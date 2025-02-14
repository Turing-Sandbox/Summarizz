import os

from dotenv import load_dotenv, find_dotenv

load_dotenv(find_dotenv())

# .env Constants
OPENAI_API_KEY = os.getenv("OPENAI_API_KEY")
OPENROUTER_API_KEY = os.getenv("OPENROUTER_API_KEY")
LANGCHAIN_API_KEY = os.getenv("LANGCHAIN_API_KEY")
