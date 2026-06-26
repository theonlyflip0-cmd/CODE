---
name: code-tour
description: Create CodeTour `.tour` files — persona-targeted, step-by-step walkthroughs with real file and line anchors. Use for onboarding tours, architecture walkthroughs, PR tours, RCA tours, and structured "explain how this works" requests.
metadata:
  origin: ECC
---

# Code Tour

Create **CodeTour** `.tour` files for codebase walkthroughs that open directly to real files and line ranges. Tours live in `.tours/` and are meant for the CodeTour format, not ad hoc Markdown notes.

A good tour is a narrative for a specific reader:
- what they are looking at
- why it matters
- what path they should follow next

Only create `.tour` JSON files. Do not modify source code as part of this skill.

## When to Use

Use this skill when:
- the user asks for a code tour, onboarding tour, architecture walkthrough, or PR tour
- the user says "explain how X works" and wants a reusable guided artifact
- the user wants a ramp-up path for a new engineer or reviewer
- the task is better served by a guided sequence than a flat summary

Examples:
- onboarding a new maintainer
- architecture tour for one service or package
- PR-review walk-through anchored to changed files
- RCA tour showing the failure path
- security review tour of trust boundaries and key checks

## When NOT to Use

| Instead of code-tour | Use |
| --- | --- |
| A one-off explanation in chat is enough | answer directly |
| The user wants prose docs, not a `.tour` artifact | `documentation-lookup` or repo docs editing |
| The task is implementation or refactoring | do the implementation work |
| The task is broad codebase onboarding without a tour artifact | `codebase-onboarding` |

## Workflow

### 1. Discover

Explore the repo before writing anything:
- README and package/app entry points
- folder structure
- relevant config files
- the changed files if the tour is PR-focused

Do not start writing steps before you understand the shape of the code.

### 2. Infer the reader

| Request shape | Persona | Suggested depth |
| --- | --- | --- |
| "onboarding", "new joiner" | `new-joiner` | 9-13 steps |
| "quick tour", "vibe check" | `vibecoder` | 5-8 steps |
| "architecture" | `architect` | 14-18 steps |
| "tour this PR" | `pr-reviewer` | 7-11 steps |
| "why did this break" | `rca-investigator` | 7-11 steps |
| "security review" | `security-reviewer` | 7-11 steps |

### 3. Read and verify anchors

Every file path and line anchor must be real:
- confirm the file exists
- confirm the line numbers are in range
- if using a selection, verify the exact block
- if the file is volatile, prefer a pattern-based anchor

Never guess line numbers.

### 4. Write the `.tour`

Write to: `.tours/<persona>-<focus>.tour`

### 5. Validate

Before finishing:
- every referenced path exists
- every line or selection is valid
- the first step is anchored to a real file or directory
- the tour tells a coherent story rather than listing files

## Step Types

### File + line (default)

```json
{ "file": "src/auth/middleware.ts", "line": 42, "title": "Auth Gate", "description": "Every protected request passes here first." }
```

### Directory

```json
{ "directory": "src/services", "title": "Service Layer", "description": "The core orchestration logic lives here." }
```

### Selection

```json
{
  "file": "src/core/pipeline.ts",
  "selection": { "start": { "line": 15, "character": 0 }, "end": { "line": 34, "character": 0 } },
  "title": "Request Pipeline"
}
```

### Pattern

```json
{ "file": "src/app.ts", "pattern": "export default class App", "title": "Application Entry" }
```

## Writing Rule: SMIG

Each description should answer:
- **Situation**: what the reader is looking at
- **Mechanism**: how it works
- **Implication**: why it matters for this persona
- **Gotcha**: what a smart reader might miss

## Example

```json
{
  "$schema": "https://aka.ms/codetour-schema",
  "title": "API Service Tour",
  "description": "Walkthrough of the request path for the payments service.",
  "ref": "main",
  "steps": [
    { "directory": "src", "title": "Source Root", "description": "All runtime code for the service starts here." },
    { "file": "src/server.ts", "line": 12, "title": "Entry Point", "description": "The server boots here and wires middleware before any route is reached." },
    { "file": "src/routes/payments.ts", "line": 8, "title": "Payment Routes", "description": "Every payments request enters through this router before hitting service logic." },
    { "title": "Next Steps", "description": "You can now follow any payment request end to end with the main anchors in place." }
  ]
}
```

## Anti-Patterns

| Anti-pattern | Fix |
| --- | --- |
| Flat file listing | Tell a story with dependency between steps |
| Generic descriptions | Name the concrete code path or pattern |
| Guessed anchors | Verify every file and line first |
| First step is content-only | Anchor the first step to a real file or directory |

## Related Skills

- `codebase-onboarding`
- `coding-standards`
