# CardioFamily POC

**Synthetic Data · Demonstration Environment · Not for Clinical Use**

*CardioFamily is a working prototype name. All people, institutions, variants
and clinical records shown in this demonstration are fictional and synthetic.*

CardioFamily is a clinician-facing cardiogenetics family-care concept. This
proof of concept demonstrates, for hypertrophic cardiomyopathy (HCM) only,
how one genetic diagnosis can trigger structured, explainable follow-up for an
entire family:

- **Who needs attention now?** — a Command Centre that ranks open family
  actions by urgency.
- **Family Action** — transparent actions (WHO / WHAT / WHEN / WHY, rule ID,
  evidence) that a clinician follows through to a recorded workflow outcome.
- **Reclassification Impact** — when a laboratory reclassifies a variant,
  CardioFamily shows which relatives' care may need review, and why. Nothing
  changes until a clinician records a review.

Every person, variant, institution, date and event is **synthetic**. All
clinical-like outputs come from clearly labelled *demonstration rules*
(`DEMO-R-001` … `DEMO-R-006`) that are not clinically validated. The app never
diagnoses, never recommends treatment and never changes clinical records.
Clinician decisions only record CardioFamily workflow state.

## Running locally

Requires Node 24 (`engines.node` is `24.x`).

```bash
npm install
npm run dev          # http://localhost:5173
npm run check        # typecheck + lint + unit/integration tests + production build
```

Browser-level tests (Playwright + axe) need a one-time browser install:

```bash
npx playwright install chromium
npm run test:e2e     # builds, serves on :4173 and runs e2e + accessibility checks
npm run verify       # check + test:e2e
```

| Script | Purpose |
|---|---|
| `npm run dev` | Development server |
| `npm run check` | Typecheck, lint, Vitest suite, production build |
| `npm test` | Vitest unit / integration / component tests |
| `npm run test:e2e` | Playwright end-to-end, keyboard, viewport and axe checks |
| `npm run verify` | Everything above |
| `npm run build` / `npm run preview` | Production build / local preview |

## Demo state

- The clock is frozen at **1 Oct 2026** (`src/data/demo-config.ts`), so due /
  overdue states never drift.
- Seed data is immutable TypeScript (`src/data/synthetic/`).
- Clinician decisions (action workflow, reclassification reviews) live **in
  memory only**. Reloading the page or using **Reset demo** in the sidebar
  restores the seeded starting state.

## Main routes

| Route | Screen |
|---|---|
| `/` | Command Centre — "Who needs attention now?" |
| `/families` | Families overview |
| `/families/:familyId` | Family Workspace — pedigree, who needs attention, relatives |
| `/families/:familyId/people/:personId` | Relative Profile — RISK / NEXT ACTION / GENETIC INTERPRETATION |
| `/actions` | Actions worklist (filter by workflow state) |
| `/actions/:actionId` | Action detail and workflow recording |
| `/reclassifications` | Received laboratory reclassifications |
| `/reclassifications/:eventId` | Reclassification Impact and clinician review |
| `/portal` | Relative Portal preview (UI simulation, one synthetic relative) |

## Canonical demo stories

See [`docs/DEMO-GUIDE.md`](docs/DEMO-GUIDE.md) for a presenter walkthrough.

- **A. Family Action (Janssens):** Command Centre → Janssens family → Pieter →
  overdue surveillance action → record *In progress* then *Completed* →
  profile history and Command Centre update.
- **B. Reclassification Impact (Peeters):** MYH7 variant VUS → Likely
  pathogenic → five relatives potentially affected, each with reasons →
  clinician records *Reviewed* → family workflow re-evaluated, nothing changed
  automatically.

## Deploying to Vercel

The app is a static single-page application. No backend, database, secrets or
environment variables are needed, and no analytics or telemetry are included.

1. Push the repository to GitHub and import it in Vercel (**Add New → Project**);
   every push to the production branch then deploys automatically, and pull
   requests get preview deployments.
2. Project settings (Vercel auto-detects these for Vite):

   | Setting | Value |
   |---|---|
   | Framework preset | Vite |
   | Install command | `npm install` (default) |
   | Build command | `npm run build` (runs `tsc -b && vite build`) |
   | Output directory | `dist` |
   | Node.js version | 24.x (from `engines.node`) |
   | Environment variables | none |

3. SPA routing: [`vercel.json`](vercel.json) rewrites every path to
   `/index.html`, so deep links such as `/families/fam-janssens` or
   `/reclassifications/rc-peeters-1` work when opened or refreshed directly.
   Vercel serves existing static files (JS, CSS, fonts) before applying the
   rewrite.

   ```json
   { "rewrites": [{ "source": "/(.*)", "destination": "/index.html" }] }
   ```

Demo decisions are held in browser memory only, so each visitor starts from the
seeded state and nothing is stored server-side. Below 1024px a small notice
recommends a desktop screen; the app is not blocked.

## Architecture

React 19 + TypeScript (strict) + Vite, Tailwind CSS v4, shadcn/ui primitives,
React Router. No backend.

```
src/
  domain/      pure TypeScript: family, genetics, phenotype, surveillance,
               demonstration rules + engine, reclassification impact,
               clinician review and action-workflow models
  data/        synthetic seed families and the frozen demo date
  state/       read models joining seed data, domain outputs and the
               in-memory demo session
  features/    screens (command centre, families, relatives, actions,
               reclassification, portal)
  components/  presentational clinical components, pedigree renderer, UI primitives
e2e/           Playwright scenarios and axe checks
```

Domain code cannot import React, data or UI layers (enforced by lint rules and
an architecture test). Screens consume domain outputs; they do not decide
clinical actions.

## Current boundaries

Intentionally **not** included: backend or database, persistence,
authentication, external APIs, FHIR/EHR integration, real variant
classification, AI/ML, CardioFamily Twin, consent flows, messaging or booking
in the portal, and any real patient data or medical guidance. The pedigree
layout supports the synthetic family structures only. Desktop-first (designed
for 1440×900, checked at 1280×800).
