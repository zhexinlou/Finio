import React, { useState, useEffect } from 'react'
import { useAuth, SpaceInfo } from '../contexts/AuthContext'
import axios from 'axios'
import {
  Building2,
  Users,
  Plus,
  Settings,
  UserPlus,
  Crown,
  Shield,
  User,
  Copy,
  Check,
  X,
  Loader2,
  Mail,
} from 'lucide-react'

interface SpaceMember {
  id: number
  userId: number
  userName: string
  userEmail: string
  role: 'OWNER' | 'ADMIN' | 'MEMBER'
  joinedAt: string
}

const api = axios.create()
api.interceptors.request.use((config) => {
  const token = localStorage.getItem('finio_token')
  if (token) config.headers.Authorization = `Bearer ${token}`
  return config
})

const roleLabel: Record<string, { label: string; icon: React.ElementType; color: string }> = {
  OWNER: { label: '拥有者', icon: Crown, color: 'text-yellow-600 bg-yellow-50' },
  ADMIN: { label: '管理员', icon: Shield, color: 'text-blue-600 bg-blue-50' },
  MEMBER: { label: '成员', icon: User, color: 'text-gray-600 bg-gray-100' },
}

export default function SpacePage() {
  const { currentSpace, spaces, refreshSpaces, switchSpace } = useAuth()
  const [members, setMembers] = useState<SpaceMember[]>([])
  const [loading, setLoading] = useState(false)
  const [showCreate, setShowCreate] = useState(false)
  const [showInvite, setShowInvite] = useState(false)
  const [newSpaceName, setNewSpaceName] = useState('')
  const [inviteEmail, setInviteEmail] = useState('')
  const [inviteRole, setInviteRole] = useState<'ADMIN' | 'MEMBER'>('MEMBER')
  const [creating, setCreating] = useState(false)
  const [inviting, setInviting] = useState(false)
  const [copied, setCopied] = useState(false)
  const [error, setError] = useState('')

  useEffect(() => {
    if (currentSpace) fetchMembers()
  }, [currentSpace?.id])

  const fetchMembers = async () => {
    if (!currentSpace) return
    setLoading(true)
    try {
      const res = await api.get(`/api/spaces/${currentSpace.id}/members`)
      setMembers(res.data)
    } catch {
      setMembers([])
    } finally {
      setLoading(false)
    }
  }

  const handleCreateSpace = async () => {
    if (!newSpaceName.trim()) return
    setCreating(true)
    setError('')
    try {
      const res = await api.post('/api/spaces', { name: newSpaceName.trim() })
      await refreshSpaces()
      switchSpace(res.data.id)
      setShowCreate(false)
      setNewSpaceName('')
    } catch (err: any) {
      setError(err.response?.data?.message || '创建失败')
    } finally {
      setCreating(false)
    }
  }

  const handleInvite = async () => {
    if (!inviteEmail.trim() || !currentSpace) return
    setInviting(true)
    setError('')
    try {
      await api.post(`/api/spaces/${currentSpace.id}/invite`, {
        email: inviteEmail.trim(),
        role: inviteRole,
      })
      await fetchMembers()
      await refreshSpaces()
      setShowInvite(false)
      setInviteEmail('')
    } catch (err: any) {
      setError(err.response?.data?.message || '邀请失败')
    } finally {
      setInviting(false)
    }
  }

  const handleRemoveMember = async (memberId: number) => {
    if (!currentSpace || !confirm('确定要移除该成员吗？')) return
    try {
      await api.delete(`/api/spaces/${currentSpace.id}/members/${memberId}`)
      await fetchMembers()
      await refreshSpaces()
    } catch {
      /* ignore */
    }
  }

  const copyInviteLink = () => {
    const link = `${window.location.origin}/invite/${currentSpace?.id}`
    navigator.clipboard.writeText(link)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  const myRole = currentSpace
    ? spaces.find((s) => s.id === currentSpace.id)?.role
    : null
  const isAdmin = myRole === 'OWNER' || myRole === 'ADMIN'

  return (
    <div className="flex-1 overflow-auto p-6">
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">企业空间</h1>
            <p className="text-sm text-gray-400 mt-1">管理你的工作空间和团队成员</p>
          </div>
          <button
            onClick={() => setShowCreate(true)}
            className="px-4 py-2 bg-[#1e3a5f] text-white rounded-xl text-sm font-medium hover:bg-[#2a4f7f] transition-colors flex items-center gap-2"
          >
            <Plus size={16} />
            创建新空间
          </button>
        </div>

        {/* Space list */}
        <div className="grid gap-4 mb-8">
          {spaces.map((space) => (
            <div
              key={space.id}
              onClick={() => switchSpace(space.id)}
              className={`bg-white rounded-xl p-5 border-2 cursor-pointer transition-all ${
                currentSpace?.id === space.id
                  ? 'border-[#1e3a5f] shadow-sm'
                  : 'border-transparent hover:border-gray-200'
              }`}
            >
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-[#1e3a5f] rounded-lg flex items-center justify-center text-white font-bold text-sm">
                    {space.name.charAt(0)}
                  </div>
                  <div>
                    <div className="font-medium text-gray-900">{space.name}</div>
                    <div className="text-xs text-gray-400 flex items-center gap-2 mt-0.5">
                      <Users size={12} />
                      {space.memberCount} 位成员
                    </div>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <span
                    className={`text-xs px-2 py-0.5 rounded-full ${roleLabel[space.role].color}`}
                  >
                    {roleLabel[space.role].label}
                  </span>
                  {currentSpace?.id === space.id && (
                    <span className="text-xs bg-green-50 text-green-600 px-2 py-0.5 rounded-full">
                      当前
                    </span>
                  )}
                </div>
              </div>
            </div>
          ))}

          {spaces.length === 0 && (
            <div className="text-center py-12 text-gray-400">
              <Building2 size={48} className="mx-auto mb-4 opacity-30" />
              <p className="text-sm">还没有空间，创建一个开始协作吧</p>
            </div>
          )}
        </div>

        {/* Members section */}
        {currentSpace && (
          <div className="bg-white rounded-xl border border-gray-100">
            <div className="p-5 border-b border-gray-100 flex items-center justify-between">
              <div>
                <h2 className="font-semibold text-gray-900">
                  {currentSpace.name} - 团队成员
                </h2>
                <p className="text-xs text-gray-400 mt-0.5">{members.length} 位成员</p>
              </div>
              <div className="flex gap-2">
                {isAdmin && (
                  <>
                    <button
                      onClick={copyInviteLink}
                      className="px-3 py-1.5 text-xs font-medium text-gray-600 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors flex items-center gap-1"
                    >
                      {copied ? <Check size={14} /> : <Copy size={14} />}
                      {copied ? '已复制' : '复制邀请链接'}
                    </button>
                    <button
                      onClick={() => setShowInvite(true)}
                      className="px-3 py-1.5 text-xs font-medium text-white bg-[#1e3a5f] rounded-lg hover:bg-[#2a4f7f] transition-colors flex items-center gap-1"
                    >
                      <UserPlus size={14} />
                      邀请成员
                    </button>
                  </>
                )}
              </div>
            </div>
            <div className="divide-y divide-gray-50">
              {loading ? (
                <div className="flex items-center justify-center py-8">
                  <Loader2 size={20} className="animate-spin text-gray-300" />
                </div>
              ) : (
                members.map((m) => {
                  const r = roleLabel[m.role]
                  return (
                    <div key={m.id} className="px-5 py-3 flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 bg-gray-100 rounded-full flex items-center justify-center text-gray-500 text-sm font-medium">
                          {m.userName.charAt(0)}
                        </div>
                        <div>
                          <div className="text-sm font-medium text-gray-900">{m.userName}</div>
                          <div className="text-xs text-gray-400">{m.userEmail}</div>
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
                        <span className={`text-xs px-2 py-0.5 rounded-full flex items-center gap-1 ${r.color}`}>
                          <r.icon size={12} />
                          {r.label}
                        </span>
                        {isAdmin && m.role !== 'OWNER' && (
                          <button
                            onClick={(e) => {
                              e.stopPropagation()
                              handleRemoveMember(m.id)
                            }}
                            className="text-gray-300 hover:text-red-500 transition-colors"
                          >
                            <X size={14} />
                          </button>
                        )}
                      </div>
                    </div>
                  )
                })
              )}
            </div>
          </div>
        )}

        {/* Create space modal */}
        {showCreate && (
          <div className="fixed inset-0 bg-black/40 z-50 flex items-center justify-center p-4">
            <div className="bg-white rounded-2xl p-6 w-full max-w-md shadow-xl">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">创建企业空间</h3>
              {error && (
                <div className="mb-3 p-2 bg-red-50 text-red-600 text-sm rounded-lg">{error}</div>
              )}
              <input
                type="text"
                value={newSpaceName}
                onChange={(e) => setNewSpaceName(e.target.value)}
                placeholder="输入公司/团队名称"
                className="w-full px-4 py-2.5 rounded-xl border border-gray-200 text-sm focus:outline-none focus:ring-2 focus:ring-[#1e3a5f]/20 focus:border-[#1e3a5f] mb-4"
                autoFocus
              />
              <div className="flex gap-3 justify-end">
                <button
                  onClick={() => {
                    setShowCreate(false)
                    setError('')
                  }}
                  className="px-4 py-2 text-sm text-gray-600 hover:bg-gray-50 rounded-xl transition-colors"
                >
                  取消
                </button>
                <button
                  onClick={handleCreateSpace}
                  disabled={creating || !newSpaceName.trim()}
                  className="px-4 py-2 text-sm text-white bg-[#1e3a5f] rounded-xl hover:bg-[#2a4f7f] disabled:opacity-50 flex items-center gap-2"
                >
                  {creating && <Loader2 size={14} className="animate-spin" />}
                  创建
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Invite modal */}
        {showInvite && (
          <div className="fixed inset-0 bg-black/40 z-50 flex items-center justify-center p-4">
            <div className="bg-white rounded-2xl p-6 w-full max-w-md shadow-xl">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">邀请成员</h3>
              {error && (
                <div className="mb-3 p-2 bg-red-50 text-red-600 text-sm rounded-lg">{error}</div>
              )}
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">邮箱地址</label>
                  <div className="relative">
                    <Mail size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                    <input
                      type="email"
                      value={inviteEmail}
                      onChange={(e) => setInviteEmail(e.target.value)}
                      placeholder="输入成员邮箱"
                      className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-gray-200 text-sm focus:outline-none focus:ring-2 focus:ring-[#1e3a5f]/20 focus:border-[#1e3a5f]"
                      autoFocus
                    />
                  </div>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">角色</label>
                  <div className="flex gap-3">
                    <button
                      type="button"
                      onClick={() => setInviteRole('MEMBER')}
                      className={`flex-1 py-2 rounded-xl text-sm border-2 transition-colors ${
                        inviteRole === 'MEMBER'
                          ? 'border-[#1e3a5f] bg-blue-50 text-[#1e3a5f]'
                          : 'border-gray-200 text-gray-400'
                      }`}
                    >
                      成员
                    </button>
                    <button
                      type="button"
                      onClick={() => setInviteRole('ADMIN')}
                      className={`flex-1 py-2 rounded-xl text-sm border-2 transition-colors ${
                        inviteRole === 'ADMIN'
                          ? 'border-[#1e3a5f] bg-blue-50 text-[#1e3a5f]'
                          : 'border-gray-200 text-gray-400'
                      }`}
                    >
                      管理员
                    </button>
                  </div>
                </div>
              </div>
              <div className="flex gap-3 justify-end mt-6">
                <button
                  onClick={() => {
                    setShowInvite(false)
                    setError('')
                  }}
                  className="px-4 py-2 text-sm text-gray-600 hover:bg-gray-50 rounded-xl transition-colors"
                >
                  取消
                </button>
                <button
                  onClick={handleInvite}
                  disabled={inviting || !inviteEmail.trim()}
                  className="px-4 py-2 text-sm text-white bg-[#1e3a5f] rounded-xl hover:bg-[#2a4f7f] disabled:opacity-50 flex items-center gap-2"
                >
                  {inviting && <Loader2 size={14} className="animate-spin" />}
                  发送邀请
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
