from fastapi import APIRouter, HTTPException
from pydantic import BaseModel
from storage.indexer import index_file, remove_file_index
import os
from config import WAREHOUSE_PATH

router = APIRouter()


class IndexRequest(BaseModel):
    file_path: str  # absolute path


class IndexResponse(BaseModel):
    success: bool
    chunks: int
    message: str


@router.post("/index", response_model=IndexResponse)
async def index(request: IndexRequest):
    abs_path = request.file_path
    if not os.path.exists(abs_path):
        raise HTTPException(status_code=404, detail=f"File not found: {abs_path}")

    try:
        chunks = index_file(abs_path)
        return IndexResponse(success=True, chunks=chunks, message="索引成功")
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


class RemoveIndexRequest(BaseModel):
    rel_path: str  # relative path (single file or folder prefix)


@router.post("/index/remove")
async def remove_index(request: RemoveIndexRequest):
    try:
        remove_file_index(request.rel_path)
        return {"success": True}
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))
