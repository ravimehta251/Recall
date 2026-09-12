# Recall

Recall is a private document knowledge workspace. Upload PDF, DOCX, or TXT files, wait for ingestion, and chat with an assistant that answers from retrieved document chunks with source citations.

## Stack

- Java 21, Spring Boot 3, Spring AI, Spring Security, and JPA
- PostgreSQL 16 with PgVector
- React 19, TypeScript, Vite, Tailwind CSS, and Zustand
- Azure OpenAI in Microsoft Foundry by default, with Ollama support for local models
- JWT authentication and fetch-based SSE streaming

## Prerequisites

- Java 21 and Maven 3.9+
- Node.js 20+
- Docker with Docker Compose
- An Azure OpenAI resource with chat and embedding deployments, or Ollama and the required local models

## Local Development

Start PgVector from the repository root:

```powershell
docker compose up -d postgres
```

Create `backend/.env` from `backend/.env.example`, then set the Azure resource endpoint, API key, and both deployment names. Spring Boot loads this file for direct Maven runs from either the repository root or the `backend` directory.

```powershell
Copy-Item backend/.env.example backend/.env
mvn -f backend/pom.xml spring-boot:run
```

Use the Azure OpenAI resource endpoint, such as `https://your-resource.openai.azure.com`, rather than a model-specific request URL. `AZURE_OPENAI_CHAT_DEPLOYMENT` and `AZURE_OPENAI_EMBEDDING_DEPLOYMENT` are Azure deployment names and may differ from their underlying model names. The Spring AI 1.0.1 Azure client manages the service API version.

In a second terminal, install and run the frontend:

```powershell
npm install --prefix frontend
npm run dev --prefix frontend
```

Open:

- Frontend: http://localhost:5173
- Backend: http://localhost:8080
- Swagger UI: http://localhost:8080/swagger-ui.html

The `dev` Spring profile creates and updates the local database schema. Uploaded files are parsed in memory and only extracted chunks and metadata are persisted.

## Docker Compose

Create `.env` from `.env.example`, set a strong `JWT_SECRET`, and provide the Azure endpoint, API key, and deployment names. Then run:

```powershell
docker compose up --build
```

Open the containerized application at http://localhost:3000. Nginx serves the SPA and proxies `/api` requests to the backend. The backend remains available at http://localhost:8080.

## Ollama

For local AI, use Ollama's `llama3.2` chat model and `nomic-embed-text` embedding model. These embeddings have 768 dimensions, so use a fresh database volume when changing from the 1536-dimension Azure OpenAI default.

Set these values in `.env`:

```dotenv
AI_PROVIDER=ollama
EMBEDDING_DIMENSIONS=768
```

Start Ollama, pull both models, and launch the stack:

```powershell
docker compose --profile ollama up -d ollama
docker compose exec ollama ollama pull llama3.2
docker compose exec ollama ollama pull nomic-embed-text
docker compose --profile ollama up --build
```

If an existing PgVector volume was initialized with another embedding size, remove it before ingesting documents with the new provider:

```powershell
docker compose down -v
```

This command deletes local Recall database and Ollama volume data.

## Validation

Run backend tests, frontend tests, the production frontend build, and Compose validation:

```powershell
mvn -f backend/pom.xml clean test
npm test --prefix frontend
npm run build --prefix frontend
docker compose config --quiet
```

## API

All application endpoints use `/api/v1`. The main groups are authentication, knowledge spaces, documents, chat sessions, and messages. Chat responses stream from `POST /api/v1/sessions/{sessionId}/messages` as `token`, `citations`, and `done` SSE events over an authenticated fetch request.

See [API_SPEC.md](API_SPEC.md), [ARCHITECTURE.md](ARCHITECTURE.md), and [FRONTEND.md](FRONTEND.md) for the contracts and implementation structure.
