import re
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
