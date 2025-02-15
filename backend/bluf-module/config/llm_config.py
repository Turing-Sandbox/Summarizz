from enum import Enum
from dataclasses import dataclass
from typing import Type, Dict, Any
from lib.constants import (
    OPENAI_API_KEY,
    GROQ_API_KEY,
    MISTRAL_API_KEY,
    TOGETHER_API_KEY
)

from langchain_core.language_models import BaseChatModel
from langchain_core.messages import SystemMessage, HumanMessage
from langchain_core.prompts import ChatPromptTemplate
from langchain_groq import ChatGroq
from langchain_mistralai import ChatMistralAI
from langchain_together import ChatTogether
from langchain_openai import ChatOpenAI

@dataclass
class ProviderConfig:
    prompt_template: ChatPromptTemplate
    model_class: Type[BaseChatModel]
    default_model: str
    api_key: str


class Models(str, Enum):
    # NOTE: These models are specific to OpenRouter (free models).
    LLAMA_3B_PREVIEW = "meta-llama/llama-3.2-3b-instruct:free"
    GEMINI_FLASH_8B = "google/gemini-flash-1.5-8b-exp"
    DEEPSEEK_R1 = "deepseek/deepseek-r1:free"
    MISTRAL_SMALL_3 = "mistralai/mistral-small-24b-instruct-2501"


class Providers(str, Enum):
    # NOTE: Our default providers which include: OpenAI, Groq, Mistral, Together (LLM, IGEN)
    # NOTE: IGEN = Image Gen, LLM = Large Language Model
    PROVIDER_OPENAI = "openai"
    PROVIDER_GROQ = "groq"
    PROVIDER_MISTRAL = "mistral"
    PROVIDER_TOGETHER = "together"


DEFAULT_PROMPT_TEMPLATE = ChatPromptTemplate.from_messages([
    SystemMessage(content=""),
    HumanMessage(content="")
])

PROVIDER_CONFIG: Dict[Providers, ProviderConfig] = {
    Providers.PROVIDER_OPENAI: ProviderConfig(
        prompt_template=DEFAULT_PROMPT_TEMPLATE,
        model_class=ChatOpenAI,
        default_model="gpt-4o",
        api_key=OPENAI_API_KEY
    ),

    Providers.PROVIDER_GROQ: ProviderConfig(
        prompt_template=DEFAULT_PROMPT_TEMPLATE,
        model_class=ChatGroq,
        default_model="",
        api_key=GROQ_API_KEY
    ),

    Providers.PROVIDER_MISTRAL: ProviderConfig(
        prompt_template=DEFAULT_PROMPT_TEMPLATE,
        model_class=ChatMistralAI,
        default_model="",
        api_key=MISTRAL_API_KEY
    ),

    Providers.PROVIDER_TOGETHER: ProviderConfig(
        prompt_template=DEFAULT_PROMPT_TEMPLATE,
        model_class=ChatTogether,
        default_model="",
        api_key=TOGETHER_API_KEY
    )
}
