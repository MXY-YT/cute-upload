export namespace FileUpload {
    interface Data {
        /**
         * 已经上传的的文件分片序号
         */
        isLoadChunkList: Array<number>
        /**
         * 文件分片列表
         */
        fileChunkList: Array<FileUpload.FileChunk>;
        /**
         * 文件 Hash 值
         */
        fileHash: string,
        /**
         * 文件路径
         */
        filePath: string,
        /**
         * 文件类型
         */
        fileType: string
    }


    interface FileChunk {
        /**
         * 文件
         */
        chunkData: Blob;
        /**
         * 文件 Hash 值
         */
        hash?: string;
        /**
         * 文件类型
         */
        type?: string;
        /**
         * 文件分片开始位置
         */
        start?: number;
        /**
         * 文件分片结束位置
         */
        end?: number;
        /**
         * 文件分片序号
         */
        num?: number;
        /**
         * 文件分片总数
         */
        sum?: number;
        /**
         * 文件分片总大小
         */
        total?: number;
        /**
         * 文件分片大小
         */
        size?: number;
        /**
         * 文件后缀
         */
        suffix?: string;
    }

    type ComputeHashResult = {
        /**
         * 文件 Hash 值
         */
        hash: string;
        /**
         * 文件类型
         */
        type: string;
    } | string;

    interface ProgressOptions {
        /**
         * 总进度
         */
        all?: number,
        /**
         * 当前进度
         */
        now?: number,
        /**
         * 是否显示进度条
         */
        show?: boolean,
        /**
         * 状态
         */
        status?: 'success' | 'warning' | 'exception' | any,
        /**
         * 进度条提示
         */
        tip?: string,
        /**
         * 是否累加
         */
        isPlus?: boolean,
        /**
         * 进度条百分比
         */
        percentage?: number,
        /**
         * 是否上传
         */
        isUpload?: boolean,
    }

    /**
     * 进度条控制
     */
    type ProgressControl = (options: FileUpload.ProgressOptions) => void;

    /**
     * 更新路径
     */
    type UpdatePath = (path: string) => void;

}
