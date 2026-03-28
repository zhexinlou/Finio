import axios from 'axios'
import type { ChatRequest, ChatResponse, FileNode, UploadResponse } from '../types'

const api = axios.create({
  baseURL: '/api',
  timeout: 90000,
})

export const sendMessage = async (request: ChatRequest): Promise<ChatResponse> => {
  const res = await api.post<ChatResponse>('/chat', request)
  return res.data
}

export const getWarehouseTree = async (): Promise<FileNode[]> => {
  const res = await api.get<FileNode[]>('/warehouse/tree')
  return res.data
}

export const uploadFiles = async (
  files: File[],
  folder: string
): Promise<UploadResponse> => {
  const formData = new FormData()
  files.forEach(f => formData.append('file', f))
  formData.append('folder', folder)
  const res = await api.post<UploadResponse>('/files/upload', formData, {
    headers: { 'Content-Type': 'multipart/form-data' },
  })
  return res.data
}

export const getDownloadUrl = (filePath: string): string => {
  return `/api/files/download?path=${encodeURIComponent(filePath)}`
}

export const createFolder = async (path: string): Promise<{ success: boolean; message: string }> => {
  const res = await api.post('/warehouse/mkdir', { path })
  return res.data
}

export const deleteItem = async (path: string): Promise<{ success: boolean; message: string }> => {
  const res = await api.delete(`/warehouse/delete?path=${encodeURIComponent(path)}`)
  return res.data
}

export const renameItem = async (path: string, newName: string): Promise<{ success: boolean; message: string }> => {
  const res = await api.post('/warehouse/rename', { path, newName })
  return res.data
}
