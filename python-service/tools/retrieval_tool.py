import re
from pathlib import Path
from langchain.tools import tool
from storage.vector_store import similarity_search
from config import WAREHOUSE_PATH
import os


def _extract_path_keywords(query: str) -> list[str]:
    """Extract potential folder/file name keywords from query."""
    # Common Chinese financial keywords -> folder hints
    # Also extract any path-like patterns
    path_patterns = re.findall(r'[\w\-/]+(?:\.xlsx?)?', query)
    return [p for p in path_patterns if len(p) > 1]


@tool
def retrieval_tool(query: str) -> str:
    """
    从财务文件仓库中检索与问题相关的内容。
    输入：用户问题字符串
    输出：相关文件片段列表（包含来源路径）
    """
    keywords = _extract_path_keywords(query)

    # Get all indexed file paths to filter by keywords
    filter_paths = None
    if keywords:
        # Walk warehouse to find matching files
        matching_paths = []
        for root, dirs, files in os.walk(WAREHOUSE_PATH):
            for f in files:
                if f.endswith(('.xlsx', '.xls')):
                    rel = os.path.relpath(os.path.join(root, f), WAREHOUSE_PATH)
                    if any(kw.lower() in rel.lower() for kw in keywords):
                        matching_paths.append(rel)
        if matching_paths:
            filter_paths = matching_paths

    docs = similarity_search(query, k=5, filter_paths=filter_paths)

    if not docs:
        return "未找到相关文件内容。"

    results = []
    for doc in docs:
        src = doc.metadata.get("path", "未知")
        sheet = doc.metadata.get("sheet_name", "")
        results.append(f"[来源: {src} - Sheet: {sheet}]\n{doc.page_content[:800]}")

    return "\n\n---\n\n".join(results)
