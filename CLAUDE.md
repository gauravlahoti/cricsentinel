# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Stack

React 19 + TypeScript 5.8 + Vite 6 + Express 4 + Tailwind CSS v4 + Google Gemini (`@google/genai`). Single full-stack app — no monorepo.

## Commands

```bash
npm run dev     # Dev server (tsx server.ts — Vite middleware mode, HMR on)
npm run build   # TWO steps: vite build (SPA) + esbuild (server → dist/server.cjs)
npm run start   # Run bundled server (requires prior build)
npm run lint    # TypeScript type check only — no ESLint/Prettier configured
```

Deploy to Cloud Run: `npm run build && npm start` with `NODE_ENV=production`.

## Environment Variables

```
GEMINI_API_KEY     # Required — but missing key triggers graceful procedural fallback, not a crash
NODE_ENV           # production → serves dist/ statically; unset → Vite middleware
DISABLE_HMR        # true → disables HMR + file watching (AI Studio pattern)
```

## Key Gotchas

- **Lint is type-check only** — no formatter enforced; style is implicit.
- **Gemini model** is hardcoded to `gemini-3.5-flash` in `server.ts:86` — change there to switch models.
- **Tailwind v4** uses `@theme` directive (not `tailwind.config.js`) — custom tokens are in `src/index.css`.
- **Path alias** `@/*` maps to repo root (not `src/`).
- **Theme** persisted in `localStorage` key `cricsentinel_theme`; defaults to dark if unavailable.
- **No test suite** — verify changes manually with `npm run dev`.
- **AI endpoint**: `POST /api/agent-respond` — sole backend route; handles Gemini + fallback logic.

## This is a hackathon project — prioritize shipping speed over perfect abstractions.
