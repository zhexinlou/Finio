import React, { useRef, useState } from 'react'
import { Upload, CheckCircle, AlertCircle } from 'lucide-react'
import { uploadFiles } from '../api/client'

interface Props {
  selectedFolder: string
  onUploadSuccess: () => void
}

export function FileUpload({ selectedFolder, onUploadSuccess }: Props) {
  const inputRef = useRef<HTMLInputElement>(null)
  const [uploading, setUploading] = useState(false)
  const [status, setStatus] = useState<{ type: 'success' | 'error'; message: string } | null>(null)

  const handleFiles = async (files: FileList | null) => {
    if (!files || files.length === 0) return
    const fileArr = Array.from(files).filter(f => /\.(xlsx|xls)$/i.test(f.name))
    if (fileArr.length === 0) {
      setStatus({ type: 'error', message: '请选择 .xlsx 或 .xls 格式的文件' })
      return
    }

    setUploading(true)
    setStatus(null)
    try {
      const res = await uploadFiles(fileArr, selectedFolder)
      setStatus({ type: 'success', message: res.message })
      onUploadSuccess()
    } catch {
      setStatus({ type: 'error', message: '上传失败，请重试' })
    } finally {
      setUploading(false)
      if (inputRef.current) inputRef.current.value = ''
    }
  }

  return (
    <div className="mt-3">
      <input
        ref={inputRef}
        type="file"
        multiple
        accept=".xlsx,.xls"
        className="hidden"
        onChange={e => handleFiles(e.target.files)}
      />
      <button
        onClick={() => inputRef.current?.click()}
        disabled={uploading}
        className="w-full flex items-center justify-center gap-2 bg-blue-900 hover:bg-blue-800 disabled:bg-blue-300 text-white text-sm rounded-lg px-4 py-2 transition-colors"
      >
        <Upload size={14} />
        {uploading ? '上传中...' : '上传 Excel 文件'}
      </button>
      {status && (
        <div className={`mt-2 flex items-center gap-1 text-xs ${status.type === 'success' ? 'text-green-600' : 'text-red-600'}`}>
          {status.type === 'success' ? <CheckCircle size={12} /> : <AlertCircle size={12} />}
          <span>{status.message}</span>
        </div>
      )}
    </div>
  )
}
