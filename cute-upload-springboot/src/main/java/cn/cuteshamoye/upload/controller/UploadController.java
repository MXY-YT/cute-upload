package cn.cuteshamoye.upload.controller;

import cn.cuteshamoye.upload.dao.ChunkDataDO;
import cn.cuteshamoye.upload.dto.UploadReqDTO;
import cn.cuteshamoye.upload.service.UploadService;
import cn.cuteshamoye.upload.utils.Resp;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

@RestController()
@RequestMapping("/file")
public class UploadController {
    @Autowired
    UploadService uploadService;

    /**
     * 获取文件上传状态
     *
     * @param hash 文件的哈希值
     * @param type 文件类型
     */
    @PostMapping("/before")
    public Resp beforeUpload(@RequestBody UploadReqDTO uploadReqDTO) {
        return Resp.ok(this.uploadService.beforeUpload(uploadReqDTO));
    }

    /**
     * 删除上传的文件，文件切片
     *
     * @param hash 文件的哈希值
     * @param type 文件类型
     */
    @PostMapping("/delete")
    public Resp delete(@RequestBody UploadReqDTO uploadReqDTO) {
        return Resp.ok(this.uploadService.delete(uploadReqDTO));
    }

    /**
     * 上传文件
     *
     * @param upload 上传文件信息
     */
    @PostMapping("/upload")
    public Resp upload(ChunkDataDO chunkDataDO) throws Exception {
        return Resp.ok(this.uploadService.upload(chunkDataDO));
    }

    /**
     * 合并文件
     *
     * @param hash 文件的哈希值
     * @param type 文件类型
     */
    @PostMapping("/merge")
    public Resp merge(@RequestBody UploadReqDTO uploadReqDTO) throws Exception {
        return Resp.ok(this.uploadService.merge(uploadReqDTO));
    }

}
