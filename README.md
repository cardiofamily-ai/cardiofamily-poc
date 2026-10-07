# cardiofamily-poc

CardioFamily HCM demonstration POC.

**Synthetic Data · Demonstration Environment · Not for Clinical Use**

See `CLAUDE.md` and `docs/` for product scope, architecture and clinical-safety rules.

## Running locally

Requires Node 24+.

```bash
npm install
npm run dev        # http://localhost:5173
```

| Script | Purpose |
|---|---|
| `npm run dev` | Development server |
| `npm run check` | Typecheck, lint, tests and production build |
| `npm test` | Unit and component tests (Vitest) |
| `npm run build` / `npm run preview` | Production build and local preview |

The demonstration clock is frozen at **2026-10-01**, configured in
`src/data/demo-config.ts`.
