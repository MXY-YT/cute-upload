package cn.cuteshamoye.upload.service;

import cn.cuteshamoye.upload.dao.ChunkDataDO;
import cn.cuteshamoye.upload.dto.UploadReqDTO;
import org.springframework.web.multipart.MultipartFile;

public interface UploadService {
    /**
     * 上传文件之前，获取文件上传状态
     */
    Object beforeUpload(UploadReqDTO uploadReqDTO);

    /**
     * 删除上传的文件，文件切片
     */
    String delete(UploadReqDTO uploadReqDTO);

    /**
     * 上传文件
     *
     * @param file        文件
     * @param chunkDataDO 切片信息
     */
    Object upload(ChunkDataDO chunkDataDO) throws Exception;

    /**
     * 合并文件
     */
    String merge(UploadReqDTO uploadReqDTO) throws Exception;


}
