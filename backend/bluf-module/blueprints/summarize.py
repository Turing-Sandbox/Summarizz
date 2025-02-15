import os
import sys
import datetime
from typing import Optional

from config.llm_config import Models, PROVIDER_CONFIG

sys.path.append(os.path.abspath(os.path.join(os.path.dirname(__file__), "..")))

from config.rich_logging import logger as log
from config.langchain_ai import LCSummarizerAI
from config.llm_config import Providers, ProviderConfig
from models.mai import Mai
from models.prompt import Prompt, Params
from lib.sanitizer import sanitize_text
from validator.response import success_response, error_response

from flask_limiter import Limiter
from flask_limiter.util import get_remote_address
from flask import request, jsonify, Response
from flask_smorest import Blueprint

summary_bp = Blueprint("summary", __name__, url_prefix="/api/v1", description="Summarize BLUR API endpoints.")
limiter = Limiter(
    key_func=get_remote_address,
    default_limits=["200 per day", "50 per hour"]
)


# TODO: Edit Params
def setup_mai() -> Mai:
    params = Params(model=Models.LLAMA_3B_PREVIEW)
    prompt = Prompt(params=params)
    return Mai(params, prompt)


def setup_lcsai(provider: str, model: Optional[str]) -> LCSummarizerAI | None:
    valid_providers = ["groq", "together", "openai", "mistral"]
    provider = Providers(provider.lower())
    provider_config = PROVIDER_CONFIG.get(provider.value)

    try:
        if not provider:
            raise ValueError(f"Provider cannot be empty, got: {provider}")

        if provider.lower() not in valid_providers:
            raise ValueError(f"Provider not in valid providers: {valid_providers}")

        return LCSummarizerAI(
            provider=provider,
            model=model or provider_config.default_model
        )
    except ValueError as e:
        log.error(f"Invalid provider: {provider}. Error: {str(e)}")
        return None


@summary_bp.route("/mai/summarize", methods=["POST"])
@limiter.limit("20 per minute")
def summarize_mai_request() -> tuple[Response, int]:
    try:
        data = request.get_json()

        if not data or "input" not in data:
            log.error("No input was provided in the request body.")
            return error_response(
                error_message="No input was provided in the request body.",
                status_code=400
            )

        text = data.get("input", "")

        if not text:
            log.error("Empty input was provided in the request body.")
            return error_response(
                error_message="Empty text was provided, or no text was provided in the request body.",
                status_code=400
            )

        mai = setup_mai()
        sanitized_text = sanitize_text(text)
        summary = mai.summarize_request(input_text=sanitized_text)

        if not summary:
            return jsonify({
                "error": "An error occurred while processing the request. Please try again.",
                "trace": summary,
                "timestamp": datetime.datetime.now().strftime("%Y-%m-%d %H:%M:%S")
            }), 400

        return jsonify({
            "summary": {
                "output": summary,
            },
            "model": mai.params.model,
            "temperature": mai.params.temperature,
            "max_tokens": mai.params.max_tokens,
            "timestamp": datetime.datetime.now().strftime("%Y-%m-%d %H:%M:%S")
        }), 200

    except Exception as e:
        log.error(f"Error processing request: {str(e)}")
        return jsonify({
            "error": str(e),
            "timestamp": datetime.datetime.now().strftime("%Y-%m-%d %H:%M:%S")
        }), 500

@summary_bp.route("/lcsai/summarize", methods=["POST"])
@limiter.limit("20 per minute")
def summarize_lcsai_request() -> tuple[Response, int]:
    try:
        data = request.get_json()
        provider = data.get("provider")
        model = data.get("model")

        if not data or "text" not in data:
            return error_response(
                error_message="No text was provided in the request body to summarize.",
                status_code=400
            )

        if not provider:
           return error_response(
               error_message="No provider was provided in the request body to summarize.",
               status_code=400
           )

        if not model:
            return error_response(
                error_message="No model was provided in the request body to summarize.",
                status_code=400
            )

        setup_lcsai(provider, model)

    except Exception as e:
        log.error(f"Error generating summary using LCSummarizerAI: {str(e)}")
        return jsonify({
            "error": str(e),
            "timestamp": datetime.datetime.now().strftime("%Y-%m-%d %H:%M:%S")
        }), 500


@summary_bp.route("/summarize/<string:text>", methods=["POST"])
@limiter.exempt()
def summarize_request_json(text: str) -> tuple[Response, int]:
    log.info("SERVE: /api/v1/summarize POST (summarize request route)")
    pass


# region Routes for Summarizing Documents (Unused)
@summary_bp.route("/summarize/pdf", methods=["POST"])
def summarize_from_pdf() -> tuple[Response, int]:
    log.info("SERVE: /api/v1/summarize/file POST (summarize file route)")
    pass


@summary_bp.route("/summarize/docx", methods=["POST"])
def summarize_from_docx() -> tuple[Response, int]:
    log.info("SERVE: /api/v1/summarize/file POST (summarize file route)")
    pass


@summary_bp.route("/summarize/supported-types", methods=["GET"])
def supported_types() -> tuple[Response, int]:
    log.info("SERVE: /api/v1/summarize/supported-types GET (supported types route)")
    return jsonify({
        "supported_types": {
            "files": ["pdf", "docx"],
            "data": ["text", "json"]
        }
    }), 200
# endregion
