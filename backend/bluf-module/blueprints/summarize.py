import datetime
from typing import Optional, Dict, Any, Union, Tuple
from functools import wraps

from config.llm_config import Models, PROVIDER_CONFIG
from config.rich_logging import logger as log
from config.langchain_ai import LCSummarizerAI
from config.llm_config import Providers, ProviderConfig
from models.mai import Mai
from models.prompt import Prompt, Params
from lib.sanitizer import sanitize_text
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


def setup_mai() -> Mai:
    params = Params(model=Models.LLAMA_3B_PREVIEW)
    prompt = Prompt(params=params)
    return Mai(params, prompt)


def setup_lcsai(provider: str, model: Optional[str] = None) -> Optional[LCSummarizerAI]:
    valid_providers = ["groq", "together", "openai", "mistral"]

    try:
        if not provider:
            raise ValueError("Provider cannot be empty")

        provider_lower = provider.lower()
        if provider_lower not in valid_providers:
            raise ValueError(f"Provider not in valid providers: {valid_providers}")

        provider_enum = Providers(provider_lower)
        provider_config = PROVIDER_CONFIG.get(provider_enum.value)

        if not provider_config:
            raise ValueError(f"Provider configuration not found for: {provider}")

        return LCSummarizerAI(
            provider=provider_enum,
            model=model or provider_config.default_model
        )
    except Exception as e:
        log.error(f"Failed to setup LCSummarizerAI with provider {provider}: {str(e)}")
        return None


def validate_request_data(required_fields: list[str]):
    def decorator(func):
        @wraps(func)
        def wrapper(*args, **kwargs):
            try:
                data = request.get_json()

                if not data:
                    return error_response(
                        error_message="No data was provided in the request body.",
                        status_code=400
                    )

                missing_fields = [field for field in required_fields if field not in data or not data.get(field)]

                if missing_fields:
                    fields_str = ", ".join(missing_fields)
                    return error_response(
                        error_message=f"Missing required fields: {fields_str}",
                        status_code=400
                    )

                return func(*args, **kwargs)

            except Exception as e:
                log.error(f"Error validating request: {str(e)}")
                return error_response(
                    error_message=f"Error processing request: {str(e)}",
                    status_code=400
                )
        return wrapper
    return decorator


# ENDPOINT: /api/v1/summarize/mai
# API ENDPOINT to summarize text with MAI
@summary_bp.route("/mai/summarize", methods=["POST"])
@limiter.limit("20 per minute")
@validate_request_data(["input"])
def summarize_mai_request() -> Tuple[Response, int]:
    try:
        data = request.get_json()
        text = data.get("input", "")

        mai = setup_mai()
        sanitized_text = sanitize_text(text)
        summary = mai.summarize_request(input_text=sanitized_text)

        if not summary:
            return error_response(
                error_message="Failed to generate summary. Please try again.",
                status_code=500
            )

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
        log.error(f"Error processing MAI summary request: {str(e)}")
        return error_response(
            error_message=f"Error generating summary: {str(e)}",
            status_code=500
        )


# ENDPOINT: /api/v1/summarize/lcsai
# API ENDPOINT to summarize text with LCSAI
@summary_bp.route("/lcsai/summarize", methods=["POST"])
@limiter.limit("20 per minute")
@validate_request_data(["provider", "model", "text"])
def summarize_lcsai_request() -> Tuple[Response, int]:
    try:
        data = request.get_json()
        provider = data.get("provider")
        model = data.get("model")
        text = data.get("text")

        lcsai = setup_lcsai(provider, model)
        if not lcsai:
            return error_response(
                error_message=f"Failed to initialize summarizer with provider: {provider}",
                status_code=400
            )

        sanitized_text = sanitize_text(text)
        summary = lcsai.summarize(content=sanitized_text)

        return success_response(
            response={
                "summary": summary,
                "provider": lcsai.provider.value,
                "model": lcsai.model,
                "timestamp": datetime.datetime.now().strftime("%Y-%m-%d %H:%M:%S")
            },
            status_code=200
        )

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
@validate_request_data(["api_key", "provider", "model", "text"])
def summarize_request_json() -> Tuple[Response, int]:
    log.info("SERVE: /api/v1/summarize/wpapi POST (summarize request route)")

    try:
        data = request.get_json()
        api_key = data.get("api_key")
        provider_name = data.get("provider")
        model = data.get("model")
        text = data.get("text")

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

        custom_config = ProviderConfig(provider.value, model)
        custom_config.api_key = api_key

        lcsai = LCSummarizerAI(provider, model)
        sanitized_text = sanitize_text(text)
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


# region Routes for Summarizing Documents w/OCR (Unused)
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
