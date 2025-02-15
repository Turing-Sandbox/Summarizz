from typing import Dict, Any, Tuple, Optional
from flask import jsonify, Response
import datetime

from config.rich_logging import logger as log

def error_response(error_message: str, status_code: int = 400) -> Tuple[Response, int] | None:
   try:
       if not error_message:
            raise ValueError(f"Expected error_message but got: {error_message} instead.")

       if not status_code:
            raise ValueError(f"Expected status_code but got: {status_code} instead.")

       # NOTE: Add more here (if needed).
       return jsonify({
           "error": error_message,
           "timestamp": datetime.datetime.now().strftime("%Y-%m-%d %H:%M:%S"),
           "trace": ""
       }), status_code

   except ValueError as e:
       log.error(f"Error returning a error_response: {str(e)}")
       return None


def success_response(data: Optional[Dict[str, Any]] = None, **kwargs) -> Tuple[Response, int] | None:
    try:
        if not data:
            raise ValueError(f"Expected data but got: {data} instead.")

        return jsonify({
            "data": data,
            **kwargs
        }), 200

    except ValueError as e:
        log.error(f"Error returning a success_response: {str(e)}")
        return None
