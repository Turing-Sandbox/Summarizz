<div align="center">
  <img src="docs/assets/turing-sandbox-logo-rbg.png" alt="Turing Sandbox Logo" width="150" height="150"/>
</div>

# Turing Sandbox Web - Official Application

[![Docker](https://img.shields.io/badge/-Docker-black?style=flat&logo=docker&logoColor)]()
[![Python](https://img.shields.io/badge/-Python-black?style=flat&logo=python&logoColor)]()
[![Flask](https://img.shields.io/badge/-Flask-black?style=flat&logo=flask&logoColor)]()
[![NextJs](https://img.shields.io/badge/-NextJs-black?style=flat&logo=next.js&logoColore)]()
[![NodeJs](https://img.shields.io/badge/-NodeJs-black?style=flat&logo=node.js&logoColor)]()
[![TypeScript](https://img.shields.io/badge/-TypeScript-black?style=flat&logo=typescript&logoColor)]()
[![Firebase](https://img.shields.io/badge/-Firebase-black?style=flat&logo=firebase&logoColor=orange)]()
[![Vercel](https://img.shields.io/badge/-Vercel-black?style=flat&logo=vercel&logoColor=white)]()
[![Digital Ocean](https://img.shields.io/badge/-Digital%20Ocean-black?style=flat&logo=digitalocean&logoColor)]()

> [!WARNING]
> This project is still currently under development and is not yet ready for production use. Given this we would recommend not to use this project in production environments unless its for testing purposes only.


## Table of Contents

- [Turing Sandbox Web - Official Application](#turing-sandbox-web---official-application)
  - [Table of Contents](#table-of-contents)
  - [Introduction](#introduction)
  - [Getting Started](#getting-started)
    - [Installation](#installation)
    - [Docker Configuration for Frontend and Backend](#docker-configuration-for-frontend-and-backend)
    - [Configuration](#configuration)
  - [Branching Strategy and Workflow](#branching-strategy-and-workflow)
  - [Contributing](#contributing)
  - [License](#license)

## Introduction

This project is a cutting-edge web application designed to empower users to create and share concise summaries of articles, videos, and other content types. Built with Next.js, Firebase, Flask, and AI-powered tools developed in Python, the application offers a seamless and user-friendly platform. Its primary goal is to streamline the summarization process, making it efficient and accessible for various content formats, fostering better understanding and collaboration among users.

## Getting Started

In order to get started with this project, you will need to have the following software installed (locally) on your machine:
1. [NodeJs](https://nodejs.org/en/) - Latest LTS Version
2. [Python](https://www.python.org/) - 3.x or Above (Recommended Version: 3.12)
3. [Docker](https://www.docker.com/) - Not Required (Optional)

### Installation

Getting started with this project is simple, however there may be a need to have multiple terminals open to run both backend APIs (AI backend and the core backend) alongside the frontend.

> [!NOTE]
> We will implement a `Makefile` or a series of `ps1` and `bat` files to make this process easier rather than having to manually enable each service for our backend APIs.

To get started with the project, follow the steps below:
1. Clone the repository to your local machine using the following command:
```bash
git clone https://github.com/Turing-Sandbox/Turing-Sandbox-Web.git
```

2. After cloning the repository, create 2 new terminals (side by side) navigating the to the `backend` and `frontend` directories respectively.
   
3. In the `backend` directory, run the following command to install the required dependencies:
```bash
npm install
```

4. In the `frontend` directory, run the following command to install the required dependencies:
```bash
npm install
```

5. In the `backend` directory, run the following command to start the backend server:
```bash
npm run dev
```

6. In the `frontend` directory, run the following command to start the frontend server:
```bash
npm run dev
```

7. You will now be able to access the frontend application at `http://localhost:3001` and the backend application at `http://localhost:3000`.

### Docker Configuration for Frontend and Backend

> [!NOTE]
> This is not a required step but we recommend it for those who are familiar with Docker and running multiple contains on the same machine, you will have 2 containers running on your machine (1 for the ai backend and 1 for the core backend) and you can access them at `http://localhost:3001` and `http://localhost:3000` or access the other ports (`5001` and `5000`) that are exposed by the containers.

> [!WARNING]
> This is still being worked on and might not work as expected, we will updated this section once we know the `Dockerfile`s for the AI backend and the core backend are working as expected and can be deployed both locally and on an EC2 instance alongside AWS Fargate for scaling purposes.

1. Building the Docker Images for Core Backend and AI Backend:
```bash
docker build -t ts-core-backend .
docker build -t ts-ai-backend .
```
1. Running the Docker Images for Core Backend and AI Backend:
```bash
docker run -d -p 3000:3000 -p 5000:5000 ts-core-backend
docker run -d -p 3001:3001 -p 5001:5001 ts-ai-backend
```

This should create 2 containers on your machine, one for the core backend and one for the AI backend, you can access them at `http://localhost:3000` and `http://localhost:3001` respectively or access the other ports that are exposed by the containers.

### Configuration

Most of the configuration for the project will be done through environment variables and a little bit of configuration in the `backend/shared/config.ts` file. The following environment variables **MUST** be set in order to the application to function properly:

Core Backend `.env.sample` file:
```bash
# Server Configuration Variables
NODE_ENV=...
PORT=...

# Firebase Configuration Variables
FIREBASE_API_KEY=...
FIREBASE_AUTH_DOMAIN=...
FIREBASE_PROJECT_ID=...
FIREBASE_STORAGE_BUCKET=...
FIREBASE_MESSAGING_SENDER_ID=...
FIREBASE_APP_ID=...
FIREBASE_MEASUREMENT_ID=...
```
AI Backend `.env.sample` file:
```bash
# AI Configuration Variables
OPENAI_API_KEY=...
LANGCHAIN_TRACING_V3=...
LANGCHAIN_API_KEY=...
OPENROUTER_API_KEY=...

# Flask .env Variables:
FLASK_APP=app.py
FLASK_ENV=development
FLASK_RUN_PORT=5000
FLASK_RUN_HOST=0.0.0.0
```

All of these variables can be set in the `.env` file in the root directory of the project, **NOTE** you will need to create this file yourself and set the values for each variable.

## Branching Strategy and Workflow

For our branching strategy, each branch should be named after a feature, bug fix, or improvement with its corresponding jira ticket identifier. For example, if you are working on a bug fix for issue 80, your branch name should be appropriately named `FIX/TS-80` where the `TS` prefix is our jira ticket identifier and also stands for "Turing Sandbox". Other examples include but are not limited to the following:
- `Feature/TS-80` - For branches that are related to a feature or improvement.
- `Bug/TS-80` - For branches that are related to a bug fix.
- `Refactor/TS-80` - For branches that are related to a refactoring or code cleanup.
- `Documentation/TS-80` - For branches that are related to documentation or documentation improvements.
- `Chore/TS-80` - For branches that are related to chores or maintenance tasks.
- The list goes on and on...

This branching strategy is crucial for our project's smooth development and is **ENCOURAGED** to be followed by all contributors, whether they are new to the project or part of our core team from the beginning of the project. This will ensure that the project remains organized and efficient, and that all contributions are properly integrated and tested, leading towards a better developer experience (hopefully).

## Contributing

We welcome all types of contributions to this project, if you would like to know more about contribution guidelines and how to contribute, please refer to our [CONTRIBUTING.md](docs/CONTRIBUTING.md) file.

<a href="https://github.com/Turing-Sandbox/Turing-Sandbox-Web/graphs/contributors">
  <img src="https://contrib.rocks/image?repo=Turing-Sandbox/Turing-Sandbox-Web" />
</a>

## License

This project is licensed under the GNU General Public License v3.0. See the [LICENSE](LICENSE) file for details.
