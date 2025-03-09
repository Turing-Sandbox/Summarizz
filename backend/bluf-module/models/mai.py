from lib.constants import OPENROUTER_API_KEY
from config.rich_logging import logger as log
from models.prompt import Prompt, Params
from config.llm_config import Models

from openai import OpenAI, OpenAIError, APIError


class Mai:
    def __init__(self, params: Params = None, prompt: Prompt = None):
        self.__api_key = OPENROUTER_API_KEY
        self.params = params
        self.prompt = prompt

        try:
            masked_key = self.__api_key[:4] + "..." + self.__api_key[-4:] if len(self.__api_key) > 8 else "Invalid key"
            log.info(f"Initializing OpenRouter API with API Key: {masked_key}")

            self.client = OpenAI(
                base_url="https://openrouter.ai/api/v1",
                api_key=self.__api_key
            )

        except Exception as e:
            log.error(f"Error processing request: {e}")

    def summarize_request(self, model: Models, input_text: str) -> str | None:
        log.info(f"Sending request to OpenRouter API with text length: {len(input_text)} "
                 f"and estimate tokens: {len(input_text.split())}")

        try:
            response = self.client.chat.completions.create(
                model=model or "meta-llama/llama-3.3-70b-instruct:free",
                messages=[
                    {
                        "role": "system",
                        "content": self.prompt.system_prompt,
                    },
                    {
                        "role": "user",
                        "content": f"""
                        <user_prompt>
                        {self.prompt.user_prompt}
                        </user_prompt>
                        
                        Summarize the following content:
                        <user_content>
                        {input_text}
                        </user_content>
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
            return None
