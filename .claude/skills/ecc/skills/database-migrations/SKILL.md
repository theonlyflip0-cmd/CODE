---
name: database-migrations
description: Database migration best practices for schema changes, data migrations, rollbacks, and zero-downtime deployments across PostgreSQL, MySQL, and common ORMs (Prisma, Drizzle, Kysely, Django, TypeORM, golang-migrate).
metadata:
  origin: ECC
---

# Database Migration Patterns

Safe, reversible database schema changes for production systems.

## When to Activate

- Creating or altering database tables
- Adding/removing columns or indexes
- Running data migrations (backfill, transform)
- Planning zero-downtime schema changes
- Setting up migration tooling for a new project

## Core Principles

1. **Every change is a migration** — never alter production databases manually
2. **Migrations are forward-only in production** — rollbacks use new forward migrations
3. **Schema and data migrations are separate** — never mix DDL and DML in one migration
4. **Test migrations against production-sized data** — a migration that works on 100 rows may lock on 10M
5. **Migrations are immutable once deployed** — never edit a migration that has run in production

## Migration Safety Checklist

- [ ] Migration has both UP and DOWN (or is explicitly marked irreversible)
- [ ] No full table locks on large tables (use concurrent operations)
- [ ] New columns have defaults or are nullable (never add NOT NULL without default)
- [ ] Indexes created concurrently (not inline with CREATE TABLE for existing tables)
- [ ] Data backfill is a separate migration from schema change
- [ ] Tested against a copy of production data
- [ ] Rollback plan documented

## PostgreSQL Patterns

### Adding a Column Safely

```sql
-- GOOD: Nullable column, no lock
ALTER TABLE users ADD COLUMN avatar_url TEXT;

-- GOOD: Column with default (Postgres 11+ is instant)
ALTER TABLE users ADD COLUMN is_active BOOLEAN NOT NULL DEFAULT true;

-- BAD: NOT NULL without default (requires full table rewrite)
ALTER TABLE users ADD COLUMN role TEXT NOT NULL;
```

### Adding an Index Without Downtime

```sql
-- BAD: Blocks writes on large tables
CREATE INDEX idx_users_email ON users (email);

-- GOOD: Non-blocking
CREATE INDEX CONCURRENTLY idx_users_email ON users (email);
```

### Renaming a Column (Zero-Downtime — Expand-Contract)

```sql
-- Step 1: Add new column
ALTER TABLE users ADD COLUMN display_name TEXT;

-- Step 2: Backfill (separate migration)
UPDATE users SET display_name = username WHERE display_name IS NULL;

-- Step 3: Update application to read/write both columns, deploy

-- Step 4: Drop old column in next migration
ALTER TABLE users DROP COLUMN username;
```

### Large Data Migrations — Batch Update

```sql
-- BAD: Updates all rows in one transaction (locks table)
UPDATE users SET normalized_email = LOWER(email);

-- GOOD: Batch update with progress
DO $$
DECLARE
  batch_size INT := 10000;
  rows_updated INT;
BEGIN
  LOOP
    UPDATE users SET normalized_email = LOWER(email)
    WHERE id IN (SELECT id FROM users WHERE normalized_email IS NULL LIMIT batch_size FOR UPDATE SKIP LOCKED);
    GET DIAGNOSTICS rows_updated = ROW_COUNT;
    EXIT WHEN rows_updated = 0;
    COMMIT;
  END LOOP;
END $$;
```

## Prisma

```bash
npx prisma migrate dev --name add_user_avatar   # dev
npx prisma migrate deploy                        # production
```

For operations Prisma cannot express (concurrent indexes), use:
```bash
npx prisma migrate dev --create-only --name add_email_index
# Edit the generated SQL file to add CONCURRENTLY
```

## Drizzle

```bash
npx drizzle-kit generate   # Generate migration from schema changes
npx drizzle-kit migrate    # Apply migrations
npx drizzle-kit push       # Push schema directly (dev only)
```

## Kysely

```bash
kysely migrate make add_user_avatar   # Create migration file
kysely migrate latest                  # Apply all pending
kysely migrate down                    # Rollback last
```

```typescript
// Always use Kysely<any>, not your typed DB interface
export async function up(db: Kysely<any>): Promise<void> {
  await db.schema
    .createTable('user_profile')
    .addColumn('id', 'serial', (col) => col.primaryKey())
    .addColumn('email', 'varchar(255)', (col) => col.notNull().unique())
    .execute()
}

export async function down(db: Kysely<any>): Promise<void> {
  await db.schema.dropTable('user_profile').execute()
}
```

## Django

```bash
python manage.py makemigrations
python manage.py migrate
python manage.py showmigrations
```

Data migration:
```python
def backfill_display_names(apps, schema_editor):
    User = apps.get_model("accounts", "User")
    batch_size = 5000
    users = User.objects.filter(display_name="")
    while users.exists():
        batch = list(users[:batch_size])
        for user in batch:
            user.display_name = user.username
        User.objects.bulk_update(batch, ["display_name"], batch_size=batch_size)
```

## golang-migrate

```bash
migrate create -ext sql -dir migrations -seq add_user_avatar
migrate -path migrations -database "$DATABASE_URL" up
migrate -path migrations -database "$DATABASE_URL" down 1
```

## Zero-Downtime Strategy (Expand-Contract)

```
Phase 1: EXPAND    — Add new column/table (nullable or with default)
                     Deploy: app writes to BOTH old and new
                     Backfill existing data

Phase 2: MIGRATE   — Deploy: app reads from NEW, writes to BOTH
                     Verify data consistency

Phase 3: CONTRACT  — Deploy: app only uses NEW
                     Drop old column/table in separate migration
```

## Anti-Patterns

| Anti-Pattern | Why It Fails | Better Approach |
|-------------|-------------|-----------------|
| Manual SQL in production | No audit trail, unrepeatable | Always use migration files |
| Editing deployed migrations | Causes drift between environments | Create new migration instead |
| NOT NULL without default | Locks table, rewrites all rows | Add nullable, backfill, then add constraint |
| Inline index on large table | Blocks writes during build | CREATE INDEX CONCURRENTLY |
| Schema + data in one migration | Hard to rollback, long transactions | Separate migrations |
| Dropping column before removing code | Application errors on missing column | Remove code first, drop column next deploy |
