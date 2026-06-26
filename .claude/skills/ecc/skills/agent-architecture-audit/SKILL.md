---
name: agent-architecture-audit
description: Full-stack diagnostic for agent and LLM applications. Audits the 12-layer agent stack for wrapper regression, memory pollution, tool discipline failures, hidden repair loops, and rendering corruption. Produces severity-ranked findings with code-first fixes. Essential for developers building agent applications, autonomous loops, or any LLM-powered feature.
metadata:
  origin: oh-my-agent-check
tools: Read, Write, Edit, Bash, Grep, Glob
---

# Agent Architecture Audit

A diagnostic workflow for agent systems that hide failures behind wrapper layers, stale memory, retry loops, or transport/rendering mutations.

## When to Activate

**MANDATORY for:**
- Releasing any agent or LLM-powered application to production
- Shipping features with tool calling, memory, or multi-step workflows
- Agent behavior degrades after adding wrapper layers
- User reports "the agent is getting worse" or "tools are flaky"
- Same model works in playground but breaks inside your wrapper
- Debugging agent behavior for more than 15 minutes without finding root cause

## The 12-Layer Stack

Every agent system has these layers. Any of them can corrupt the answer:

| # | Layer | What Goes Wrong |
|---|-------|----------------|
| 1 | System prompt | Conflicting instructions, instruction bloat |
| 2 | Session history | Stale context injection from previous turns |
| 3 | Long-term memory | Pollution across sessions, old topics in new conversations |
| 4 | Distillation | Compressed artifacts re-entering as pseudo-facts |
| 5 | Active recall | Redundant re-summary layers wasting context |
| 6 | Tool selection | Wrong tool routing, model skips required tools |
| 7 | Tool execution | Hallucinated execution — claims to call but doesn't |
| 8 | Tool interpretation | Misread or ignored tool output |
| 9 | Answer shaping | Format corruption in final response |
| 10 | Platform rendering | Transport-layer mutation (UI, API, CLI mutates valid answers) |
| 11 | Hidden repair loops | Silent fallback/retry agents running second LLM pass |
| 12 | Persistence | Expired state or cached artifacts reused as live evidence |

## Common Failure Patterns

### 1. Wrapper Regression
The base model produces correct answers, but the wrapper layers make it worse.

### 2. Memory Contamination
Old topics leak into new conversations through history, memory retrieval, or distillation.

### 3. Tool Discipline Failure
Tools are declared in the prompt but not enforced in code. The model skips them or hallucinates execution.

### 4. Rendering/Transport Corruption
The agent's internal answer is correct, but the platform layer mutates it during delivery.

### 5. Hidden Agent Layers
Silent repair, retry, summarization, or recall agents run without explicit contracts.

## Audit Workflow

### Phase 1: Scope
- Target system, entrypoints, model stack, symptoms, time window, layers to audit

### Phase 2: Evidence Collection

```bash
# Tool requirements expressed only in prompt text (not code)
rg "must.*tool|required.*call" --type md

# Hidden LLM calls outside main agent loop
rg "completion|chat\.create|messages\.create|llm\.invoke"

# Memory admission without user-correction priority
rg "memory.*admit|long.*term.*update|persist.*memory" --type py --type ts

# Fallback loops that run additional LLM calls
rg "fallback|retry.*llm|repair.*prompt" --type py --type ts
```

### Phase 3: Failure Mapping
For each finding document: symptom, mechanism, source layer, root cause, evidence (file:line), confidence (0.0–1.0)

### Phase 4: Fix Strategy

Default fix order (code-first, not prompt-first):
1. **Code-gate tool requirements** — enforce in code, not just prompt text
2. **Remove or narrow hidden repair agents** — make fallback explicit
3. **Reduce context duplication** — same info through multiple layers
4. **Tighten memory admission** — user corrections > agent assertions
5. **Reduce rendering mutation** — pass-through, don't transform
6. **Convert to typed JSON envelopes** — structured internal flow

## Severity Model

| Level | Meaning | Action |
|-------|---------|--------|
| `critical` | Agent can confidently produce wrong operational behavior | Fix before next release |
| `high` | Agent frequently degrades correctness or stability | Fix this sprint |
| `medium` | Correctness usually survives but output is fragile | Plan for next cycle |
| `low` | Mostly cosmetic or maintainability issues | Backlog |

## Quick Diagnostic Questions

| # | Question | If Yes → |
|---|----------|----------|
| 1 | Can the model skip a required tool and still answer? | Tool not code-gated |
| 2 | Does old conversation content appear in new turns? | Memory contamination |
| 3 | Is the same info in system prompt AND memory AND history? | Context duplication |
| 4 | Does the platform run a second LLM pass before delivery? | Hidden repair loop |
| 5 | Does the output differ between internal generation and user delivery? | Rendering corruption |
| 6 | Are "must use tool X" rules only in prompt text? | Tool discipline failure |

## Output Format

Present findings in this order:
1. **Severity-ranked findings** (most critical first)
2. **Architecture diagnosis** (which layer corrupted what, and why)
3. **Ordered fix plan** (code-first, not prompt-first)

Do not lead with compliments or summaries. If the system is broken, say so directly.

## Related Skills

- `agent-introspection-debugging` — Debug agent runtime failures
- `agent-eval` — Benchmark agent performance head-to-head
- `autonomous-agent-harness` — Set up autonomous agent operations
