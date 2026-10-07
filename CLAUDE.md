# CardioFamily POC — Claude Project Instructions

## Mission

CardioFamily is a clinician-facing cardiogenetics family-care platform.

The initial POC demonstrates how one genetic diagnosis in an index patient
can trigger structured follow-up for an entire family.

The POC is designed for:
- investor demonstrations
- cardiogenetics customer demonstrations
- early clinician validation

This is NOT a production clinical system and must never be represented as one.

## Initial Clinical Scope

Disease scope:

Hypertrophic Cardiomyopathy (HCM) ONLY.

Do not expand into:
- DCM
- arrhythmogenic cardiomyopathy
- channelopathies
- aortopathies
- familial hypercholesterolemia

unless explicitly instructed.

## Core Product Question

The primary clinician question is:

"Who in this family needs my attention now?"

## Core Product Loop

Genetic finding
→ family graph
→ identify potentially at-risk relatives
→ cascade testing
→ phenotype screening
→ surveillance tracking
→ family actions
→ new genetic or phenotypic evidence
→ family-wide impact
→ clinician review

## Core CardioFamily Concepts

The system should model:

- Family
- Person
- Proband
- Family relationship
- Genetic variant
- Variant classification
- Genetic test
- Phenotype
- Screening
- Surveillance
- Clinical action
- Reclassification event
- Family impact
- Clinician review

## Relative Summary

Every relevant relative should expose three concepts prominently:

1. RISK
2. NEXT ACTION
3. GENETIC INTERPRETATION

## Family Action Engine

The Family Action Engine should answer:

WHO requires attention?
WHAT should be considered?
WHEN is it due?
WHY has the action been raised?

Every generated action must be:

- transparent
- explainable
- versioned
- traceable to a demonstration rule
- subject to clinician review

## Reclassification Impact

A major differentiating POC capability is:

genetic interpretation changes
→ identify potentially affected relatives
→ identify potentially affected surveillance/testing pathways
→ create clinician-review actions

The application must NEVER automatically modify real medical care.

## Clinical Safety

This repository is a demonstration POC.

Use synthetic data only.

Never introduce:
- real patient information
- PHI
- identifiable medical data
- autonomous diagnosis
- autonomous treatment recommendations

All clinical-like recommendations must clearly state:

"Demonstration only — requires clinician review."

The application should contain a persistent indication that it is:

"Synthetic Data · Demonstration Environment · Not for Clinical Use"

## AI

AI is NOT the clinical decision maker.

Do not build:
- AI diagnosis
- black-box clinical recommendations
- AI-generated risk percentages
- autonomous treatment decisions
- proprietary clinical prediction models

Future AI may assist with document extraction and workflow support,
but it is outside the initial POC.

## CardioFamily Twin

Do NOT implement CardioFamily Twin.

It is a future research/prediction layer.

## Technology Principles

Use:

- TypeScript
- React
- modern component architecture
- Tailwind CSS
- shadcn/ui where appropriate
- strong TypeScript domain models
- reusable components
- accessible UI
- responsive desktop-first layout

Keep clinical/domain logic separate from presentation components.

Preferred conceptual structure:

src/
  components/
  features/
  domain/
  data/
  lib/

## Data

Initial data must be deterministic synthetic seed data.

Do not introduce a database unless explicitly requested.

The initial POC should work completely from local synthetic data.

## Architecture

Prefer simple architecture over premature infrastructure.

Do NOT introduce unless explicitly approved:

- Supabase
- PostgreSQL
- authentication
- FHIR
- EHR integration
- external genomic APIs
- microservices
- queues
- event buses
- Kubernetes
- ML infrastructure

## UI Philosophy

The UI should look like a serious modern clinical product.

It should NOT look like:
- a hackathon dashboard
- an AI chatbot
- a generic admin template
- a consumer wellness application

Prioritize:
- information hierarchy
- clinical clarity
- family relationships
- actionable status
- explainability
- minimal cognitive load

## Development Behaviour

Before implementing a substantial feature:

1. inspect existing architecture
2. explain proposed approach
3. identify affected files
4. avoid unnecessary dependencies
5. preserve domain/UI separation
6. implement
7. test
8. review for regressions

Do not expand scope without explicit instruction.

Do not silently invent clinical guidance.

When clinical logic has not been supplied, use clearly labelled synthetic
demonstration rules rather than pretending the rule is medically validated.