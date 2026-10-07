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
npm run verify       # check + check:streamlit + test:e2e
```

| Script | Purpose |
|---|---|
| `npm run dev` | Development server |
| `npm run check` | Typecheck, lint, Vitest suite, production build |
| `npm test` | Vitest unit / integration / component tests |
| `npm run test:e2e` | Playwright end-to-end, keyboard, viewport and axe checks |
| `npm run build:streamlit` | Regenerate the self-contained Streamlit bundle (`streamlit_dist/cardiofamily.html`) |
| `npm run check:streamlit` | Verify the committed Streamlit bundle is self-contained and up to date |
| `npm run test:streamlit` | Playwright checks against the Streamlit-hosted app (needs Python + Streamlit) |
| `npm run verify` | `check` + `check:streamlit` + `test:e2e` |
| `npm run build` / `npm run preview` | Production build / local preview |

## Demo state

- The clock is frozen at **1 Oct 2026** (`src/data/demo-config.ts`), so due /
  overdue states never drift.
- Seed data is immutable TypeScript (`src/data/synthetic/`).
- Clinician decisions (action workflow, reclassification reviews) live **in
  memory only**. Reloading the page or using **Reset demo** in the sidebar
  restores the seeded starting state.

## Main routes

In the Streamlit-hosted version these screens are reached by in-app navigation
(the embedded app has no URLs of its own).

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

## Deploying on Streamlit Community Cloud

The hosted demo is the same React application, wrapped by a minimal Streamlit
entrypoint. Community Cloud only runs Python: it never needs Node or npm.

```
GitHub repository
  → streamlit_app.py                    (Streamlit entrypoint, no UI of its own)
  → streamlit_dist/cardiofamily.html    (committed, self-contained React build:
                                          JS, CSS and fonts inlined)
```

`streamlit_app.py` embeds that file with `st.iframe(Path(...))` full-page and
hides Streamlit's own header, toolbar, sidebar and padding, so CardioFamily is
the only visible product. Inside the embedded build, navigation uses an
in-memory router (the iframe has no URL of its own); the Streamlit app has a
single public URL.

**Community Cloud settings** (Create app → deploy from GitHub):

| Setting | Value |
|---|---|
| Repository | this GitHub repository |
| Branch | `main` |
| Main file path | `streamlit_app.py` |
| Python version (Advanced settings) | 3.12 |
| Dependencies | `requirements.txt` (`streamlit==1.64.0` only) |
| Secrets | none |
| Environment variables | none |

`.streamlit/config.toml` disables Streamlit usage-statistics collection and
minimises Streamlit chrome. CardioFamily itself makes no network requests and
contains no analytics or telemetry.

### Regenerating the Streamlit bundle

`streamlit_dist/cardiofamily.html` is generated from the React source and must
be **regenerated and committed after any UI or code change**, before deploying:

```bash
npm run build:streamlit     # writes streamlit_dist/cardiofamily.html
npm run check:streamlit     # fails if the committed file is stale or not self-contained
git add streamlit_dist/cardiofamily.html
```

`npm run verify` includes `check:streamlit`, so a stale bundle fails
verification. Never edit the generated file by hand.

### Running the Streamlit-hosted version locally

```bash
python3 -m venv .venv && source .venv/bin/activate
pip install -r requirements.txt
streamlit run streamlit_app.py      # http://localhost:8501
npm run test:streamlit              # Playwright checks against the Streamlit-hosted app
```

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
e2e/           Playwright scenarios and axe checks (browser build)
e2e-streamlit/ Playwright checks of the Streamlit-hosted app
build-tools/   single-file Streamlit build plugin and artifact check
streamlit_app.py, requirements.txt, .streamlit/   Streamlit wrapper
streamlit_dist/cardiofamily.html                  generated, committed bundle
```

Domain code cannot import React, data or UI layers (enforced by lint rules and
an architecture test). Screens consume domain outputs; they do not decide
clinical actions.

## Current boundaries

Intentionally **not** included: a backend of our own (Streamlit only serves the
prebuilt page), database, persistence,
authentication, external APIs, FHIR/EHR integration, real variant
classification, AI/ML, CardioFamily Twin, consent flows, messaging or booking
in the portal, and any real patient data or medical guidance. The pedigree
layout supports the synthetic family structures only. Desktop-first (designed
for 1440×900, checked at 1280×800).
