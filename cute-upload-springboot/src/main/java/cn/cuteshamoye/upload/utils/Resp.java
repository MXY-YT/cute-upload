package cn.cuteshamoye.upload.utils;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

/**
 * 自定义响应
 */
@Data
public class Resp {
    /**
     * 响应状态码
     */
    Integer status;
    /**
     * 响应信息
     */
    String message;
    /**
     * 响应数据
     */
    Object data;
    /**
     * 响应是否成功
     */
    Boolean success;

    public Resp(Integer status, String message, Object data, Boolean success) {
        this.status = status;
        this.message = message;
        this.data = data;
        this.success = success;
    }

    public static Resp ok() {
        return new Resp(200, "OK", null, true);
    }

    public static Resp ok(Object data) {
        return new Resp(200, "OK", data, true);
    }

    public static Resp ok(Object data, String message) {
        return new Resp(200, message, data, true);
    }

    public static Resp fail() {
        return new Resp(500, "FAIL", null, false);
    }

    public static Resp fail(Object data) {
        return new Resp(500, "FAIL", data, false);
    }

    public static Resp fail(Object data, String message) {
        return new Resp(500, message, data, false);
    }
}
