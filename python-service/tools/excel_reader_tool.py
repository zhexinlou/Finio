import os
import pandas as pd
from langchain.tools import tool
from config import WAREHOUSE_PATH


@tool
def excel_reader_tool(file_path: str) -> str:
    """
    读取指定Excel文件的完整内容。
    输入：文件相对路径（相对于warehouse目录）
    输出：文件所有sheet的完整数据内容
    """
    abs_path = os.path.join(WAREHOUSE_PATH, file_path)
    if not os.path.exists(abs_path):
        return f"文件不存在: {file_path}"

    try:
        xf = pd.ExcelFile(abs_path)
        parts = []
        for sheet_name in xf.sheet_names:
            df = pd.read_excel(xf, sheet_name=sheet_name, header=None)
            df = df.ffill(axis=0).ffill(axis=1)
            parts.append(f"=== Sheet: {sheet_name} ===")
            parts.append(df.to_string(index=False, header=False))
        return "\n\n".join(parts)
    except Exception as e:
        return f"读取文件失败: {str(e)}"
