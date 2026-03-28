import React, { useState, useEffect, useCallback } from 'react'
import { Folder, FolderOpen, FileSpreadsheet, RefreshCw, ChevronRight, ChevronDown } from 'lucide-react'
import type { FileNode } from '../types'
import { getWarehouseTree } from '../api/client'
import { FileUpload } from './FileUpload'

interface TreeNodeProps {
  node: FileNode
  level: number
  onFolderSelect: (path: string) => void
  selectedFolder: string
}

function TreeNode({ node, level, onFolderSelect, selectedFolder }: TreeNodeProps) {
  const [expanded, setExpanded] = useState(true)
  const isSelected = node.isDirectory && node.path === selectedFolder

  return (
    <div>
      <div
        className={`flex items-center gap-1 py-1 px-2 rounded cursor-pointer hover:bg-blue-50 text-sm transition-colors ${isSelected ? 'bg-blue-100 text-blue-900 font-medium' : 'text-gray-700'}`}
        style={{ paddingLeft: `${level * 12 + 8}px` }}
        onClick={() => {
          if (node.isDirectory) {
            setExpanded(!expanded)
            onFolderSelect(node.path)
          }
        }}
      >
        {node.isDirectory ? (
          <>
            <span className="text-gray-400">
              {expanded ? <ChevronDown size={12} /> : <ChevronRight size={12} />}
            </span>
            {expanded ? <FolderOpen size={14} className="text-yellow-500" /> : <Folder size={14} className="text-yellow-500" />}
          </>
        ) : (
          <>
            <span className="w-3" />
            <FileSpreadsheet size={14} className="text-green-600" />
          </>
        )}
        <span className="ml-1 truncate">{node.name}</span>
      </div>
      {node.isDirectory && expanded && node.children && (
        <div>
          {node.children.map(child => (
            <TreeNode
              key={child.path}
              node={child}
              level={level + 1}
              onFolderSelect={onFolderSelect}
              selectedFolder={selectedFolder}
            />
          ))}
        </div>
      )}
    </div>
  )
}

export function WarehouseTree() {
  const [tree, setTree] = useState<FileNode[]>([])
  const [selectedFolder, setSelectedFolder] = useState('')
  const [loading, setLoading] = useState(false)

  const refresh = useCallback(async () => {
    setLoading(true)
    try {
      const data = await getWarehouseTree()
      setTree(data)
    } catch {
      // ignore
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => { refresh() }, [refresh])

  // Collect all folders
  const folders: string[] = ['']
  const collectFolders = (nodes: FileNode[]) => {
    for (const n of nodes) {
      if (n.isDirectory) {
        folders.push(n.path)
        if (n.children) collectFolders(n.children)
      }
    }
  }
  collectFolders(tree)

  return (
    <div className="flex flex-col h-full">
      <div className="flex items-center justify-between mb-3">
        <h2 className="text-sm font-semibold text-gray-600 uppercase tracking-wide">文件仓库</h2>
        <button
          onClick={refresh}
          disabled={loading}
          className="p-1 hover:bg-gray-100 rounded transition-colors"
          title="刷新"
        >
          <RefreshCw size={14} className={`text-gray-500 ${loading ? 'animate-spin' : ''}`} />
        </button>
      </div>

      {/* Folder selector */}
      <div className="mb-3">
        <label className="text-xs text-gray-500 mb-1 block">上传到目录</label>
        <select
          value={selectedFolder}
          onChange={e => setSelectedFolder(e.target.value)}
          className="w-full text-sm border border-gray-200 rounded-lg px-2 py-1.5 focus:outline-none focus:ring-2 focus:ring-blue-300 bg-white"
        >
          <option value="">/ 根目录</option>
          {folders.filter(f => f !== '').map(f => (
            <option key={f} value={f}>{f}</option>
          ))}
        </select>
      </div>

      {/* File upload */}
      <FileUpload selectedFolder={selectedFolder} onUploadSuccess={refresh} />

      {/* Tree */}
      <div className="flex-1 overflow-y-auto mt-4 border-t border-gray-100 pt-3">
        {tree.length === 0 ? (
          <p className="text-xs text-gray-400 text-center py-4">仓库为空，请上传文件</p>
        ) : (
          tree.map(node => (
            <TreeNode
              key={node.path}
              node={node}
              level={0}
              onFolderSelect={setSelectedFolder}
              selectedFolder={selectedFolder}
            />
          ))
        )}
      </div>
    </div>
  )
}
