import mysql, { Pool, MysqlError, Query } from 'mysql';
import config from "../config";

const db = config.db

// 创建连接池
const pool: Pool = mysql.createPool(db);

const query = (sql: string, params: any[], callback?: (err: MysqlError | null, results: any) => void): Promise<any> => {
    return new Promise((resolve, reject) => {
        try {
            pool.getConnection((err, connection) => {
                if (err) {
                    reject(err);
                    return;
                }
                const result: Query = connection.query(sql, params, (err: MysqlError | null, results: any) => {
                    connection.release(); // 释放连接回连接池
                    if (err) {
                        reject(err);
                    } else {
                        resolve(results);
                    }
                    callback ? callback(err, results) : ''
                });
                db.logging ? console.info(`MySQL--Log ${new Date().toLocaleString()} : ${result.sql}\n`) : '';
            });
        } catch (e) {
            reject(e);
        }
    });
};

export default {
    query
};
