package cn.cuteshamoye.upload.dto;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@AllArgsConstructor
@NoArgsConstructor
public class UploadReqDTO {
    /**
     * 文件 hash
     */
    private String hash;
    /**
     * 文件类型
     */
    private String type;

    /**
     * 文件块序号
     */
    private Integer num;
}
