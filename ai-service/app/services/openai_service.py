from langchain_google_genai import ChatGoogleGenerativeAI

from app.config.settings import settings
from app.utils.logger import log_error, log_info
import re
import time

DEFAULT_TEMPERATURE = 0.7


def _normalize_model_name(value: str | None) -> str:
    model = (value or "").strip()
    return model or "gemini-2.5-flash"


class GeminiClient:
    def __init__(self):
        self._model = _normalize_model_name(settings.GEMINI_MODEL)
        self._client: ChatGoogleGenerativeAI | None = None
        self._startup_logged = False
        self._quota_exhausted_until = 0.0
        self._gemini_call_count = 0

    def _build_client(self, temperature: float = DEFAULT_TEMPERATURE) -> ChatGoogleGenerativeAI:
        return ChatGoogleGenerativeAI(
            api_key=settings.GEMINI_API_KEY,
            model=self._model,
            temperature=temperature,
        )

    def _ensure_client(self):
        if self._client is None:
            self._client = self._build_client()

        if not self._startup_logged:
            self._startup_logged = True
            log_info("Gemini model selected", extra={"selected_model": self._model})

    def invoke(self, prompt: str, temperature: float = DEFAULT_TEMPERATURE):
        now = time.time()
        if now < self._quota_exhausted_until:
            remaining = int(self._quota_exhausted_until - now)
            log_info(
                "Gemini skipped due to cached quota exhaustion",
                extra={"selected_model": self._model, "retry_after_seconds": remaining},
            )
            raise GeminiQuotaExceeded(retry_after_seconds=max(1, remaining), cached_skip=True)

        self._ensure_client()
        client = self._client if temperature == DEFAULT_TEMPERATURE else self._build_client(temperature)

        try:
            self._gemini_call_count += 1
            log_info("Gemini invocation started", extra={"selected_model": self._model})
            response = client.invoke(prompt)
            log_info("Gemini invocation success", extra={"selected_model": self._model})
            return response
        except Exception as error:
            retry_after = _extract_retry_after_seconds(error)
            if _is_quota_error(error):
                self._quota_exhausted_until = time.time() + retry_after
                log_error(
                    f"Gemini quota exceeded for model '{self._model}'. "
                    f"Using fallback path for ~{retry_after}s.",
                    error,
                )
                raise GeminiQuotaExceeded(retry_after_seconds=retry_after) from error
            log_error(
                f"Gemini invocation failed for model '{self._model}'. "
                "Check GEMINI_MODEL and API access.",
                error,
            )
            raise

    @property
    def model(self) -> str:
        return self._model

    def reset_call_count(self):
        self._gemini_call_count = 0

    def get_call_count(self) -> int:
        return self._gemini_call_count


class GeminiQuotaExceeded(Exception):
    def __init__(self, retry_after_seconds: int = 60, cached_skip: bool = False):
        super().__init__(f"Gemini quota exhausted. Retry after {retry_after_seconds}s")
        self.retry_after_seconds = retry_after_seconds
        self.cached_skip = cached_skip


def _is_quota_error(error: Exception) -> bool:
    message = str(error).lower()
    return "429" in message or "resourceexhausted" in message or "quota" in message


def _extract_retry_after_seconds(error: Exception) -> int:
    message = str(error)
    patterns = [
        r"retry[_\s-]?delay.*?seconds:\s*(\d+)",
        r"retry after\s*(\d+)",
        r"try again in\s*(\d+)",
    ]
    for pattern in patterns:
        match = re.search(pattern, message, flags=re.IGNORECASE | re.DOTALL)
        if match:
            try:
                value = int(match.group(1))
                if value > 0:
                    return min(value, 600)
            except Exception:
                pass
    return 90


llm = GeminiClient()


def get_model_runtime_info() -> dict:
    return {
        "configured_model": _normalize_model_name(settings.GEMINI_MODEL),
        "active_model": llm.model,
        "quota_cached": time.time() < llm._quota_exhausted_until,
    }


def reset_gemini_call_count():
    llm.reset_call_count()


def get_gemini_call_count() -> int:
    return llm.get_call_count()


async def call_gemini(prompt: str, temperature: float = DEFAULT_TEMPERATURE):
    """Call Google Gemini API using configured model only."""
    response = llm.invoke(prompt, temperature=temperature)
    return response.content
