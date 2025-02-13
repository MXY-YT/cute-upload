import {FileUpload} from "/@/types/file-upload";
import axios from "./axios";

/**
 * 文件上传前校验
 * @param hash
 * @param type
 */
export const beforeFileUpload = async (hash: string, type: string) => {
    return await axios.post("/file/before", {hash, type})
}



/**
 * 文件上传 (切片)
 * @param data
 */
export const fileUpload = async (data: FileUpload.FileChunk) => {
    return await axios.post("/file/upload", data, {
        headers: {
            "Content-Type": 'multipart/form-data'
        }
    })
}

/**
 * 合并文件分片
 * @param hash
 * @param type
 */
export const mergeChunk = async (hash: string, type: string) => {
    return await axios.post("/file/merge", {hash, type})
}

/**
 * 重新上传
 * @param hash
 * @param type
 */
export const deleteChunkAndFile = async (hash: string, type: string) => {
    return await axios.post("/file/delete", {hash, type})
}
