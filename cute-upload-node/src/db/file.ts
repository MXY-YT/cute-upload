import {Query} from "mysql";
import {FileEntity} from "../entity/file";
import db from './index';

const table = 'file_data';

/**
 * 添加文件
 * @param fileEntity
 */
const add = async (fileEntity: FileEntity): Promise<Query> => {
    delete fileEntity.id
    fileEntity.createTime = new Date()
    fileEntity.updateTime = new Date()
    const keys = Object.keys(fileEntity);
    const values = Object.values(fileEntity);
    const sql = `INSERT INTO ${table} (${keys.join(',')})
                 VALUES (${values.map((item: any) => '?').join(',')})`;
    return db.query(sql, values)
};

/**
 * 获取文件
 * @param hash
 * @param type
 */
const info = (hash: string, type: string): Promise<Array<FileEntity>> => {
    const sql = `SELECT *
                 FROM ${table}
                 WHERE hash = ?
                   AND type = ?
                 ORDER BY createTime
                 limit 1`;
    return db.query(sql, [hash, type]);
};

/**
 * 删除文件
 * @param hash
 * @param type
 */
const deletedByHash = (hash: string, type: string): Promise<Query> => {
    const sql = `DELETE
                 FROM ${table}
                 WHERE hash = ?
                   AND type = ?`;
    return db.query(sql, [hash, type]);
};

export const FileDB = {
    add,
    info,
    deletedByHash
}
