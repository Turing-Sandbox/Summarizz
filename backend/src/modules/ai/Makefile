.PHONY: setup_poetry

ifeq ($(OS), Windows_NT)
    OS := Windows
    PYTHON = py
    VENV_BIN := $(shell cygpath -u $(shell pwd)/venv/Scripts)
    PATH := $(VENV_BIN):$(PATH)
    SHELL := cmd
    RM := rmdir /s /q
else
    OS := $(shell sh -c 'uname 2>/dev/null || echo Unknown')
    PYTHON := python3
    VENV_BIN := $(shell pwd)/venv/bin
    PATH := $(VENV_BIN):$(PATH)
    SHELL := bash
    RM := rm -rf
endif

REQUIREMENTS := requirements.txt
VENV_NAME := virenv

.PHONY: setup_poetry
setup_poetry:
	@echo "Setting up poetry environment..."

	@if ! command -v poetry &> /dev/null; then \
		echo "Installing Poetry..."; \
		curl -sSL https://install.python-poetry.org | $(PYTHON) -; \
	fi
	poetry install

	@while IFS= read -r package; do \
		poetry add "$$package"; \
	done < requirements.txt

	@echo "Poetry setup complete. Use 'poetry shell' to activate the environment."


.PHONY: clean
clean:
	@echo "Cleaning up module..."
	$(RM) -r venv
	$(RM) -r .pytest_cache
	$(RM) -r __pycache__
	$(RM) MANIFEST
	$(RM) logs
	$(RM) build dish out
