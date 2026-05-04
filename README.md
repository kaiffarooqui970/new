<div align="center">

# 🌌 Oryon

### *A futuristic AI workspace for writing & code — designed to feel like the future.*

[![Live Demo](https://img.shields.io/badge/Live_Demo-Open_App-22d3ee?style=for-the-badge&logo=vercel&logoColor=white)](https://a18b8e61-8966-4886-ad12-ffb0b84e83c3-00-fnhjkfjgdj1y.kirk.replit.dev)
[![Built on Replit](https://img.shields.io/badge/Built_on-Replit-F26207?style=for-the-badge&logo=replit&logoColor=white)](https://replit.com)
[![License](https://img.shields.io/badge/License-MIT-9333ea?style=for-the-badge)](#license)

![TypeScript](https://img.shields.io/badge/TypeScript-5.9-3178C6?logo=typescript&logoColor=white)
![React](https://img.shields.io/badge/React-19-61DAFB?logo=react&logoColor=black)
![Vite](https://img.shields.io/badge/Vite-7-646CFF?logo=vite&logoColor=white)
![Express](https://img.shields.io/badge/Express-5-000?logo=express&logoColor=white)
![OpenAI](https://img.shields.io/badge/OpenAI-GPT--5-412991?logo=openai&logoColor=white)
![PostgreSQL](https://img.shields.io/badge/PostgreSQL-Drizzle-4169E1?logo=postgresql&logoColor=white)
![Tailwind CSS](https://img.shields.io/badge/Tailwind-CSS-06B6D4?logo=tailwindcss&logoColor=white)

</div>

---

## ✨ Overview

**Oryon** is a premium, full-stack AI assistant that helps you refine your thinking and write better code. Two specialized AI personas (**Writing** and **Coding**), wrapped in a glassmorphism UI inspired by Apple Vision Pro and neon-cyber aesthetics — animated gradients, drifting particle fields that respond to your cursor, streaming typing animations, and every detail polished to feel like a luxury workspace.

> **No API keys required.** OpenAI access is handled securely through the Replit AI Integrations proxy.

---

## 🎯 Key Features

### 🧠 Dual-Mode AI
- **Writing mode** — refines style, clarity, tone, and engagement using a dedicated editorial system prompt
- **Coding mode** — explains, generates, and improves code with inline comments and best practices
- Mode-aware rendering: Markdown for prose, syntax-highlighted blocks for code

### ⚡ Real-Time Streaming
- **Server-Sent Events** stream tokens directly from OpenAI as they arrive
- Animated **blinking neon cursor** during generation
- **Stop mid-generation** to cancel a response (Esc shortcut on the way)

### 📜 Session History
- Last 20 generations preserved per session
- One-click restore of any past prompt + mode
- Expandable response previews to peek without leaving your current draft
- Color-coded mode badges and relative timestamps

### 🎨 Cinematic UI
- **Glassmorphism panels** with backdrop blur, neon borders, and depth shadows
- **Animated radial gradient** background that breathes between deep purple and teal
- **90 luminous particles** with cursor-attracted drift physics, rendered on a Canvas 2D loop
- **Orbitron typography** for headers, **Inter** for body text
- Custom shimmer-glow Generate button with motion-aware hover states

### ♿ Accessibility & Comfort
- Full **`prefers-reduced-motion`** support — particles pause, gradients freeze, animations collapse to 0ms
- Mobile-responsive layout
- Dark-mode-first with all WCAG-compliant contrast

---

## 🏗️ Architecture

This project is a **pnpm monorepo** organized into deployable artifacts and shared libraries.

```text
oryon/
├── artifacts/
│   ├── ai-assistant/          # React + Vite frontend (the Oryon UI)
│   ├── api-server/            # Express 5 backend with streaming endpoints
│   └── mockup-sandbox/        # Component preview server for UI exploration
├── lib/
│   ├── api-spec/              # OpenAPI 3.1 contract (single source of truth)
│   ├── api-client-react/      # Auto-generated React Query hooks (Orval)
│   ├── api-zod/               # Auto-generated Zod schemas
│   ├── db/                    # PostgreSQL schema (Drizzle ORM)
│   ├── integrations/          # Shared integration helpers
│   ├── integrations-openai-ai-server/  # OpenAI proxy client (server)
│   └── integrations-openai-ai-react/   # OpenAI proxy client (React)
├── scripts/                   # Utility scripts (typechecked workspace pkg)
├── pnpm-workspace.yaml        # Workspace + dependency catalog
└── package.json               # Root task orchestration
```

### Request lifecycle

```
   ┌────────────┐    POST /api/generate/stream    ┌─────────────┐
   │  React UI  │ ──────────────────────────────► │   Express   │
   │ (streaming │                                 │   server    │
   │   reader)  │ ◄── SSE: { text } chunks ◄──── │             │
   └────────────┘                                 └──────┬──────┘
                                                         │
                                          stream: true   │
                                                         ▼
                                                ┌─────────────────┐
                                                │  OpenAI gpt-5   │
                                                │ (Replit AI proxy│
                                                └─────────────────┘
```

---

## 🛠️ Tech Stack

| Layer            | Technology                                              |
|------------------|---------------------------------------------------------|
| **Frontend**     | React 19 · Vite 7 · Tailwind CSS · shadcn/ui · React Query |
| **Backend**      | Node.js 24 · Express 5 · TypeScript 5.9 · Zod (`zod/v4`) |
| **AI**           | OpenAI GPT-5 (via Replit AI Integrations proxy)         |
| **Database**     | PostgreSQL · Drizzle ORM · `drizzle-zod`                |
| **Contracts**    | OpenAPI 3.1 → Orval codegen (React Query + Zod)         |
| **Rendering**    | `react-markdown` · `react-syntax-highlighter` (Prism)   |
| **Build**        | esbuild (server) · Vite (client) · pnpm workspaces      |
| **Animations**   | Custom Canvas 2D particle engine · CSS keyframes        |

---

## 🚀 Getting Started

### Prerequisites
- Node.js 24+
- pnpm 10+
- A PostgreSQL database (Replit provisions one automatically)

### Installation

```bash
# Clone the repo
git clone https://github.com/kaiffarooqui970/new.git oryon
cd oryon

# Install all workspace dependencies
pnpm install

# Push the database schema
pnpm --filter @workspace/db run push
```

### Running locally

The project uses **Replit workflows** to manage long-running processes. If running outside Replit, start each artifact in its own terminal:

```bash
# Terminal 1 — API server
pnpm --filter @workspace/api-server run dev

# Terminal 2 — Frontend
pnpm --filter @workspace/ai-assistant run dev
```

The frontend will proxy `/api/*` requests to the backend automatically.

### Common commands

| Command                                        | What it does                                       |
|------------------------------------------------|----------------------------------------------------|
| `pnpm run typecheck`                           | Full typecheck across every package                |
| `pnpm run build`                               | Typecheck + build all packages                     |
| `pnpm --filter @workspace/api-spec run codegen` | Regenerate API hooks & Zod schemas from OpenAPI   |
| `pnpm --filter @workspace/db run push`         | Push DB schema changes (dev only)                  |

---

## 🌐 API

| Method | Endpoint                  | Description                                              |
|--------|---------------------------|----------------------------------------------------------|
| GET    | `/api/healthz`            | Health check                                             |
| POST   | `/api/generate`           | Generate response (non-streaming) — `{ prompt, mode }`   |
| POST   | `/api/generate/stream`    | Stream response via SSE — `{ prompt, mode }`             |

All request/response shapes are defined in `lib/api-spec/openapi.yaml`. Type-safe React Query hooks and Zod validators are auto-generated from this spec.

---

## 🎨 Design System

| Token            | Value                                                    |
|------------------|----------------------------------------------------------|
| Background       | Animated radial gradient — deep purple → neon teal       |
| Primary accent   | `hsl(185, 90%, 65%)` — neon cyan                         |
| Secondary accent | `hsl(275, 70%, 70%)` — electric purple                   |
| Header font      | **Orbitron** (700 weight, 0.12em tracking)               |
| Body font        | **Inter**                                                |
| Glass surfaces   | `backdrop-filter: blur(24px)` + 8% white border          |
| Motion           | Honors `prefers-reduced-motion: reduce`                  |

---

## 🗺️ Roadmap

- [x] Glassmorphism UI redesign
- [x] Streaming responses with typing animation
- [x] Cursor-reactive particle background
- [x] Session prompt history
- [x] Reduced-motion accessibility
- [x] Stop mid-generation
- [ ] **Oryon AI Suite** — auth (Replit Auth / Clerk)
- [ ] **Stripe subscriptions** — Free / Pro $9.99 / Team $29.99
- [ ] **Quota tracking + Upgrade modal**
- [ ] **Account & billing page**
- [ ] Save & name favorite generations
- [ ] Side-by-side response comparison
- [ ] Search across history
- [ ] Live word/token counter
- [ ] Auto-scroll to streaming text

---

## 🤝 Contributing

Issues and pull requests are welcome. If you'd like to suggest a major change, please open an issue first to discuss what you'd like to change.

```bash
# Before opening a PR, please run:
pnpm run typecheck
pnpm run build
```

---

## 📜 License

[MIT](LICENSE) © 2026 [kaiffarooqui970](https://github.com/kaiffarooqui970)

---

<div align="center">

**Oryon** — *Refine your thoughts. Refine your code.*

[Live Demo](https://a18b8e61-8966-4886-ad12-ffb0b84e83c3-00-fnhjkfjgdj1y.kirk.replit.dev) · [Report Bug](https://github.com/kaiffarooqui970/new/issues) · [Request Feature](https://github.com/kaiffarooqui970/new/issues)

</div>
