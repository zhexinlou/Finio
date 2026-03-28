import React from 'react'
import { MessageSquare, FolderOpen } from 'lucide-react'

export type Page = 'chat' | 'warehouse'

interface Props {
  currentPage: Page
  onNavigate: (page: Page) => void
}

export function Navbar({ currentPage, onNavigate }: Props) {
  return (
    <nav className="h-14 bg-[#1e3a5f] flex items-center px-6 gap-8 shadow-md flex-shrink-0">
      {/* Logo */}
      <div className="flex items-center gap-2 mr-4">
        <div className="w-7 h-7 bg-white rounded-lg flex items-center justify-center">
          <span className="text-[#1e3a5f] text-sm font-black">F</span>
        </div>
        <span className="text-white font-bold text-lg tracking-wide">Finio</span>
      </div>

      {/* Nav links */}
      <button
        onClick={() => onNavigate('chat')}
        className={`flex items-center gap-2 px-3 py-1.5 rounded-lg text-sm font-medium transition-colors ${
          currentPage === 'chat'
            ? 'bg-white/20 text-white'
            : 'text-white/60 hover:text-white hover:bg-white/10'
        }`}
      >
        <MessageSquare size={15} />
        AI 对话
      </button>

      <button
        onClick={() => onNavigate('warehouse')}
        className={`flex items-center gap-2 px-3 py-1.5 rounded-lg text-sm font-medium transition-colors ${
          currentPage === 'warehouse'
            ? 'bg-white/20 text-white'
            : 'text-white/60 hover:text-white hover:bg-white/10'
        }`}
      >
        <FolderOpen size={15} />
        文件仓库
      </button>
    </nav>
  )
}
