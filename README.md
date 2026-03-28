<div align="center">

<img src="https://img.shields.io/badge/Finio-AI%20Finance-1e3a5f?style=for-the-badge&labelColor=1e3a5f" />

# Finio

**AI 驱动的新一代企业财务管理平台**

智能对话 · 自动报表 · 团队协作 · 企业空间

[![React](https://img.shields.io/badge/React-18.2-61DAFB?style=flat-square&logo=react&logoColor=white)](https://reactjs.org/)
[![Spring Boot](https://img.shields.io/badge/Spring%20Boot-3.2-6DB33F?style=flat-square&logo=springboot&logoColor=white)](https://spring.io/projects/spring-boot)
[![FastAPI](https://img.shields.io/badge/FastAPI-0.109-009688?style=flat-square&logo=fastapi&logoColor=white)](https://fastapi.tiangolo.com/)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.3-3178C6?style=flat-square&logo=typescript&logoColor=white)](https://www.typescriptlang.org/)
[![Docker](https://img.shields.io/badge/Docker-Ready-2496ED?style=flat-square&logo=docker&logoColor=white)](https://www.docker.com/)
[![License](https://img.shields.io/badge/License-Private-gray?style=flat-square)](/)

</div>

---

## Overview

Finio 将大语言模型与专业财务知识深度融合，为企业提供智能对话、自动报表生成、数据分析等一站式财务 AI 解决方案。支持企业空间多人协作、微信登录、角色权限管理，开箱即用。

## Architecture

```
┌─────────────────────────────────────────────────────┐
│                    Nginx (443/80)                    │
│              SSL · Proxy · Static Files             │
└──────────┬──────────────────┬────────────────────────┘
           │                  │
     /api/*│            /stream/*
           ▼                  ▼
┌──────────────────┐  ┌──────────────────┐
│   Java Service   │  │  Python Service  │
│  Spring Boot 3.2 │  │  FastAPI + AI    │
│                  │  │                  │
│  • Auth (JWT)    │  │  • LangChain     │
│  • Space CRUD    │  │  • Qwen LLM      │
│  • File Mgmt     │  │  • ChromaDB      │
│  • Payment       │  │  • Excel Tools   │
│  • Audit Log     │  │  • SSE Streaming │
└────────┬─────────┘  └──────────────────┘
         │
         ▼
┌──────────────────┐  ┌──────────────────┐
│   MySQL 8.0      │  │     Redis 7      │
│  Persistent Data │  │  Cache · Rate    │
└──────────────────┘  └──────────────────┘
```

## Features

| Category | Details |
|----------|---------|
| **AI 智能对话** | 基于通义千问大模型，自然语言提问即可获取专业财务分析，支持流式输出 |
| **智能报表** | 上传 Excel 文件，AI 自动解析并生成分析报告与可视化图表 |
| **企业空间** | 为每个企业创建独立工作空间，数据完全隔离，团队协作共享 |
| **多角色权限** | Owner / Admin / Member 三级角色，灵活分配操作权限 |
| **用户认证** | 邮箱注册登录 + 微信 OAuth 扫码登录，JWT + Refresh Token |
| **安全防护** | BCrypt 密码加密、登录失败锁定、密码强度校验、审计日志 |
| **支付系统** | 个人版(免费) / 专业版(¥99/月) / 企业版(定制)，支持微信支付/支付宝 |
| **管理后台** | 用户管理、空间管理、审计日志查看、数据统计仪表盘 |
| **Docker 部署** | 一键 `docker compose up`，包含 MySQL + Redis + Nginx HTTPS |

## Tech Stack

| Layer | Technology |
|-------|-----------|
| Frontend | React 18 · TypeScript · Tailwind CSS · Vite · Framer Motion |
| API Gateway | Nginx · TLS 1.3 · CORS · Security Headers |
| Backend | Spring Boot 3.2 · Spring Security · JPA · H2/MySQL |
| AI Service | FastAPI · LangChain · Qwen (DashScope) · ChromaDB |
| Auth | JWT (access + refresh) · BCrypt · WeChat OAuth 2.0 |
| Database | MySQL 8.0 (prod) · H2 (dev) · Redis 7 (cache) |
| DevOps | Docker · Docker Compose · Multi-stage builds |

## Quick Start

### Development (Local)

```bash
# 1. Clone
git clone git@github.com:zhexinlou/Finio.git && cd Finio

# 2. Configure
cp .env.example python-service/.env
# Edit python-service/.env → fill in DASHSCOPE_API_KEY

# 3. Start Python AI Service (port 8000)
cd python-service
pip install -r requirements.txt
uvicorn main:app --reload --port 8000

# 4. Start Java Service (port 8080)
cd ../java-service
export WAREHOUSE_PATH=$(pwd)/../warehouse
mvn spring-boot:run

# 5. Start Frontend (port 3000)
cd ../frontend
npm install && npm run dev
```

Open http://localhost:3000

### Production (Docker)

```bash
# 1. Configure environment
cp .env.example .env
# Edit .env → fill in all required values

# 2. Launch
docker compose up -d

# 3. Access
# HTTP:  http://your-server
# HTTPS: https://your-domain (after configuring SSL certs)
```

## Project Structure

```
Finio/
├── frontend/                    # React SPA
│   ├── src/
│   │   ├── pages/               # Landing · Login · Register · Dashboard · Settings
│   │   ├── contexts/            # AuthContext (JWT + spaces)
│   │   └── components/          # ChatPanel · Toast · Navbar
│   ├── Dockerfile
│   └── nginx.conf
│
├── java-service/                # Spring Boot API
│   └── src/main/java/com/finio/
│       ├── controller/          # Auth · Space · Conversation · Payment · Admin
│       ├── entity/              # User · Space · SpaceMember · AuditLog · Payment
│       ├── security/            # JWT · Filter · SecurityConfig
│       ├── service/             # Email · LoginAttempt
│       └── exception/           # BizException · GlobalHandler
│
├── python-service/              # FastAPI AI Engine
│   ├── agent/                   # LangChain Agent + Streaming
│   ├── tools/                   # Excel Reader/Writer · Retrieval
│   └── storage/                 # ChromaDB Vector Store
│
├── nginx/                       # Production HTTPS config
├── docker-compose.yml           # Full stack orchestration
└── .env.example                 # Environment template
```

## API Reference

<details>
<summary><b>Authentication</b></summary>

| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/api/auth/register` | 注册 (自动创建空间) |
| POST | `/api/auth/login` | 登录 (返回 JWT) |
| POST | `/api/auth/refresh` | 刷新 Token |
| GET | `/api/auth/me` | 当前用户信息 |
| PUT | `/api/auth/profile` | 更新个人信息 |
| POST | `/api/auth/change-password` | 修改密码 |
| POST | `/api/auth/forgot-password` | 忘记密码 |
| POST | `/api/auth/reset-password` | 重置密码 |
| GET | `/api/auth/wechat/login-url` | 微信登录链接 |
| POST | `/api/auth/wechat/callback` | 微信登录回调 |

</details>

<details>
<summary><b>Spaces & Members</b></summary>

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/spaces/my` | 我的空间列表 |
| POST | `/api/spaces` | 创建空间 |
| PUT | `/api/spaces/:id` | 更新空间 |
| DELETE | `/api/spaces/:id` | 删除空间 (Owner only) |
| GET | `/api/spaces/:id/members` | 成员列表 |
| POST | `/api/spaces/:id/invite` | 邀请成员 |
| PUT | `/api/spaces/:id/members/:mid/role` | 修改角色 |
| DELETE | `/api/spaces/:id/members/:mid` | 移除成员 |

</details>

<details>
<summary><b>Conversations & AI</b></summary>

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/conversations?spaceId=` | 对话列表 |
| POST | `/api/conversations` | 创建对话 |
| GET | `/api/conversations/:id/messages` | 消息历史 |
| POST | `/api/conversations/:id/messages` | 发送消息 |
| POST | `/api/chat` | AI 对话 (同步) |
| POST | `/stream/chat` | AI 对话 (流式 SSE) |

</details>

<details>
<summary><b>Payment & Admin</b></summary>

| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/api/payments/create` | 创建支付订单 |
| POST | `/api/payments/callback/:channel` | 支付回调 |
| GET | `/api/payments/my` | 我的订单 |
| GET | `/api/admin/stats` | 管理统计 |
| GET | `/api/admin/users` | 用户管理 |
| GET | `/api/admin/audit-logs` | 审计日志 |

</details>

## Environment Variables

| Variable | Required | Description |
|----------|----------|-------------|
| `DASHSCOPE_API_KEY` | Yes | 阿里云 DashScope API Key |
| `JWT_SECRET` | Yes (prod) | JWT 签名密钥 (≥256 bits) |
| `DB_PASSWORD` | Yes (prod) | MySQL 数据库密码 |
| `WECHAT_APP_ID` | No | 微信开放平台 App ID |
| `WECHAT_APP_SECRET` | No | 微信开放平台 App Secret |
| `EMAIL_ENABLED` | No | 是否启用邮件服务 |
| `APP_BASE_URL` | No | 应用访问地址 |

## License

Private · All rights reserved · &copy; 2024-2026 Finio
