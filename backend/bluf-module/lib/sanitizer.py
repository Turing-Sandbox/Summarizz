import os
import re
import sys

sys.path.append(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))

import unicodedata
from urllib.parse import unquote

from config.rich_logging import logger as log

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


def sanitize_content(content: str) -> str:
    if not isinstance(content, str):
        log.error("")
        return ""

    if content is None:
        log.warning("Input text was None, please ensure there is text to sanitize.")
        return ""

    try:
        text_sanitized = unquote(content)
        text_sanitized = HTML_REGEX.sub(" ", text_sanitized)
        text_sanitized = SPECIAL_CHARS_REGEX.sub(" ", text_sanitized)

        for regex in HTML_ENTITIES_REGEX:
            text_sanitized = regex.sub(" ", text_sanitized)

        text_sanitized = unicodedata.normalize("NFKD", text_sanitized)
        text_sanitized = WHITESPACE_REGEX.sub(" ", text_sanitized)
        text_sanitized = text_sanitized.strip()

        log.info(f"Sanitized (text) from request: {text_sanitized[:200] + "..." if len(text_sanitized) > 200 else text_sanitized}")
        return text_sanitized

    except Exception as e:
        log.error(f"Error during text sanitization: {e}")
        return ""
