---
name: coding-standards
description: Baseline cross-project coding conventions for naming, readability, immutability, and code-quality review. Use detailed frontend or backend skills for framework-specific patterns.
metadata:
  origin: ECC
---

# Coding Standards & Best Practices

Baseline coding conventions applicable across projects.

- Use `frontend-patterns` for React, state, forms, rendering, and UI architecture.
- Use `backend-patterns` or `api-design` for repository/service layers, endpoint design, validation, and server-specific concerns.

## When to Activate

- Starting a new project or module
- Reviewing code for quality and maintainability
- Refactoring existing code to follow conventions
- Enforcing naming, formatting, or structural consistency
- Onboarding new contributors to coding conventions

## Code Quality Principles

1. **Readability First** — Code is read more than written. Clear names, consistent formatting, self-documenting code.
2. **KISS** — Simplest solution that works. Avoid over-engineering and premature optimization.
3. **DRY** — Extract common logic into functions. Avoid copy-paste programming.
4. **YAGNI** — Don't build features before they're needed. Start simple, refactor when needed.

## TypeScript/JavaScript Standards

### Variable & Function Naming

```typescript
// GOOD: Descriptive names
const marketSearchQuery = 'election'
const isUserAuthenticated = true
async function fetchMarketData(marketId: string) { }
function isValidEmail(email: string): boolean { }

// BAD: Unclear names
const q = 'election'
const flag = true
async function market(id: string) { }
```

### Immutability (CRITICAL)

```typescript
// ALWAYS use spread operator
const updatedUser = { ...user, name: 'New Name' }
const updatedArray = [...items, newItem]

// NEVER mutate directly
user.name = 'New Name'  // BAD
items.push(newItem)     // BAD
```

### Async/Await

```typescript
// GOOD: Parallel execution when possible
const [users, markets, stats] = await Promise.all([fetchUsers(), fetchMarkets(), fetchStats()])

// BAD: Sequential when unnecessary
const users = await fetchUsers()
const markets = await fetchMarkets()
```

### Type Safety

```typescript
// GOOD: Proper types
interface Market {
  id: string
  name: string
  status: 'active' | 'resolved' | 'closed'
}

// BAD: Using 'any'
function getMarket(id: any): Promise<any> { }
```

## React Best Practices

```typescript
// GOOD: Functional component with types
interface ButtonProps {
  children: React.ReactNode
  onClick: () => void
  variant?: 'primary' | 'secondary'
}

export function Button({ children, onClick, variant = 'primary' }: ButtonProps) {
  return <button onClick={onClick} className={`btn btn-${variant}`}>{children}</button>
}
```

### State Management

```typescript
// GOOD: Functional update for state based on previous state
setCount(prev => prev + 1)

// BAD: Direct state reference (can be stale in async scenarios)
setCount(count + 1)
```

## Code Smell Detection

### Long Functions
Split functions >50 lines into smaller, focused functions.

### Deep Nesting — Use Early Returns

```typescript
// BAD: 5+ levels of nesting
if (user) { if (user.isAdmin) { if (market) { /* ... */ } } }

// GOOD: Early returns
if (!user) return
if (!user.isAdmin) return
if (!market) return
// Do something
```

### Magic Numbers

```typescript
// BAD
if (retryCount > 3) { }
setTimeout(callback, 500)

// GOOD
const MAX_RETRIES = 3
const DEBOUNCE_DELAY_MS = 500
```

## Comments

```typescript
// GOOD: Explain WHY, not WHAT
// Use exponential backoff to avoid overwhelming the API during outages
const delay = Math.min(1000 * Math.pow(2, retryCount), 30000)

// BAD: Stating the obvious
// Increment counter by 1
count++
```

## Testing Standards

### AAA Pattern

```typescript
test('calculates similarity correctly', () => {
  // Arrange
  const vector1 = [1, 0, 0]
  const vector2 = [0, 1, 0]

  // Act
  const similarity = calculateCosineSimilarity(vector1, vector2)

  // Assert
  expect(similarity).toBe(0)
})
```

### Descriptive Test Names

```typescript
// GOOD
test('returns empty array when no markets match query', () => { })
test('throws error when OpenAI API key is missing', () => { })

// BAD
test('works', () => { })
test('test search', () => { })
```
