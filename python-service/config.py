import os
from pathlib import Path
from dotenv import load_dotenv

# 明确指定 .env 文件路径，避免工作目录不对导致加载失败
load_dotenv(dotenv_path=Path(__file__).parent / ".env")

DASHSCOPE_API_KEY = os.environ.get("DASHSCOPE_API_KEY", "")
WAREHOUSE_PATH = os.environ.get("WAREHOUSE_PATH", "./warehouse")
CHROMA_PERSIST_DIR = os.environ.get("CHROMA_PERSIST_DIR", "./chroma_db")
LLM_MODEL = os.environ.get("LLM_MODEL", "qwen-plus")
EMBEDDING_MODEL = os.environ.get("EMBEDDING_MODEL", "text-embedding-v3")
DASHSCOPE_BASE_URL = "https://dashscope.aliyuncs.com/compatible-mode/v1"
