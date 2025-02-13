import express from "express";
import multer from "multer";
import {randomUUID} from "node:crypto";
import * as fs from "node:fs";
import path from "path";
import config from "../config";
import {ChunkDB} from "../db/chunk";
import {FileDB} from "../db/file";
import {Resp} from "../utils/response";
import {ChunkEntity} from "../entity/chunk";
import {FileEntity} from "../entity/file";
import {Utils} from "../utils";
import {ServerResponse, IncomingMessage} from "http";

const router = express.Router();

const {upload, debug} = config

const FilePath = `${upload.path}/${Utils.getDate()}`;

const Post = (path: string, ...handlers: any[]) => {
    try {
        router.post(path, ...handlers)
    } catch (e) {
        debug ? console.error("e = ", e) : ''
    }
}

/**
 * 获取文件上传状态
 */
Post('/before', async function (req: any, res: ServerResponse<IncomingMessage>, next: any) {
    if (!fs.existsSync(FilePath)) {
        fs.mkdirSync(FilePath, {recursive: true});
    }
    const {hash, type} = req.body;
    // 如果文件存在，直接返回文件路径 （秒传）
    const file: Array<FileEntity> = await FileDB.info(hash, type)
    if (file && file.length === 1 && fs.existsSync(file[0].path)) {
        Resp.ok(res, upload.host + file[0].path);
        return;
    }
    // 如果文件上传了一部分（断点续传）
    const result: Array<ChunkEntity> = await ChunkDB.list(hash, type);
    if (!result || result.length === 0) {
        Resp.fail(res, "查无文件");
        return;
    } else { // 断点续传
        const list: Array<number> = []
        const promiseList = [];
        for (const chunk of result) {
            // 文件存在 且 文件大小等于切片大小
            promiseList.push(fs.promises.stat(chunk.path)
                .then(stats => {
                    stats.size === Number(chunk.size) ? list.push(chunk.num) : ''
                })
                .catch(() => {
                }));
        }
        await Promise.all(promiseList);
        Resp.ok(res, {list}); // 返回已上传的切片列表
    }
})

/**
 * 删除上传的文件，文件切片
 */
Post('/delete', async function (req: any, res: ServerResponse<IncomingMessage>, next: any) {
    const {hash, type} = req.body;
    const promise1 = ChunkDB.all(hash, type).then(async res => {
        Utils.deleteFile(res);
    }).finally(async () => {
        await ChunkDB.deletedByHash(hash, type);
    })
    const promise2 = FileDB.info(hash, type).then(async res => {
        Utils.deleteFile(res);
    }).finally(async () => {
        await FileDB.deletedByHash(hash, type);
    });
    await Promise.all([promise1, promise2]).then(() => {
        Resp.ok(res, "文件删除成功！");
    })
})

// 配置上传文件 dest: 文件保存路径; single: 接收单个文件; chunkData: 前端传递过来的 切片文件 的键 （跟前端保持一致）
const uploadOption: express.RequestHandler = multer({
    dest: FilePath,
    limits: {
        fileSize: upload.maxSize
    }
}).single('chunkData')

// 上传文件
Post('/upload', uploadOption,async function (req: any, res: ServerResponse<IncomingMessage>, next: any) {
    // 校验文件是否完整
    if (Number(req.body.size) !== req.file.size) {
        Resp.fail(res, "文件上传失败");
        return;
    }
    // 删除已上传的切片（数据库信息 + 实际文件）
    const chunk: ChunkEntity | any = new ChunkEntity();
    Object.keys(chunk).forEach((key) => {
        if (req.body[key]) {
            chunk[key] = req.body[key];
        }
        if (req.file[key]) {
            chunk[key] = req.file[key];
        }
    });
    ChunkDB.deletedByHashAndNum(req.body.hash, req.body.type, req.body.num).then(res => {
        Utils.deleteFile(res);
    })
    debug ? console.log(`hash【${req.body.hash}】 ---- type【${req.body.type}】 第【${req.body.num}】 文件切片上传成功！`) : ''
    await ChunkDB.add(chunk);
    Resp.ok(res);
});

// 合并切片
Post('/merge', async function (req: any, res: ServerResponse<IncomingMessage>, next: any) {
    const {hash, type} = req.body;
    const result: Array<ChunkEntity> = await ChunkDB.list(hash, type);
    // 删除已上传的完整文件（如果存在的话）
    FileDB.info(hash, type).then(file => {
        if (file && file.length > 0) {
            Utils.deleteFile(file);
            FileDB.deletedByHash(hash, type);
        }
    });

    // 兼容重复上传文件切片
    const chunkPathList: string[] = [];
    result.forEach(chunk => {
        chunkPathList[chunk.num] = chunk.path;
    });
    if (!result || result.length === 0 || chunkPathList.length !== result[0].sum) {
        Resp.fail(res, "文件切片合并失败！" + "已上传文件不完整")
        return;
    }
    const concatFilePath = path.join(FilePath, randomUUID().substring(0, 32) + "." + result[0].suffix);
    // 创建写入流
    const writeStream = fs.createWriteStream(concatFilePath);
    let chunksWritten = 0;
    writeStream.once('finish', async () => {
        let concatFileSize = null
        await fs.promises.stat(concatFilePath)
            .then((stats: { size: any; }) => {
                concatFileSize = stats.size
            })
            .catch(() => {
            });
        if (concatFileSize !== Number(result[0].total)) {
            Resp.fail(res, "文件合并失败！" + "写入文件不完整")
            Utils.deleteFile([{path: concatFilePath}]);
            return;
        }
        // 删除切片文件
        ChunkDB.all(hash, type).then(res => {
            Utils.deleteFile(res)
        }).finally(() => {
            ChunkDB.deletedByHash(hash, type);
        })
        const file: FileEntity = {
            ...new FileEntity(),
            hash: hash,
            path: concatFilePath,
            size: result[0].size,
            type: result[0].type
        }
        FileDB.add(file)
        Resp.ok(res, upload.host + concatFilePath);
    });
    writeStream.once('error', (err) => {
        debug ? console.error("文件合并失败", err.message) : ''
        Utils.deleteFile([{path: concatFilePath}])
        Resp.fail(res, "文件合并失败" + err);
    });
    const promiseList = chunkPathList.map((chunkPath, index) => {
        return {
            index,
            chunkPath,
            readStream: fs.createReadStream(chunkPath)
        }
    })
    for (let {index, chunkPath, readStream} of promiseList) {
        await new Promise((resolve, reject) => {
            readStream.on('data', (chunk) => {
                writeStream.write(chunk);
            });
            readStream.on('end', () => {
                chunksWritten++;
                if (chunksWritten === chunkPathList.length) {
                    writeStream.end();
                }
                resolve(`完成读取 ${chunkPath}`)
            });
            readStream.on('error', (err) => {
                debug ? console.error(`读取切片【${chunkPath}】失败:`, err.message) : ''
                Utils.deleteFile([{path: concatFilePath}])
                writeStream.end();
                Resp.fail(res, index)
                reject(`读取切片【${chunkPath}】失败:` + err.message);
            });
        })
    }
});

export default router;
