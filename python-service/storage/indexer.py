import os
import re
from datetime import datetime
from pathlib import Path

import pandas as pd
from langchain.schema import Document

from storage.vector_store import get_vector_store, delete_by_path
from config import WAREHOUSE_PATH


def _get_folder_chain(file_path: str) -> str:
    rel = os.path.relpath(file_path, WAREHOUSE_PATH)
    parts = Path(rel).parts
    return "/".join(parts[:-1]) if len(parts) > 1 else ""


def _parse_excel(file_path: str) -> list[Document]:
    """Parse all sheets of an Excel file into Documents."""
    docs = []
    rel_path = os.path.relpath(file_path, WAREHOUSE_PATH)
    filename = os.path.basename(file_path)
    folder_chain = _get_folder_chain(file_path)

    try:
        xf = pd.ExcelFile(file_path)
        for sheet_name in xf.sheet_names:
            df = pd.read_excel(xf, sheet_name=sheet_name, header=None)
            # Handle merged cells by forward-filling
            df = df.ffill(axis=0).ffill(axis=1)
            text_lines = [f"Sheet: {sheet_name}"]
            for _, row in df.iterrows():
                line = " | ".join(str(v) for v in row.values if str(v) != "nan")
                if line.strip():
                    text_lines.append(line)
            content = "\n".join(text_lines)

            doc = Document(
                page_content=content,
                metadata={
                    "path": rel_path,
                    "folder_chain": folder_chain,
                    "filename": filename,
                    "sheet_name": str(sheet_name),
                    "uploaded_at": datetime.now().isoformat(),
                },
            )
            docs.append(doc)
    except Exception as e:
        print(f"Error parsing {file_path}: {e}")
    return docs


def index_file(file_path: str):
    """Index a single file: delete old vectors then add new ones."""
    rel_path = os.path.relpath(file_path, WAREHOUSE_PATH)
    delete_by_path(rel_path)
    docs = _parse_excel(file_path)
    if docs:
        vs = get_vector_store()
        vs.add_documents(docs)
    return len(docs)


def remove_file_index(rel_path: str):
    delete_by_path(rel_path)
