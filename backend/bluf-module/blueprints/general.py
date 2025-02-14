import os
import sys
import datetime

sys.path.append(os.path.abspath(os.path.join(os.path.dirname(__file__), "..")))

from config.rich_logging import logger as log

from flask import jsonify, Response
from flask_smorest import Blueprint

general_bp = Blueprint("general", __name__, url_prefix="/api/v1", description="General BLUR API endpoints.")


@general_bp.route("/", methods=["GET"])
def root() -> tuple[Response, int]:
    log.info("SERVE: /api/v1/ GET (base route)")
    return jsonify({
        "status": 200,
        "message": "BLUR API is working.",
        "abbr": "BLUR stands for Bottom Line Up Front.",
        "version": "1.0.0",
        "timestamp": datetime.datetime.now().strftime("%Y-%m-%d %H:%M:%S")
    }), 200


@general_bp.route("/info", methods=["GET"])
def info() -> tuple[Response, int]:
    log.info("SERVE: /api/v1/info GET (info route)")
    return jsonify({
        "status": 200,
        "message": "BLUR API is working.",
        "abbr": "BLUR stands for Bottom Line Up Front.",
        "version": "1.0.0",
        "timestamp": datetime.datetime.now().strftime("%Y-%m-%d %H:%M:%S")
    }), 200
