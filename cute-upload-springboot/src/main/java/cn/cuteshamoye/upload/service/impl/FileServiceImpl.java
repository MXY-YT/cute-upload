package cn.cuteshamoye.upload.service.impl;

import cn.cuteshamoye.upload.dto.UploadReqDTO;
import com.baomidou.mybatisplus.core.conditions.query.LambdaQueryWrapper;
import com.baomidou.mybatisplus.extension.service.impl.ServiceImpl;
import cn.cuteshamoye.upload.dao.FileDataDO;
import cn.cuteshamoye.upload.service.FileService;
import cn.cuteshamoye.upload.mapper.FileDataMapper;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

/**
 * @author Administrator
 * @description 针对表【file_data】的数据库操作Service实现
 * @createDate 2025-01-14 15:16:51
 */
@Service
public class FileServiceImpl extends ServiceImpl<FileDataMapper, FileDataDO> implements FileService {
    @Autowired
    private FileDataMapper mapper;

    /**
     * 添加文件信息
     *
     * @param fileDataDO 文件信息
     */
    @Override
    public Boolean add(FileDataDO fileDataDO) {
        fileDataDO.setId(null);
        return this.mapper.insert(fileDataDO) > 0;
    }

    /**
     * 根据hash和type查询文件信息
     */
    @Override
    public FileDataDO info(UploadReqDTO uploadReqDTO) {
        LambdaQueryWrapper<FileDataDO> wrapper = new LambdaQueryWrapper<>();
        wrapper.eq(FileDataDO::getHash, uploadReqDTO.getHash()).eq(FileDataDO::getType, uploadReqDTO.getType()).orderByAsc(FileDataDO::getCreatetime);
        return this.mapper.selectOne(wrapper);
    }

    /**
     * 根据hash和type删除文件信息
     */
    @Override
    public Boolean deletedByHash(UploadReqDTO uploadReqDTO) {
        LambdaQueryWrapper<FileDataDO> wrapper = new LambdaQueryWrapper<>();
        wrapper.eq(FileDataDO::getHash, uploadReqDTO.getHash()).eq(FileDataDO::getType, uploadReqDTO.getType());
        return this.mapper.delete(wrapper) > 0;
    }
}




