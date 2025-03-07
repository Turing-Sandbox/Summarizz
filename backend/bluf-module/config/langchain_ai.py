from typing import Optional
from langchain.chains import LLMChain
from langchain.schema import (
    HumanMessage,
    SystemMessage,
)
from langchain_core.language_models import BaseChatModel

from config.rich_logging import logger as log
from config.llm_config import Providers, ProviderConfig
from models.prompt import DEFAULT_SYSTEM_PROMPT, DEFAULT_USER_PROMPT_FORMAT

# TODO: Fix LCSummarizerAI Class & Functionality
class LCSummarizerAI:
    def __init__(self, provider: Providers, model: Optional[str] = None):
        self.provider = provider
        self.model = model
        self.config = self._get_provider_config()
        self.llm = self._initialize_llm()

    def _get_provider_config(self) -> ProviderConfig:
        if self.provider not in ProviderConfig:
            raise ValueError(f"Unsupported provider: {self.provider}")

        return ProviderConfig[self.provider]

    def _initialize_llm(self) -> BaseChatModel:
        try:
            return self.config.model_class(
                model_name=self.model or self.config.default_model,
                api_key=self.config.api_key
            )

        except Exception as e:
            log.error(f"Failed to initialize LLM for provider {self.provider}: {str(e)}")
            raise ValueError(f"Failed to initialize LLM: {str(e)}")

    def summarize(self, content: str) -> str:
        if not content.strip():
            raise ValueError("Content cannot be empty")

        messages = [
            SystemMessage(content=DEFAULT_SYSTEM_PROMPT),
            HumanMessage(content=f"{DEFAULT_USER_PROMPT_FORMAT}\n\n"
                                f"Content to summarize:\n{content}")
        ]

        try:
            response = self.llm.generate([messages])
            if not response.generations:
                raise ValueError("No summary generated")

            return response.generations[0][0].text

        except Exception as e:
            log.error(f"Something went wrong, error generating summary: {str(e)}")
            raise ValueError(f"Failed to generate a valid summary: {str(e)}")
