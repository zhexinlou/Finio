package com.finio.controller;

import com.finio.service.AiProxyService;
import com.finio.service.FileService;
import org.springframework.core.io.Resource;
import org.springframework.core.io.UrlResource;
import org.springframework.http.HttpHeaders;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

import java.io.IOException;
import java.net.MalformedURLException;
import java.net.URLEncoder;
import java.nio.charset.StandardCharsets;
import java.nio.file.Path;
import java.util.HashMap;
import java.util.Map;

@RestController
@RequestMapping("/api/files")
public class FileController {

    private final FileService fileService;
    private final AiProxyService aiProxyService;

    public FileController(FileService fileService, AiProxyService aiProxyService) {
        this.fileService = fileService;
        this.aiProxyService = aiProxyService;
    }

    @PostMapping("/upload")
    public ResponseEntity<Map<String, Object>> upload(
            @RequestParam("file") MultipartFile[] files,
            @RequestParam(value = "folder", defaultValue = "") String folder) throws IOException {

        Map<String, Object> result = new HashMap<>();
        int success = 0;

        for (MultipartFile file : files) {
            String relPath = fileService.saveFile(file, folder);
            Path absPath = fileService.resolveAbsolutePath(relPath);
            aiProxyService.indexFile(absPath.toAbsolutePath().toString());
            success++;
        }

        result.put("success", true);
        result.put("count", success);
        result.put("message", "上传成功 " + success + " 个文件");
        return ResponseEntity.ok(result);
    }

    @GetMapping("/download")
    public ResponseEntity<Resource> download(@RequestParam("path") String relPath) throws MalformedURLException {
        Path absPath = fileService.resolveAbsolutePath(relPath);
        Resource resource = new UrlResource(absPath.toUri());

        if (!resource.exists()) {
            return ResponseEntity.notFound().build();
        }

        String filename = absPath.getFileName().toString();
        String encodedFilename = URLEncoder.encode(filename, StandardCharsets.UTF_8).replace("+", "%20");
        return ResponseEntity.ok()
                .header(HttpHeaders.CONTENT_DISPOSITION, "attachment; filename*=UTF-8''" + encodedFilename)
                .contentType(MediaType.APPLICATION_OCTET_STREAM)
                .body(resource);
    }
}
