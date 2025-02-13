package cn.cuteshamoye.upload.service.impl;

import cn.cuteshamoye.upload.dto.UploadReqDTO;
import com.baomidou.mybatisplus.core.conditions.query.LambdaQueryWrapper;
import com.baomidou.mybatisplus.extension.service.impl.ServiceImpl;
import cn.cuteshamoye.upload.dao.ChunkDataDO;
import cn.cuteshamoye.upload.service.ChunkService;
import cn.cuteshamoye.upload.mapper.ChunkDataMapper;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.util.ArrayList;
import java.util.List;

/**
 * @author Administrator
 * @description 针对表【chunk_data】的数据库操作Service实现
 * @createDate 2025-01-14 15:16:51
 */
@Service
public class ChunkServiceImpl extends ServiceImpl<ChunkDataMapper, ChunkDataDO> implements ChunkService {
    @Autowired
    private ChunkDataMapper mapper;

    /**
     * 添加分片信息
     *
     * @param chunkDataDO 分片信息
     */
    @Override
    public Boolean add(ChunkDataDO chunkDataDO) {
        chunkDataDO.setId(null);
        return this.mapper.insert(chunkDataDO) > 0;
    }

    /**
     * 获取文件切片列表 (去重)
     */
    @Override
    public List<ChunkDataDO> list(UploadReqDTO uploadReqDTO) {
        LambdaQueryWrapper<ChunkDataDO> wrapper = new LambdaQueryWrapper<>();
        wrapper.eq(ChunkDataDO::getHash, uploadReqDTO.getHash()).eq(ChunkDataDO::getType, uploadReqDTO.getType()).groupBy(ChunkDataDO::getNum).orderByAsc(ChunkDataDO::getNum);
        return this.mapper.selectList(wrapper);
    }

    /**
     * 获取文件切片列表 （切片大小符合上传的大小，即切片上传完整）
     */
    @Override
    public List<ChunkDataDO> all(UploadReqDTO uploadReqDTO) {
        LambdaQueryWrapper<ChunkDataDO> wrapper = new LambdaQueryWrapper<>();
        wrapper.eq(ChunkDataDO::getHash, uploadReqDTO.getHash()).eq(ChunkDataDO::getType, uploadReqDTO.getType()).apply("size = CAST(REGEXP_REPLACE(end, '[^0-9.]', '') AS DECIMAL) - CAST(REGEXP_REPLACE(start, '[^0-9.]', '') AS DECIMAL)").orderByAsc(ChunkDataDO::getNum);
        return this.mapper.selectList(wrapper);
    }


    /**
     * 删除文件切片
     */
    @Override
    public Boolean deletedByHash(UploadReqDTO uploadReqDTO) {
        LambdaQueryWrapper<ChunkDataDO> wrapper = new LambdaQueryWrapper<>();
        wrapper.eq(ChunkDataDO::getHash, uploadReqDTO.getHash()).eq(ChunkDataDO::getType, uploadReqDTO.getType());
        return this.mapper.delete(wrapper) > 0;
    }

    /**
     * 删除文件切片
     *
     * @param ids 切片 ID 列表
     */
    @Override
    public Boolean deletedByIds(ArrayList<Number> ids) {
        LambdaQueryWrapper<ChunkDataDO> wrapper = new LambdaQueryWrapper<>();
        wrapper.in(ChunkDataDO::getId, ids);
        return this.mapper.delete(wrapper) > 0;
    }

    /**
     * 删除文件切片，并且返回删除的列表
     *
     * @param num 指定位置切片
     */
    @Override
    public List<ChunkDataDO> deletedByHashAndNum(UploadReqDTO uploadReqDTO) {
        LambdaQueryWrapper<ChunkDataDO> wrapper = new LambdaQueryWrapper<>();
        wrapper.eq(ChunkDataDO::getHash, uploadReqDTO.getHash()).eq(ChunkDataDO::getType, uploadReqDTO.getType()).eq(ChunkDataDO::getNum, uploadReqDTO.getNum());
        List<ChunkDataDO> list = this.mapper.selectList(wrapper);
        this.mapper.delete(wrapper);
        return list;
    }
}




