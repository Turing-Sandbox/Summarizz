#!/usr/bin/env bash

if ! command -v poetry &> /dev/null; then
    echo "Poetry installation not found. Installing Poetry..."
    curl -sSL https://install.python-poetry.org | python3 -
fi

if ! command -v poetry &> /dev/null; then
     echo "Poetry installation failed, recommended to install Poetry manually."
     exit 1
fi

if [ -f "requirements.txt" ]; then
    echo "Installing dependencies and setting up virtual environment..."
    poetry add $(cat requirements.txt)

    if [ $? -ne 0 ]; then
        echo "Failed to install dependencies, check requirements.txt file for dependencies."
        exit 1
    fi
else
    echo "requirements.txt file was not found, please consider creating one."
    exit 1
fi


poetry shell
poetry lock