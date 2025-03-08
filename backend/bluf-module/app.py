import datetime
import logging

from .config.rich_logging import logger as log
from .blueprints.general import general_bp
from .blueprints.summarize import summary_bp

from flask import Flask, make_response, request, Response
from flask_cors import CORS

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

app.register_blueprint(general_bp)
app.register_blueprint(summary_bp)

@app.before_request
def before_request():
    log.info(f"REQUEST: {request.method} {request.path}")

if __name__ == "__main__":
    time_in = datetime.datetime.now()
    app.run(debug=True)
    time_out = datetime.datetime.now() - time_in
    log.info(f"Application started in {time_out.total_seconds()} seconds.")
