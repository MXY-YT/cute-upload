package cn.cuteshamoye.upload.utils;

import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.MissingServletRequestParameterException;
import org.springframework.web.bind.annotation.ControllerAdvice;
import org.springframework.web.bind.annotation.ExceptionHandler;
import org.springframework.web.bind.annotation.ResponseBody;
import org.springframework.web.bind.annotation.ResponseStatus;

@ControllerAdvice
public class GlobalExceptionHandler {
    /**
     * 拦截其他异常
     */
    @ExceptionHandler(MissingServletRequestParameterException.class)
    @ResponseBody
    public Resp handleRequestParameterException(MissingServletRequestParameterException parameterException) throws Exception {
        System.out.println(parameterException.getMessage());
        return Resp.fail(parameterException.getMessage(), "请求参数有误");
    }

    /**
     * 拦截其他异常
     */
    @ExceptionHandler(Exception.class)
    @ResponseBody
    public Resp handleException(Exception ex) throws Exception {
        System.out.println(ex.getMessage());
        return Resp.fail(ex.getMessage());
    }
}
