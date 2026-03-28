import React, { useState, useEffect, useCallback, useRef } from 'react'
import {
  ChevronRight, Home, FolderPlus, Upload, RefreshCw,
  X, Check, Pencil, Trash2,
} from 'lucide-react'
import { getWarehouseTree, uploadFiles, createFolder, deleteItem, renameItem, getDownloadUrl } from '../api/client'
import type { FileNode } from '../types'

function findNode(nodes: FileNode[], path: string): FileNode | null {
  for (const n of nodes) {
    if (n.path === path) return n
    if (n.isDirectory && n.children) {
      const found = findNode(n.children, path)
      if (found) return found
    }
  }
  return null
}

function getChildren(tree: FileNode[], currentPath: string): FileNode[] {
  if (currentPath === '') return tree
  const node = findNode(tree, currentPath)
  return node?.children ?? []
}

function buildBreadcrumb(path: string) {
  if (!path) return []
  const parts = path.split('/')
  return parts.map((p, i) => ({ name: p, path: parts.slice(0, i + 1).join('/') }))
}

// ─── Folder Card ────────────────────────────────────────────────────────────
interface FolderCardProps {
  node: FileNode
  onOpen: (path: string) => void
  onDeleted: () => void
  onRenamed: () => void
}

function FolderCard({ node, onOpen, onDeleted, onRenamed }: FolderCardProps) {
  const [renaming, setRenaming] = useState(false)
  const [newName, setNewName] = useState(node.name)
  const [hovered, setHovered] = useState(false)
  const inputRef = useRef<HTMLInputElement>(null)

  useEffect(() => { if (renaming) inputRef.current?.focus() }, [renaming])

  const handleRename = async () => {
    const name = newName.trim()
    if (!name || name === node.name) { setRenaming(false); setNewName(node.name); return }
    await renameItem(node.path, name)
    setRenaming(false)
    onRenamed()
  }

  const handleDelete = async () => {
    if (!window.confirm(`确定删除文件夹「${node.name}」及其所有内容？`)) return
    await deleteItem(node.path)
    onDeleted()
  }

  return (
    <div
      className="relative group"
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
    >
      <div
        onClick={() => !renaming && onOpen(node.path)}
        className="flex flex-col items-center p-4 bg-white rounded-xl border border-gray-200 hover:border-blue-300 hover:shadow-md transition-all cursor-pointer text-center select-none"
      >
        <svg viewBox="0 0 48 48" className="w-12 h-12 mb-2 flex-shrink-0">
          <path d="M6 10 C6 8 7.5 6 10 6 L20 6 L24 10 L42 10 C44 10 46 12 46 14 L46 38 C46 40 44 42 42 42 L6 42 C4 42 2 40 2 38 L2 14 C2 12 4 10 6 10Z" fill="#FCD34D" />
          <path d="M2 18 L46 18 L46 38 C46 40 44 42 42 42 L6 42 C4 42 2 40 2 38Z" fill="#FBBF24" />
        </svg>

        {renaming ? (
          <input
            ref={inputRef}
            value={newName}
            onChange={e => setNewName(e.target.value)}
            onKeyDown={e => { if (e.key === 'Enter') handleRename(); if (e.key === 'Escape') { setRenaming(false); setNewName(node.name) } }}
            onBlur={handleRename}
            onClick={e => e.stopPropagation()}
            className="w-full text-xs text-center border border-blue-300 rounded px-1 py-0.5 outline-none"
          />
        ) : (
          <span className="text-xs text-gray-700 font-medium truncate w-full">{node.name}</span>
        )}
        {node.children && !renaming && (
          <span className="text-xs text-gray-400 mt-0.5">{node.children.length} 项</span>
        )}
      </div>

      {/* Hover action buttons */}
      {hovered && !renaming && (
        <div className="absolute top-1.5 right-1.5 flex gap-1" onClick={e => e.stopPropagation()}>
          <button
            onClick={() => { setRenaming(true); setNewName(node.name) }}
            className="p-1 bg-white border border-gray-200 rounded-md shadow-sm hover:bg-blue-50 hover:border-blue-300 transition-colors"
            title="重命名"
          >
            <Pencil size={11} className="text-gray-500" />
          </button>
          <button
            onClick={handleDelete}
            className="p-1 bg-white border border-gray-200 rounded-md shadow-sm hover:bg-red-50 hover:border-red-300 transition-colors"
            title="删除"
          >
            <Trash2 size={11} className="text-red-400" />
          </button>
        </div>
      )}
    </div>
  )
}

// ─── File Card ───────────────────────────────────────────────────────────────
interface FileCardProps {
  node: FileNode
  onDeleted: () => void
  onRenamed: () => void
}

function FileCard({ node, onDeleted, onRenamed }: FileCardProps) {
  const [renaming, setRenaming] = useState(false)
  const [newName, setNewName] = useState(node.name)
  const [hovered, setHovered] = useState(false)
  const inputRef = useRef<HTMLInputElement>(null)

  useEffect(() => { if (renaming) inputRef.current?.focus() }, [renaming])

  const handleRename = async () => {
    const name = newName.trim()
    if (!name || name === node.name) { setRenaming(false); setNewName(node.name); return }
    await renameItem(node.path, name)
    setRenaming(false)
    onRenamed()
  }

  const handleDelete = async () => {
    if (!window.confirm(`确定删除文件「${node.name}」？`)) return
    await deleteItem(node.path)
    onDeleted()
  }

  return (
    <div
      className="relative group"
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
    >
      <a
        href={renaming ? undefined : getDownloadUrl(node.path)}
        download={!renaming}
        onClick={e => renaming && e.preventDefault()}
        className="flex flex-col items-center p-4 bg-white rounded-xl border border-gray-200 hover:border-green-300 hover:shadow-md transition-all text-center"
      >
        <svg viewBox="0 0 48 48" className="w-12 h-12 mb-2 flex-shrink-0">
          <rect x="6" y="2" width="36" height="44" rx="3" fill="white" stroke="#D1FAE5" strokeWidth="1" />
          <path d="M28 2 L38 12 L28 12Z" fill="#6EE7B7" />
          <path d="M28 2 L28 12 L38 12Z" fill="#BBF7D0" />
          <rect x="12" y="18" width="24" height="2" rx="1" fill="#34D399" />
          <rect x="12" y="23" width="20" height="2" rx="1" fill="#6EE7B7" />
          <rect x="12" y="28" width="22" height="2" rx="1" fill="#6EE7B7" />
          <rect x="12" y="33" width="16" height="2" rx="1" fill="#A7F3D0" />
          <text x="24" y="44" fontSize="6" fill="#059669" textAnchor="middle" fontWeight="bold">XLSX</text>
        </svg>

        {renaming ? (
          <input
            ref={inputRef}
            value={newName}
            onChange={e => setNewName(e.target.value)}
            onKeyDown={e => { if (e.key === 'Enter') handleRename(); if (e.key === 'Escape') { setRenaming(false); setNewName(node.name) } }}
            onBlur={handleRename}
            onClick={e => e.preventDefault()}
            className="w-full text-xs text-center border border-blue-300 rounded px-1 py-0.5 outline-none"
          />
        ) : (
          <span className="text-xs text-gray-700 font-medium truncate w-full" title={node.name}>{node.name}</span>
        )}
        {!renaming && <span className="text-xs text-gray-400 mt-0.5">点击下载</span>}
      </a>

      {hovered && !renaming && (
        <div className="absolute top-1.5 right-1.5 flex gap-1" onClick={e => e.stopPropagation()}>
          <button
            onClick={() => { setRenaming(true); setNewName(node.name) }}
            className="p-1 bg-white border border-gray-200 rounded-md shadow-sm hover:bg-blue-50 hover:border-blue-300 transition-colors"
            title="重命名"
          >
            <Pencil size={11} className="text-gray-500" />
          </button>
          <button
            onClick={handleDelete}
            className="p-1 bg-white border border-gray-200 rounded-md shadow-sm hover:bg-red-50 hover:border-red-300 transition-colors"
            title="删除"
          >
            <Trash2 size={11} className="text-red-400" />
          </button>
        </div>
      )}
    </div>
  )
}

// ─── Main Page ───────────────────────────────────────────────────────────────
export function WarehousePage() {
  const [tree, setTree] = useState<FileNode[]>([])
  const [currentPath, setCurrentPath] = useState('')
  const [loading, setLoading] = useState(false)
  const [uploading, setUploading] = useState(false)
  const [uploadStatus, setUploadStatus] = useState<string | null>(null)
  const [showNewFolder, setShowNewFolder] = useState(false)
  const [newFolderName, setNewFolderName] = useState('')
  const [folderError, setFolderError] = useState('')
  const newFolderInputRef = useRef<HTMLInputElement>(null)
  const fileInputRef = useRef<HTMLInputElement>(null)

  const refresh = useCallback(async () => {
    setLoading(true)
    try {
      const data = await getWarehouseTree()
      setTree(data)
    } catch { /* ignore */ }
    finally { setLoading(false) }
  }, [])

  useEffect(() => { refresh() }, [refresh])
  useEffect(() => { if (showNewFolder) setTimeout(() => newFolderInputRef.current?.focus(), 50) }, [showNewFolder])

  const currentItems = getChildren(tree, currentPath)
  const folders = currentItems.filter(n => n.isDirectory)
  const files = currentItems.filter(n => !n.isDirectory)
  const breadcrumb = buildBreadcrumb(currentPath)

  const handleUpload = async (fileList: FileList | null) => {
    if (!fileList) return
    const validFiles = Array.from(fileList).filter(f => /\.(xlsx|xls)$/i.test(f.name))
    if (!validFiles.length) { setUploadStatus('请选择 .xlsx 或 .xls 文件'); return }
    setUploading(true); setUploadStatus(null)
    try {
      const res = await uploadFiles(validFiles, currentPath)
      setUploadStatus(res.message)
      await refresh()
    } catch { setUploadStatus('上传失败，请重试') }
    finally {
      setUploading(false)
      if (fileInputRef.current) fileInputRef.current.value = ''
      setTimeout(() => setUploadStatus(null), 3000)
    }
  }

  const handleCreateFolder = async () => {
    const name = newFolderName.trim()
    if (!name) { setFolderError('请输入名称'); return }
    if (/[/\\:*?"<>|]/.test(name)) { setFolderError('含非法字符'); return }
    const fullPath = currentPath ? `${currentPath}/${name}` : name
    await createFolder(fullPath)
    setShowNewFolder(false); setNewFolderName(''); setFolderError('')
    await refresh()
  }

  return (
    <div className="h-full flex flex-col bg-gray-50">
      {/* Toolbar */}
      <div className="bg-white border-b border-gray-200 px-6 py-3 flex items-center gap-3">
        <div className="flex items-center gap-1 flex-1 min-w-0 text-sm">
          <button onClick={() => setCurrentPath('')} className="flex items-center gap-1 text-[#1e3a5f] hover:underline font-medium">
            <Home size={14} />仓库
          </button>
          {breadcrumb.map(crumb => (
            <React.Fragment key={crumb.path}>
              <ChevronRight size={14} className="text-gray-400 flex-shrink-0" />
              <button onClick={() => setCurrentPath(crumb.path)} className="text-[#1e3a5f] hover:underline truncate max-w-[160px]">
                {crumb.name}
              </button>
            </React.Fragment>
          ))}
        </div>

        <div className="flex items-center gap-2">
          {uploadStatus && <span className="text-xs text-green-600 bg-green-50 px-2 py-1 rounded-lg">{uploadStatus}</span>}
          <button onClick={refresh} disabled={loading} className="p-2 hover:bg-gray-100 rounded-lg transition-colors" title="刷新">
            <RefreshCw size={15} className={`text-gray-500 ${loading ? 'animate-spin' : ''}`} />
          </button>
          <button
            onClick={() => { setShowNewFolder(true); setNewFolderName(''); setFolderError('') }}
            className="flex items-center gap-1.5 text-sm px-3 py-1.5 border border-gray-200 rounded-lg hover:bg-gray-50 text-gray-700 transition-colors"
          >
            <FolderPlus size={14} />新建文件夹
          </button>
          <input ref={fileInputRef} type="file" multiple accept=".xlsx,.xls" className="hidden" onChange={e => handleUpload(e.target.files)} />
          <button
            onClick={() => fileInputRef.current?.click()}
            disabled={uploading}
            className="flex items-center gap-1.5 text-sm px-3 py-1.5 bg-[#1e3a5f] hover:bg-[#16304f] disabled:bg-blue-300 text-white rounded-lg transition-colors"
          >
            <Upload size={14} />{uploading ? '上传中...' : '上传文件'}
          </button>
        </div>
      </div>

      {/* New folder bar */}
      {showNewFolder && (
        <div className="bg-blue-50 border-b border-blue-100 px-6 py-2.5 flex items-center gap-3">
          <FolderPlus size={16} className="text-[#1e3a5f]" />
          <input
            ref={newFolderInputRef}
            value={newFolderName}
            onChange={e => { setNewFolderName(e.target.value); setFolderError('') }}
            onKeyDown={e => { if (e.key === 'Enter') handleCreateFolder(); if (e.key === 'Escape') setShowNewFolder(false) }}
            placeholder="输入文件夹名称..."
            className="flex-1 text-sm bg-white border border-blue-200 rounded-lg px-3 py-1.5 outline-none focus:ring-2 focus:ring-blue-300"
          />
          {folderError && <span className="text-xs text-red-500">{folderError}</span>}
          <button onClick={handleCreateFolder} className="p-1.5 bg-[#1e3a5f] text-white rounded-lg hover:bg-[#16304f]"><Check size={14} /></button>
          <button onClick={() => setShowNewFolder(false)} className="p-1.5 hover:bg-blue-100 rounded-lg text-gray-500"><X size={14} /></button>
        </div>
      )}

      {/* Content */}
      <div className="flex-1 overflow-y-auto p-6">
        {currentItems.length === 0 && !loading ? (
          <div className="flex flex-col items-center justify-center h-64 text-gray-400">
            <svg viewBox="0 0 48 48" className="w-16 h-16 mb-3 opacity-20">
              <path d="M6 10 C6 8 7.5 6 10 6 L20 6 L24 10 L42 10 C44 10 46 12 46 14 L46 38 C46 40 44 42 42 42 L6 42 C4 42 2 40 2 38 L2 14 C2 12 4 10 6 10Z" fill="#9CA3AF" />
            </svg>
            <p className="text-sm">此目录为空</p>
            <p className="text-xs mt-1">上传 Excel 文件或新建子文件夹</p>
          </div>
        ) : (
          <>
            {folders.length > 0 && (
              <div className="mb-6">
                <h3 className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-3">文件夹</h3>
                <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-3">
                  {folders.map(node => (
                    <FolderCard
                      key={node.path}
                      node={node}
                      onOpen={setCurrentPath}
                      onDeleted={refresh}
                      onRenamed={refresh}
                    />
                  ))}
                </div>
              </div>
            )}

            {files.length > 0 && (
              <div>
                <h3 className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-3">文件</h3>
                <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-3">
                  {files.map(node => (
                    <FileCard
                      key={node.path}
                      node={node}
                      onDeleted={refresh}
                      onRenamed={refresh}
                    />
                  ))}
                </div>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  )
}
