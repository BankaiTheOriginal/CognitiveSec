# CognitiveSec

CognitiveSec is a multi-tenant knowledge workspace for asking questions about an organization's internal documents. It combines a focused web application with a NestJS API, asynchronous document processing, semantic search, and retrieval-augmented AI conversations.

## What It Provides

- **Copilot conversations**: Ask questions in natural language and receive answers grounded in indexed company documents.
- **Citations and source browsing**: Inspect the document sources and chunks used to support an answer.
- **Knowledge management**: Upload PDF, DOCX, TXT, and CSV files, monitor indexing status, inspect chunks, delete documents, and request reindexing.
- **Semantic retrieval**: Convert document chunks and user questions into vector representations and retrieve relevant context with PostgreSQL and `pgvector`.
- **Workspace isolation**: Organize users and documents by organization with membership-aware access controls.
- **Roles and administration**: Support `ADMIN`, `EDITOR`, and `VIEWER` roles, organization settings, member management, and role changes.
- **Search**: Search across conversations, document names, and indexed document content.
- **Audit activity**: Record important workspace events such as uploads, deletes, reindex requests, role changes, and organization updates.

## Repository Layout

```text
apps/
  api/   NestJS API, Prisma schema, workers, and integrations
  web/   Next.js web application
```

## Architecture

```text
Next.js web app
        |
        v
NestJS API  ---- PostgreSQL + pgvector
    |
    +-------- Redis + BullMQ -> document extraction and indexing
    |
    +-------- Cloudflare R2 -> source document storage
    |
    +-------- OpenRouter -> embeddings and chat completion
```

Document uploads are stored in Cloudflare R2 and queued through BullMQ. A worker extracts text, creates chunks, generates embeddings, and persists them in PostgreSQL. Copilot queries retrieve the most relevant chunks before requesting a grounded response from the language model.

## Requirements

- Node.js 20 or newer
- npm
- PostgreSQL with the `pgvector` extension
- Redis
- A Cloudflare R2 bucket
- An OpenRouter API key

## Quick Start

Install dependencies and configure the API first:

```bash
cd apps/api
npm install
```

Create `apps/api/.env` with the variables described in [apps/api/README.md](apps/api/README.md), then apply the Prisma migrations:

```bash
npx prisma migrate deploy
npm run start:dev
```

In a second terminal, configure and start the web app:

```bash
cd apps/web
npm install
```

Create `apps/web/.env.local`:

```env
NEXT_PUBLIC_API_URL=http://localhost:4000
```

Then start the frontend:

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000).

## Application Guides

- [Web application](apps/web/README.md): frontend features, routes, configuration, and development commands.
- [API application](apps/api/README.md): backend architecture, endpoints, workers, configuration, and tests.

## Development Commands

Run commands from the relevant application directory.

```bash
# Web
cd apps/web
npm run dev
npm run lint
npm run build

# API
cd apps/api
npm run start:dev
npm run lint
npm run test
npm run test:e2e
npm run build
```

## Security Notes

CognitiveSec is designed around tenant-aware API access, JWT authentication, HTTP-only refresh-token cookies, and role-based authorization. Keep API secrets out of source control, use strong values for `JWT_SECRET`, and configure production CORS and site URLs for the deployed domains.

## Status

This repository is under active development. Configuration, model providers, and deployment conventions may evolve as the platform grows.
