import {BaseEntity} from "./base";
/**
 * 文件实体
 */
export class FileEntity extends BaseEntity {
    /**
     * 文件路径
     */
    path: string;
    /**
     * 文件 hash 值
     */
    hash: string;
    /**
     * 文件大小
     */
    size: string;
    /**
     * 文件类型
     */
    type: string;

    constructor() {
        super();
        this.path = "";
        this.hash = "";
        this.size = "";
        this.type = "";
    }
}
