import re
import unicodedata
from urllib.parse import unquote
from config.rich_logging import logger as log

"""
File: sanitizer.py
Module: bluf-module
Author: Muhammad Bilal Khan
Description:
    - This file contains functions to sanitize and clean input from POST requests for the AI.
    - Functions should take in a string of text and return a sanitized string of text.
        - The sanitized string will make it easier for the AI to generate a 2 paragraph summary.
    - The function(s) should be able to handle only English text.
License: MIT License
Copyright (c) 2024 Turing Sandbox
Modified History:
    - 2024-12-04: Creation of the file.
"""

HTML_REGEX = re.compile("<.*?>")
SPECIAL_CHARS_REGEX = re.compile("[^a-zA-Z0-9\\s]")
HTML_ENTITIES_REGEX = [
    re.compile("&nbsp;"),
    re.compile("&lt;"),
    re.compile("&lt;"),
    re.compile("&gt;"),
    re.compile("&amp;"),
]
WHITESPACE_REGEX = re.compile("\\s+")


def sanitize_text(text: str) -> str:
    if not isinstance(text, str):
        log.error("Input (text) provided is not a string.")
        return ""

    if not text:
        log.error("Input (text) provided is empty.")

    text_sanitized = unquote(text)
    text_sanitized = HTML_REGEX.sub(" ", text_sanitized)
    text_sanitized = SPECIAL_CHARS_REGEX.sub(" ", text_sanitized)

    for regex in HTML_ENTITIES_REGEX:
        text_sanitized = regex.sub(" ", text_sanitized)

    text_sanitized = unicodedata.normalize("NFKD", text_sanitized)
    text_sanitized = WHITESPACE_REGEX.sub(" ", text_sanitized)
    text_sanitized = text_sanitized.strip()

    log.info(f"Sanitized (text) from request: {text_sanitized}")
    return text_sanitized
