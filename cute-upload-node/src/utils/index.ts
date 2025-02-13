import fs from "node:fs";
import config from "../config";

const {debug} = config

/**
 * 工具类
 */
export class Utils {
    /**
     * 删除文件
     * @param fileList 文件列表
     */
   static deleteFile = (fileList: Array<{ path: string, [key: string]: any }>): void => {
        fileList.forEach(file => {
            fs.promises.unlink(file.path).catch(() => {
               debug ? console.error(`delete filePath error 【${file.path}】`) : ''
            })
        })
    }

    /**
     * 获取当前日期 (yyyy-mm-dd)
     * @returns {string}
     */
   static getDate = (): string => {
        let date = new Date();
        let year = date.getFullYear();
        let month = date.getMonth() + 1;
        let day = date.getDate();
        return year + "-" + month + "-" + day;
    }
}
