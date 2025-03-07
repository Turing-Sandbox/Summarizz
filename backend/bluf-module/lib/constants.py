import os
from dotenv import load_dotenv, find_dotenv

load_dotenv(find_dotenv())

# .env Constants
OPENAI_API_KEY = os.getenv("OPENAI_API_KEY")
OPENROUTER_API_KEY = os.getenv("OPENROUTER_API_KEY")
GROQ_API_KEY = os.getenv("GROQ_API_KEY")
MISTRAL_API_KEY = os.getenv("MISTRAL_API_KEY")
TOGETHER_API_KEY = os.getenv("TOGETHER_API_KEY")