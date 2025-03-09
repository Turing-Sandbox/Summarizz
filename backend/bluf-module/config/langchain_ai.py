import os
import sys
import time
from typing import Optional, List
from functools import lru_cache
from concurrent.futures import ThreadPoolExecutor

sys.path.append(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))

from langchain_core.language_models import BaseChatModel
from langchain_core.messages import HumanMessage, SystemMessage
from config.rich_logging import logger as log
from config.llm_config import (
    Providers,
    PROVIDER_CONFIG,
    ProviderConfig,
    Models
)
from models.prompt import DEFAULT_SYSTEM_PROMPT, DEFAULT_USER_PROMPT_FORMAT


class LCSummarizerAI:
    def __init__(
            self,
            provider: Providers,
            model: Optional[str] = None,
            max_retries: int = 3,
            retry_delay: float = 1.0,
            cache_size: int = 128
    ):
        self.provider = provider
        self.model = model or self.config.default_model
        self.max_retries = max_retries
        self.retry_delay = retry_delay
        self._llm = None

        if provider not in PROVIDER_CONFIG:
            raise ValueError(f"Unsupported provider: {provider}")

        self._summarize = lru_cache(maxsize=cache_size)(self._summarize_impl)

    @property
    def config(self) -> ProviderConfig:
        config = PROVIDER_CONFIG.get(self.provider)
        if not config:
            raise ValueError(f"No configuration found for provider: {self.provider}")
        return config

    @property
    def llm(self) -> BaseChatModel:
        if self._llm is None:
            self._llm = self._initialize_llm()
        return self._llm

    def _initialize_llm(self) -> BaseChatModel:
        try:
            return self.config.model_class(
                model=self.model,
                api_key=self.config.api_key,
            )
        except Exception as e:
            log.error(f"LLM initialization failed for {self.provider}: {str(e)}")
            raise RuntimeError(f"Failed to initialize {self.provider} LLM: {str(e)}")

    def _build_messages(self, content: str) -> List:
        return [
            SystemMessage(content=DEFAULT_SYSTEM_PROMPT),
            HumanMessage(content=f"{DEFAULT_USER_PROMPT_FORMAT}\n\n{content}")
        ]

    def _summarize_impl(self, content: str) -> str:
        if not content.strip():
            raise ValueError("Content cannot be empty")

        for attempt in range(self.max_retries):
            try:
                response = self.llm.invoke(self._build_messages(content))
                return response.content.strip()
            except Exception as e:
                if attempt < self.max_retries - 1:
                    log.warning(f"Attempt {attempt + 1} failed: {str(e)}")
                    time.sleep(self.retry_delay * (2 ** attempt))
                else:
                    log.error(f"All summarization attempts failed")
                    raise RuntimeError(f"Summarization failed: {str(e)}")

    def summarize(self, content: str) -> str:
        return self._summarize(content)

    def summarize_batch(self, contents: List[str], max_workers: int = 4) -> List[str]:
        with ThreadPoolExecutor(max_workers=max_workers) as executor:
            return list(executor.map(self.summarize, contents))

    def clear_cache(self) -> None:
        self._summarize.cache_clear()
