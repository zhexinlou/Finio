import React, { useState } from 'react'
import { useNavigate, Link } from 'react-router-dom'
import { useAuth } from '../contexts/AuthContext'
import { useToast } from '../components/Toast'
import { Eye, EyeOff, Loader2, Building2, User } from 'lucide-react'
import axios from 'axios'

type AccountType = 'personal' | 'enterprise'

export default function RegisterPage() {
  const navigate = useNavigate()
  const { register } = useAuth()
  const toast = useToast()

  const [accountType, setAccountType] = useState<AccountType>('personal')
  const [form, setForm] = useState({
    name: '',
    email: '',
    password: '',
    confirmPassword: '',
    companyName: '',
  })
  const [showPwd, setShowPwd] = useState(false)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [agreed, setAgreed] = useState(false)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')

    if (form.password !== form.confirmPassword) {
      setError('两次输入的密码不一致')
      return
    }
    if (form.password.length < 6) {
      setError('密码至少需要6位')
      return
    }
    if (!agreed) {
      setError('请先同意服务协议和隐私政策')
      return
    }

    setLoading(true)
    try {
      await register(
        form.name,
        form.email,
        form.password,
        accountType === 'enterprise' ? form.companyName : undefined
      )
      navigate('/dashboard')
    } catch (err: any) {
      setError(err.response?.data?.message || '注册失败，请稍后重试')
    } finally {
      setLoading(false)
    }
  }

  const handleWeChatLogin = async () => {
    try {
      const redirectUri = encodeURIComponent(window.location.origin + '/api/auth/wechat/callback')
      const res = await axios.get(`/api/auth/wechat/login-url?redirectUri=${redirectUri}`)
      const data = res.data.data || res.data
      if (data.url) {
        window.location.href = data.url
      }
    } catch (err: any) {
      const msg = err.response?.data?.message || '微信登录暂不可用'
      toast.info(msg)
    }
  }

  return (
    <div className="min-h-screen bg-gray-50 flex">
      {/* Left brand panel */}
      <div className="hidden lg:flex lg:w-1/2 bg-[#1e3a5f] text-white flex-col justify-between p-12">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 bg-white rounded-lg flex items-center justify-center">
            <span className="text-[#1e3a5f] text-sm font-black">F</span>
          </div>
          <span className="font-bold text-xl tracking-wide">Finio</span>
        </div>
        <div>
          <h2 className="text-3xl font-bold mb-4 leading-tight">
            加入 10,000+ 企业
            <br />
            开启智能财务之旅
          </h2>
          <p className="text-white/60 text-sm leading-relaxed max-w-md">
            注册即可免费使用 Finio 个人版。企业用户可创建专属工作空间，
            邀请团队成员协作，共享AI财务分析能力。
          </p>
        </div>
        <p className="text-white/30 text-xs">&copy; {new Date().getFullYear()} Finio</p>
      </div>

      {/* Right form panel */}
      <div className="flex-1 flex items-center justify-center p-8">
        <div className="w-full max-w-md">
          <div className="lg:hidden flex items-center gap-2 mb-8">
            <div className="w-8 h-8 bg-[#1e3a5f] rounded-lg flex items-center justify-center">
              <span className="text-white text-sm font-black">F</span>
            </div>
            <span className="text-[#1e3a5f] font-bold text-xl">Finio</span>
          </div>

          <h1 className="text-2xl font-bold text-gray-900 mb-1">创建账户</h1>
          <p className="text-sm text-gray-400 mb-6">开始你的 Finio 之旅</p>

          {/* Account type selector */}
          <div className="flex gap-3 mb-6">
            <button
              type="button"
              onClick={() => setAccountType('personal')}
              className={`flex-1 py-3 rounded-xl text-sm font-medium border-2 transition-colors flex items-center justify-center gap-2 ${
                accountType === 'personal'
                  ? 'border-[#1e3a5f] bg-blue-50 text-[#1e3a5f]'
                  : 'border-gray-200 text-gray-400 hover:border-gray-300'
              }`}
            >
              <User size={16} />
              个人版
            </button>
            <button
              type="button"
              onClick={() => setAccountType('enterprise')}
              className={`flex-1 py-3 rounded-xl text-sm font-medium border-2 transition-colors flex items-center justify-center gap-2 ${
                accountType === 'enterprise'
                  ? 'border-[#1e3a5f] bg-blue-50 text-[#1e3a5f]'
                  : 'border-gray-200 text-gray-400 hover:border-gray-300'
              }`}
            >
              <Building2 size={16} />
              企业版
            </button>
          </div>

          {error && (
            <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-lg text-sm text-red-600">
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">姓名</label>
              <input
                type="text"
                required
                value={form.name}
                onChange={(e) => setForm({ ...form, name: e.target.value })}
                placeholder="你的姓名"
                className="w-full px-4 py-2.5 rounded-xl border border-gray-200 text-sm focus:outline-none focus:ring-2 focus:ring-[#1e3a5f]/20 focus:border-[#1e3a5f] transition-colors"
              />
            </div>

            {accountType === 'enterprise' && (
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">公司名称</label>
                <input
                  type="text"
                  required
                  value={form.companyName}
                  onChange={(e) => setForm({ ...form, companyName: e.target.value })}
                  placeholder="你的公司名称"
                  className="w-full px-4 py-2.5 rounded-xl border border-gray-200 text-sm focus:outline-none focus:ring-2 focus:ring-[#1e3a5f]/20 focus:border-[#1e3a5f] transition-colors"
                />
              </div>
            )}

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">邮箱</label>
              <input
                type="email"
                required
                value={form.email}
                onChange={(e) => setForm({ ...form, email: e.target.value })}
                placeholder="your@email.com"
                className="w-full px-4 py-2.5 rounded-xl border border-gray-200 text-sm focus:outline-none focus:ring-2 focus:ring-[#1e3a5f]/20 focus:border-[#1e3a5f] transition-colors"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">密码</label>
              <div className="relative">
                <input
                  type={showPwd ? 'text' : 'password'}
                  required
                  value={form.password}
                  onChange={(e) => setForm({ ...form, password: e.target.value })}
                  placeholder="至少6位密码"
                  className="w-full px-4 py-2.5 rounded-xl border border-gray-200 text-sm focus:outline-none focus:ring-2 focus:ring-[#1e3a5f]/20 focus:border-[#1e3a5f] transition-colors pr-10"
                />
                <button
                  type="button"
                  onClick={() => setShowPwd(!showPwd)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
                >
                  {showPwd ? <EyeOff size={16} /> : <Eye size={16} />}
                </button>
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">确认密码</label>
              <input
                type="password"
                required
                value={form.confirmPassword}
                onChange={(e) => setForm({ ...form, confirmPassword: e.target.value })}
                placeholder="再次输入密码"
                className="w-full px-4 py-2.5 rounded-xl border border-gray-200 text-sm focus:outline-none focus:ring-2 focus:ring-[#1e3a5f]/20 focus:border-[#1e3a5f] transition-colors"
              />
            </div>

            <div className="flex items-start gap-2">
              <input
                type="checkbox"
                checked={agreed}
                onChange={(e) => setAgreed(e.target.checked)}
                className="mt-0.5 rounded border-gray-300"
              />
              <span className="text-xs text-gray-400">
                我已阅读并同意{' '}
                <span className="text-[#1e3a5f] cursor-pointer hover:underline">服务协议</span> 和{' '}
                <span className="text-[#1e3a5f] cursor-pointer hover:underline">隐私政策</span>
              </span>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full py-2.5 bg-[#1e3a5f] text-white rounded-xl text-sm font-medium hover:bg-[#2a4f7f] transition-colors disabled:opacity-50 flex items-center justify-center gap-2"
            >
              {loading && <Loader2 size={16} className="animate-spin" />}
              {accountType === 'enterprise' ? '创建企业账户' : '注册'}
            </button>
          </form>

          <div className="flex items-center gap-3 my-6">
            <div className="flex-1 h-px bg-gray-200" />
            <span className="text-xs text-gray-400">或</span>
            <div className="flex-1 h-px bg-gray-200" />
          </div>

          <button
            onClick={handleWeChatLogin}
            className="w-full py-2.5 border border-gray-200 rounded-xl text-sm font-medium text-gray-700 hover:bg-gray-50 transition-colors flex items-center justify-center gap-2"
          >
            <svg viewBox="0 0 24 24" width="18" height="18" fill="#07C160">
              <path d="M8.691 2.188C3.891 2.188 0 5.476 0 9.53c0 2.212 1.17 4.203 3.002 5.55a.59.59 0 0 1 .213.665l-.39 1.48c-.019.07-.048.141-.048.213 0 .163.13.295.29.295a.328.328 0 0 0 .186-.059l1.866-1.1a.587.587 0 0 1 .462-.076c1.005.275 2.073.413 3.11.413.338 0 .67-.018 1-.045-.23-.636-.354-1.313-.354-2.008 0-3.762 3.587-6.813 8.016-6.813.275 0 .543.016.813.035C17.073 4.39 13.25 2.188 8.691 2.188zm-2.6 4.22c.61 0 1.1.492 1.1 1.1 0 .61-.49 1.1-1.1 1.1-.61 0-1.1-.49-1.1-1.1 0-.608.49-1.1 1.1-1.1zm5.2 0c.61 0 1.1.492 1.1 1.1 0 .61-.49 1.1-1.1 1.1-.61 0-1.1-.49-1.1-1.1 0-.608.49-1.1 1.1-1.1zm4.262 3.95c-3.898 0-7.06 2.692-7.06 6.013 0 3.32 3.162 6.012 7.06 6.012.797 0 1.566-.1 2.28-.29a.5.5 0 0 1 .387.06l1.406.831a.268.268 0 0 0 .155.048c.133 0 .24-.108.24-.24 0-.06-.024-.118-.04-.176l-.293-1.11a.49.49 0 0 1 .178-.558c1.528-1.126 2.507-2.79 2.507-4.577 0-3.321-3.163-6.013-7.06-6.013h.24zm-2.143 3.293c.504 0 .913.41.913.913 0 .505-.41.913-.913.913-.505 0-.914-.408-.914-.913 0-.504.41-.913.914-.913zm4.286 0c.505 0 .913.41.913.913 0 .505-.408.913-.913.913a.914.914 0 0 1-.913-.913c0-.504.41-.913.913-.913z" />
            </svg>
            微信注册
          </button>

          <p className="mt-6 text-center text-sm text-gray-400">
            已有账户？{' '}
            <Link to="/login" className="text-[#1e3a5f] font-medium hover:underline">
              登录
            </Link>
          </p>
        </div>
      </div>
    </div>
  )
}
