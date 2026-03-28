import React from 'react'
import { useNavigate } from 'react-router-dom'
import { motion } from 'framer-motion'
import {
  Brain,
  FileSpreadsheet,
  Shield,
  Building2,
  Users,
  Zap,
  ArrowRight,
  Check,
  MessageSquare,
  TrendingUp,
  BarChart3,
  ChevronRight,
} from 'lucide-react'

const fadeUp = {
  hidden: { opacity: 0, y: 30 },
  visible: (i: number) => ({
    opacity: 1,
    y: 0,
    transition: { delay: i * 0.1, duration: 0.5, ease: 'easeOut' },
  }),
}

const features = [
  {
    icon: Brain,
    title: 'AI 智能对话',
    desc: '基于大模型的财务AI助手，自然语言提问即可获取专业财务分析',
  },
  {
    icon: FileSpreadsheet,
    title: '智能报表生成',
    desc: '上传财务数据，AI自动解析并生成专业分析报告与可视化图表',
  },
  {
    icon: Shield,
    title: '数据安全',
    desc: '企业级数据加密，私有化部署支持，符合国家信息安全等级保护要求',
  },
  {
    icon: Building2,
    title: '企业空间',
    desc: '为每个企业创建独立工作空间，团队协作共享财务数据与分析成果',
  },
  {
    icon: Users,
    title: '多角色协作',
    desc: '支持管理员、财务主管、会计等多角色权限管理，灵活分配操作权限',
  },
  {
    icon: Zap,
    title: '极速响应',
    desc: '流式输出实时反馈，毫秒级文件解析，让财务工作效率提升10倍',
  },
]

const pricingPlans = [
  {
    name: '个人版',
    price: '免费',
    period: '',
    desc: '适合个人用户和自由职业者',
    features: ['AI 对话 50次/天', '文件存储 1GB', '基础报表生成', '单用户使用'],
    cta: '免费开始',
    highlighted: false,
  },
  {
    name: '专业版',
    price: '¥99',
    period: '/月',
    desc: '适合中小型企业财务团队',
    features: [
      'AI 对话 无限次',
      '文件存储 50GB',
      '高级报表与可视化',
      '最多 10 个成员',
      '企业空间',
      '优先客服支持',
    ],
    cta: '开始试用',
    highlighted: true,
  },
  {
    name: '企业版',
    price: '联系我们',
    period: '',
    desc: '适合大型企业和集团公司',
    features: [
      'AI 对话 无限次',
      '文件存储 无限',
      '定制化报表模板',
      '不限成员数',
      '多空间管理',
      '私有化部署',
      '专属客户成功经理',
      'API 接口开放',
    ],
    cta: '联系销售',
    highlighted: false,
  },
]

export default function LandingPage() {
  const navigate = useNavigate()

  return (
    <div className="min-h-screen bg-white">
      {/* Navbar */}
      <nav className="fixed top-0 w-full bg-white/80 backdrop-blur-md z-50 border-b border-gray-100">
        <div className="max-w-7xl mx-auto px-6 h-16 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 bg-[#1e3a5f] rounded-lg flex items-center justify-center">
              <span className="text-white text-sm font-black">F</span>
            </div>
            <span className="text-[#1e3a5f] font-bold text-xl tracking-wide">Finio</span>
          </div>
          <div className="hidden md:flex items-center gap-8 text-sm text-gray-600">
            <a href="#features" className="hover:text-[#1e3a5f] transition-colors">
              功能特性
            </a>
            <a href="#pricing" className="hover:text-[#1e3a5f] transition-colors">
              定价方案
            </a>
            <a href="#about" className="hover:text-[#1e3a5f] transition-colors">
              关于我们
            </a>
          </div>
          <div className="flex items-center gap-3">
            <button
              onClick={() => navigate('/login')}
              className="px-4 py-2 text-sm font-medium text-[#1e3a5f] hover:bg-gray-50 rounded-lg transition-colors"
            >
              登录
            </button>
            <button
              onClick={() => navigate('/register')}
              className="px-4 py-2 text-sm font-medium text-white bg-[#1e3a5f] hover:bg-[#2a4f7f] rounded-lg transition-colors"
            >
              免费注册
            </button>
          </div>
        </div>
      </nav>

      {/* Hero */}
      <section className="pt-32 pb-20 px-6">
        <div className="max-w-7xl mx-auto text-center">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
          >
            <div className="inline-flex items-center gap-2 px-4 py-1.5 bg-blue-50 rounded-full text-sm text-[#1e3a5f] font-medium mb-6">
              <Zap size={14} />
              AI 驱动的新一代财务管理平台
            </div>
            <h1 className="text-5xl md:text-6xl font-bold text-gray-900 leading-tight mb-6">
              让 AI 成为你的
              <br />
              <span className="text-[#1e3a5f]">专属财务智囊</span>
            </h1>
            <p className="text-lg text-gray-500 max-w-2xl mx-auto mb-10 leading-relaxed">
              Finio 将人工智能与专业财务知识深度融合，为企业提供智能对话、自动报表生成、
              数据分析等一站式财务AI解决方案，让财务工作更高效、更智能。
            </p>
            <div className="flex items-center justify-center gap-4">
              <button
                onClick={() => navigate('/register')}
                className="px-8 py-3 text-base font-medium text-white bg-[#1e3a5f] hover:bg-[#2a4f7f] rounded-xl transition-colors flex items-center gap-2 shadow-lg shadow-blue-900/20"
              >
                免费开始使用
                <ArrowRight size={18} />
              </button>
              <button
                onClick={() => {
                  document.getElementById('features')?.scrollIntoView({ behavior: 'smooth' })
                }}
                className="px-8 py-3 text-base font-medium text-gray-600 bg-gray-100 hover:bg-gray-200 rounded-xl transition-colors"
              >
                了解更多
              </button>
            </div>
          </motion.div>

          {/* Hero illustration */}
          <motion.div
            className="mt-16 max-w-4xl mx-auto"
            initial={{ opacity: 0, y: 40 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.3 }}
          >
            <div className="bg-gradient-to-br from-[#1e3a5f] to-[#2a5f8f] rounded-2xl p-8 shadow-2xl">
              <div className="bg-white/10 rounded-xl p-6 backdrop-blur-sm">
                <div className="flex items-center gap-3 mb-4">
                  <div className="w-3 h-3 rounded-full bg-red-400" />
                  <div className="w-3 h-3 rounded-full bg-yellow-400" />
                  <div className="w-3 h-3 rounded-full bg-green-400" />
                  <span className="text-white/50 text-xs ml-2">Finio AI Assistant</span>
                </div>
                <div className="space-y-4">
                  <div className="flex justify-end">
                    <div className="bg-white/20 rounded-2xl rounded-tr-md px-4 py-3 text-white text-sm max-w-xs">
                      帮我分析一下今年Q1的营收数据，和去年同期做个对比
                    </div>
                  </div>
                  <div className="flex justify-start">
                    <div className="bg-white rounded-2xl rounded-tl-md px-4 py-3 text-gray-700 text-sm max-w-sm">
                      <p className="mb-2">根据您上传的财务数据，Q1分析如下：</p>
                      <div className="flex items-center gap-4 text-xs">
                        <div className="flex items-center gap-1 text-green-600">
                          <TrendingUp size={14} />
                          <span>营收增长 23.5%</span>
                        </div>
                        <div className="flex items-center gap-1 text-blue-600">
                          <BarChart3 size={14} />
                          <span>利润率 18.2%</span>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </motion.div>

          {/* Stats */}
          <div className="mt-20 grid grid-cols-2 md:grid-cols-4 gap-8 max-w-3xl mx-auto">
            {[
              { value: '10,000+', label: '企业用户' },
              { value: '500万+', label: '报表生成' },
              { value: '99.9%', label: '服务可用率' },
              { value: '<1s', label: '平均响应' },
            ].map((stat, i) => (
              <motion.div
                key={stat.label}
                custom={i}
                variants={fadeUp}
                initial="hidden"
                whileInView="visible"
                viewport={{ once: true }}
                className="text-center"
              >
                <div className="text-3xl font-bold text-[#1e3a5f]">{stat.value}</div>
                <div className="text-sm text-gray-400 mt-1">{stat.label}</div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Features */}
      <section id="features" className="py-20 px-6 bg-gray-50">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-3xl font-bold text-gray-900 mb-4">强大的功能特性</h2>
            <p className="text-gray-500 max-w-xl mx-auto">
              从智能对话到报表生成，从数据安全到团队协作，Finio 为您提供全方位的财务AI能力
            </p>
          </div>
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
            {features.map((f, i) => (
              <motion.div
                key={f.title}
                custom={i}
                variants={fadeUp}
                initial="hidden"
                whileInView="visible"
                viewport={{ once: true }}
                className="bg-white rounded-2xl p-6 shadow-sm hover:shadow-md transition-shadow border border-gray-100"
              >
                <div className="w-12 h-12 bg-blue-50 rounded-xl flex items-center justify-center mb-4">
                  <f.icon size={24} className="text-[#1e3a5f]" />
                </div>
                <h3 className="text-lg font-semibold text-gray-900 mb-2">{f.title}</h3>
                <p className="text-sm text-gray-500 leading-relaxed">{f.desc}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Enterprise section */}
      <section id="about" className="py-20 px-6">
        <div className="max-w-7xl mx-auto">
          <div className="grid md:grid-cols-2 gap-16 items-center">
            <motion.div
              initial={{ opacity: 0, x: -30 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6 }}
            >
              <div className="inline-flex items-center gap-2 px-3 py-1 bg-blue-50 rounded-full text-sm text-[#1e3a5f] font-medium mb-4">
                <Building2 size={14} />
                企业版
              </div>
              <h2 className="text-3xl font-bold text-gray-900 mb-4">
                为企业量身打造的
                <br />
                财务协作空间
              </h2>
              <p className="text-gray-500 mb-6 leading-relaxed">
                企业空间让团队成员在统一平台上协作处理财务数据。管理员可以灵活管理成员权限，
                确保数据安全的同时提升团队效率。
              </p>
              <ul className="space-y-3">
                {[
                  '创建独立企业空间，数据完全隔离',
                  '邀请团队成员，支持多角色权限管理',
                  '共享文件仓库与AI分析成果',
                  '企业级审计日志与操作追踪',
                  '支持私有化部署与定制开发',
                ].map((item) => (
                  <li key={item} className="flex items-center gap-3 text-sm text-gray-600">
                    <Check size={16} className="text-green-500 flex-shrink-0" />
                    {item}
                  </li>
                ))}
              </ul>
              <button
                onClick={() => navigate('/register')}
                className="mt-8 px-6 py-3 text-sm font-medium text-white bg-[#1e3a5f] hover:bg-[#2a4f7f] rounded-xl transition-colors flex items-center gap-2"
              >
                立即体验企业版
                <ChevronRight size={16} />
              </button>
            </motion.div>
            <motion.div
              initial={{ opacity: 0, x: 30 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6 }}
              className="bg-gradient-to-br from-gray-50 to-blue-50 rounded-2xl p-8"
            >
              <div className="space-y-4">
                {/* Space card mockup */}
                <div className="bg-white rounded-xl p-5 shadow-sm border border-gray-100">
                  <div className="flex items-center justify-between mb-4">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 bg-[#1e3a5f] rounded-lg flex items-center justify-center text-white font-bold text-sm">
                        科
                      </div>
                      <div>
                        <div className="font-medium text-gray-900 text-sm">科创未来科技有限公司</div>
                        <div className="text-xs text-gray-400">12 位成员</div>
                      </div>
                    </div>
                    <span className="text-xs bg-green-50 text-green-600 px-2 py-0.5 rounded-full">
                      企业版
                    </span>
                  </div>
                  <div className="flex gap-2">
                    {['财务总监', '会计主管', '出纳'].map((role) => (
                      <span
                        key={role}
                        className="text-xs bg-gray-100 text-gray-500 px-2 py-1 rounded-md"
                      >
                        {role}
                      </span>
                    ))}
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div className="bg-white rounded-xl p-4 shadow-sm border border-gray-100">
                    <MessageSquare size={20} className="text-[#1e3a5f] mb-2" />
                    <div className="text-2xl font-bold text-gray-900">1,234</div>
                    <div className="text-xs text-gray-400">本月AI对话</div>
                  </div>
                  <div className="bg-white rounded-xl p-4 shadow-sm border border-gray-100">
                    <FileSpreadsheet size={20} className="text-[#1e3a5f] mb-2" />
                    <div className="text-2xl font-bold text-gray-900">89</div>
                    <div className="text-xs text-gray-400">生成报表</div>
                  </div>
                </div>
              </div>
            </motion.div>
          </div>
        </div>
      </section>

      {/* Pricing */}
      <section id="pricing" className="py-20 px-6 bg-gray-50">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-3xl font-bold text-gray-900 mb-4">选择适合你的方案</h2>
            <p className="text-gray-500">灵活的定价方案，从个人到企业全覆盖</p>
          </div>
          <div className="grid md:grid-cols-3 gap-8 max-w-5xl mx-auto">
            {pricingPlans.map((plan, i) => (
              <motion.div
                key={plan.name}
                custom={i}
                variants={fadeUp}
                initial="hidden"
                whileInView="visible"
                viewport={{ once: true }}
                className={`rounded-2xl p-8 ${
                  plan.highlighted
                    ? 'bg-[#1e3a5f] text-white shadow-xl shadow-blue-900/20 scale-105'
                    : 'bg-white text-gray-900 border border-gray-200'
                }`}
              >
                <div className="text-sm font-medium opacity-70 mb-1">{plan.name}</div>
                <div className="flex items-baseline gap-1 mb-1">
                  <span className="text-3xl font-bold">{plan.price}</span>
                  {plan.period && (
                    <span className={`text-sm ${plan.highlighted ? 'text-white/60' : 'text-gray-400'}`}>
                      {plan.period}
                    </span>
                  )}
                </div>
                <p
                  className={`text-sm mb-6 ${plan.highlighted ? 'text-white/60' : 'text-gray-400'}`}
                >
                  {plan.desc}
                </p>
                <ul className="space-y-3 mb-8">
                  {plan.features.map((f) => (
                    <li key={f} className="flex items-center gap-2 text-sm">
                      <Check
                        size={16}
                        className={plan.highlighted ? 'text-green-300' : 'text-green-500'}
                      />
                      {f}
                    </li>
                  ))}
                </ul>
                <button
                  onClick={() => navigate('/register')}
                  className={`w-full py-2.5 rounded-xl text-sm font-medium transition-colors ${
                    plan.highlighted
                      ? 'bg-white text-[#1e3a5f] hover:bg-gray-100'
                      : 'bg-[#1e3a5f] text-white hover:bg-[#2a4f7f]'
                  }`}
                >
                  {plan.cta}
                </button>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="py-20 px-6">
        <div className="max-w-3xl mx-auto text-center">
          <h2 className="text-3xl font-bold text-gray-900 mb-4">准备好提升财务效率了吗？</h2>
          <p className="text-gray-500 mb-8">
            加入已有超过 10,000 家企业选择的财务AI平台，开启智能财务新时代
          </p>
          <button
            onClick={() => navigate('/register')}
            className="px-8 py-3 text-base font-medium text-white bg-[#1e3a5f] hover:bg-[#2a4f7f] rounded-xl transition-colors shadow-lg shadow-blue-900/20"
          >
            免费注册，立即体验
          </button>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-gray-100 py-12 px-6">
        <div className="max-w-7xl mx-auto">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
            <div>
              <div className="flex items-center gap-2 mb-4">
                <div className="w-7 h-7 bg-[#1e3a5f] rounded-lg flex items-center justify-center">
                  <span className="text-white text-xs font-black">F</span>
                </div>
                <span className="text-[#1e3a5f] font-bold text-lg">Finio</span>
              </div>
              <p className="text-sm text-gray-400 leading-relaxed">
                AI 驱动的新一代
                <br />
                财务管理平台
              </p>
            </div>
            <div>
              <h4 className="font-medium text-gray-900 mb-3 text-sm">产品</h4>
              <ul className="space-y-2 text-sm text-gray-400">
                <li className="hover:text-gray-600 cursor-pointer">功能特性</li>
                <li className="hover:text-gray-600 cursor-pointer">定价方案</li>
                <li className="hover:text-gray-600 cursor-pointer">更新日志</li>
              </ul>
            </div>
            <div>
              <h4 className="font-medium text-gray-900 mb-3 text-sm">支持</h4>
              <ul className="space-y-2 text-sm text-gray-400">
                <li className="hover:text-gray-600 cursor-pointer">帮助中心</li>
                <li className="hover:text-gray-600 cursor-pointer">API 文档</li>
                <li className="hover:text-gray-600 cursor-pointer">联系我们</li>
              </ul>
            </div>
            <div>
              <h4 className="font-medium text-gray-900 mb-3 text-sm">法律</h4>
              <ul className="space-y-2 text-sm text-gray-400">
                <li className="hover:text-gray-600 cursor-pointer">服务协议</li>
                <li className="hover:text-gray-600 cursor-pointer">隐私政策</li>
                <li className="hover:text-gray-600 cursor-pointer">数据安全</li>
              </ul>
            </div>
          </div>
          <div className="mt-10 pt-6 border-t border-gray-100 text-center text-xs text-gray-400">
            &copy; {new Date().getFullYear()} Finio. All rights reserved. | 京ICP备XXXXXXXX号
          </div>
        </div>
      </footer>
    </div>
  )
}
