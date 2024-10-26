from flask import Flask
import os

app = Flask(__name__)


@app.route("/")
def main() -> str:
    return 'Hello World!'


if __name__ == "__main__":
    app.run(debug=True, port=8000, host="0.0.0.0")
