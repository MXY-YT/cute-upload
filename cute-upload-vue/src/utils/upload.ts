import {beforeFileUpload, deleteChunkAndFile, fileUpload, mergeChunk} from "/@/api";
import {FileUpload} from "/@/types/file-upload";
import {AxiosCanceler} from "/@/utils/axiosCanceler.ts";
import {ElMessage} from "element-plus";
import type {UploadRequestOptions} from "element-plus/lib/components";

export class UploadUtils {
    private readonly concurrent: number = 5; // 当前并发数
    private concurrentEndNum: number = 0; // 当前最终并发数
    private worker: Worker | null = null; // worker实例
    private loadedChunkList: Array<number> = []; // 已上传的分片列表
    private chunkList: Array<FileUpload.FileChunk> = []; // 分片列表
    private hash: string = ""; // 文件 hash
    public path: string = ""; // 文件路径
    private type: string = ""; // 文件类型
    private handelChunkPointer: number = 0; // 当前处理切片指针
    public isPause: boolean = false; // 是否暂停上传

    public progress: FileUpload.ProgressOptions = {all: 1}; // 进度控制
    readonly emitProgressChange: FileUpload.ProgressControl | undefined = undefined; // 进度控制回调
    readonly emitPathChange: FileUpload.UpdatePath | undefined = undefined;
    public uploadOptions: UploadRequestOptions | any = null; // 上传配置

    /**
     * 进度控制
     * @param options
     */
    public readonly progressControl: FileUpload.ProgressControl = (options: FileUpload.ProgressOptions) => {
        let now: number = (options.status === 'success' ? this.progress.all : this.progress.now) ?? 0
        now = options.isPlus ? now + 1 : now
        this.progress = {
            isUpload: false,
            show: true,
            ...this.progress,
            now,
            ...options,
        }
        this.progress.now = this.progress.now == undefined ? 0 : this.progress.now
        this.progress.all = this.progress.all == undefined ? 1 : this.progress.all
        const num: number = Number(parseFloat(String((this.progress.now / this.progress.all) * 100)).toFixed(2))
        this.progress.percentage = num > 100 ? 100 : num
        this.emitProgressChange ? this.emitProgressChange(this.progress) : ''
        if (this.progress.status === 'success' || this.progress.status === 'exception') {
            setTimeout(() => {
                this.progress = {
                    status: null,
                    tip: '',
                    now: 0,
                    all: 1,
                    show: false,
                    isPlus: false,
                    percentage: 0,
                    isUpload: this.progress.status !== 'exception'
                }
                this.emitProgressChange ? this.emitProgressChange(this.progress) : ''
            }, 500)
        }
    };

    /**
     * 更新路径
     * @param path
     */
    public readonly updatePath = (path: string) => {
        this.path = path
        this.emitPathChange ? this.emitPathChange(this.path) : ''
    }

    constructor(progressControl?: FileUpload.ProgressControl, updatePath?: FileUpload.UpdatePath) {
        this.emitProgressChange = progressControl
        this.emitPathChange = updatePath
    }

    /**
     * 上传前校验文件是否存在，或者是否已上传文件部分切片
     */
    public beforeUpload = async () => {
        const rawFile = this.uploadOptions.file
        this.path = ''
        this.type = rawFile.type
        this.progressControl({all: 0, tip: '开始切片', status: null})
        // 根据文件大小，计算切片大小
        let chunkSize = 100
        if (rawFile.size >= 1024 * 1024 * 1024) {
            chunkSize = 75
        } else if (rawFile.size >= 1024 * 1024 * 100) {
            chunkSize = 50
        }
        // 切片
        const fileChunkList: FileUpload.FileChunk[] = this.createFileChunk(rawFile, chunkSize * 1024 * 1024)
        this.chunkList = fileChunkList
        this.progressControl({all: fileChunkList.length, tip: '开始校验'})
        // 计算文件 hash 值
        const computeHashResult: FileUpload.ComputeHashResult = await this.computeHash(rawFile, fileChunkList)
        this.hash = typeof computeHashResult === 'string' ? computeHashResult : computeHashResult.hash;
        if (!this.hash) {
            ElMessage.error("获取文件 hash 值失败")
            this.progressControl({status: 'exception', tip: '获取信息失败'})
            return false
        } else {
            await beforeFileUpload(this.hash, rawFile.type).then(async (res: any) => {
                if (res.success) {
                    if (res.data.list) {
                        this.loadedChunkList = res.data.list // 已上传的切片列表
                        this.progressControl({all: fileChunkList.length, now: res.data.list.length})
                    } else {
                        this.updatePath(res.data)
                        ElMessage.success("上传成功")
                        this.progressControl({status: 'success'})
                    }
                    return;
                }
            })
        }
    }

    /**
     * 上传文件
     * @param options
     */
    public httpRequest = (options?: UploadRequestOptions): Promise<any> => {
        options ? this.uploadOptions = options : ''
        this.progressControl({
            now: 0,
            show: true,
            status: null,
            isUpload: false,
            percentage: 0,
            tip: '正在上传'
        })
        return new Promise(async (resolve, reject) => {
            await this.beforeUpload()
            if (this.path) {
                resolve(this.path)
                return;
            }
            // 结合切片大小，并发数，设置最终并发数
            this.concurrentEndNum = Math.min(this.chunkList.length, this.concurrent)
            this.loadedChunkList = []
            // 切片指针重置为 0
            this.handelChunkPointer = 0
            return await this.handleUpload()
        })
    }

    /**
     * 处理上传文件
     */
    public handleUpload = (callback?: () => void) => {
        return new Promise(async (resolve, reject) => {
            // 循环上传，实现持续并发请求
            const upload = async () => {
                // 跳过已上传的切片
                while (this.loadedChunkList.includes(this.handelChunkPointer)) {
                    this.handelChunkPointer++
                }
                // 当上传完成，或者暂停，则跳出循环
                if (this.handelChunkPointer > this.chunkList.length || this.isPause) {
                    return;
                }
                const item = this.chunkList[this.handelChunkPointer]
                if (!item) {
                    return;
                }
                item.hash = this.hash
                let handelChunkPointerNow = this.handelChunkPointer
                this.handelChunkPointer++
                await fileUpload(item).then(async (res: any) => {
                    this.progressControl({isPlus: true, tip: '正在上传'})
                    await upload()
                }).catch(() => {
                    this.handelChunkPointer = handelChunkPointerNow
                })
            }
            const promiseList: Array<Promise<any>> = []
            // 从当前指针开始，循环上传
            let startPointer = this.handelChunkPointer
            this.handelChunkPointer = startPointer + this.concurrentEndNum
            for (let k = startPointer; k < startPointer + this.concurrentEndNum; k++) { // 并发数
                // 跳过已上传的切片
                while (this.loadedChunkList.includes(k)) {
                    k++
                }
                if (k > this.chunkList.length) {
                    break;
                }
                const item = this.chunkList[k]
                if (!item) {
                    break;
                }
                item.hash = this.hash

                const fileUploadPromise = fileUpload(item).then(async (res: any) => {
                    this.progressControl({isPlus: true, tip: '正在上传'})
                    await upload()
                }).catch(() => {
                    this.handelChunkPointer = k // 回退上传指针
                })
                promiseList.push(fileUploadPromise)
            }
            await Promise.all(promiseList)
            if (this.isPause) {
                return;
            }
            this.progressControl({tip: '正在合并'})
            await mergeChunk(this.hash, this.type).then((res: any) => {
                if (res.success) {
                    this.updatePath(res.data)
                    ElMessage.success("合并成功")
                    this.progressControl({status: 'success', isUpload: true})
                    resolve(res)
                } else {
                    ElMessage.error("合并失败，请重新上传")
                    this.progressControl({status: 'exception', isUpload: false})
                    reject(res)
                }
            }).finally(() => {
                callback ? callback() : ''
            })
        })
    }

    /**
     * 暂停或继续上传
     */
    public pauseOrContinue = async () => {
        this.isPause = !this.isPause
        if (this.isPause) {
            AxiosCanceler.removeAllPending()
            ElMessage.success("暂停上传")
        } else {
            ElMessage.success("继续上传")
            this.httpRequest()
        }
        return this.isPause
    }

    /**
     * 取消上传
     */
    public cancel = async () => {
        this.updatePath('')
        this.isPause = true
        this.progressControl({all: 0, show: false})
        AxiosCanceler.removeAllPending()
        await deleteChunkAndFile(this.hash, this.type).then(() => {
            ElMessage.success("已取消上传")
        })
    }
    /**
     * 重新上传
     */
    public reUpload = async () => {
        this.path = ''
        if (this.uploadOptions) {
            await deleteChunkAndFile(this.hash, this.type)
            await this.httpRequest(this.uploadOptions)
        } else {
            ElMessage.error("请先选择文件")
        }
    }
    /**
     * 生成文件切片
     * @param file
     * @param size
     */
    private createFileChunk = (file: File, size: number): Array<FileUpload.FileChunk> => {
        const fileChunkList: Array<FileUpload.FileChunk> = []
        let cur = 0
        let num = 0
        const sum = Math.ceil(file.size / size) // 向上取整
        while (cur < file.size) {
            const fileChunk: Blob = file.slice(cur, cur + size) // 切片
            fileChunkList.push({
                chunkData: fileChunk,
                type: file.type,
                start: cur,
                end: cur + fileChunk.size,
                num: num,
                sum,
                total: file.size,
                size: fileChunk.size,
                suffix: file.name.substring(file.name.lastIndexOf('.') + 1)
            })
            cur += size
            num++
        }
        return fileChunkList
    }

    /**
     * 计算文件 hash
     * @param file
     * @param fileChunkList
     * @param isProgress
     */
    private computeHash = async (file: File, fileChunkList: Array<FileUpload.FileChunk>, isProgress?: boolean): Promise<FileUpload.ComputeHashResult> => {
        this.worker = new Worker(new URL('./file-hash.worker.js', import.meta.url), {type: 'module'});
        return new Promise((resolve, reject) => {
            if (!this.worker) {
                console.error("worker 加载失败")
                reject("worker 加载失败")
                return;
            }
            this.worker.postMessage({fileChunkList, file, isProgress})
            this.worker.onmessage = (e: MessageEvent) => {
                resolve(e.data)
                this.worker?.terminate();
            };
            this.worker.onerror = (e: ErrorEvent) => {
                console.error("获取文件 hash 值失败" + e.message)
                reject("获取文件 hash 值失败" + e.message)
            };
        })
    }
}
