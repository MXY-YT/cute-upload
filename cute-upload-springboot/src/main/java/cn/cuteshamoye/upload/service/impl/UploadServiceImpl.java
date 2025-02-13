package cn.cuteshamoye.upload.service.impl;

import cn.cuteshamoye.upload.config.UploadConfig;
import cn.cuteshamoye.upload.dao.ChunkDataDO;
import cn.cuteshamoye.upload.dao.FileDataDO;
import cn.cuteshamoye.upload.dto.UploadReqDTO;
import cn.cuteshamoye.upload.service.ChunkService;
import cn.cuteshamoye.upload.service.FileService;
import cn.cuteshamoye.upload.service.UploadService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.scheduling.annotation.Async;
import org.springframework.stereotype.Service;
import org.springframework.web.multipart.MultipartFile;

import java.io.*;
import java.text.SimpleDateFormat;
import java.util.*;


@Service
public class UploadServiceImpl implements UploadService {
    @Autowired
    UploadConfig uploadConfig;
    @Autowired
    ChunkService chunkService;
    @Autowired
    FileService fileService;

    /**
     * 上传文件之前，获取文件上传状态
     */
    @Override
    public Object beforeUpload(UploadReqDTO uploadReqDTO) {
        String dirPath = uploadConfig.getPath() + "/" + getDate();
        // 校验文件路径是否存在
        File dirFile = new File(dirPath);
        Boolean dirExist = !dirFile.exists() && dirFile.mkdirs();
        // 如果文件存在，直接返回文件路径 （秒传）
        FileDataDO fileDataDO = this.fileService.info(uploadReqDTO);
        if (fileDataDO != null && fileDataDO.getPath() != null && new File(fileDataDO.getPath()).exists()) {
            return uploadConfig.getHost() + fileDataDO.getPath();
        }
        // 如果文件上传了一部分（断点续传）
        List<ChunkDataDO> chunkList = this.chunkService.list(uploadReqDTO);
        List<Number> numList = new ArrayList<>();
        if (chunkList != null && chunkList.size() > 0) {
            chunkList.forEach(chunkData -> {
                // 校验切片大小是否完整
                if (new File(chunkData.getPath()).length() == Integer.parseInt(chunkData.getSize())) {
                    numList.add(chunkData.getNum());
                }
            });
        }
        // 返回已上传的切片位置列表
        HashMap<String, Object> map = new HashMap<String, Object>();
        map.put("list", numList);
        return map;
    }

    /**
     * 删除上传的文件，文件切片
     */
    @Override
    public String delete(UploadReqDTO uploadReqDTO) {
        List<ChunkDataDO> chunkDataDOList = this.chunkService.all(uploadReqDTO);
        FileDataDO fileDataDO = this.fileService.info(uploadReqDTO);
        this.deleteFiles(Collections.singletonList(chunkDataDOList));
        this.deleteFiles(Collections.singletonList(fileDataDO));
        this.chunkService.deletedByHash(uploadReqDTO);
        this.fileService.deletedByHash(uploadReqDTO);
        return "文件删除成功!";
    }

    /**
     * 上传文件
     *
     * @param file        文件
     * @param chunkDataDO 切片信息
     */
    @Override
    public Object upload(ChunkDataDO chunkDataDO) throws Exception {
        MultipartFile chunkData = chunkDataDO.getChunkData();
        if (!chunkDataDO.getSize().equals(chunkData.getSize() + "")) {
            throw new Exception("文件切片合并失败！切片大小不匹配");
        }
        String dirPath = uploadConfig.getPath() + "/" + getDate();

        // 确保目录存在
        File dir = new File(dirPath);
        if (!dir.exists()) {
            dir.mkdirs();
        }

        // 将文件保存到本地
        String filePath = dirPath + "/" + UUID.randomUUID();
        File chunkFile = new File(filePath);
        try (InputStream ins = chunkData.getInputStream(); OutputStream os = new FileOutputStream(chunkFile)) {
            int bytesRead;
            byte[] buffer = new byte[8192];
            while ((bytesRead = ins.read(buffer, 0, 8192)) != -1) {
                os.write(buffer, 0, bytesRead);
            }
            ins.close();
            os.close();
        } catch (IOException e) {
            throw new Exception("文件切片保存失败！", e);
        }
        this.deleteChunk(chunkDataDO);
        System.out.println("hash【" + chunkDataDO.getHash() + "】 ---- type【" + chunkDataDO.getType() + "】 第【" + chunkDataDO.getNum() + "】 文件切片上传成功！");
        chunkDataDO.setPath(filePath);
        chunkDataDO.setSize(chunkDataDO.getSize());
        return this.chunkService.add(chunkDataDO);
    }


    /**
     * 合并文件
     */
    @Override
    public String merge(UploadReqDTO uploadReqDTO) throws Exception {
        List<ChunkDataDO> isUploadChunkList = this.chunkService.list(uploadReqDTO);
        this.deleteFile(uploadReqDTO); // 删除已有文件，避免重复上传

        // 兼容重复上传文件切片
        HashMap<Integer, String> hashMap = new HashMap<>();
        for (ChunkDataDO chunkDataDO : isUploadChunkList) {
            hashMap.put(chunkDataDO.getNum().intValue(), chunkDataDO.getPath());
        }

        if (isUploadChunkList == null || isUploadChunkList.size() == 0 || hashMap.size() != isUploadChunkList.get(0).getSum()) {
            throw new Exception("文件切片合并失败！已上传文件不完整");
        }
        String dirPath = uploadConfig.getPath() + "/" + getDate();
        // 确保目录存在
        File dir = new File(dirPath);
        if (!dir.exists()) {
            dir.mkdirs();
        }
        String concatFilePath = dirPath + "/" + UUID.randomUUID() + "." + isUploadChunkList.get(0).getSuffix();
        File concatFile = new File(concatFilePath);
        try (OutputStream output = new FileOutputStream(concatFile)) {
            for (int i = 0; i < hashMap.size(); i++) {
                File chunkFile = new File(hashMap.get(i));
                if (!chunkFile.exists()) {
                    throw new Exception("切片文件不存在: " + chunkFile.getPath());
                }
                try (InputStream input = new FileInputStream(chunkFile)) {
                    byte[] buffer = new byte[1024];
                    int len;
                    while ((len = input.read(buffer)) > 0) {
                        output.write(buffer, 0, len);
                    }
                    input.close();
                }
                chunkFile.delete();
            }
            output.close();
        } catch (IOException e) {
            throw new Exception("文件合并失败", e);
        }
        this.chunkService.deletedByHash(uploadReqDTO);
        this.fileService.add(new FileDataDO(concatFilePath, uploadReqDTO, (int) concatFile.length()));
        return uploadConfig.getHost() + concatFilePath;
    }


    /**
     * 删除已上传的切片（数据库信息 + 实际文件）
     *
     * @param chunkDataDO
     */
    @Async
    private void deleteChunk(ChunkDataDO chunkDataDO) {
        UploadReqDTO uploadReqDTO = new UploadReqDTO(chunkDataDO.getHash(), chunkDataDO.getType(), chunkDataDO.getNum());
        List<ChunkDataDO> isLoadChunkDataDOS = this.chunkService.deletedByHashAndNum(uploadReqDTO);
        isLoadChunkDataDOS.forEach(isLoadChunkDataDO -> {
            File isUploadFile = new File(isLoadChunkDataDO.getPath());
            if (isUploadFile.exists()) {
                isUploadFile.delete();
            }
        });
    }


    /**
     * 删除已上传的完整文件（如果存在的话）
     */
    @Async
    private void deleteFile(UploadReqDTO uploadReqDTO) {
        FileDataDO fileDataDO = this.fileService.info(uploadReqDTO);
        this.deleteFiles(Collections.singletonList(fileDataDO));
        this.fileService.deletedByHash(uploadReqDTO);
    }


    /**
     * 获取当前时间
     */
    private String getDate() {
        SimpleDateFormat dateFormat = new SimpleDateFormat("YYYY-MM-dd");
        return dateFormat.format(new Date());
    }

    /**
     * 删除文件
     *
     * @param objects
     */
    @Async
    private Boolean deleteFiles(List<Object> objects) {
        objects.forEach(object -> {
            try {
                if (object instanceof ChunkDataDO) {
                    ChunkDataDO chunkDataDO = (ChunkDataDO) object;
                    new File(chunkDataDO.getPath()).delete();
                } else if (object instanceof FileDataDO) {
                    FileDataDO fileDataDO = (FileDataDO) object;
                    new File(fileDataDO.getPath()).delete();
                }
            } catch (Exception e) {
                System.out.println("\ne.getMessage() = " + e.getMessage());
            }
        });
        return true;
    }
}
