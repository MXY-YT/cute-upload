import {BaseEntity} from "./base";
/**
 * 切片实体
 */
export class ChunkEntity extends BaseEntity {
    /**
     * 该切片路径
     */
    path: string;
    /**
     * 起始字节
     */
    start: string;
    /**
     * 结束字节
     */
    end: string;
    /**
     * 该切片大小
     */
    size: string;
    /**
     * 该切片所在位置
     */
    num: number;
    /**
     * 该切片所在位置
     */
    sum: number;
    /**
     * 父文件 Hash 值
     */
    hash: string;
    /**
     * 父文件总字节
     */
    total: string;
    /**
     * 文件类型
     */
    type: string;
    /**
     * 文件后缀
     */
    suffix:string;

    constructor() {
        super();
        this.path = '';
        this.start = '';
        this.end = '';
        this.size = '';
        this.num = 0;
        this.sum = 0;
        this.hash = '';
        this.total = '';
        this.type = '';
        this.suffix = '';
    }
}
