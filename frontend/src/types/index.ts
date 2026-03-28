export interface Message {
  id: string
  role: 'user' | 'assistant'
  type: 'text' | 'file'
  content: string
  filePath?: string
  timestamp: string  // ISO string for localStorage serialization
}

export interface Conversation {
  id: string
  title: string
  messages: Message[]
  createdAt: string
  updatedAt: string
}

export interface ChatRequest {
  message: string
  history: { role: string; content: string }[]
}

export interface ChatResponse {
  type: 'text' | 'file'
  message: string
  file_path?: string
}

export interface FileNode {
  name: string
  path: string
  isDirectory: boolean
  children?: FileNode[]
}

export interface UploadResponse {
  success: boolean
  count: number
  message: string
}
