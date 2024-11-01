from openai import OpenAI, OpenAIError, APIError


import os
import sys
import datetime

sys.path.append(os.path.abspath(os.path.join(os.path.dirname(__file__), "../..")))

from lib.constants import LANGCHAIN_API_KEY, OPENROUTER_API_KEY, OPENAI_API_KEY
from config.rich_logging import logger as log
from models.prompt import Prompt

class Mai:
    def __init__(self):
        self.__api_key = OPENAI_API_KEY
        self.__langchain_api_key = LANGCHAIN_API_KEY
        self.__openrouter_api_key = OPENROUTER_API_KEY
        self.__prompt = Prompt()

    def __call__(self, text: str) -> str:
        pass

    def __summarize_request(self, text: str) -> str:
        pass

    def __summarize_request_json(self, text: str) -> str:
        pass
