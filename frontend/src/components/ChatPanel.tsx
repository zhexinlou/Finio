import React, { useRef, useEffect, useState, KeyboardEvent } from 'react'
import { Send, Square, Plus, Trash2, MessageSquare } from 'lucide-react'
import { useChat } from '../hooks/useChat'
import { MessageBubble } from './MessageBubble'
import type { Conversation } from '../types'

// ─── Conversation Sidebar ────────────────────────────────────────────────────
interface SidebarProps {
  conversations: Conversation[]
  activeId: string
  onNew: () => void
  onSwitch: (id: string) => void
  onDelete: (id: string) => void
}

function ConversationSidebar({ conversations, activeId, onNew, onSwitch, onDelete }: SidebarProps) {
  return (
    <div className="w-56 bg-[#162d4a] flex flex-col flex-shrink-0">
      <div className="p-3 border-b border-white/10">
        <button
          onClick={onNew}
          className="w-full flex items-center gap-2 px-3 py-2 rounded-lg bg-white/10 hover:bg-white/20 text-white text-sm transition-colors"
        >
          <Plus size={14} />
          新对话
        </button>
      </div>

      <div className="flex-1 overflow-y-auto py-2">
        {conversations.map(conv => {
          const isActive = conv.id === activeId
          const date = new Date(conv.updatedAt)
          const dateStr = date.toLocaleDateString('zh-CN', { month: 'numeric', day: 'numeric' })

          return (
            <div
              key={conv.id}
              onClick={() => onSwitch(conv.id)}
              className={`group mx-2 mb-0.5 rounded-lg px-3 py-2.5 cursor-pointer flex items-start justify-between gap-1 transition-colors ${
                isActive ? 'bg-white/20 text-white' : 'text-white/60 hover:bg-white/10 hover:text-white'
              }`}
            >
              <div className="flex items-start gap-2 min-w-0">
                <MessageSquare size={13} className="flex-shrink-0 mt-0.5 opacity-60" />
                <div className="min-w-0">
                  <p className="text-xs font-medium truncate leading-tight">{conv.title}</p>
                  <p className="text-xs opacity-40 mt-0.5">{dateStr}</p>
                </div>
              </div>
              <button
                onClick={e => { e.stopPropagation(); onDelete(conv.id) }}
                className="opacity-0 group-hover:opacity-100 p-0.5 hover:text-red-400 transition-all flex-shrink-0 mt-0.5"
              >
                <Trash2 size={11} />
              </button>
            </div>
          )
        })}
      </div>
    </div>
  )
}

// ─── Chat Area ───────────────────────────────────────────────────────────────
export function ChatPanel() {
  const { conversations, activeId, messages, loading, send, stop, createConversation, switchConversation, deleteConversation } = useChat()
  const [input, setInput] = useState('')
  const bottomRef = useRef<HTMLDivElement>(null)
  const textareaRef = useRef<HTMLTextAreaElement>(null)

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages, loading])

  const handleSend = () => {
    if (!input.trim() || loading) return
    send(input.trim())
    setInput('')
    if (textareaRef.current) textareaRef.current.style.height = 'auto'
  }

  const handleKeyDown = (e: KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault()
      handleSend()
    }
  }

  const handleInput = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    setInput(e.target.value)
    e.target.style.height = 'auto'
    e.target.style.height = Math.min(e.target.scrollHeight, 120) + 'px'
  }

  return (
    <div className="flex h-full">
      {/* Left: conversation history */}
      <ConversationSidebar
        conversations={conversations}
        activeId={activeId}
        onNew={createConversation}
        onSwitch={switchConversation}
        onDelete={deleteConversation}
      />

      {/* Right: chat area */}
      <div className="flex-1 flex flex-col bg-gray-50 min-w-0">
        {/* Status bar */}
        <div className="bg-white border-b border-gray-200 px-6 py-2.5 flex items-center gap-2 flex-shrink-0">
          <div className={`w-2 h-2 rounded-full ${loading ? 'bg-yellow-400 animate-pulse' : 'bg-green-400'}`} />
          <span className="text-sm text-gray-500">{loading ? 'AI 正在思考...' : '财务AI助手已就绪'}</span>
        </div>

        {/* Messages */}
        <div className="flex-1 overflow-y-auto px-6 py-5">
          <div className="max-w-3xl mx-auto">
            {messages.length === 0 && (
              <div className="flex flex-col items-center justify-center h-64 text-center">
                <div className="w-14 h-14 bg-[#1e3a5f] rounded-2xl flex items-center justify-center mb-4 shadow-lg">
                  <span className="text-white text-xl font-bold">F</span>
                </div>
                <h2 className="text-base font-semibold text-gray-700 mb-1">你好，我是 Finio</h2>
                <p className="text-sm text-gray-400 max-w-xs">
                  我可以帮您检索财务文件、分析数据、生成报表。<br />
                  请先前往「文件仓库」上传 Excel 文件，然后开始提问。
                </p>
              </div>
            )}

            {messages.map((msg, i) => (
              <MessageBubble
                key={msg.id}
                message={msg}
                isStreaming={loading && i === messages.length - 1 && msg.role === 'assistant'}
              />
            ))}

            {loading && messages[messages.length - 1]?.role !== 'assistant' && (
              <div className="flex justify-start mb-5">
                <div className="w-8 h-8 rounded-full bg-[#1e3a5f] flex items-center justify-center text-white text-xs font-bold mr-2.5 flex-shrink-0">
                  F
                </div>
                <div className="bg-white border border-gray-200 rounded-2xl rounded-tl-sm px-4 py-3 shadow-sm">
                  <div className="flex gap-1.5 items-center h-4">
                    <div className="w-1.5 h-1.5 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '0ms' }} />
                    <div className="w-1.5 h-1.5 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '150ms' }} />
                    <div className="w-1.5 h-1.5 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '300ms' }} />
                  </div>
                </div>
              </div>
            )}
            <div ref={bottomRef} />
          </div>
        </div>

        {/* Input */}
        <div className="bg-white border-t border-gray-200 px-4 py-3 flex-shrink-0">
          <div className="max-w-3xl mx-auto">
            {/* Stop button — shown above input while generating */}
            {loading && (
              <div className="flex justify-center mb-2">
                <button
                  onClick={stop}
                  className="flex items-center gap-1.5 px-4 py-1.5 rounded-full border border-gray-300 bg-white hover:bg-gray-50 text-gray-600 text-xs font-medium transition-colors shadow-sm"
                >
                  <Square size={11} fill="currentColor" />
                  停止生成
                </button>
              </div>
            )}

            <div className="flex items-end gap-2 bg-gray-50 rounded-2xl border border-gray-200 px-4 py-2.5 focus-within:border-blue-300 focus-within:ring-2 focus-within:ring-blue-100 transition-all">
              <textarea
                ref={textareaRef}
                value={input}
                onChange={handleInput}
                onKeyDown={handleKeyDown}
                placeholder="输入财务问题... (Enter 发送，Shift+Enter 换行)"
                disabled={loading}
                rows={1}
                className="flex-1 bg-transparent text-sm text-gray-700 resize-none outline-none placeholder-gray-400 disabled:opacity-50"
                style={{ minHeight: '22px', maxHeight: '120px' }}
              />
              <button
                onClick={handleSend}
                disabled={loading || !input.trim()}
                className="w-8 h-8 bg-[#1e3a5f] hover:bg-[#16304f] disabled:bg-gray-200 rounded-full flex items-center justify-center transition-colors flex-shrink-0"
              >
                <Send size={13} className={loading || !input.trim() ? 'text-gray-400' : 'text-white'} />
              </button>
            </div>
            <p className="text-xs text-gray-400 text-center mt-1.5">AI 回答基于上传的文件内容，请确保数据准确</p>
          </div>
        </div>
      </div>
    </div>
  )
}
