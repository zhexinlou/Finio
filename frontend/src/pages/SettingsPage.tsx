import React, { useState } from 'react'
import { useAuth } from '../contexts/AuthContext'
import { useToast } from '../components/Toast'
import axios from 'axios'
import { User, Lock, Bell, Shield, Loader2 } from 'lucide-react'

const api = axios.create()
api.interceptors.request.use((config) => {
  const token = localStorage.getItem('finio_token')
  if (token) config.headers.Authorization = `Bearer ${token}`
  return config
})

export default function SettingsPage() {
  const { user } = useAuth()
  const toast = useToast()
  const [activeTab, setActiveTab] = useState<'profile' | 'security'>('profile')

  const [name, setName] = useState(user?.name || '')
  const [saving, setSaving] = useState(false)

  const [passwords, setPasswords] = useState({
    oldPassword: '',
    newPassword: '',
    confirmPassword: '',
  })
  const [changingPwd, setChangingPwd] = useState(false)

  const handleSaveProfile = async () => {
    setSaving(true)
    try {
      await api.put('/api/auth/profile', { name })
      toast.success('个人信息已更新')
    } catch (err: any) {
      toast.error(err.response?.data?.message || '更新失败')
    } finally {
      setSaving(false)
    }
  }

  const handleChangePassword = async () => {
    if (passwords.newPassword !== passwords.confirmPassword) {
      toast.error('两次输入的密码不一致')
      return
    }
    if (passwords.newPassword.length < 6) {
      toast.error('密码至少需要6位')
      return
    }

    setChangingPwd(true)
    try {
      await api.post('/api/auth/change-password', {
        oldPassword: passwords.oldPassword,
        newPassword: passwords.newPassword,
      })
      toast.success('密码已修改')
      setPasswords({ oldPassword: '', newPassword: '', confirmPassword: '' })
    } catch (err: any) {
      toast.error(err.response?.data?.message || '修改失败')
    } finally {
      setChangingPwd(false)
    }
  }

  const tabs = [
    { key: 'profile' as const, label: '个人信息', icon: User },
    { key: 'security' as const, label: '安全设置', icon: Shield },
  ]

  return (
    <div className="flex-1 overflow-auto p-6">
      <div className="max-w-3xl mx-auto">
        <h1 className="text-2xl font-bold text-gray-900 mb-6">账户设置</h1>

        {/* Tabs */}
        <div className="flex gap-1 mb-6 bg-gray-100 rounded-xl p-1 w-fit">
          {tabs.map((tab) => (
            <button
              key={tab.key}
              onClick={() => setActiveTab(tab.key)}
              className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                activeTab === tab.key
                  ? 'bg-white text-[#1e3a5f] shadow-sm'
                  : 'text-gray-500 hover:text-gray-700'
              }`}
            >
              <tab.icon size={16} />
              {tab.label}
            </button>
          ))}
        </div>

        {/* Profile Tab */}
        {activeTab === 'profile' && (
          <div className="bg-white rounded-xl border border-gray-100 p-6">
            <h2 className="text-lg font-semibold text-gray-900 mb-4">个人信息</h2>
            <div className="space-y-4 max-w-md">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">邮箱</label>
                <input
                  type="email"
                  disabled
                  value={user?.email || ''}
                  className="w-full px-4 py-2.5 rounded-xl border border-gray-200 text-sm bg-gray-50 text-gray-500"
                />
                <p className="text-xs text-gray-400 mt-1">邮箱暂不支持修改</p>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">姓名</label>
                <input
                  type="text"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="w-full px-4 py-2.5 rounded-xl border border-gray-200 text-sm focus:outline-none focus:ring-2 focus:ring-[#1e3a5f]/20 focus:border-[#1e3a5f]"
                />
              </div>
              <button
                onClick={handleSaveProfile}
                disabled={saving}
                className="px-6 py-2.5 bg-[#1e3a5f] text-white rounded-xl text-sm font-medium hover:bg-[#2a4f7f] disabled:opacity-50 flex items-center gap-2"
              >
                {saving && <Loader2 size={14} className="animate-spin" />}
                保存
              </button>
            </div>
          </div>
        )}

        {/* Security Tab */}
        {activeTab === 'security' && (
          <div className="space-y-6">
            <div className="bg-white rounded-xl border border-gray-100 p-6">
              <h2 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
                <Lock size={18} />
                修改密码
              </h2>
              <div className="space-y-4 max-w-md">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">当前密码</label>
                  <input
                    type="password"
                    value={passwords.oldPassword}
                    onChange={(e) =>
                      setPasswords({ ...passwords, oldPassword: e.target.value })
                    }
                    className="w-full px-4 py-2.5 rounded-xl border border-gray-200 text-sm focus:outline-none focus:ring-2 focus:ring-[#1e3a5f]/20 focus:border-[#1e3a5f]"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">新密码</label>
                  <input
                    type="password"
                    value={passwords.newPassword}
                    onChange={(e) =>
                      setPasswords({ ...passwords, newPassword: e.target.value })
                    }
                    placeholder="至少6位，包含字母和数字"
                    className="w-full px-4 py-2.5 rounded-xl border border-gray-200 text-sm focus:outline-none focus:ring-2 focus:ring-[#1e3a5f]/20 focus:border-[#1e3a5f]"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">确认新密码</label>
                  <input
                    type="password"
                    value={passwords.confirmPassword}
                    onChange={(e) =>
                      setPasswords({ ...passwords, confirmPassword: e.target.value })
                    }
                    className="w-full px-4 py-2.5 rounded-xl border border-gray-200 text-sm focus:outline-none focus:ring-2 focus:ring-[#1e3a5f]/20 focus:border-[#1e3a5f]"
                  />
                </div>
                <button
                  onClick={handleChangePassword}
                  disabled={changingPwd}
                  className="px-6 py-2.5 bg-[#1e3a5f] text-white rounded-xl text-sm font-medium hover:bg-[#2a4f7f] disabled:opacity-50 flex items-center gap-2"
                >
                  {changingPwd && <Loader2 size={14} className="animate-spin" />}
                  修改密码
                </button>
              </div>
            </div>

            <div className="bg-white rounded-xl border border-gray-100 p-6">
              <h2 className="text-lg font-semibold text-gray-900 mb-2 flex items-center gap-2">
                <Bell size={18} />
                通知设置
              </h2>
              <p className="text-sm text-gray-400 mb-4">管理你的邮件和消息通知偏好</p>
              <div className="space-y-3">
                {[
                  { label: '安全提醒', desc: '异常登录、密码变更通知', defaultOn: true },
                  { label: '空间动态', desc: '成员变动、权限变更通知', defaultOn: true },
                  { label: '产品更新', desc: '新功能发布、系统维护通知', defaultOn: false },
                ].map((item) => (
                  <label
                    key={item.label}
                    className="flex items-center justify-between py-2 cursor-pointer"
                  >
                    <div>
                      <div className="text-sm font-medium text-gray-700">{item.label}</div>
                      <div className="text-xs text-gray-400">{item.desc}</div>
                    </div>
                    <input
                      type="checkbox"
                      defaultChecked={item.defaultOn}
                      className="w-4 h-4 rounded border-gray-300 text-[#1e3a5f]"
                    />
                  </label>
                ))}
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
