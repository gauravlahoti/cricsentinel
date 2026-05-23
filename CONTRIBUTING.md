# Contributing to CricSentinel

## Setup

```bash
git clone <repo>
cd cricsentinel
npm install
cp .env.example .env.local
# Add your GEMINI_API_KEY to .env.local
npm run dev
```

## Development workflow

- `npm run dev` — start dev server with HMR at http://localhost:3000
- `npm run lint` — TypeScript type check (must pass before PR)
- `npm run build` — production build (Vite SPA + esbuild server bundle)

## Conventions

- All UI is in `src/components/` — one component per file
- Domain types live in `src/types.ts` — add new types there
- The Express backend is a single file: `server.ts`
- No formatter configured — follow the existing code style

## Submitting a PR

1. Fork the repo and create a branch: `git checkout -b feat/your-feature`
2. Make your changes and run `npm run lint`
3. Open a PR using the PR template
