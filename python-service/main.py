from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from api.routers import chat, index

app = FastAPI(title="Finio AI Service", version="1.0.0")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:3000", "http://localhost:8080"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(chat.router)
app.include_router(index.router)


@app.get("/health")
async def health():
    return {"status": "ok"}
