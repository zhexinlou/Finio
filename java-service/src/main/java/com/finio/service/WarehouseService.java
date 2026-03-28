package com.finio.service;

import com.finio.model.FileNode;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;

import java.io.File;
import java.nio.file.Paths;
import java.util.ArrayList;
import java.util.List;

@Service
public class WarehouseService {

    @Value("${finio.warehouse.path}")
    private String warehousePath;

    public List<FileNode> getTree() {
        File root = new File(warehousePath);
        if (!root.exists()) root.mkdirs();
        return buildTree(root, "");
    }

    public boolean createFolder(String relPath) {
        File dir = new File(warehousePath, relPath);
        return dir.mkdirs();
    }

    /** 删除文件或文件夹（递归），返回被删文件的相对路径列表（用于清理索引） */
    public List<String> deleteItem(String relPath) {
        File item = new File(warehousePath, relPath);
        List<String> deleted = new ArrayList<>();
        collectRelFilePaths(item, deleted);
        deleteRecursive(item);
        return deleted;
    }

    /** 重命名文件或文件夹，返回旧的相对路径列表（用于清理索引） */
    public RenameResult renameItem(String relPath, String newName) {
        File item = new File(warehousePath, relPath);
        File newItem = new File(item.getParentFile(), newName);
        List<String> oldPaths = new ArrayList<>();
        collectRelFilePaths(item, oldPaths);
        boolean success = item.renameTo(newItem);
        String newRelPath = Paths.get(warehousePath).relativize(newItem.toPath()).toString();
        return new RenameResult(success, oldPaths, newRelPath, newItem);
    }

    private void collectRelFilePaths(File f, List<String> result) {
        if (f.isFile()) {
            result.add(Paths.get(warehousePath).relativize(f.toPath()).toString());
        } else if (f.isDirectory()) {
            File[] children = f.listFiles();
            if (children != null) for (File c : children) collectRelFilePaths(c, result);
        }
    }

    private void deleteRecursive(File f) {
        if (f.isDirectory()) {
            File[] children = f.listFiles();
            if (children != null) for (File c : children) deleteRecursive(c);
        }
        f.delete();
    }

    private List<FileNode> buildTree(File dir, String relPath) {
        List<FileNode> nodes = new ArrayList<>();
        File[] files = dir.listFiles();
        if (files == null) return nodes;

        for (File f : files) {
            if (f.getName().startsWith(".")) continue;
            String childRel = relPath.isEmpty() ? f.getName() : relPath + "/" + f.getName();
            FileNode node = new FileNode(f.getName(), childRel, f.isDirectory());
            if (f.isDirectory()) {
                node.setChildren(buildTree(f, childRel));
            }
            nodes.add(node);
        }
        return nodes;
    }

    public record RenameResult(boolean success, List<String> oldPaths, String newRelPath, File newFile) {}
}
