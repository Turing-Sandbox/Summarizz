# External Dependencies (Imports)
from flask import Flask, make_response, request, jsonify, Response
from flask_cors import CORS, cross_origin
from flask_limiter import Limiter, RequestLimit, RateLimitExceeded
from flask_limiter.util import get_remote_address, get_qualified_name


# Internal Dependencies (Imports)
import os
import sys
import json
import datetime
import logging

sys.path.append(os.path.abspath(os.path.join(os.path.dirname(__file__), "..")))

from config.rich_logging import logger as log

app = Flask(__name__)
app.logger.handlers = log.handlers
app.logger.setLevel(logging.INFO)
CORS(app)
app.config["CORS_HEADERS"] = "Content-Type"


def make_custom_response(**kwargs) -> Response:
    response = make_response("API Response")
    for key, value in kwargs.items():
        response.headers[key] = value

    return response


@app.route("/api/v1/", methods=["GET"])
def root() -> Response:
    return jsonify({
        "status": 200,
        "message": "BLUR API is working.",
        "abbr": "BLUR stands for Bottom Line Up Front.",
        "version": "1.0.0",
        "timestamp": datetime.datetime.now().strftime("%Y-%m-%d %H:%M:%S")
    })


@app.route("/summarize/<string:text>", methods=["POST"])
def summarize_request(text: str):
    pass


@app.route("/summarize", methods=["POST"])
def summarize_request_json():
    pass


if __name__ == "__main__":
    app.run(debug=True)
