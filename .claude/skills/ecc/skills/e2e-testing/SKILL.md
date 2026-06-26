---
name: e2e-testing
description: Playwright E2E testing patterns, Page Object Model, configuration, CI/CD integration, artifact management, and flaky test strategies.
metadata:
  origin: ECC
---

# E2E Testing Patterns

Comprehensive Playwright patterns for building stable, fast, and maintainable E2E test suites.

## Test File Organization

```
tests/
├── e2e/
│   ├── auth/login.spec.ts
│   ├── features/search.spec.ts
│   └── api/endpoints.spec.ts
├── fixtures/auth.ts
└── playwright.config.ts
```

## Page Object Model (POM)

```typescript
import { Page, Locator } from '@playwright/test'

export class ItemsPage {
  readonly searchInput: Locator
  readonly itemCards: Locator

  constructor(readonly page: Page) {
    this.searchInput = page.locator('[data-testid="search-input"]')
    this.itemCards = page.locator('[data-testid="item-card"]')
  }

  async goto() {
    await this.page.goto('/items')
    await this.page.waitForLoadState('networkidle')
  }

  async search(query: string) {
    await this.searchInput.fill(query)
    await this.page.waitForResponse(resp => resp.url().includes('/api/search'))
    await this.page.waitForLoadState('networkidle')
  }
}
```

## Test Structure

```typescript
import { test, expect } from '@playwright/test'

test.describe('Item Search', () => {
  test('should search by keyword', async ({ page }) => {
    const itemsPage = new ItemsPage(page)
    await itemsPage.goto()
    await itemsPage.search('test')

    const count = await itemsPage.itemCards.count()
    expect(count).toBeGreaterThan(0)
    await expect(itemsPage.itemCards.first()).toContainText(/test/i)
  })
})
```

## Playwright Configuration

```typescript
import { defineConfig, devices } from '@playwright/test'

export default defineConfig({
  testDir: './tests/e2e',
  fullyParallel: true,
  forbidOnly: !!process.env.CI,
  retries: process.env.CI ? 2 : 0,
  reporter: [['html'], ['junit', { outputFile: 'results.xml' }]],
  use: {
    baseURL: process.env.BASE_URL || 'http://localhost:3000',
    trace: 'on-first-retry',
    screenshot: 'only-on-failure',
    video: 'retain-on-failure',
    actionTimeout: 10000,
  },
  projects: [
    { name: 'chromium', use: { ...devices['Desktop Chrome'] } },
    { name: 'mobile-chrome', use: { ...devices['Pixel 5'] } },
  ],
  webServer: {
    command: 'npm run dev',
    url: 'http://localhost:3000',
    reuseExistingServer: !process.env.CI,
  },
})
```

## Flaky Test Patterns

### Common Causes & Fixes

```typescript
// BAD: Arbitrary timeout
await page.waitForTimeout(5000)

// GOOD: Wait for specific condition
await page.waitForResponse(resp => resp.url().includes('/api/data'))

// BAD: Click during animation
await page.click('[data-testid="menu-item"]')

// GOOD: Wait for stability
await page.locator('[data-testid="menu-item"]').waitFor({ state: 'visible' })
await page.waitForLoadState('networkidle')
await page.locator('[data-testid="menu-item"]').click()
```

### Quarantine Flaky Tests

```typescript
test('flaky: complex search', async ({ page }) => {
  test.fixme(true, 'Flaky - Issue #123')
  // test code...
})

// Identify flakiness
// npx playwright test tests/search.spec.ts --repeat-each=10
```

## CI/CD Integration

```yaml
name: E2E Tests
on: [push, pull_request]
jobs:
  test:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - uses: actions/setup-node@v4
        with: { node-version: 20 }
      - run: npm ci
      - run: npx playwright install --with-deps
      - run: npx playwright test
        env: { BASE_URL: ${{ vars.STAGING_URL }} }
      - uses: actions/upload-artifact@v4
        if: always()
        with:
          name: playwright-report
          path: playwright-report/
          retention-days: 30
```
