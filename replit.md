# AI Writing & Coding Assistant

## Overview

A full-stack web app that uses OpenAI's latest model to help users with writing and coding tasks. Supports two modes with distinct AI personas: Writing mode (style, clarity, engagement) and Coding mode (code explanation, generation, and improvement).

## Stack

- **Monorepo tool**: pnpm workspaces
- **Node.js version**: 24
- **Package manager**: pnpm
- **TypeScript version**: 5.9
- **API framework**: Express 5
- **Frontend**: React + Vite + Tailwind CSS + shadcn/ui
- **AI**: OpenAI (via Replit AI Integrations proxy — no user API key needed)
- **Database**: PostgreSQL + Drizzle ORM (for conversations/messages schema)
- **Validation**: Zod (`zod/v4`), `drizzle-zod`
- **API codegen**: Orval (from OpenAPI spec)
- **Build**: esbuild (CJS bundle)
- **Markdown rendering**: react-markdown
- **Syntax highlighting**: react-syntax-highlighter (Prism)

## Key Commands

- `pnpm run typecheck` — full typecheck across all packages
- `pnpm run build` — typecheck + build all packages
- `pnpm --filter @workspace/api-spec run codegen` — regenerate API hooks and Zod schemas from OpenAPI spec
- `pnpm --filter @workspace/db run push` — push DB schema changes (dev only)
- `pnpm --filter @workspace/api-server run dev` — run API server locally
- `pnpm --filter @workspace/ai-assistant run dev` — run frontend locally

## Architecture

### Frontend (`artifacts/ai-assistant/`)
- Single-page React app at `/`
- Mode toggle: Writing vs Coding
- Large textarea for user input
- Markdown rendering for writing mode responses
- Syntax highlighting for coding mode responses
- Loading animation while AI generates
- Copy to clipboard on results

### Backend (`artifacts/api-server/`)
- Express API server at `/api`
- `POST /api/generate` — accepts `{ prompt, mode }`, returns `{ result, mode }`
  - Writing mode system prompt: improves style, clarity, and engagement
  - Coding mode system prompt: explains, writes, and improves code with comments
- Uses OpenAI `gpt-5.4` model via Replit AI Integrations

### AI Integration
- Uses `@workspace/integrations-openai-ai-server` for OpenAI access
- Environment variables auto-set: `AI_INTEGRATIONS_OPENAI_BASE_URL`, `AI_INTEGRATIONS_OPENAI_API_KEY`
- No user API key required

## API Endpoints

- `GET /api/healthz` — health check
- `POST /api/generate` — AI text/code generation

See the `pnpm-workspace` skill for workspace structure, TypeScript setup, and package details.
