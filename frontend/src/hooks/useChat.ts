import { useState, useCallback, useRef } from 'react'
import type { Message, Conversation } from '../types'

const STORAGE_KEY = 'finio_conversations'
const genId = () => Math.random().toString(36).slice(2) + Date.now().toString(36)

function newConversation(): Conversation {
  const now = new Date().toISOString()
  return { id: genId(), title: '新对话', messages: [], createdAt: now, updatedAt: now }
}

function loadConversations(): Conversation[] {
  try {
    const raw = localStorage.getItem(STORAGE_KEY)
    if (!raw) return [newConversation()]
    const parsed: Conversation[] = JSON.parse(raw)
    return parsed.length > 0 ? parsed : [newConversation()]
  } catch {
    return [newConversation()]
  }
}

function save(convs: Conversation[]) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(convs))
}

export function useChat() {
  const [conversations, setConversations] = useState<Conversation[]>(loadConversations)
  const [activeId, setActiveId] = useState<string>(() => loadConversations()[0].id)
  const [loading, setLoading] = useState(false)
  const abortRef = useRef<AbortController | null>(null)

  const activeConversation = conversations.find(c => c.id === activeId) ?? conversations[0]
  const messages = activeConversation?.messages ?? []

  const updateConversation = useCallback((id: string, updater: (c: Conversation) => Conversation) => {
    setConversations(prev => {
      const next = prev.map(c => c.id === id ? updater(c) : c)
      save(next)
      return next
    })
  }, [])

  const stop = useCallback(() => {
    abortRef.current?.abort()
  }, [])

  const send = useCallback(async (text: string) => {
    if (!text.trim() || loading) return

    const userMsg: Message = {
      id: genId(), role: 'user', type: 'text',
      content: text, timestamp: new Date().toISOString(),
    }

    const historySnapshot = messages.map(m => ({ role: m.role, content: m.content }))
    const currentActiveId = activeId

    const aiMsgId = genId()
    const aiMsg: Message = {
      id: aiMsgId, role: 'assistant', type: 'text',
      content: '', timestamp: new Date().toISOString(),
    }

    updateConversation(currentActiveId, c => ({
      ...c,
      title: c.messages.length === 0 ? text.slice(0, 24) : c.title,
      messages: [...c.messages, userMsg, aiMsg],
      updatedAt: new Date().toISOString(),
    }))

    setLoading(true)
    const controller = new AbortController()
    abortRef.current = controller

    try {
      const res = await fetch('/stream/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ message: text, history: historySnapshot }),
        signal: controller.signal,
      })

      if (!res.ok || !res.body) throw new Error('Stream request failed')

      const reader = res.body.getReader()
      const decoder = new TextDecoder()
      let buffer = ''
      let accumulated = ''

      while (true) {
        const { done, value } = await reader.read()
        if (done) break

        buffer += decoder.decode(value, { stream: true })
        const lines = buffer.split('\n')
        buffer = lines.pop() ?? ''

        for (const line of lines) {
          if (!line.startsWith('data: ')) continue
          const payload = line.slice(6).trim()
          if (!payload) continue

          try {
            const data = JSON.parse(payload)

            if (data.clear) {
              accumulated = ''
              setConversations(prev => {
                const next = prev.map(c => {
                  if (c.id !== currentActiveId) return c
                  return {
                    ...c,
                    messages: c.messages.map(m =>
                      m.id === aiMsgId ? { ...m, content: '' } : m
                    ),
                  }
                })
                save(next)
                return next
              })
            } else if (data.token !== undefined) {
              accumulated += data.token
              const accCopy = accumulated
              setConversations(prev => {
                const next = prev.map(c => {
                  if (c.id !== currentActiveId) return c
                  return {
                    ...c,
                    messages: c.messages.map(m =>
                      m.id === aiMsgId ? { ...m, content: accCopy } : m
                    ),
                  }
                })
                save(next)
                return next
              })
            } else if (data.done) {
              const finalType = data.type ?? 'text'
              const filePath = data.file_path ?? undefined
              setConversations(prev => {
                const next = prev.map(c => {
                  if (c.id !== currentActiveId) return c
                  return {
                    ...c,
                    messages: c.messages.map(m =>
                      m.id === aiMsgId ? { ...m, type: finalType, filePath } : m
                    ),
                    updatedAt: new Date().toISOString(),
                  }
                })
                save(next)
                return next
              })
            }
          } catch {
            // ignore parse errors
          }
        }
      }
    } catch (err: any) {
      // AbortError means user stopped — keep whatever content was streamed, don't show error
      if (err?.name !== 'AbortError') {
        setConversations(prev => {
          const next = prev.map(c => {
            if (c.id !== currentActiveId) return c
            return {
              ...c,
              messages: c.messages.map(m =>
                m.id === aiMsgId
                  ? { ...m, content: m.content || '抱歉，服务暂时不可用，请稍后重试。' }
                  : m
              ),
            }
          })
          save(next)
          return next
        })
      }
    } finally {
      abortRef.current = null
      setLoading(false)
      // If AI message is still empty after stream ends (edge case), remove it
      setConversations(prev => {
        const conv = prev.find(c => c.id === currentActiveId)
        if (!conv) return prev
        const aiMsg = conv.messages.find(m => m.id === aiMsgId)
        if (aiMsg && aiMsg.content === '') {
          const next = prev.map(c =>
            c.id === currentActiveId
              ? { ...c, messages: c.messages.filter(m => m.id !== aiMsgId) }
              : c
          )
          save(next)
          return next
        }
        return prev
      })
    }
  }, [messages, loading, activeId, updateConversation])

  const createConversation = useCallback(() => {
    const conv = newConversation()
    setConversations(prev => {
      const next = [conv, ...prev]
      save(next)
      return next
    })
    setActiveId(conv.id)
  }, [])

  const switchConversation = useCallback((id: string) => setActiveId(id), [])

  const deleteConversation = useCallback((id: string) => {
    setConversations(prev => {
      const next = prev.filter(c => c.id !== id)
      const result = next.length > 0 ? next : [newConversation()]
      save(result)
      if (id === activeId) setActiveId(result[0].id)
      return result
    })
  }, [activeId])

  return { conversations, activeId, messages, loading, send, stop, createConversation, switchConversation, deleteConversation }
}
