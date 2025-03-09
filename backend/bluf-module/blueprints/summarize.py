import os
import sys

sys.path.append(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))

import datetime
from typing import Optional, Dict, Any, Union, Tuple

from config.llm_config import Models, PROVIDER_CONFIG
from config.rich_logging import logger as log
from config.langchain_ai import LCSummarizerAI
from config.llm_config import Providers, ProviderConfig
from models.mai import Mai
from models.prompt import Prompt, Params
from lib.sanitizer import sanitize_content
from lib.formatter import format_to_html
from .validator.response import success_response, error_response

from flask_limiter import Limiter
from flask_limiter.util import get_remote_address
from flask import request, jsonify, Response
from flask_smorest import Blueprint

summary_bp = Blueprint("summary", __name__, url_prefix="/api/v1", description="Summarize BLUR API endpoints.")
limiter = Limiter(
    key_func=get_remote_address,
    default_limits=["200 per day", "50 per hour"]
)

#region Setup MAI and LCSAI
def setup_mai() -> Mai:
    params = Params(model=Models.LLAMA_3B_PREVIEW,
                    temperature=0.5,
                    max_tokens=1000,
                    top_p=1.0,
                    frequency_penalty=0.0,
                    presence_penalty=0.0, n=1)
    prompt = Prompt(params=params)
    return Mai(params, prompt)


def setup_lcsai(provider: str, model: Optional[str] = None) -> Optional[LCSummarizerAI] | None:
    if not provider: raise ValueError("Provider cannot be empty")

    try:
        provider = Providers(provider.lower())

        if provider not in PROVIDER_CONFIG:
            log.error(f"Provider not found: {provider}")
            raise ValueError(f"Provider not found: {provider}")

        if not PROVIDER_CONFIG[provider].api_key:
            log.error(f"API key not found for provider: {provider}")
            raise ValueError(f"API key not found for provider: {provider}")

        return LCSummarizerAI(
            provider=provider,
            model=model or PROVIDER_CONFIG[provider].default_model,
        )

    except Exception as e:
        log.error(f"Failed to setup LCSummarizerAI with provider {provider}: {str(e)}")
        return None
#endregion

# ENDPOINT: /api/v1/summarize/mai
# API ENDPOINT to summarize text with MAI
@summary_bp.route("/mai/summarize", methods=["POST"])
@limiter.limit("20 per minute")
def summarize_mai_request() -> tuple[Response, int] | None:
    try:
        if request.method == "POST":
            data = request.get_json()
            content = data.get("input", "")

            mai = setup_mai()
            sanitized_text = sanitize_content(content)
            summary = mai.summarize_request(input_text=sanitized_text, model=Models.LLAMA_3B_PREVIEW)

            if not summary:
                return error_response(
                    error_message="Failed to generate summary. Please try again.",
                    status_code=500
                )

            return jsonify({
                "summary": {
                    "format": {
                        "markdown": summary,
                        "html": format_to_html(summary)
                    }
                },
                "model": mai.params.model,
                "temperature": mai.params.temperature,
                "max_tokens": mai.params.max_tokens,
                "timestamp": datetime.datetime.now().strftime("%Y-%m-%d %H:%M:%S")
            }), 200

    except Exception as e:
        log.error(f"Error processing MAI summary request: {str(e)}")
        return error_response(
            error_message=f"Error generating summary: {str(e)}",
            status_code=500
        )


# ENDPOINT: /api/v1/summarize/lcsai
# API ENDPOINT to summarize text with LCSAI
@summary_bp.route("/lcsai/summarize", methods=["POST"])
@limiter.limit("20 per minute")
def summarize_lcsai_request() -> Response | tuple[Response, int] | None:
    try:
        data = request.get_json()

        if not all(key in data for key in ["provider", "content"]):
            return error_response(
                error_message=f"There are missing fields with your request."
                              f"Following missing fields: {', '.join([key for key in data if key not in ['provider', 'content']])}",
                status_code=400
            )

        provider = data.get("provider")
        model = data.get("model")
        content = data.get("content")

        lcsai = setup_lcsai(provider, model)
        if not lcsai:
            return error_response(
                error_message=f"Failed to initialize summarizer with provider: {provider}",
                status_code=400
            )

        sanitized_text = sanitize_content(content)
        summary = lcsai.summarize(content=sanitized_text)

        return jsonify({
            "summary": {
                "format": {
                    "markdown": summary,
                    "html": format_to_html(summary)
                },
            },
            "provider": lcsai.provider.value,
            "model": lcsai.model,
            "timestamp": datetime.datetime.now().strftime("%Y-%m-%d %H:%M:%S")
        }), 200

    except Exception as e:
        log.error(f"Error generating summary using LCSummarizerAI: {str(e)}")
        return error_response(
            error_message=f"Error generating summary: {str(e)}",
            status_code=500
        )


# ENDPOINT: /api/v1/summarize/wpapi
# API ENDPOINT to summarize text with custom provider and model using LCSAI
@summary_bp.route("/summarize/wpapi", methods=["POST"])
@limiter.exempt()
def summarize_request_json() -> Tuple[Response, int]:
    log.info("SERVE: /api/v1/summarize/wpapi POST (summarize request route)")

    try:
        data = request.get_json()
        api_key = data.get("api_key")
        provider_name = data.get("provider")
        model = data.get("model")
        content = data.get("content")

        try:
            provider = Providers(provider_name.lower())
        except ValueError:
            return error_response(
                error_message=f"Invalid provider: {provider_name}",
                status_code=400
            )

        provider_config = PROVIDER_CONFIG.get(provider.value)
        if not provider_config:
            return error_response(
                error_message=f"Provider configuration not found: {provider_name}",
                status_code=400
            )

        custom_config = ProviderConfig(provider.value, model, api_key, provider_config.default_model)
        custom_config.api_key = api_key

        lcsai = LCSummarizerAI(provider, model)
        sanitized_text = sanitize_content(content)
        summary = lcsai.summarize(content=sanitized_text)

        return success_response(
            response={
                "summary": summary,
                "provider": provider.value,
                "model": model,
                "timestamp": datetime.datetime.now().strftime("%Y-%m-%d %H:%M:%S")
            },
            status_code=200
        )

    except Exception as e:
        log.error(f"Error in WPAPI summary route: {str(e)}")
        return error_response(
            error_message=f"Error generating summary: {str(e)}",
            status_code=500
        )


#region Routes for Summarizing Documents w/OCR (Unused)
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
#endregion
