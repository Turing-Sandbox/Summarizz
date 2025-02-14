# External Dependencies (Imports)
from openai import OpenAI, OpenAIError, APIError
from langchain.chat_models import ChatOpenAI
from langchain.chains import LLMChain
from langchain.llms import OpenAI
from langchain.prompts import PromptTemplate
from langchain.schema import (
    AIMessage,
    HumanMessage,
    SystemMessage,
)


# Internal Dependencies (Imports)
import os
import sys

sys.path.append(os.path.abspath(os.path.join(os.path.dirname(__file__), "../..")))

from lib.constants import LANGCHAIN_API_KEY, OPENROUTER_API_KEY, OPENAI_API_KEY
from config.rich_logging import logger as log


class LCSummarizerAI(LLMChain):
    def __init__(self, **kwargs):
        super().__init__(**kwargs)

    def __call__(self, inputs: dict[str, str]) -> str:
        pass

    def __parse(self, text: str) -> str:
        pass

    def __get_summary(self, text: str) -> str:
        pass

    def __get_summary_with_openrouter(self, text: str) -> str:
        pass

    def __get_summary_with_openai(self, text: str) -> str:
        pass

    def __get_summary_with_deepseek(self, text: str) -> str:
        pass
