package com.finio.controller;

import com.finio.model.FileNode;
import com.finio.service.AiProxyService;
import com.finio.service.WarehouseService;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.io.File;
import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/warehouse")
public class WarehouseController {

    private final WarehouseService warehouseService;
    private final AiProxyService aiProxyService;

    public WarehouseController(WarehouseService warehouseService, AiProxyService aiProxyService) {
        this.warehouseService = warehouseService;
        this.aiProxyService = aiProxyService;
    }

    @GetMapping("/tree")
    public List<FileNode> tree() {
        return warehouseService.getTree();
    }

    @PostMapping("/mkdir")
    public ResponseEntity<Map<String, Object>> mkdir(@RequestBody Map<String, String> body) {
        String path = body.get("path");
        if (path == null || path.isBlank()) {
            return ResponseEntity.badRequest().body(Map.of("success", false, "message", "路径不能为空"));
        }
        boolean created = warehouseService.createFolder(path);
        return ResponseEntity.ok(Map.of("success", created, "message", created ? "文件夹创建成功" : "文件夹已存在"));
    }

    @DeleteMapping("/delete")
    public ResponseEntity<Map<String, Object>> delete(@RequestParam("path") String path) {
        if (path == null || path.isBlank()) {
            return ResponseEntity.badRequest().body(Map.of("success", false, "message", "路径不能为空"));
        }
        List<String> deletedPaths = warehouseService.deleteItem(path);
        for (String relPath : deletedPaths) {
            aiProxyService.removeIndex(relPath);
        }
        return ResponseEntity.ok(Map.of("success", true, "message", "删除成功"));
    }

    @PostMapping("/rename")
    public ResponseEntity<Map<String, Object>> rename(@RequestBody Map<String, String> body) {
        String relPath = body.get("path");
        String newName = body.get("newName");
        if (relPath == null || newName == null || newName.isBlank()) {
            return ResponseEntity.badRequest().body(Map.of("success", false, "message", "参数错误"));
        }
        WarehouseService.RenameResult result = warehouseService.renameItem(relPath, newName);
        if (result.success()) {
            // Remove old indexes
            for (String oldPath : result.oldPaths()) {
                aiProxyService.removeIndex(oldPath);
            }
            // Re-index new files if applicable
            if (result.newFile().isFile()) {
                aiProxyService.indexFile(result.newFile().getAbsolutePath());
            }
        }
        return ResponseEntity.ok(Map.of("success", result.success(), "message", result.success() ? "重命名成功" : "重命名失败"));
    }
}
