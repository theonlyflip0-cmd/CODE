---
name: codebase-onboarding
description: Analyze an unfamiliar codebase and generate a structured onboarding guide with architecture map, key entry points, conventions, and a starter CLAUDE.md. Use when joining a new project or setting up Claude Code for the first time in a repo.
metadata:
  origin: ECC
---

# Codebase Onboarding

Systematically analyze an unfamiliar codebase and produce a structured onboarding guide. Designed for developers joining a new project or setting up Claude Code in an existing repo for the first time.

## When to Use

- First time opening a project with Claude Code
- Joining a new team or repository
- User asks "help me understand this codebase"
- User asks to generate a CLAUDE.md for a project
- User says "onboard me" or "walk me through this repo"

## How It Works

### Phase 1: Reconnaissance

Gather raw signals about the project without reading every file. Run these checks in parallel:

```
1. Package manifest detection
   → package.json, go.mod, Cargo.toml, pyproject.toml, pom.xml, build.gradle, Gemfile, composer.json

2. Framework fingerprinting
   → next.config.*, nuxt.config.*, angular.json, vite.config.*, django settings, fastapi main, rails config

3. Entry point identification
   → main.*, index.*, app.*, server.*, cmd/, src/main/

4. Directory structure snapshot
   → Top 2 levels (ignore node_modules, vendor, .git, dist, build, __pycache__, .next)

5. Config and tooling detection
   → .eslintrc*, .prettierrc*, tsconfig.json, Makefile, Dockerfile, .github/workflows/, .env.example

6. Test structure detection
   → tests/, test/, __tests__/, *_test.go, *.spec.ts, jest.config.*, vitest.config.*
```

### Phase 2: Architecture Mapping

From reconnaissance data, identify:

**Tech Stack**: Language(s), framework(s), database(s), build tools, CI/CD platform

**Architecture Pattern**: Monolith, monorepo, microservices, or serverless; API style (REST, GraphQL, gRPC)

**Key Directories**: Map top-level directories to their purpose

**Data Flow**: Trace one request from entry to response — where it enters, is validated, hits business logic, and reaches the database

### Phase 3: Convention Detection

Identify patterns the codebase already follows:
- File naming: kebab-case, camelCase, PascalCase, snake_case
- Error handling style: try/catch, Result types, error codes
- Async patterns: callbacks, promises, async/await
- Git conventions from recent commits (skip if shallow clone)

### Phase 4: Generate Onboarding Artifacts

#### Output 1: Onboarding Guide

```markdown
# Onboarding Guide: [Project Name]

## Overview
[2-3 sentences: what this project does and who it serves]

## Tech Stack
| Layer | Technology | Version |
|-------|-----------|---------|

## Key Entry Points
- **API routes**: `src/app/api/` — Next.js route handlers
- **Database**: `prisma/schema.prisma` — data model source of truth

## Directory Map
[Top-level directory → purpose mapping]

## Request Lifecycle
[Trace one API request from entry to response]

## Conventions
- [File naming pattern]
- [Error handling approach]
- [Testing patterns]

## Common Tasks
- **Run dev server**: `npm run dev`
- **Run tests**: `npm test`

## Where to Look
| I want to... | Look at... |
|--------------|-----------|
```

#### Output 2: Starter CLAUDE.md

Generate or update project-specific CLAUDE.md. If it already exists, enhance rather than replace — preserve existing instructions and mark what's new.

## Best Practices

1. **Don't read everything** — use Glob and Grep for reconnaissance, read selectively only for ambiguous signals
2. **Verify, don't guess** — if a framework is detected from config but the code uses something different, trust the code
3. **Respect existing CLAUDE.md** — enhance it, don't replace it
4. **Stay concise** — the guide should be scannable in 2 minutes
5. **Flag unknowns** — "Could not determine test runner" is better than a wrong answer

## Anti-Patterns to Avoid

- Generating a CLAUDE.md longer than 100 lines
- Listing every dependency
- Describing obvious directory names
- Copying the README
