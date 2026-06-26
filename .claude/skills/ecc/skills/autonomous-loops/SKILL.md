---
name: autonomous-loops
description: "Patterns and architectures for autonomous Claude Code loops — from simple sequential pipelines to RFC-driven multi-agent DAG systems."
metadata:
  origin: ECC
---

# Autonomous Loops Skill

> Compatibility note: `autonomous-loops` is retained for one release. The canonical skill name is now `continuous-agent-loop`.

Patterns, architectures, and reference implementations for running Claude Code autonomously in loops.

## Loop Pattern Spectrum

| Pattern | Complexity | Best For |
|---------|-----------|----------|
| Sequential Pipeline (`claude -p`) | Low | Daily dev steps, scripted workflows |
| NanoClaw REPL | Low | Interactive persistent sessions |
| Infinite Agentic Loop | Medium | Parallel content generation, spec-driven work |
| Continuous Claude PR Loop | Medium | Multi-day iterative projects with CI gates |
| De-Sloppify Pattern | Add-on | Quality cleanup after any Implementer step |
| RFC-Driven DAG (Ralphinho) | High | Large features, multi-unit parallel work with merge queue |

## 1. Sequential Pipeline (`claude -p`)

Break daily development into a sequence of non-interactive `claude -p` calls:

```bash
#!/bin/bash
set -e

# Step 1: Implement the feature
claude -p "Read the spec in docs/auth-spec.md. Implement OAuth2 login in src/auth/. Write tests first (TDD)."

# Step 2: De-sloppify (cleanup pass)
claude -p "Review all files changed by the previous commit. Remove unnecessary type tests, overly defensive checks. Keep real business logic tests. Run the test suite after cleanup."

# Step 3: Verify
claude -p "Run the full build, lint, type check, and test suite. Fix any failures. Do not add new features."

# Step 4: Commit
claude -p "Create a conventional commit for all staged changes."
```

**Key Design Principles:**
1. Each step is isolated — fresh context window per `claude -p` call
2. Order matters — each builds on filesystem state left by the previous
3. Exit codes propagate — `set -e` stops the pipeline on failure

## 2. The De-Sloppify Pattern

Add a dedicated cleanup step after each Implementer step instead of using negative instructions:

```bash
# Step 1: Implement (let it be thorough)
claude -p "Implement the feature with full TDD. Be thorough with tests."

# Step 2: De-sloppify (separate context)
claude -p "Review all changes. Remove:
- Tests that verify language/framework behavior rather than business logic
- Redundant type checks the type system already enforces
- Console.log statements
- Commented-out code
Keep all business logic tests. Run the test suite after cleanup."
```

> Rather than adding negative instructions (which have downstream quality effects), add a separate de-sloppify pass. Two focused agents outperform one constrained agent.

## 3. Continuous Claude PR Loop

A shell script that runs Claude Code in a continuous loop, creating PRs, waiting for CI, and merging automatically:

```
Loop:
  1. Create branch (continuous-claude/iteration-N)
  2. Run claude -p with enhanced prompt
  3. Commit changes
  4. Push + create PR
  5. Wait for CI checks
  6. CI failure? → Auto-fix pass
  7. Merge PR
  8. Return to main → repeat

Limit by: --max-runs N | --max-cost $X | --max-duration 2h | completion signal
```

### Cross-Iteration Context: SHARED_TASK_NOTES.md

A `SHARED_TASK_NOTES.md` file persists across iterations, bridging the context gap between independent `claude -p` invocations.

## 4. RFC-Driven DAG (Ralphinho)

An RFC-driven, multi-agent pipeline that decomposes a spec into a dependency DAG, runs each unit through a tiered quality pipeline, and lands them via an agent-driven merge queue.

```
RFC/PRD Document
       │
       ▼
  DECOMPOSITION → Break RFC into work units with dependency DAG
       │
       ▼
  Parallel quality pipelines per DAG layer:
  Research → Plan → Implement → Test → Review (depth by complexity tier)
       │
       ▼
  Merge Queue: Rebase → Test → Land or evict with conflict context
```

**Complexity Tiers:**
| Tier | Pipeline Stages |
|------|----------------|
| trivial | implement → test |
| small | implement → test → code-review |
| medium | research → plan → implement → test → PRD-review + code-review → review-fix |
| large | research → plan → implement → test → PRD-review + code-review → review-fix → final-review |

## Choosing the Right Pattern

```
Single focused change?
└─ Yes → Sequential Pipeline or NanoClaw

Multi-unit work with written spec/RFC?
├─ Need parallel implementation → Ralphinho (DAG)
└─ Iterative PR-by-PR → Continuous Claude

Many variations of the same thing?
└─ Infinite Agentic Loop (spec-driven generation)
```

## Anti-Patterns

1. **Infinite loops without exit conditions** — Always have a max-runs, max-cost, or completion signal
2. **No context bridge between iterations** — Use `SHARED_TASK_NOTES.md` or filesystem state
3. **Retrying the same failure without context** — Capture the error context and feed it to the next attempt
4. **Negative instructions instead of cleanup passes** — Don't say "don't do X." Add a separate pass that removes X
5. **All agents in one context window** — For complex workflows, separate concerns into different agent processes
