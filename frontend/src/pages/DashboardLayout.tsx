import React, { useState } from 'react'
import { Routes, Route, useNavigate, useLocation } from 'react-router-dom'
import { useAuth } from '../contexts/AuthContext'
import { ChatPanel } from '../components/ChatPanel'
import { WarehousePage } from './WarehousePage'
import SpacePage from './SpacePage'
import SettingsPage from './SettingsPage'
import {
  MessageSquare,
  FolderOpen,
  Building2,
  ChevronDown,
  LogOut,
  Settings,
  User,
  Check,
} from 'lucide-react'

type Page = 'chat' | 'warehouse' | 'space' | 'settings'

export default function DashboardLayout() {
  const { user, currentSpace, spaces, switchSpace, logout } = useAuth()
  const navigate = useNavigate()
  const location = useLocation()

  const [showUserMenu, setShowUserMenu] = useState(false)
  const [showSpaceMenu, setShowSpaceMenu] = useState(false)

  const currentPage: Page = location.pathname.includes('/warehouse')
    ? 'warehouse'
    : location.pathname.includes('/space')
      ? 'space'
      : location.pathname.includes('/settings')
        ? 'settings'
        : 'chat'

  const goTo = (page: Page) => {
    const base = '/dashboard'
    if (page === 'chat') navigate(base)
    else navigate(`${base}/${page}`)
  }

  return (
    <div className="flex flex-col h-screen bg-gray-50">
      {/* Navbar */}
      <nav className="h-14 bg-[#1e3a5f] flex items-center px-6 gap-4 shadow-md flex-shrink-0">
        {/* Logo */}
        <div className="flex items-center gap-2 mr-2">
          <div className="w-7 h-7 bg-white rounded-lg flex items-center justify-center">
            <span className="text-[#1e3a5f] text-sm font-black">F</span>
          </div>
          <span className="text-white font-bold text-lg tracking-wide">Finio</span>
        </div>

        {/* Space selector */}
        {spaces.length > 0 && (
          <div className="relative">
            <button
              onClick={() => setShowSpaceMenu(!showSpaceMenu)}
              className="flex items-center gap-2 px-3 py-1.5 rounded-lg text-sm text-white/80 hover:bg-white/10 transition-colors"
            >
              <Building2 size={14} />
              <span className="max-w-[120px] truncate">
                {currentSpace?.name || '选择空间'}
              </span>
              <ChevronDown size={14} />
            </button>
            {showSpaceMenu && (
              <>
                <div className="fixed inset-0 z-30" onClick={() => setShowSpaceMenu(false)} />
                <div className="absolute top-full left-0 mt-1 w-56 bg-white rounded-xl shadow-lg border border-gray-100 z-40 py-1">
                  {spaces.map((s) => (
                    <button
                      key={s.id}
                      onClick={() => {
                        switchSpace(s.id)
                        setShowSpaceMenu(false)
                      }}
                      className="w-full px-4 py-2 text-left text-sm hover:bg-gray-50 flex items-center justify-between"
                    >
                      <div className="flex items-center gap-2">
                        <div className="w-6 h-6 bg-[#1e3a5f] rounded text-white text-xs flex items-center justify-center font-medium">
                          {s.name.charAt(0)}
                        </div>
                        <span className="text-gray-700 truncate max-w-[140px]">{s.name}</span>
                      </div>
                      {currentSpace?.id === s.id && (
                        <Check size={14} className="text-green-500 flex-shrink-0" />
                      )}
                    </button>
                  ))}
                  <div className="border-t border-gray-100 mt-1 pt-1">
                    <button
                      onClick={() => {
                        goTo('space')
                        setShowSpaceMenu(false)
                      }}
                      className="w-full px-4 py-2 text-left text-sm text-[#1e3a5f] hover:bg-gray-50 flex items-center gap-2"
                    >
                      <Settings size={14} />
                      管理空间
                    </button>
                  </div>
                </div>
              </>
            )}
          </div>
        )}

        {/* Nav links */}
        <div className="flex items-center gap-1 ml-4">
          <button
            onClick={() => goTo('chat')}
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
            onClick={() => goTo('warehouse')}
            className={`flex items-center gap-2 px-3 py-1.5 rounded-lg text-sm font-medium transition-colors ${
              currentPage === 'warehouse'
                ? 'bg-white/20 text-white'
                : 'text-white/60 hover:text-white hover:bg-white/10'
            }`}
          >
            <FolderOpen size={15} />
            文件仓库
          </button>
          <button
            onClick={() => goTo('space')}
            className={`flex items-center gap-2 px-3 py-1.5 rounded-lg text-sm font-medium transition-colors ${
              currentPage === 'space'
                ? 'bg-white/20 text-white'
                : 'text-white/60 hover:text-white hover:bg-white/10'
            }`}
          >
            <Building2 size={15} />
            企业空间
          </button>
        </div>

        {/* Spacer */}
        <div className="flex-1" />

        {/* User menu */}
        <div className="relative">
          <button
            onClick={() => setShowUserMenu(!showUserMenu)}
            className="flex items-center gap-2 px-3 py-1.5 rounded-lg text-sm text-white/80 hover:bg-white/10 transition-colors"
          >
            <div className="w-6 h-6 bg-white/20 rounded-full flex items-center justify-center text-white text-xs font-medium">
              {user?.name?.charAt(0) || 'U'}
            </div>
            <span className="hidden md:inline max-w-[100px] truncate">{user?.name}</span>
            <ChevronDown size={14} />
          </button>
          {showUserMenu && (
            <>
              <div className="fixed inset-0 z-30" onClick={() => setShowUserMenu(false)} />
              <div className="absolute top-full right-0 mt-1 w-48 bg-white rounded-xl shadow-lg border border-gray-100 z-40 py-1">
                <div className="px-4 py-2 border-b border-gray-100">
                  <div className="text-sm font-medium text-gray-900">{user?.name}</div>
                  <div className="text-xs text-gray-400 truncate">{user?.email}</div>
                </div>
                <button
                  onClick={() => {
                    navigate('/dashboard/settings')
                    setShowUserMenu(false)
                  }}
                  className="w-full px-4 py-2 text-left text-sm text-gray-600 hover:bg-gray-50 flex items-center gap-2"
                >
                  <User size={14} />
                  个人设置
                </button>
                <button
                  onClick={() => {
                    logout()
                    navigate('/')
                  }}
                  className="w-full px-4 py-2 text-left text-sm text-red-500 hover:bg-red-50 flex items-center gap-2"
                >
                  <LogOut size={14} />
                  退出登录
                </button>
              </div>
            </>
          )}
        </div>
      </nav>

      {/* Content */}
      <div className="flex-1 overflow-hidden">
        <Routes>
          <Route index element={<ChatPanel />} />
          <Route path="warehouse" element={<WarehousePage />} />
          <Route path="space" element={<SpacePage />} />
          <Route path="settings" element={<SettingsPage />} />
        </Routes>
      </div>
    </div>
  )
}
