import {Query} from "mysql";
import {ChunkEntity} from "../entity/chunk";
import db from './index';

const table = 'chunk_data';

/**
 * 添加文件切片
 * @param chunkEntity
 */
const add = (chunkEntity: ChunkEntity): Promise<any> => {
    delete chunkEntity.id
    chunkEntity.createTime = new Date()
    chunkEntity.updateTime = new Date()
    const keys = Object.keys(chunkEntity);
    const values = Object.values(chunkEntity);
    const sql = `INSERT INTO ${table} (${keys.join(',')})
                 VALUES (${values.map((item: any) => '?').join(',')})`;
    return db.query(sql, values)
};

/**
 * 获取文件切片列表 (去重)
 * @param hash
 * @param type
 */
const list = (hash: string, type: string): Promise<Array<ChunkEntity>> => {
    const sql = `SELECT *
                 FROM ${table}
                 WHERE hash = ?
                   AND type = ?
                 GROUP BY num
                 ORDER BY num`;
    return db.query(sql, [hash, type])
};


/**
 * 获取文件切片列表 （切片大小符合上传的大小，即切片上传完整）
 * @param hash
 * @param type
 */
const all = (hash: string, type: string): Promise<Array<ChunkEntity>> => {
    const sql = `SELECT *
                 FROM ${table} AS a
                          LEFT JOIN (SELECT id,
                                            CAST(REGEXP_REPLACE(end, '[^0-9.]', '') AS DECIMAL) -
                                            CAST(REGEXP_REPLACE(start, '[^0-9.]', '') AS DECIMAL) AS result
                                     FROM ${table}) AS b ON a.id = b.id
                 WHERE a.hash = ?
                   AND a.type = ?
                   AND a.size = b.result
                 ORDER BY a.num `;
    return db.query(sql, [hash, type])
};


/**
 * 删除文件切片
 * @param hash
 * @param type
 */
const deletedByHash = (hash: string, type: string): Promise<any> => {
    const sql = `DELETE
                 FROM ${table}
                 WHERE hash = ?
                   AND type = ?`;
    return db.query(sql, [hash, type])
};

/**
 * 删除文件切片
 * @param ids
 */
const deletedByIds = (ids: Array<number>): Promise<any> => {
    const sql = `DELETE
                 FROM ${table}
                 WHERE id IN (${ids.join(',')})`;
    return db.query(sql, [ids])
};

/**
 * 删除文件切片，并且返回删除的列表
 * @param hash
 * @param type
 * @param num
 */
const deletedByHashAndNum = (hash: string, type: string, num: number): Promise<ChunkEntity[]> => {
   const sql =  `FROM ${table}
                   WHERE hash = ?
                     AND type = ?
                     AND num = ?`
    return db.query(`SELECT * ` + sql, [hash, type, num], (err, results: ChunkEntity[]) => {
        if (results && results.length > 0) {
            db.query(`DELETE ` + sql, [hash, type, num])
        }
    })
}


export const ChunkDB = {
    add,
    list,
    all,
    deletedByHash,
    deletedByIds,
    deletedByHashAndNum
}
