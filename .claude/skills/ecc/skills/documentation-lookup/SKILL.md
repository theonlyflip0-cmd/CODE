---
name: documentation-lookup
description: Use up-to-date library and framework docs via Context7 MCP instead of training data. Activates for setup questions, API references, code examples, or when the user names a framework (e.g. React, Next.js, Prisma).
metadata:
  origin: ECC
---

# Documentation Lookup (Context7)

When the user asks about libraries, frameworks, or APIs, fetch current documentation via the Context7 MCP (tools `resolve-library-id` and `query-docs`) instead of relying on training data.

## When to use

Activate when the user:
- Asks setup or configuration questions (e.g. "How do I configure Next.js middleware?")
- Requests code that depends on a library ("Write a Prisma query for...")
- Needs API or reference information ("What are the Supabase auth methods?")
- Mentions specific frameworks or libraries (React, Vue, Svelte, Express, Tailwind, Prisma, Supabase, etc.)

## How it works

### Step 1: Resolve the Library ID

Call **resolve-library-id** with:
- **libraryName**: The library or product name from the user's question (e.g. `Next.js`, `Prisma`)
- **query**: The user's full question (improves relevance ranking)

### Step 2: Select the Best Match

From the resolution results, choose using:
- **Name match**: Prefer exact or closest match
- **Benchmark score**: Higher scores = better documentation quality
- **Version**: If user specified a version, prefer a version-specific library ID

### Step 3: Fetch the Documentation

Call **query-docs** with:
- **libraryId**: The selected Context7 library ID (e.g. `/vercel/next.js`)
- **query**: The user's specific question

Limit: do not call query-docs more than 3 times per question.

### Step 4: Use the Documentation

- Answer using the fetched, current information
- Include relevant code examples from the docs
- Cite the library or version when it matters

## Examples

### Next.js middleware
1. `resolve-library-id(libraryName: "Next.js", query: "How do I set up Next.js middleware?")`
2. Pick the best match (e.g. `/vercel/next.js`)
3. `query-docs(libraryId: "/vercel/next.js", query: "How do I set up Next.js middleware?")`
4. Use returned snippets to answer

### Prisma query
1. `resolve-library-id(libraryName: "Prisma", query: "How do I query with relations?")`
2. Select the official Prisma library ID
3. `query-docs(libraryId: "/prisma/prisma", query: "How do I query with relations?")`
4. Return the Prisma Client pattern with code snippet

## Best Practices

- **Be specific**: Use the user's full question as the query for better relevance
- **Version awareness**: Use version-specific library IDs when the user specifies a version
- **Prefer official sources**: Prefer official or primary packages over community forks
- **No sensitive data**: Redact API keys, passwords, tokens from any query sent to Context7
