# Finio - 财务AI助手

一个供中小公司财务人员和老板使用的AI助手。支持上传Excel文件、自然语言提问、AI分析数据并生成报表。

## 技术栈

- **前端**: React + TypeScript + Tailwind CSS（端口3000）
- **主服务**: Java Spring Boot（端口8080）
- **AI服务**: Python FastAPI + LangChain（端口8000）
- **向量库**: Chroma（本地运行）
- **LLM**: 阿里云通义千问 Qwen（OpenAI兼容接口）

## 环境准备

1. 申请阿里云 DashScope API Key：https://dashscope.aliyun.com
2. 复制根目录 `.env.example` 为 `python-service/.env`，填入你的 API Key 和 warehouse 绝对路径

## 启动方式

### 1. Python AI 服务（端口 8000）
```bash
cd python-service
pip install -r requirements.txt
# 配置 .env 文件
uvicorn main:app --reload --port 8000
```

### 2. Java 主服务（端口 8080）
```bash
cd java-service
# 设置环境变量 WAREHOUSE_PATH 和 PYTHON_SERVICE_URL
export WAREHOUSE_PATH=/absolute/path/to/Finio/warehouse
export PYTHON_SERVICE_URL=http://localhost:8000
mvn spring-boot:run
```

### 3. 前端（端口 3000）
```bash
cd frontend
npm install
npm run dev
```

## 使用流程

1. 在左侧面板选择目标文件夹，上传 Excel 文件（.xlsx/.xls）
2. 文件自动建立向量索引
3. 在右侧聊天区域用自然语言提问
4. AI 会检索相关文件、分析数据、回答问题
5. 需要时 AI 会生成新的 Excel 报表，可直接下载

## 目录结构

```
Finio/
├── frontend/          # React前端
├── java-service/      # Spring Boot主服务
├── python-service/    # FastAPI AI服务
└── warehouse/         # 共享文件仓库（Excel文件存储位置）
```
