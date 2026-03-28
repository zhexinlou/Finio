import chromadb
from langchain_community.embeddings import DashScopeEmbeddings
from langchain_community.vectorstores import Chroma
from config import DASHSCOPE_API_KEY, CHROMA_PERSIST_DIR

_embeddings = None
_vector_store = None

def get_embeddings():
    global _embeddings
    if _embeddings is None:
        _embeddings = DashScopeEmbeddings(
            model="text-embedding-v3",
            dashscope_api_key=DASHSCOPE_API_KEY,
        )
    return _embeddings

def get_vector_store() -> Chroma:
    global _vector_store
    if _vector_store is None:
        _vector_store = Chroma(
            collection_name="finio_warehouse",
            embedding_function=get_embeddings(),
            persist_directory=CHROMA_PERSIST_DIR,
        )
    return _vector_store

def delete_by_path(file_path: str):
    """Delete all vectors for a given file path."""
    vs = get_vector_store()
    results = vs.get(where={"path": file_path})
    if results and results["ids"]:
        vs.delete(ids=results["ids"])

def similarity_search(query: str, k: int = 5, filter_paths: list[str] = None):
    vs = get_vector_store()
    if filter_paths:
        where = {"path": {"$in": filter_paths}}
        return vs.similarity_search(query, k=k, filter=where)
    return vs.similarity_search(query, k=k)
