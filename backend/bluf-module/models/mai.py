# Internal Dependencies (Imports)
import os
import sys

sys.path.append(os.path.abspath(os.path.join(os.path.dirname(__file__), "../..")))

from lib.constants import OPENROUTER_API_KEY
from config.rich_logging import logger as log
from models.prompt import Prompt, Params, Models

# External Dependencies (Imports)
from openai import OpenAI, OpenAIError, APIError


class Mai:
    def __init__(self, params: Params = None, prompt: Prompt = None):
        self.__api_key = os.getenv("OPENROUTER_API_KEY")
        if not self.__api_key:
            log.debug("OPENROUTER_API_KEY environment variable is not set.")
            raise ValueError("OPENROUTER_API_KEY environment variable is not set.")

        self.params = params
        self.prompt = prompt

        try:
            self.client = OpenAI(
                base_url="https://openrouter.ai/api/v1",
                api_key=OPENROUTER_API_KEY if not None else self.__api_key,
                default_headers={
                    "Authorization": f"Bearer {self.__api_key}",
                    "Content-Type": "application/json"
                },
            )
            log.info("OpenRouter API Key set successfully.")

        except Exception as e:
            log.error(f"Error processing request: {e}")

    def summarize_request(self, input_text: str) -> str | None:
        log.info(f"Sending request to OpenRouter API with text length: {len(input_text)}")

        try:
            response = self.client.chat.completions.create(
                model="meta-llama/llama-3.1-8b-instruct:free",
                messages=[
                    {
                        "role": "system",
                        "content": self.prompt.system_prompt,
                    },
                    {
                        "role": "user",
                        "content": f"""
                        {self.prompt.user_prompt.format(input_text=input_text)}
                        """
                    }
                ]
            )

            log.info(f"API Response: {response}")
            return response.choices[0].message.content or None

        except (OpenAIError, APIError) as e:
            log.error(f"Error with OpenAI API or API Error: {e}")
            return None

        except Exception as e:
            log.error(f"An unexpected error occurred: {e}")
            return ""
