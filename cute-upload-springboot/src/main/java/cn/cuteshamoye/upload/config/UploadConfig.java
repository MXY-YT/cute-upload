package cn.cuteshamoye.upload.config;

import lombok.Data;
import org.springframework.boot.context.properties.ConfigurationProperties;
import org.springframework.stereotype.Component;

@Data
@ConfigurationProperties(prefix = "upload")
@Component
public class UploadConfig {
    /**
     * 上传文件服务器地址
     */
    private String host;
    /**
     * 上传文件路径
     */
    private String path;
    /**
     * 文件大小限制
     */
    private long maxSize;
}
