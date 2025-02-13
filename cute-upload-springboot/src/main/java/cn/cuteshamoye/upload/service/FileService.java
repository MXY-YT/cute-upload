package cn.cuteshamoye.upload.service;

import cn.cuteshamoye.upload.dao.FileDataDO;
import cn.cuteshamoye.upload.dto.UploadReqDTO;
import com.baomidou.mybatisplus.extension.service.IService;

/**
 * @author Administrator
 * @description 针对表【file_data】的数据库操作Service
 * @createDate 2025-01-14 15:16:51
 */
public interface FileService extends IService<FileDataDO> {
    /**
     * 添加文件信息
     *
     * @param fileDataDO 文件信息
     */
    public Boolean add(FileDataDO fileDataDO);

    /**
     * 根据hash和type查询文件信息
     */
    public FileDataDO info(UploadReqDTO uploadReqDTO);

    /**
     * 根据hash和type删除文件信息
     */
    public Boolean deletedByHash(UploadReqDTO uploadReqDTO);

}
