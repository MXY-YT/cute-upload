/**
 * 基础实体
 */
export class BaseEntity {
    /**
     * id
     */
    id?: number;
    /**
     * 创建时间
     */
    createTime: Date;
    /**
     * 更新时间
     */
    updateTime: Date;

    constructor() {
        this.createTime = new Date();
        this.updateTime = new Date();
    }
}

