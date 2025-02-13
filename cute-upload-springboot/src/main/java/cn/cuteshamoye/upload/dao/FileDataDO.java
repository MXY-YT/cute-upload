package cn.cuteshamoye.upload.dao;

import cn.cuteshamoye.upload.dto.UploadReqDTO;
import com.baomidou.mybatisplus.annotation.IdType;
import com.baomidou.mybatisplus.annotation.TableField;
import com.baomidou.mybatisplus.annotation.TableId;
import com.baomidou.mybatisplus.annotation.TableName;
import java.io.Serializable;
import java.util.Date;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

/**
 *
 * @TableName file_data
 */
@TableName(value ="file_data")
@AllArgsConstructor
@NoArgsConstructor
@Data
public class FileDataDO implements Serializable {
    /**
     * 索引 ID
     */
    @TableId(value = "id", type = IdType.AUTO)
    private Integer id;

    /**
     * 创建时间
     */
    @TableField(value = "createTime")
    private Date createtime;

    /**
     * 更新时间
     */
    @TableField(value = "updateTime")
    private Date updatetime;

    /**
     * 文件路径
     */
    @TableField(value = "path")
    private String path;

    /**
     * 文件 hash 值
     */
    @TableField(value = "hash")
    private String hash;

    /**
     * 文件类型
     */
    @TableField(value = "type")
    private String type;

    /**
     * 文件总字节大小
     */
    @TableField(value = "size")
    private Integer size;

    @TableField(exist = false)
    private static final long serialVersionUID = 1L;


    public FileDataDO(String path, String hash, String type, Integer size) {
        this.path = path;
        this.hash = hash;
        this.type = type;
        this.size = size;
    }

    public FileDataDO(String concatFilePath, UploadReqDTO uploadReqDTO, int length) {
        this.path = concatFilePath;
        this.hash = uploadReqDTO.getHash();
        this.type = uploadReqDTO.getType();
        this.size = length;
    }
}
