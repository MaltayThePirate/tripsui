# Project: Wander

## Mission
There is a popular web application today called Wanderlog. Wanderlog provides tools for planning and executing on a Trip typically in another city, country, or town. This tool feels hard to use and "heavy" providing information overload. There is room for a product that accomplishes the same task but with minimal overhead focusing on a less structured approach to travel. 

This project is building a new set of tools from scratch to deliver a more minimalist travel planning application. 

---

## Directory Layout
- **`docs/`**: Source of truth for markdown documentation, including:
  - Product Requirements Document (`docs/prd.md`)
  - Technical Design (`docs/technical_design.md`)
  - Release 1 User Stories grouped by product area (`docs/user-stories/`)
  - Implementation Plans (`docs/plans/`)
  - Outstanding work issue definitions (`docs/issues/`)
- **`tripsapi/`**: Backend API Ruby on Rails server for Trips.
- **`tripsui/`**: Frontend React Next.js web application for the product.
- **`DOMAIN.md`**: Business domain model description (also duplicated in `tripsapi/DOMAIN.md` and `tripsui/DOMAIN.md`).

---

## References & Source of Truth
The following markdown files should be considered the source of truth for the high-level direction of the project:
- The Product Requirements Document is under `./docs/prd.md`
- The Technical Design is documented in `./docs/technical_design.md`
- The Business Domain Model is documented in `./DOMAIN.md`

Before making any decisions in implementation that may affect the design or user experience, ALWAYS validate that it aligns with these files. If I ever ask you to do something that would violate this source of truth, immediately halt the task and raise the violation as a blocker and ask if the documents need to be updated. 

---

## Pull Request & Branching Guidelines
When working on any issue or feature:
1. **Feature Branches:** Always create and work on a separate feature branch (never work directly on `main`).
2. **Pull Requests:** Submit all completed work as a Pull Request targeting `main`.
3. **High-Level Landing Page Description:** Every PR must include a clear, comprehensive description that acts as an overview and landing page for reviewers, explaining the architectural and functional context of the changes.
4. **Targeted User Stories:** The PR description must explicitly list all User Stories being addressed by the PR using their release keys (e.g., `R1-A-01`, `R1-B-03`).

## Agent skills

### Issue tracker

Issues are tracked as local markdown files under `docs/issues/`. See `docs/agents/issue-tracker.md`.

### Triage labels

Canonical triage roles mapped to repo labels. See `docs/agents/triage-labels.md`.

### Domain docs

Single-context layout (`DOMAIN.md`/root docs). See `docs/agents/domain.md`.

