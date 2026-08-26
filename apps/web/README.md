# CognitiveSec Web

The CognitiveSec web application is a Next.js client for managing an organization's knowledge base and working with Copilot. It provides the workspace navigation, authentication flows, document operations, grounded conversations, source inspection, search, and organization administration interfaces.

## Features

- Sign in, sign up, refresh sessions, log out, and switch workspaces.
- Start and manage Copilot conversations with streamed-feeling chat interactions, message history, and citations.
- Browse cited source documents and inspect the chunks behind an answer.
- Upload supported files with drag and drop, validation, and upload progress.
- View document indexing status and chunk counts, open document details, delete documents, and request reindexing.
- Search across chats and indexed documents from the workspace search interface.
- Update organization details, review audit activity, manage members, and administer roles according to permissions.

## Routes

| Route           | Purpose                                      |
| --------------- | -------------------------------------------- |
| `/login`        | Sign in and account registration             |
| `/copilot`      | Start a new Copilot conversation             |
| `/copilot/[id]` | Continue a conversation and inspect sources  |
| `/knowledge`    | Manage documents and indexing                |
| `/settings`     | Organization settings, members, and activity |

## Technology

- Next.js 16 with the App Router
- React 19 and TypeScript
- TanStack Query for server state and document indexing refreshes
- Axios for API communication
- Zustand for authentication state
- React Hook Form and Zod for form validation
- Tailwind CSS and Lucide icons for the interface

## Prerequisites

- Node.js 20 or newer
- The CognitiveSec API running locally or at a reachable deployment

## Configuration

Create `apps/web/.env.local`:

```env
NEXT_PUBLIC_API_URL=http://localhost:4000
```

The URL should point to the API origin without a trailing route path. The API enables credentialed browser requests for the configured frontend site.

## Getting Started

From this directory:

```bash
npm install
npm run dev
```

Open [http://localhost:3000](http://localhost:3000).

## Scripts

```bash
npm run dev      # Start the development server
npm run build    # Create a production build
npm run start    # Serve the production build
npm run lint     # Run ESLint
```

## Project Structure

```text
app/
	(dashboard)/       Authenticated workspace routes
	modules/           Feature API clients, hooks, stores, and types
	common/            Shared API and validation helpers
components/
	parts/             Workspace-level UI such as navigation and source views
	ui/                Reusable UI primitives
```

## Related Documentation

- [Repository overview](../../README.md)
- [API application](../api/README.md)
  This is a [Next.js](https://nextjs.org) project bootstrapped with [`create-next-app`](https://nextjs.org/docs/app/api-reference/cli/create-next-app).

## Getting Started

First, run the development server:

```bash
npm run dev
# or
yarn dev
# or
pnpm dev
# or
bun dev
```

Open [http://localhost:3000](http://localhost:3000) with your browser to see the result.

You can start editing the page by modifying `app/page.tsx`. The page auto-updates as you edit the file.

This project uses [`next/font`](https://nextjs.org/docs/app/building-your-application/optimizing/fonts) to automatically optimize and load [Geist](https://vercel.com/font), a new font family for Vercel.

## Learn More

To learn more about Next.js, take a look at the following resources:

- [Next.js Documentation](https://nextjs.org/docs) - learn about Next.js features and API.
- [Learn Next.js](https://nextjs.org/learn) - an interactive Next.js tutorial.

You can check out [the Next.js GitHub repository](https://github.com/vercel/next.js) - your feedback and contributions are welcome!

## Deploy on Vercel

The easiest way to deploy your Next.js app is to use the [Vercel Platform](https://vercel.com/new?utm_medium=default-template&filter=next.js&utm_source=create-next-app&utm_campaign=create-next-app-readme) from the creators of Next.js.

Check out our [Next.js deployment documentation](https://nextjs.org/docs/app/building-your-application/deploying) for more details.
