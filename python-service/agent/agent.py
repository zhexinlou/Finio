import re
import asyncio
from langchain_openai import ChatOpenAI
from langchain.agents import AgentExecutor, create_openai_tools_agent
from langchain.schema import HumanMessage, AIMessage
from langchain_core.prompts import ChatPromptTemplate, MessagesPlaceholder
from langchain.callbacks import AsyncIteratorCallbackHandler
from langchain_core.outputs import LLMResult

from config import DASHSCOPE_API_KEY, DASHSCOPE_BASE_URL, LLM_MODEL
from tools.retrieval_tool import retrieval_tool
from tools.excel_reader_tool import excel_reader_tool
from tools.excel_writer_tool import excel_writer_tool
from agent.prompts import SYSTEM_PROMPT


# ── Custom callback: streams tokens across ALL LLM calls in one agent run ────
CLEAR_SIGNAL = "\x00CLEAR\x00"

class AgentStreamingCallback(AsyncIteratorCallbackHandler):
    """
    _emit=True  → tokens are forwarded to the queue (LLM is generating)
    _emit=False → tokens are suppressed (a tool is executing)

    When a tool starts: suppress future tokens AND enqueue CLEAR_SIGNAL so the
    frontend discards the intermediate planning text.
    When the tool ends: re-enable emission for the next LLM call.
    done is only set externally by _run(), never by LangChain callbacks.
    """

    def __init__(self) -> None:
        super().__init__()
        self._emit = True

    async def on_llm_new_token(self, token: str, **kwargs) -> None:
        if self._emit and not self.done.is_set():
            await self.queue.put(token)

    async def on_tool_start(self, serialized, input_str, **kwargs) -> None:
        self._emit = False
        if not self.done.is_set():
            await self.queue.put(CLEAR_SIGNAL)

    async def on_tool_end(self, output: str, **kwargs) -> None:
        self._emit = True

    async def on_llm_end(self, response: LLMResult, **kwargs) -> None:
        pass  # don't set done

    async def on_chain_end(self, outputs, **kwargs) -> None:
        pass  # don't set done

    async def on_agent_finish(self, finish, **kwargs) -> None:
        pass  # don't set done; _run() finally handles it


# ── Singleton executor (built once, reused across requests) ──────────────────
_executor: AgentExecutor | None = None

def _build_executor(streaming: bool = False) -> AgentExecutor:
    llm = ChatOpenAI(
        model=LLM_MODEL,
        api_key=DASHSCOPE_API_KEY,
        base_url=DASHSCOPE_BASE_URL,
        temperature=0.1,
        timeout=60,
        streaming=streaming,
    )
    tools = [retrieval_tool, excel_reader_tool, excel_writer_tool]
    prompt = ChatPromptTemplate.from_messages([
        ("system", SYSTEM_PROMPT),
        MessagesPlaceholder(variable_name="chat_history"),
        ("human", "{input}"),
        MessagesPlaceholder(variable_name="agent_scratchpad"),
    ])
    agent = create_openai_tools_agent(llm, tools, prompt)
    return AgentExecutor(agent=agent, tools=tools, verbose=True, max_iterations=5)

def get_executor() -> AgentExecutor:
    global _executor
    if _executor is None:
        _executor = _build_executor(streaming=True)
    return _executor

# ── History conversion ────────────────────────────────────────────────────────
def _to_lc_history(history: list[dict]):
    result = []
    for msg in history:
        if msg["role"] == "user":
            result.append(HumanMessage(content=msg["content"]))
        elif msg["role"] == "assistant":
            result.append(AIMessage(content=msg["content"]))
    return result

# ── Detect file path in output ────────────────────────────────────────────────
def _extract_file_path(text: str) -> str | None:
    match = re.search(r'[\w/\-\u4e00-\u9fff]+\.xlsx', text)
    return match.group(0) if match else None

# ── Sync run (kept for Java /chat endpoint) ──────────────────────────────────
def run_agent(message: str, history: list[dict]) -> dict:
    executor = get_executor()
    result = executor.invoke({
        "input": message,
        "chat_history": _to_lc_history(history),
    })
    output = result.get("output", "")
    file_path = _extract_file_path(output)
    return {
        "type": "file" if file_path else "text",
        "message": output,
        "file_path": file_path,
    }

# ── Async streaming run ───────────────────────────────────────────────────────
async def run_agent_stream(message: str, history: list[dict]) -> AsyncIteratorCallbackHandler:
    """
    Starts the agent in the background and returns the callback immediately.
    The caller iterates callback.aiter() for tokens; done is set when agent finishes.
    """
    callback = AgentStreamingCallback()
    executor = get_executor()

    async def _run():
        try:
            await executor.ainvoke(
                {"input": message, "chat_history": _to_lc_history(history)},
                config={"callbacks": [callback]},
            )
        except Exception as e:
            print(f"Agent stream error: {e}")
        finally:
            callback.done.set()

    asyncio.create_task(_run())
    return callback
