# OpenCrawl System Architecture

This document defines the complete architecture for a production-grade, deterministic OpenCrawl-like system. It is intentionally **architecture-only**: no code, crawling logic, or AI functionality is included.

## 1. Complete Folder Structure (Tree Format)

```
.
├── ARCHITECTURE.md
├── RESULT_PROMPT_1.md
├── docs/
│   ├── architecture/
│   │   ├── decisions/
│   │   │   └── README.md
│   │   └── glossary.md
│   ├── operating-guides/
│   │   └── README.md
│   └── product-requirements/
│       └── README.md
├── config/
│   ├── defaults/
│   │   └── README.md
│   └── environments/
│       └── README.md
├── scripts/
│   └── README.md
├── src/
│   ├── core/
│   │   ├── domain/
│   │   │   └── README.md
│   │   ├── policies/
│   │   │   └── README.md
│   │   └── value-objects/
│   │       └── README.md
│   ├── application/
│   │   ├── use-cases/
│   │   │   └── README.md
│   │   ├── workflows/
│   │   │   └── README.md
│   │   └── ports/
│   │       └── README.md
│   ├── infrastructure/
│   │   ├── http/
│   │   │   └── README.md
│   │   ├── parsing/
│   │   │   └── README.md
│   │   ├── storage/
│   │   │   └── README.md
│   │   ├── queues/
│   │   │   └── README.md
│   │   └── observability/
│   │       └── README.md
│   ├── interfaces/
│   │   ├── cli/
│   │   │   └── README.md
│   │   ├── api/
│   │   │   └── README.md
│   │   └── events/
│   │       └── README.md
│   └── shared/
│       ├── errors/
│       │   └── README.md
│       ├── logging/
│       │   └── README.md
│       ├── metrics/
│       │   └── README.md
│       └── validation/
│           └── README.md
├── data/
│   ├── crawl-runs/
│   │   └── README.md
│   ├── normalized-content/
│   │   └── README.md
│   └── knowledge-store/
│       └── README.md
├── tests/
│   ├── unit/
│   │   └── README.md
│   ├── integration/
│   │   └── README.md
│   └── contract/
│       └── README.md
└── tools/
    ├── local-dev/
    │   └── README.md
    └── migrations/
        └── README.md
```

## 2. Responsibility of Each Folder and File

### Root
- `ARCHITECTURE.md`: Single source of truth for the system architecture and constraints. This exists to ensure deterministic scope control.
- `RESULT_PROMPT_1.md`: Human-readable summary and decision log for the current architecture pass to support review.

### `docs/`
- `docs/`: Long-term documentation that keeps architectural intent explicit and prevents accidental scope creep.
- `docs/architecture/`: Focused space for architectural references to explain **why** the system is structured this way.
- `docs/architecture/decisions/README.md`: Placeholder for ADRs to capture rationale and trade-offs over time.
- `docs/architecture/glossary.md`: Shared vocabulary to keep domain terms consistent across teams.
- `docs/operating-guides/README.md`: Runbooks and operational practices for deterministic crawling.
- `docs/product-requirements/README.md`: Product boundaries and requirements that the architecture must satisfy.

### `config/`
- `config/`: All configuration lives here to make deterministic behavior explicit and reviewable.
- `config/defaults/README.md`: Documents default configuration values and the reasoning behind them.
- `config/environments/README.md`: Environment-specific override guidance (dev, staging, prod) to keep behavior predictable.

### `scripts/`
- `scripts/README.md`: Documents automation scripts to ensure consistent operational hygiene without embedding behavior in code.

### `src/`
- `src/`: Node.js ES Modules source root. Separates concerns into stable layers.

#### `src/core/`
- `src/core/`: Pure domain model. This exists to keep core concepts independent of infrastructure and runtime concerns.
- `src/core/domain/README.md`: Defines canonical domain entities (crawl target, content snapshot, knowledge artifact).
- `src/core/policies/README.md`: Deterministic constraints and normalization policies that govern system behavior.
- `src/core/value-objects/README.md`: Immutable primitives (URL, canonical ID, normalized text) to prevent data drift.

#### `src/application/`
- `src/application/`: Use-case orchestration layer. Exists to translate business intent into coordinated steps.
- `src/application/use-cases/README.md`: Use-case definitions (start crawl, resume crawl, verify knowledge).
- `src/application/workflows/README.md`: Multi-step workflows that chain use-cases into deterministic pipelines.
- `src/application/ports/README.md`: Interfaces that infrastructure adapters must satisfy; prevents vendor lock-in.

#### `src/infrastructure/`
- `src/infrastructure/`: Integration layer for external systems; keeps external volatility away from core.
- `src/infrastructure/http/README.md`: HTTP access, robots policy enforcement, rate-limiting.
- `src/infrastructure/parsing/README.md`: HTML parsing and content extraction adapters.
- `src/infrastructure/storage/README.md`: Persistence adapters for crawl artifacts and knowledge store.
- `src/infrastructure/queues/README.md`: Scheduling/queue backends to keep crawl deterministic.
- `src/infrastructure/observability/README.md`: Logging, tracing, metrics integration.

#### `src/interfaces/`
- `src/interfaces/`: Boundary layer for external control surfaces.
- `src/interfaces/cli/README.md`: CLI entry points for deterministic single-site crawls.
- `src/interfaces/api/README.md`: API entry points for orchestration and future integrations.
- `src/interfaces/events/README.md`: Event ingress/egress for lifecycle signals.

#### `src/shared/`
- `src/shared/`: Cross-cutting utilities that are pure and deterministic.
- `src/shared/errors/README.md`: Error taxonomy to unify handling and observability.
- `src/shared/logging/README.md`: Logging standards to preserve structured outputs.
- `src/shared/metrics/README.md`: Metrics definitions to keep telemetry consistent.
- `src/shared/validation/README.md`: Input validation to guard crawl target integrity.

### `data/`
- `data/`: On-disk storage layout for deterministic data segregation.
- `data/crawl-runs/README.md`: Raw crawl artifacts and fetch metadata for auditability.
- `data/normalized-content/README.md`: Cleaned, normalized content outputs ready for knowledge.
- `data/knowledge-store/README.md`: Verified knowledge snapshots for downstream agents.

### `tests/`
- `tests/`: Automated checks to keep deterministic behavior stable.
- `tests/unit/README.md`: Pure domain tests with no infrastructure dependencies.
- `tests/integration/README.md`: Adapter and workflow integration checks.
- `tests/contract/README.md`: Port and interface contracts to ensure adapter compliance.

### `tools/`
- `tools/`: Non-runtime helpers to keep operational tooling separate from production.
- `tools/local-dev/README.md`: Local developer utilities and fixtures.
- `tools/migrations/README.md`: Storage migration tooling to keep evolution controlled.

## 3. High-Level Data Flow (Textual)

1. A crawl request enters through `src/interfaces/cli` or `src/interfaces/api` and is validated by `src/shared/validation`.
2. The appropriate `src/application/use-cases` selects or constructs a `src/application/workflows` pipeline for the crawl.
3. Workflow steps coordinate with `src/application/ports` to request HTTP fetches, parsing, storage, and scheduling.
4. `src/infrastructure/http` performs deterministic retrieval while enforcing `src/core/policies`.
5. `src/infrastructure/parsing` normalizes content into `src/core/value-objects` and produces `src/core/domain` snapshots.
6. `src/infrastructure/storage` persists raw artifacts into `data/crawl-runs` and normalized outputs into `data/normalized-content`.
7. Verified knowledge artifacts are stored in `data/knowledge-store` via storage adapters and emitted through `src/interfaces/events`.
8. `src/infrastructure/observability` records logs/metrics for traceability without mutating core behavior.

## 4. Explicit AI Boundaries

### Where AI *will* be allowed later
- **Future-only** within `src/application/workflows` and `src/application/use-cases` to propose plans or reorder deterministic steps.
- **Future-only** within `data/knowledge-store` enrichment pipelines to propose hypotheses that must be verified.

### Where AI *will never* be allowed
- `src/core/` (domain, policies, value-objects) to preserve deterministic behavior.
- `src/shared/validation` and `src/shared/errors` to prevent nondeterministic input handling.
- `src/infrastructure/http` and `src/infrastructure/storage` to ensure faithful, deterministic I/O.
- `src/interfaces/cli` and `src/interfaces/api` request parsing to keep boundaries explicit and predictable.
- `tests/` and `config/` to avoid nondeterministic configuration drift.

These boundaries exist to keep the crawl deterministic, auditable, and production-grade while still enabling controlled future AI extensions.
