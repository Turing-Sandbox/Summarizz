# Internal Dependencies (Imports)
import os
import sys
import datetime

sys.path.append(os.path.abspath(os.path.join(os.path.dirname(__file__), "..")))

from config.rich_logging import logger as log
from models.mai import Mai
from models.prompt import Models, Prompt, Params

# External Dependencies (Imports)
from flask import request, jsonify, Response
from flask_smorest import Blueprint
from werkzeug.utils import secure_filename

"""
File: summarize.py
Module: bluf-module
Author: Muhammad Bilal Khan
Description:
    - This file contains a blueprint for summarize API endpoints.
    - The blueprint is defined using flask_smorest, and is documented using OpenAPI.
    - The blueprint is responsible for handling any requests related to AI summarization.
    - The blueprint is designed to be flexible and can be used for different types of summarization.
    
License: MIT License
Copyright (c) 2024 Turing Sandbox

Modified History:
    - 2024-11-05: Creation of the file.
"""

summary_bp = Blueprint("summary", __name__, url_prefix="/api/v1", description="Summarize BLUR API endpoints.")


def setup_mai() -> Mai:
    params = Params(
        model=Models.LLAMA_3B_PREVIEW,
    )
    prompt = Prompt(params=params)
    return Mai(params, prompt)


# NOTE: This function should be changes to a more secure way of handling file uploads.
# NOTE: More specifically, we should have a way to validate the file type and size before saving it
#       and to store the file in a secure location rather than storing in a module dir.
def process_file_request(allows_extensions: set) -> tuple[Response, int]:
    if "file" not in request.files:
        return jsonify({
            "status": 400,
            "message": "No file was provided in the request."
        }), 400

    file = request.files["file"]
    if file.filename == "":
        return jsonify({
            "status": 400,
            "message": "No file name was provided in the request."
        }), 400

    if not file.filename.lower().endswith(tuple(allows_extensions)):
        return jsonify({
            "status": 400,
            "message": f"File extension not supported. Supported extensions: {', '.join(allows_extensions)}"
        }), 400

    filename = secure_filename(file.filename)
    filepath = os.path.join("", filename)
    file.save(filepath)

    return jsonify({
        "status": 200,
        "message": f"File {filename} has been saved successfully.",
        "filename": filename,
        "filepath": filepath
    }), 200


@summary_bp.route("/summarize", methods=["POST"])
def summarize_request() -> tuple[Response, int]:
    try:
        text = request.args.get("input")

        log.info(f"Received request with text length: {len(text)}")
        log.debug(f"Request text: {text}")

        if not text:
            return jsonify({
                "error": "No text provided within the request body.",
                "timestamp": datetime.datetime.now().strftime("%Y-%m-%d %H:%M:%S")
            }), 400

        mai = setup_mai()
        summary = mai.summarize_request(input_text=text)

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


@summary_bp.route("/summarize/<string:text>", methods=["POST"])
def summarize_request_json(text: str) -> tuple[Response, int]:
    log.info("SERVE: /api/v1/summarize POST (summarize request route)")
    pass


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
