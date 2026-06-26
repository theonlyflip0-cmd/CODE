---
name: context-budget
description: Audits Claude Code context window consumption across agents, skills, MCP servers, and rules. Identifies bloat, redundant components, and produces prioritized token-savings recommendations.
metadata:
  origin: ECC
---

# Context Budget

Analyze token overhead across every loaded component in a Claude Code session and surface actionable optimizations to reclaim context space.

## When to Use

- Session performance feels sluggish or output quality is degrading
- You've recently added many skills, agents, or MCP servers
- You want to know how much context headroom you actually have
- Planning to add more components and need to know if there's room

## How It Works

### Phase 1: Inventory

Scan all component directories and estimate token consumption:

**Agents** (`agents/*.md`)
- Count lines and tokens per file (words × 1.3)
- Flag: files >200 lines (heavy), description >30 words (bloated frontmatter)

**Skills** (`skills/*/SKILL.md`)
- Count tokens per SKILL.md
- Flag: files >400 lines

**Rules** (`rules/**/*.md`)
- Flag: files >100 lines
- Detect content overlap between rule files

**MCP Servers** (`.mcp.json`)
- Estimate schema overhead at ~500 tokens per tool
- Flag: servers with >20 tools, servers that wrap simple CLI commands (`gh`, `git`, `npm`)

**CLAUDE.md**
- Flag: combined total >300 lines

### Phase 2: Classify

| Bucket | Criteria | Action |
|--------|----------|--------|
| **Always needed** | Referenced in CLAUDE.md, backs an active command | Keep |
| **Sometimes needed** | Domain-specific, not referenced in CLAUDE.md | Consider on-demand |
| **Rarely needed** | No command reference, overlapping content | Remove or lazy-load |

### Phase 3: Detect Issues

- **Bloated agent descriptions** — description >30 words in frontmatter loads into every Task tool invocation
- **Heavy agents** — files >200 lines inflate Task tool context on every spawn
- **Redundant components** — skills that duplicate agent logic, rules that duplicate CLAUDE.md
- **MCP over-subscription** — >10 servers, or servers wrapping CLI tools available for free
- **CLAUDE.md bloat** — verbose explanations, outdated sections

### Phase 4: Report

```
Context Budget Report
═══════════════════════════════════════

Total estimated overhead: ~XX,XXX tokens
Context model: Claude Sonnet (200K window)
Effective available context: ~XXX,XXX tokens (XX%)

Component Breakdown:
┌─────────────────┬────────┬───────────┐
│ Component       │ Count  │ Tokens    │
├─────────────────┼────────┼───────────┤
│ Agents          │ N      │ ~X,XXX    │
│ Skills          │ N      │ ~X,XXX    │
│ Rules           │ N      │ ~X,XXX    │
│ MCP tools       │ N      │ ~XX,XXX   │
│ CLAUDE.md       │ N      │ ~X,XXX    │
└─────────────────┴────────┴───────────┘

Top 3 Optimizations:
1. [action] → save ~X,XXX tokens
2. [action] → save ~X,XXX tokens
3. [action] → save ~X,XXX tokens
```

## Best Practices

- **Token estimation**: use `words × 1.3` for prose, `chars / 4` for code-heavy files
- **MCP is the biggest lever**: each tool schema costs ~500 tokens; a 30-tool server costs more than all your skills combined
- **Agent descriptions are loaded always**: even if the agent is never invoked, its description is present in every Task tool context
- **Audit after changes**: run after adding any agent, skill, or MCP server to catch creep early
