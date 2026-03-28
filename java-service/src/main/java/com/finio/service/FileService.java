package com.finio.service;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;
import org.springframework.web.multipart.MultipartFile;

import java.io.IOException;
import java.nio.file.Files;
import java.nio.file.Path;
import java.nio.file.Paths;

@Service
public class FileService {

    @Value("${finio.warehouse.path}")
    private String warehousePath;

    public String saveFile(MultipartFile file, String targetFolder) throws IOException {
        String folder = (targetFolder == null || targetFolder.isBlank()) ? "" : targetFolder;
        Path dir = Paths.get(warehousePath, folder);
        Files.createDirectories(dir);

        String filename = file.getOriginalFilename();
        Path dest = dir.resolve(filename);
        file.transferTo(dest.toFile());

        // Return relative path
        return Paths.get(warehousePath).relativize(dest).toString();
    }

    public Path resolveAbsolutePath(String relPath) {
        return Paths.get(warehousePath, relPath);
    }

    public String getWarehousePath() {
        return warehousePath;
    }
}
