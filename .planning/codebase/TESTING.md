# Testing Patterns

**Analysis Date:** 2026-01-20

## Test Framework

**Runner:**
- Vitest 4.0.17
- Config: `vitest.config.ts`

**Assertion Library:**
- Vitest built-in assertions (via `expect`)
- React Testing Library matchers (via `@testing-library/jest-dom` integration)

**Run Commands:**
```bash
npm test              # Run all tests once
npm run test:watch   # Watch mode (rebuilds on file changes)
```

**Setup:**
- Environment: `jsdom` (browser-like DOM simulation)
- Global test functions enabled: `describe`, `it`, `expect` available without imports
- Setup file: `vitest.setup.ts` imports `@testing-library/jest-dom/vitest` for extended matchers
- Path alias support: `@/` maps to project root in tests

## Test File Organization

**Location:**
- Co-located with source files
- Same directory as the component being tested
- Pattern: `ComponentName.test.tsx` in same folder as `ComponentName.tsx`

**Examples:**
- `components/shared/MessageBubble.tsx` → `components/shared/MessageBubble.test.tsx`
- `components/flowtoken/FlowTokenRenderer.tsx` → `components/flowtoken/FlowTokenRenderer.test.tsx`
- `contexts/ViewRawContext.tsx` → `contexts/ViewRawContext.test.tsx`

**Naming:**
- `.test.tsx` suffix for React component tests
- Matches component filename exactly

**Current Coverage:**
- 16 test files in codebase
- All major components have corresponding test files
- Comprehensive coverage of components, contexts, and rendering logic

## Test Structure

**Suite Organization:**
```typescript
import { render, screen, fireEvent } from '@testing-library/react';
import { describe, expect, it, vi, beforeEach } from 'vitest';

import { ComponentName } from './ComponentName';

describe('ComponentName', () => {
  describe('user messages', () => {
    it('renders user message with blue background', () => {
      render(<ComponentName role="user" content="Hello" />);
      const element = screen.getByText('Hello').closest('div');
      expect(element).toHaveClass('bg-blue-500');
    });
  });

  describe('assistant messages', () => {
    it('renders assistant message with light gray background', () => {
      render(<ComponentName role="assistant" content="Hi" />);
      // test assertion
    });
  });
});
```

**Patterns:**
- Nested `describe` blocks for logical grouping by feature/role (user messages, assistant messages, accessibility, etc.)
- Each `it` block tests one specific behavior or assertion
- Setup/teardown using `beforeEach` for test preparation (seen in `MessageBubble.test.tsx` line 157)

## Mocking

**Framework:** Vitest `vi` module

**Patterns:**
```typescript
// Module mocking with vi.mock()
vi.mock('@/contexts/ViewRawContext', () => ({
  useViewRaw: () => mockViewRaw,
}));

// Function mocking
const mockViewRaw = { viewRaw: false, setViewRaw: vi.fn() };
```

**Advanced Mocking Example (FlowTokenRenderer.test.tsx):**
```typescript
vi.mock('flowtoken', () => ({
  AnimatedMarkdown: vi.fn(({ content, animation, customComponents }) => {
    // Implement mock behavior with conditional rendering
    // Parse XML tags and pass to custom components
    // Return JSX for testing
  }),
}));
```

**What to Mock:**
- External library components that aren't being tested (`flowtoken`, `streamdown`)
- Context hooks when testing components that use them
- Complex dependencies that would slow down tests
- API calls or async operations

**What NOT to Mock:**
- The component being tested (test the real implementation)
- React internals (Testing Library handles React integration)
- Simple props/state values (test with real values)
- Built-in DOM APIs (jsdom provides these)

## Fixtures and Factories

**Test Data:**
```typescript
// Simple test content in test files
const multiline = "Line 1\nLine 2\nLine 3";
const content = `Here is contact info:

<contactcard name="John Smith" email="john@example.com" phone="+1-555-123-4567"></contactcard>

More text after.`;
```

**Test Consumer Components:**
```typescript
// Helper component for context testing (ViewRawContext.test.tsx)
function TestConsumer(): React.ReactElement {
  const { viewRaw, setViewRaw } = useViewRaw();
  return (
    <div>
      <span data-testid="view-raw-value">{viewRaw ? 'ON' : 'OFF'}</span>
      <button onClick={() => setViewRaw(true)}>Turn On</button>
    </div>
  );
}
```

**Location:**
- Inline in test files; no separate fixtures directory
- Test data created as needed within test blocks or helper functions
- Mock implementations defined at top of test file before `describe` blocks

## Coverage

**Requirements:** Not enforced (no coverage threshold configured)

**View Coverage:**
```bash
# Coverage reporting not explicitly configured; run tests with coverage flag if needed
npm test -- --coverage
```

## Test Types

**Unit Tests:**
- Scope: Individual component rendering and behavior
- Approach: Use `render()` from React Testing Library, query elements via `screen`, assert with `.expect()`
- Examples: `MessageBubble.test.tsx` tests various prop combinations and styling
- Frequency: Most tests (majority of 16 test files)

**Component Behavior Tests:**
- Scope: Props, state changes, event handling
- Approach: `fireEvent` for user interactions; mocks for isolated context testing
- Example: `ViewRawContext.test.tsx` line 42-43 uses `fireEvent.click()` to test state updates
- Event patterns: Click handlers, input changes, form submissions

**Integration Tests:**
- Scope: Context providers with multiple consumers
- Approach: Render provider wrapping multiple consumer components; verify shared state
- Example: `ViewRawContext.test.tsx` lines 70-111 tests state sharing between multiple consumers in same provider

**Accessibility Tests:**
- Scope: ARIA attributes, roles, semantic HTML
- Approach: Query by `role` attribute (e.g., `getByRole('article')`, `getByRole('form')`)
- Patterns: Verify `aria-label`, `aria-checked`, semantic roles
- Example: `MessageBubble.test.tsx` lines 137-153 test article role and aria-labels

**Error Boundary Tests:**
- Approach: Mock componentDidCatch, verify fallback rendering
- Not explicitly covered in current tests (error boundaries tested implicitly through component tests)

## Common Patterns

**Async Testing:**
```typescript
// Vitest with fireEvent (synchronous)
fireEvent.click(screen.getByTestId('toggle'));
expect(screen.getByTestId('view-raw-value')).toHaveTextContent('ON');

// For actual async operations (if needed)
// import { waitFor } from '@testing-library/react'
// await waitFor(() => { expect(...).toBeDefined() })
```

**Error Testing:**
```typescript
// Error throwing from hooks outside provider
it('throws error when used outside provider', () => {
  const originalError = console.error;
  console.error = () => {}; // Suppress expected error output

  expect(() => {
    render(<TestConsumer />);
  }).toThrow('useViewRaw must be used within a ViewRawProvider');

  console.error = originalError;
});
```

**Querying Patterns:**
- `screen.getByText(content)` - Find by text content
- `screen.getByRole(role)` - Find by semantic role (preferred for accessibility)
- `screen.getByTestId(id)` - Find by data-testid attribute
- `screen.queryByRole(role)` - Query that returns null if not found (use for negative assertions)
- `.closest('div')` - Navigate up DOM tree to parent element

**Assertion Patterns:**
```typescript
// DOM matchers from jest-dom
expect(element).toHaveClass('className');
expect(element).toHaveAttribute('name', 'value');
expect(element).toBeInTheDocument();
expect(element).not.toBeInTheDocument();
expect(element).toHaveTextContent('text');
expect(screen.getByText(...)).toBeInTheDocument();
```

**Custom Text Matchers:**
```typescript
// Matcher function for complex text matching
expect(
  screen.getByText((content) => content.includes('Line 1') && content.includes('Line 2'))
).toBeInTheDocument();
```

**Mock Reset Patterns:**
```typescript
beforeEach(() => {
  // Reset mock state before each test
  mockViewRaw.viewRaw = false;
  vi.clearAllMocks(); // Optional: clear all mock calls
});
```

## Testing Best Practices Used

1. **Test user behavior, not implementation details** - Tests use `screen` queries and event simulation
2. **Arrange-Act-Assert** - Tests follow clear setup → action → verification pattern
3. **Descriptive test names** - Each `it()` describes the expected behavior
4. **Mocking dependencies** - External libs mocked; tested component rendered real
5. **Data attributes for querying** - Components use `data-testid` for reliable test selectors
6. **Accessibility-focused** - Tests prefer querying by role and semantic HTML

---

*Testing analysis: 2026-01-20*
