# CardioFamily POC Architecture

## Objective

Build the smallest clean architecture capable of demonstrating the
CardioFamily workflow.

## Initial Stack

Frontend:
- React
- TypeScript
- Tailwind CSS
- shadcn/ui

Data:
- local TypeScript synthetic fixtures

State:
- simple local application state

Backend:
- none initially

Database:
- none initially

Authentication:
- none initially

## Domain Separation

Domain models and rules must not live directly inside UI components.

Suggested structure:

src/
  components/
  features/
    dashboard/
    families/
    relatives/
    actions/
    reclassification/
  domain/
    family/
    genetics/
    surveillance/
    actions/
  data/
    synthetic/
  lib/

## Core Domain Objects

Family
Person
Relationship
Variant
GeneticTest
Phenotype
ScreeningEvent
SurveillancePlan
Action
Rule
ReclassificationEvent
ImpactAssessment

## Design Principle

The POC should make future replacement of:

synthetic data
→ persistence/API

and

demonstration rules
→ validated clinical rule service

possible without rewriting the UI.