# CognitiveSec API

The CognitiveSec API is a NestJS service that provides authentication, tenant-aware workspace APIs, document ingestion, semantic retrieval, Copilot inference, search, and audit activity. Prisma manages the PostgreSQL data model, while Redis and BullMQ handle document processing outside the request cycle.

## Capabilities

- JWT access authentication with HTTP-only refresh-token cookies.
- Organization memberships with `ADMIN`, `EDITOR`, and `VIEWER` roles.
- Tenant-aware guards for protected organization and document data.
- Document upload and validation for PDF, DOCX, TXT, and CSV files up to 20 MB.
- Asynchronous extraction, chunking, embedding, and indexing with status tracking and reindex support.
- Cloudflare R2 source-file storage.
- PostgreSQL vector retrieval with `pgvector`.
- OpenRouter-powered embeddings and grounded chat completion with document citations.
- Search across chat titles, messages, document names, and indexed chunk content.
- Organization activity events for important administrative and document operations.

## API Surface

All protected routes require a valid authenticated session. Organization and membership access is enforced server-side.

| Area           | Routes                                                                                                                                                                                   |
| -------------- | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Authentication | `POST /auth/login`, `POST /auth/sign-up`, `POST /auth/refresh`, `POST /auth/logout`, `POST /auth/switch-workspace`, `GET /auth/me`                                                       |
| Documents      | `GET /documents`, `POST /documents/upload`, `GET /documents/:id`, `DELETE /documents/:id`, `POST /documents/:id/reindex`, `GET /documents/:id/chunks`, `GET /documents/:id/status`       |
| Chat           | `GET/POST /organizations/:orgId/chats`, `GET/DELETE /organizations/:orgId/chats/:id`, `PATCH /organizations/:orgId/chats/:id/title`, `GET/POST /organizations/:orgId/chats/:id/messages` |
| Search         | `GET /search?q=...`                                                                                                                                                                      |
| Organization   | `GET/PATCH /organizations/me`, `GET /organizations/me/organizations`, `GET /organizations/me/members`, `GET /organizations/me/activity`, `DELETE /organizations/me/members/:id`          |
| Users          | `GET/PATCH /users/me`, `PATCH /users/:id/role`                                                                                                                                           |

## Architecture

```text
HTTP request -> NestJS controllers -> domain services -> Prisma/PostgreSQL
                                      |
                                      +-> Redis/BullMQ -> document worker
                                      +-> Cloudflare R2
                                      +-> OpenRouter
```

When a document is uploaded or reindexed, the API stores or reuses the source file and queues a parsing job. The worker extracts text, creates meaningful chunks, generates vector embeddings, and updates the document status to `READY` or `FAILED`. Chat inference uses vector similarity to select context before generating a cited answer.

## Prerequisites

- Node.js 20 or newer
- PostgreSQL with the `vector`/`pgvector` extension enabled
- Redis
- A Cloudflare R2 bucket named `cognitive-sec`, or an equivalent configured bucket
- An OpenRouter account and API key

## Configuration

Create `apps/api/.env`:

```env
DIRECT_URL=postgresql://user:password@localhost:5432/cognitivesec
JWT_SECRET=replace-with-a-long-random-secret
OPENROUTER_API_KEY=your-openrouter-key
R2_ACCOUNT_ID=your-cloudflare-account-id
R2_ACCESS_KEY_ID=your-r2-access-key
R2_SECRET_ACCESS_KEY=your-r2-secret-key

PORT=4000
REDIS_HOST=localhost
REDIS_PORT=6379
REDIS_PASSWORD=
APP_SITE_URL=http://localhost:3000
```

Keep this file out of source control. `PORT`, Redis settings, and `APP_SITE_URL` have local defaults, but production deployments should set them explicitly.

## Getting Started

From this directory:

```bash
npm install
npx prisma migrate deploy
npm run start:dev
```

The API listens on [http://localhost:4000](http://localhost:4000) by default. Start Redis and PostgreSQL before launching the service. For local schema development, use `npx prisma migrate dev`.

## Scripts

```bash
npm run start:dev  # Start NestJS in watch mode
npm run build      # Compile the API
npm run start:prod # Run the compiled API
npm run lint       # Lint and fix TypeScript files
npm run test       # Run unit tests
npm run test:e2e   # Run end-to-end tests
npm run test:cov   # Generate test coverage
```

## Data Model

The Prisma schema includes users, organizations, memberships, activity events, documents, document chunks, chats, and messages. Document chunks store embeddings in PostgreSQL for semantic retrieval.

## Project Structure

```text
src/
  auth/                 Authentication and session management
  common/               Shared guards, decorators, and utilities
  modules/
    chat/               Chat APIs and retrieval-augmented inference
    document/           Upload, indexing, workers, and document APIs
    integrations/       Storage and external AI integrations
    organizations/      Organization and member administration
    queue/              Queue configuration
    search/             Cross-entity search
    users/              User profile and role operations
prisma/
  schema.prisma         PostgreSQL data model
  migrations/           Versioned database migrations
```

## Related Documentation

- [Repository overview](../../README.md)
- [Web application](../web/README.md)

<p align="center">
  <a href="http://nestjs.com/" target="blank"><img src="https://nestjs.com/img/logo-small.svg" width="120" alt="Nest Logo" /></a>
</p>

[circleci-image]: https://img.shields.io/circleci/build/github/nestjs/nest/master?token=abc123def456
[circleci-url]: https://circleci.com/gh/nestjs/nest

  <p align="center">A progressive <a href="http://nodejs.org" target="_blank">Node.js</a> framework for building efficient and scalable server-side applications.</p>
    <p align="center">
<a href="https://www.npmjs.com/~nestjscore" target="_blank"><img src="https://img.shields.io/npm/v/@nestjs/core.svg" alt="NPM Version" /></a>
<a href="https://www.npmjs.com/~nestjscore" target="_blank"><img src="https://img.shields.io/npm/l/@nestjs/core.svg" alt="Package License" /></a>
<a href="https://www.npmjs.com/~nestjscore" target="_blank"><img src="https://img.shields.io/npm/dm/@nestjs/common.svg" alt="NPM Downloads" /></a>
<a href="https://circleci.com/gh/nestjs/nest" target="_blank"><img src="https://img.shields.io/circleci/build/github/nestjs/nest/master" alt="CircleCI" /></a>
<a href="https://discord.gg/G7Qnnhy" target="_blank"><img src="https://img.shields.io/badge/discord-online-brightgreen.svg" alt="Discord"/></a>
<a href="https://opencollective.com/nest#backer" target="_blank"><img src="https://opencollective.com/nest/backers/badge.svg" alt="Backers on Open Collective" /></a>
<a href="https://opencollective.com/nest#sponsor" target="_blank"><img src="https://opencollective.com/nest/sponsors/badge.svg" alt="Sponsors on Open Collective" /></a>
  <a href="https://paypal.me/kamilmysliwiec" target="_blank"><img src="https://img.shields.io/badge/Donate-PayPal-ff3f59.svg" alt="Donate us"/></a>
    <a href="https://opencollective.com/nest#sponsor"  target="_blank"><img src="https://img.shields.io/badge/Support%20us-Open%20Collective-41B883.svg" alt="Support us"></a>
  <a href="https://twitter.com/nestframework" target="_blank"><img src="https://img.shields.io/twitter/follow/nestframework.svg?style=social&label=Follow" alt="Follow us on Twitter"></a>
</p>
  <!--[![Backers on Open Collective](https://opencollective.com/nest/backers/badge.svg)](https://opencollective.com/nest#backer)
  [![Sponsors on Open Collective](https://opencollective.com/nest/sponsors/badge.svg)](https://opencollective.com/nest#sponsor)-->

## Description

[Nest](https://github.com/nestjs/nest) framework TypeScript starter repository.

## Project setup

```bash
$ npm install
```

## Compile and run the project

```bash
# development
$ npm run start

# watch mode
$ npm run start:dev

# production mode
$ npm run start:prod
```

## Run tests

```bash
# unit tests
$ npm run test

# e2e tests
$ npm run test:e2e

# test coverage
$ npm run test:cov
```

## Deployment

When you're ready to deploy your NestJS application to production, there are some key steps you can take to ensure it runs as efficiently as possible. Check out the [deployment documentation](https://docs.nestjs.com/deployment) for more information.

If you are looking for a cloud-based platform to deploy your NestJS application, check out [Mau](https://mau.nestjs.com), our official platform for deploying NestJS applications on AWS. Mau makes deployment straightforward and fast, requiring just a few simple steps:

```bash
$ npm install -g @nestjs/mau
$ mau deploy
```

With Mau, you can deploy your application in just a few clicks, allowing you to focus on building features rather than managing infrastructure.

## Resources

Check out a few resources that may come in handy when working with NestJS:

- Visit the [NestJS Documentation](https://docs.nestjs.com) to learn more about the framework.
- For questions and support, please visit our [Discord channel](https://discord.gg/G7Qnnhy).
- To dive deeper and get more hands-on experience, check out our official video [courses](https://courses.nestjs.com/).
- Deploy your application to AWS with the help of [NestJS Mau](https://mau.nestjs.com) in just a few clicks.
- Visualize your application graph and interact with the NestJS application in real-time using [NestJS Devtools](https://devtools.nestjs.com).
- Need help with your project (part-time to full-time)? Check out our official [enterprise support](https://enterprise.nestjs.com).
- To stay in the loop and get updates, follow us on [X](https://x.com/nestframework) and [LinkedIn](https://linkedin.com/company/nestjs).
- Looking for a job, or have a job to offer? Check out our official [Jobs board](https://jobs.nestjs.com).

## Support

Nest is an MIT-licensed open source project. It can grow thanks to the sponsors and support by the amazing backers. If you'd like to join them, please [read more here](https://docs.nestjs.com/support).

## Stay in touch

- Author - [Kamil Myśliwiec](https://twitter.com/kammysliwiec)
- Website - [https://nestjs.com](https://nestjs.com/)
- Twitter - [@nestframework](https://twitter.com/nestframework)

## License

Nest is [MIT licensed](https://github.com/nestjs/nest/blob/master/LICENSE).
