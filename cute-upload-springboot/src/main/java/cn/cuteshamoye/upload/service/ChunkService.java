package cn.cuteshamoye.upload.service;

import cn.cuteshamoye.upload.dao.ChunkDataDO;
import cn.cuteshamoye.upload.dto.UploadReqDTO;
import com.baomidou.mybatisplus.extension.service.IService;

import java.util.ArrayList;
import java.util.List;

/**
 * @author Administrator
 * @description 针对表【chunk_data】的数据库操作Service
 * @createDate 2025-01-14 15:16:51
 */
public interface ChunkService extends IService<ChunkDataDO> {
    /**
     * 添加分片信息
     *
     * @param chunkDataDO 分片信息
     */
    public Boolean add(ChunkDataDO chunkDataDO);

    /**
     * 获取文件切片列表 (去重)
     *
     */
    public List<ChunkDataDO> list(UploadReqDTO uploadReqDTO);

    /**
     * 获取文件切片列表 （切片大小符合上传的大小，即切片上传完整）
     *
     */
    public List<ChunkDataDO> all(UploadReqDTO uploadReqDTO);

    /**
     * 删除文件切片
     *
     */
    public Boolean deletedByHash(UploadReqDTO uploadReqDTO);

    /**
     * 删除文件切片
     *
     * @param ids 切片 ID 列表
     */
    public Boolean deletedByIds(ArrayList<Number> ids);

    /**
     * 删除文件切片
     *
     */
    List<ChunkDataDO> deletedByHashAndNum(UploadReqDTO uploadReqDTO) ;
}
