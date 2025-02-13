package cn.cuteshamoye.upload.dao;

import com.baomidou.mybatisplus.annotation.IdType;
import com.baomidou.mybatisplus.annotation.TableField;
import com.baomidou.mybatisplus.annotation.TableId;
import com.baomidou.mybatisplus.annotation.TableName;
import java.io.Serializable;
import java.util.Date;
import lombok.Data;
import org.springframework.web.multipart.MultipartFile;

/**
 *
 * @TableName chunk_data
 */
@TableName(value ="chunk_data")
@Data
public class ChunkDataDO implements Serializable {

    /**
     * 文件内容（忽略）
     */
    @TableField(exist = false)
    private MultipartFile chunkData;

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
     * 该切片路径
     */
    @TableField(value = "path")
    private String path;

    /**
     * 起始字节
     */
    @TableField(value = "start")
    private String start;

    /**
     * 结束字节
     */
    @TableField(value = "end")
    private String end;

    /**
     * 该切片大小
     */
    @TableField(value = "size")
    private String size;

    /**
     * 该切片所在位置
     */
    @TableField(value = "num")
    private Integer num;

    /**
     * 父文件 Hash 值
     */
    @TableField(value = "hash")
    private String hash;

    /**
     * 父文件总字节
     */
    @TableField(value = "total")
    private String total;

    /**
     * 文件类型（切片和总文件类型相同）
     */
    @TableField(value = "type")
    private String type;

    /**
     * 文件后缀
     */
    @TableField(value = "suffix")
    private String suffix;

    /**
     * 总切片数
     */
    @TableField(value = "sum")
    private Integer sum;

    @TableField(exist = false)
    private static final long serialVersionUID = 1L;
}
