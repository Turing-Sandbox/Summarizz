from typing import LiteralString
from pydantic import BaseModel

"""
File: prompt.py
Module: bluf-module
Author: Muhammad Bilal Khan
Description:
    - This file contains the schema for the prompts used by the AI models.
    -  The prompts are defined using the Pydantic BaseModel class.
    
License: MIT License
Copyright (c) 2024 Turing Sandbox

Modified History:
    - 2024-11-01: Creation of the file.
"""


class Prompt(BaseModel):
    prompt: str
    model: str = "llama3.5-3b-preview"
    temperature: float = 0.5
    max_tokens: int = 1000
    top_p: float = 1.0
    frequency_penalty: float = 0.0
    presence_penalty: float = 0.0
    stop: list[str] = []
    n: int = 1
    stream: bool = False
