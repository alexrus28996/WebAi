# OpenCrawl Engine Folder Structure

## Folder tree

```
.
├── docs/
│   ├── architecture/
│   │   ├── decisions/
│   │   └── diagrams/
│   ├── operating-guides/
│   └── product-requirements/
├── scripts/
├── config/
├── src/
│   ├── core/
│   │   ├── domain/
│   │   ├── policies/
│   │   └── value-objects/
│   ├── application/
│   │   ├── use-cases/
│   │   ├── ports/
│   │   └── workflows/
│   ├── infrastructure/
│   │   ├── http/
│   │   ├── parsing/
│   │   ├── storage/
│   │   ├── queues/
│   │   └── observability/
│   ├── interfaces/
│   │   ├── cli/
│   │   ├── api/
│   │   └── events/
│   └── shared/
│       ├── errors/
│       ├── logging/
│       ├── metrics/
│       └── validation/
├── data/
│   ├── crawl-runs/
│   ├── normalized-content/
│   └── knowledge-store/
├── tests/
│   ├── unit/
│   ├── integration/
│   └── contract/
└── tools/
    ├── local-dev/
    └── migrations/
```

## Folder responsibilities

- `docs/`: Living documentation that captures architecture, product goals, and operational guidance so the system remains deterministic and auditable.
- `docs/architecture/`: Architecture-specific references that explain why key structural choices exist.
- `docs/architecture/decisions/`: ADRs that record trade-offs and prevent knowledge loss as the crawler evolves.
- `docs/architecture/diagrams/`: Future-friendly space for non-code visuals; stored separately to keep core docs clean.
- `docs/operating-guides/`: Runbooks for crawl execution, data hygiene, and operational checklists.
- `docs/product-requirements/`: Product intent and scope boundaries for the crawler and future website builder.
- `scripts/`: Developer automation scripts for repeatable local tasks (linting, data resets, environment bootstrapping).
- `config/`: Centralized configuration defaults and environment templates to keep deterministic behavior explicit.
- `src/`: Source root for the Node.js ES Modules codebase.
- `src/core/`: Stable domain definitions that represent the crawler’s core concepts and rules.
- `src/core/domain/`: Domain entities and aggregates such as crawl targets, content snapshots, and knowledge artifacts.
- `src/core/policies/`: Deterministic crawling constraints and normalization policies applied consistently across the system.
- `src/core/value-objects/`: Immutable value types (URLs, canonical identifiers, normalized text) to keep data consistent.
- `src/application/`: Use-case orchestration that maps business intent to domain actions without infrastructure details.
- `src/application/use-cases/`: Task-specific orchestrators (start crawl, resume crawl, verify knowledge) to keep intent explicit.
- `src/application/ports/`: Interfaces that infrastructure adapters must implement (fetcher, parser, storage, scheduler).
- `src/application/workflows/`: Cross-use-case pipelines that chain multiple steps, ready for future AI agents.
- `src/infrastructure/`: Runtime integrations that fulfill ports while keeping external details isolated.
- `src/infrastructure/http/`: HTTP clients, robots.txt enforcement, and throttling adapters.
- `src/infrastructure/parsing/`: HTML extraction and normalization adapters.
- `src/infrastructure/storage/`: Persistence adapters for crawl artifacts, normalized content, and knowledge storage.
- `src/infrastructure/queues/`: Queueing or scheduling backends to support deterministic crawl execution.
- `src/infrastructure/observability/`: Logging, tracing, and metrics emitters that stay out of core logic.
- `src/interfaces/`: Entry points for external control surfaces without mixing with domain logic.
- `src/interfaces/cli/`: CLI commands for single-site deterministic crawls.
- `src/interfaces/api/`: Future API surfaces for orchestration or integration with other systems.
- `src/interfaces/events/`: Event adapters for emitting or subscribing to crawl lifecycle events.
- `src/shared/`: Cross-cutting utilities used across layers while remaining pure and deterministic.
- `src/shared/errors/`: Error taxonomy to keep failure handling consistent.
- `src/shared/logging/`: Logging helpers that standardize output formatting.
- `src/shared/metrics/`: Metrics helpers so instrumentation stays consistent.
- `src/shared/validation/`: Input validation primitives to guard against invalid crawl targets.
- `data/`: Local development and controlled runtime data storage with explicit segregation.
- `data/crawl-runs/`: Raw crawl artifacts and fetch metadata for traceability.
- `data/normalized-content/`: Cleaned, normalized content ready for knowledge building.
- `data/knowledge-store/`: Verified knowledge snapshots suitable for agent consumption.
- `tests/`: Automated tests to safeguard deterministic behavior.
- `tests/unit/`: Pure unit tests focused on domain logic.
- `tests/integration/`: Integration tests that verify adapter wiring and workflows.
- `tests/contract/`: Contract tests for ports and interfaces, ensuring adapters stay compliant.
- `tools/`: Auxiliary tooling that should not ship with runtime code.
- `tools/local-dev/`: Local developer support utilities such as fixtures or seeders.
- `tools/migrations/`: Schema migration helpers for future storage evolution.

## High-level data flow

1. `interfaces/cli` or `interfaces/api` receives a crawl request and validates it using `shared/validation`.
2. `application/use-cases` selects the appropriate workflow and coordinates with `application/ports` to begin the crawl.
3. `infrastructure/http` fetches pages deterministically while honoring `core/policies` and emits telemetry via `infrastructure/observability`.
4. `infrastructure/parsing` normalizes content into `core/value-objects`, producing structured snapshots.
5. `application/workflows` aggregates snapshots, stores artifacts in `infrastructure/storage`, and records the crawl in `data/crawl-runs`.
6. `application/use-cases` moves normalized outputs into `data/normalized-content`, then stores verified knowledge in `data/knowledge-store` for future agents.
7. `interfaces/events` emits crawl lifecycle events for downstream automation or future website builder integrations.
