import {ServerResponse} from "http";

/**
 * 自定义响应体
 */
export class Resp{
    public status: number;
    public message: string;
    public data: any;
    public success: boolean;

    constructor(
        status: number,
        message: string,
        data: any,
        success: boolean,
    ){
        this.status = status;
        this.message = message;
        this.data = data;
        this.success = success;
    }
    public static body(data: any, message?: any, success: boolean = true, status: number = 200): Resp{
        return new Resp(status, message, data, success);
    }

    public static ok(res: ServerResponse,data?: any, message: string = 'OK'): void{
        res.statusCode = 200;
        res.setHeader('Content-Type', 'application/json;charset=utf-8');
        res.end(JSON.stringify(this.body(data, message, true, 200)))
    }
    public static fail(res: ServerResponse, message: any, status: number = 500): void{
        res.statusCode = 200;
        res.setHeader('Content-Type', 'application/json;charset=utf-8');
        res.end(JSON.stringify(this.body(null, message, false, status)))
    }
}
