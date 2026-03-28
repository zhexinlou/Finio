import React from 'react'
import ReactMarkdown from 'react-markdown'
import remarkGfm from 'remark-gfm'
import { Download } from 'lucide-react'
import type { Message } from '../types'
import { getDownloadUrl } from '../api/client'

interface Props {
  message: Message
  isStreaming?: boolean
}

export function MessageBubble({ message, isStreaming = false }: Props) {
  const isUser = message.role === 'user'
  const time = new Date(message.timestamp).toLocaleTimeString('zh-CN', { hour: '2-digit', minute: '2-digit' })

  return (
    <div className={`flex ${isUser ? 'justify-end' : 'justify-start'} mb-5`}>
      {!isUser && (
        <div className="w-8 h-8 rounded-full bg-[#1e3a5f] flex items-center justify-center text-white text-xs font-bold mr-2.5 flex-shrink-0 mt-1">
          F
        </div>
      )}

      <div className={`max-w-[72%] flex flex-col ${isUser ? 'items-end' : 'items-start'}`}>
        <div className={`rounded-2xl px-4 py-3 ${
          isUser
            ? 'bg-[#1e3a5f] text-white rounded-tr-sm'
            : 'bg-white border border-gray-200 text-gray-800 rounded-tl-sm shadow-sm'
        }`}>
          {isUser ? (
            <p className="text-sm leading-relaxed whitespace-pre-wrap">{message.content}</p>
          ) : (isStreaming && message.content === '') ? (
            <div className="flex gap-1.5 items-center h-4">
              <div className="w-1.5 h-1.5 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '0ms' }} />
              <div className="w-1.5 h-1.5 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '150ms' }} />
              <div className="w-1.5 h-1.5 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '300ms' }} />
            </div>
          ) : (
            <div className="text-sm leading-relaxed">
              <ReactMarkdown
                remarkPlugins={[remarkGfm]}
                components={{
                  p: ({ children }) => <p className="mb-2 last:mb-0 leading-relaxed">{children}</p>,
                  strong: ({ children }) => <strong className="font-semibold text-gray-900">{children}</strong>,
                  em: ({ children }) => <em className="italic text-gray-700">{children}</em>,
                  ul: ({ children }) => <ul className="list-disc pl-4 mb-2 space-y-0.5">{children}</ul>,
                  ol: ({ children }) => <ol className="list-decimal pl-4 mb-2 space-y-0.5">{children}</ol>,
                  li: ({ children }) => <li className="leading-relaxed">{children}</li>,
                  h1: ({ children }) => <h1 className="text-base font-bold mb-2 mt-1 text-gray-900">{children}</h1>,
                  h2: ({ children }) => <h2 className="text-sm font-bold mb-1.5 mt-2 text-gray-900">{children}</h2>,
                  h3: ({ children }) => <h3 className="text-sm font-semibold mb-1 mt-1.5 text-gray-800">{children}</h3>,
                  code: ({ inline, children }: any) =>
                    inline
                      ? <code className="bg-blue-50 text-[#1e3a5f] px-1.5 py-0.5 rounded text-xs font-mono border border-blue-100">{children}</code>
                      : <pre className="bg-gray-50 border border-gray-200 rounded-lg p-3 text-xs font-mono overflow-x-auto mb-2 whitespace-pre-wrap text-gray-700">{children}</pre>,
                  table: ({ children }) => (
                    <div className="overflow-x-auto my-2 rounded-lg border border-gray-200 shadow-xs">
                      <table className="text-xs w-full border-collapse">{children}</table>
                    </div>
                  ),
                  thead: ({ children }) => <thead className="bg-[#1e3a5f]">{children}</thead>,
                  th: ({ children }) => <th className="px-3 py-2 text-left font-semibold text-white whitespace-nowrap">{children}</th>,
                  td: ({ children }) => <td className="px-3 py-2 text-gray-700 border-b border-gray-100 whitespace-nowrap">{children}</td>,
                  tr: ({ children }) => <tr className="even:bg-gray-50 hover:bg-blue-50 transition-colors">{children}</tr>,
                  blockquote: ({ children }) => (
                    <blockquote className="border-l-4 border-blue-200 pl-3 my-2 text-gray-600 italic bg-blue-50 rounded-r-lg py-1">{children}</blockquote>
                  ),
                  hr: () => <hr className="border-gray-200 my-3" />,
                  a: ({ href, children }) => (
                    <a href={href} className="text-blue-600 hover:underline" target="_blank" rel="noopener noreferrer">{children}</a>
                  ),
                }}
              >
                {message.content}
              </ReactMarkdown>
            </div>
          )}

          {message.type === 'file' && message.filePath && (
            <a
              href={getDownloadUrl(message.filePath)}
              download
              className="mt-2.5 flex items-center gap-1.5 text-xs bg-green-50 border border-green-200 text-green-700 rounded-lg px-3 py-2 hover:bg-green-100 transition-colors w-fit font-medium"
            >
              <Download size={12} />
              下载生成的文件
            </a>
          )}
        </div>
        <p className={`text-xs text-gray-400 mt-1 px-1`}>{time}</p>
      </div>

      {isUser && (
        <div className="w-8 h-8 rounded-full bg-gray-200 flex items-center justify-center text-gray-600 text-xs font-bold ml-2.5 flex-shrink-0 mt-1">
          我
        </div>
      )}
    </div>
  )
}
