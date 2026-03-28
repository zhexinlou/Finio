import json
import re
from fastapi import APIRouter
from fastapi.responses import StreamingResponse
from pydantic import BaseModel
from typing import Optional
from agent.agent import run_agent, run_agent_stream, CLEAR_SIGNAL

router = APIRouter()


class ChatRequest(BaseModel):
    message: str
    history: list[dict] = []


class ChatResponse(BaseModel):
    type: str  # "text" or "file"
    message: str
    file_path: Optional[str] = None


@router.post("/chat", response_model=ChatResponse)
async def chat(request: ChatRequest):
    result = run_agent(request.message, request.history)
    return ChatResponse(**result)


@router.post("/stream/chat")
async def chat_stream(request: ChatRequest):
    callback = await run_agent_stream(request.message, request.history)

    accumulated: list[str] = []

    async def generate():
        async for token in callback.aiter():
            if token == CLEAR_SIGNAL:
                accumulated.clear()
                yield f"data: {json.dumps({'clear': True})}\n\n"
            else:
                accumulated.append(token)
                yield f"data: {json.dumps({'token': token}, ensure_ascii=False)}\n\n"
        full = "".join(accumulated)
        match = re.search(r'[\w/\-\u4e00-\u9fff]+\.xlsx', full)
        file_path = match.group(0) if match else None
        yield f"data: {json.dumps({'done': True, 'type': 'file' if file_path else 'text', 'file_path': file_path}, ensure_ascii=False)}\n\n"

    return StreamingResponse(
        generate(),
        media_type="text/event-stream",
        headers={"Cache-Control": "no-cache", "X-Accel-Buffering": "no"},
    )
