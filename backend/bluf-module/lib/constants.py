import os

from dotenv import load_dotenv, find_dotenv


"""
File: constants.py
Module: bluf-module
Author: Muhammad Bilal Khan
Description:
    - This file contains all the constants that will be used throughout the application.
    - Most of the constants are going to be from .env variables.
    - The constants are defined here to make it easier to manage and maintain.
Notes:
    - This file should only be used to store constants.
    - If there is a need to edit the constants, there has to be a corresponding .env change.

License: MIT License
Copyright (c) 2024 Turing Sandbox


Modified History:
    - 2024-10-31: Creation of the file.
"""

load_dotenv(find_dotenv())

# .env Constants
OPENAI_API_KEY = os.getenv("OPENAI_API_KEY")
OPENROUTER_API_KEY = os.getenv("OPENROUTER_API_KEY")
LANGCHAIN_API_KEY = os.getenv("LANGCHAIN_API_KEY")
