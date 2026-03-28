import os
import json
from datetime import datetime
import openpyxl
from langchain.tools import tool
from config import WAREHOUSE_PATH
from storage.indexer import index_file


@tool
def excel_writer_tool(input_json: str) -> str:
    """
    生成Excel文件并存入仓库，同时更新向量索引。
    输入：JSON字符串，包含字段：
      - data: dict，key为sheet名，value为二维列表（行列数据）
      - target_path: str，目标相对路径（如 "报表/收入汇总.xlsx"）
      - description: str，文件描述
    输出：生成文件的相对路径
    """
    try:
        params = json.loads(input_json)
        data = params.get("data", {})
        target_path = params.get("target_path", "")
        description = params.get("description", "")
    except Exception as e:
        return f"参数解析失败: {str(e)}"

    if not target_path:
        # Auto generate path
        ts = datetime.now().strftime("%Y-%m-%d_%H%M%S")
        target_path = f"报表/{ts}_{description[:20]}.xlsx"

    abs_path = os.path.join(WAREHOUSE_PATH, target_path)
    os.makedirs(os.path.dirname(abs_path), exist_ok=True)

    try:
        wb = openpyxl.Workbook()
        wb.remove(wb.active)  # Remove default sheet

        for sheet_name, rows in data.items():
            ws = wb.create_sheet(title=str(sheet_name))
            for row in rows:
                ws.append([str(v) if v is not None else "" for v in row])

        wb.save(abs_path)

        # Update vector index
        index_file(abs_path)

        return target_path
    except Exception as e:
        return f"生成文件失败: {str(e)}"
