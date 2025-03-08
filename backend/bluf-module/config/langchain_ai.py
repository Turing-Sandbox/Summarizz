from typing import Optional, Dict, Any
from langchain.chains import LLMChain
from langchain.schema import (
    HumanMessage,
    SystemMessage,
)
from langchain_core.language_models import BaseChatModel
from functools import lru_cache
import time
from concurrent.futures import ThreadPoolExecutor

from config.rich_logging import logger as log
from config.llm_config import Providers, ProviderConfig
from models.prompt import DEFAULT_SYSTEM_PROMPT, DEFAULT_USER_PROMPT_FORMAT


class LCSummarizerAI:
    def __init__(self, provider: Providers, model: Optional[str] = None, max_retries: int = 3,
                 retry_delay: float = 1.0, cache_size: int = 128):
        self.provider = provider
        self.model = model
        self.max_retries = max_retries
        self.retry_delay = retry_delay
        self._config = None
        self._llm = None
        self._summarize = lru_cache(maxsize=cache_size)(self._summarize_impl)

    @property
    def config(self) -> ProviderConfig:
        if self._config is None:
            self._config = self._get_provider_config()
        return self._config

    @property
    def llm(self) -> BaseChatModel:
        if self._llm is None:
            self._llm = self._initialize_llm()
        return self._llm

    def _get_provider_config(self) -> ProviderConfig:
        if not isinstance(self.provider, Providers):
            raise ValueError(f"Unsupported provider: {self.provider}")

        return ProviderConfig[self.provider]

    def _initialize_llm(self) -> BaseChatModel:
        try:
            model_class = self.config.model_class
            model_name = self.model or self.config.default_model

            log.debug(f"Initializing {model_class.__name__} with model {model_name}")

            return model_class(
                model_name=model_name,
                api_key=self.config.api_key
            )

        except Exception as e:
            log.error(f"Failed to initialize LLM for provider {self.provider}: {str(e)}")
            raise ValueError(f"Failed to initialize LLM: {str(e)}")

    def _summarize_impl(self, content: str) -> str:
        if not content.strip():
            raise ValueError("Content cannot be empty")

        messages = [
            SystemMessage(content=DEFAULT_SYSTEM_PROMPT),
            HumanMessage(content=f"{DEFAULT_USER_PROMPT_FORMAT}\n\n"
                                 f"Content to summarize:\n{content}")
        ]

        for attempt in range(self.max_retries):
            try:
                response = self.llm.generate([messages])
                if not response.generations or not response.generations[0]:
                    raise ValueError("No summary generated")

                return response.generations[0][0].text

            except Exception as e:
                if attempt < self.max_retries - 1:
                    log.warning(f"Summary generation attempt {attempt + 1} failed: {str(e)}. Retrying...")
                    time.sleep(self.retry_delay * (2 ** attempt))
                else:
                    log.error(f"All attempts to generate summary failed: {str(e)}")
                    raise ValueError(f"Failed to generate a valid summary after {self.max_retries} attempts: {str(e)}")

    def summarize(self, content: str) -> str:
        return self._summarize(content)

    def summarize_batch(self, contents: list[str], max_workers: Optional[int] = None) -> list[str]:
        if not contents:
            return []

        with ThreadPoolExecutor(max_workers=max_workers) as executor:
            return list(executor.map(self.summarize, contents))

    def clear_cache(self) -> None:
        """Clear the summarization cache."""
        self._summarize.cache_clear()
