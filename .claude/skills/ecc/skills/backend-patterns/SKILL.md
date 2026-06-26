---
name: backend-patterns
description: Backend architecture patterns, API design, database optimization, and server-side best practices for Node.js, Express, and Next.js API routes.
metadata:
  origin: ECC
---

# Backend Development Patterns

Backend architecture patterns and best practices for scalable server-side applications.

## When to Activate

- Designing REST or GraphQL API endpoints
- Implementing repository, service, or controller layers
- Optimizing database queries (N+1, indexing, connection pooling)
- Adding caching (Redis, in-memory, HTTP cache headers)
- Setting up background jobs or async processing
- Structuring error handling and validation for APIs
- Building middleware (auth, logging, rate limiting)

## Repository Pattern

```typescript
interface MarketRepository {
  findAll(filters?: MarketFilters): Promise<Market[]>
  findById(id: string): Promise<Market | null>
  create(data: CreateMarketDto): Promise<Market>
  update(id: string, data: UpdateMarketDto): Promise<Market>
  delete(id: string): Promise<void>
}

class SupabaseMarketRepository implements MarketRepository {
  async findAll(filters?: MarketFilters): Promise<Market[]> {
    let query = supabase.from('markets').select('id, name, status, volume')
    if (filters?.status) query = query.eq('status', filters.status)
    if (filters?.limit) query = query.limit(filters.limit)
    const { data, error } = await query
    if (error) throw new Error(error.message)
    return data
  }
}
```

## Service Layer Pattern

```typescript
class MarketService {
  constructor(private marketRepo: MarketRepository) {}

  async searchMarkets(query: string, limit = 10): Promise<Market[]> {
    const embedding = await generateEmbedding(query)
    const results = await this.vectorSearch(embedding, limit)
    return this.marketRepo.findByIds(results.map(r => r.id))
  }
}
```

## Middleware Pattern

```typescript
export function withAuth(handler: NextApiHandler): NextApiHandler {
  return async (req, res) => {
    const token = req.headers.authorization?.replace('Bearer ', '')
    if (!token) return res.status(401).json({ error: 'Unauthorized' })
    try {
      req.user = await verifyToken(token)
      return handler(req, res)
    } catch {
      return res.status(401).json({ error: 'Invalid token' })
    }
  }
}
```

## Database Query Optimization

```typescript
// GOOD: Select only needed columns
const { data } = await supabase.from('markets').select('id, name, status').limit(10)

// BAD: Select everything
const { data } = await supabase.from('markets').select('*')
```

### N+1 Query Prevention

```typescript
// BAD: N+1 query problem
for (const market of markets) {
  market.creator = await getUser(market.creator_id)  // N queries
}

// GOOD: Batch fetch
const creatorIds = markets.map(m => m.creator_id)
const creators = await getUsers(creatorIds)  // 1 query
const creatorMap = new Map(creators.map(c => [c.id, c]))
markets.forEach(market => { market.creator = creatorMap.get(market.creator_id) })
```

## Caching (Cache-Aside Pattern)

```typescript
async function getMarketWithCache(id: string): Promise<Market> {
  const cacheKey = `market:${id}`
  const cached = await redis.get(cacheKey)
  if (cached) return JSON.parse(cached)

  const market = await db.markets.findUnique({ where: { id } })
  if (!market) throw new NotFoundError('Market', id)

  await redis.setex(cacheKey, 300, JSON.stringify(market))
  return market
}
```

## Authentication & Authorization

```typescript
export async function requireAuth(request: Request) {
  const token = request.headers.get('authorization')?.replace('Bearer ', '')
  if (!token) throw new ApiError(401, 'Missing authorization token')
  return verifyToken(token)
}

// Role-based access control
const rolePermissions = {
  admin: ['read', 'write', 'delete', 'admin'],
  moderator: ['read', 'write', 'delete'],
  user: ['read', 'write'],
}

export function hasPermission(user: User, permission: string): boolean {
  return rolePermissions[user.role].includes(permission)
}
```

## Rate Limiting

Rate limiting must use a shared store (Redis, a gateway, or the platform's native limiter). Do not use per-process in-memory counters for production APIs — they reset on deploy, split across replicas, and fail open in serverless or multi-instance environments.

## Structured Logging

```typescript
class Logger {
  log(level: 'info' | 'warn' | 'error', message: string, context?: Record<string, unknown>) {
    console.log(JSON.stringify({ timestamp: new Date().toISOString(), level, message, ...context }))
  }
}
```

## Background Jobs (Simple Queue)

```typescript
class JobQueue<T> {
  private queue: T[] = []
  private processing = false

  async add(job: T): Promise<void> {
    this.queue.push(job)
    if (!this.processing) this.process()
  }

  private async process(): Promise<void> {
    this.processing = true
    while (this.queue.length > 0) {
      const job = this.queue.shift()!
      try { await this.execute(job) } catch (error) { console.error('Job failed:', error) }
    }
    this.processing = false
  }

  protected async execute(job: T): Promise<void> { /* override */ }
}
```
