import os
import sys

sys.path.append(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))

from config.rich_logging import logger as log

def format_to_html(content: str) -> str:
    if not isinstance(content, str):
        log.error("Content must be a string.")
        return ""
    if content is None:
        log.warning("Input content was None, please ensure there is content to format.")
        return ""

    html = []
    in_list = False
    current_paragraph = []

    def close_paragraph():
        if current_paragraph:
            html.append(f"<p>{"<br>".join(current_paragraph)}</p>")
            current_paragraph.clear()

    def close_list():
        nonlocal in_list
        if in_list:
            html.append("</ul>")
            in_list = False

    try:
        for line in content.split("\n"):
            stripped = line.strip()

            if stripped.startswith("###"):
                close_paragraph()
                close_list()
                html.append(f"<h3>{stripped[3:].strip()}</h3>")

            elif stripped.startswith('##'):
                close_paragraph()
                close_list()
                html.append(f"<h2>{stripped[2:].strip()}</h2>")

            elif stripped.startswith('#'):
                close_paragraph()
                close_list()
                html.append(f"<h1>{stripped[1:].strip()}</h1>")

            elif stripped.startswith('-'):
                close_paragraph()
                if not in_list:
                    html.append("<ul>")
                    in_list = True
                html.append(f"<li>{stripped[1:].strip()}</li>")

            else:
                if stripped:
                    current_paragraph.append(stripped)
                else:
                    close_paragraph()
                    close_list()

        close_paragraph()
        close_list()

        log.info(f"Formatted (HTML) from request: {html[:200] + "..." if len(html) > 200 else html}")
        return "\n".join(html)

    except Exception as e:
        log.error(f"Error during HTML formatting: {e}")
        return ""
