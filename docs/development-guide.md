# Development Guide

## Prerequisites

- **Node.js:** 20+ (LTS recommended)
- **npm:** 10+
- **Git:** For version control

## Installation

```bash
# Clone the repository
git clone <repository-url>
cd stream-gen-ui

# Install dependencies
npm install
```

## Development Server

```bash
# Start development server
npm run dev

# Server runs at http://localhost:3000
```

**Default Route:** `/` redirects to `/flowtoken`

**Available Routes:**
| Route | Implementation |
|-------|---------------|
| `/flowtoken` | FlowToken (XML-based) |
| `/llm-ui` | llm-ui (delimiter-based) |
| `/streamdown` | Streamdown (custom XML) |

## Scripts

```bash
npm run dev        # Start development server (Next.js)
npm run build      # Production build
npm run start      # Start production server
npm run lint       # Run ESLint
npm run test       # Run Vitest tests (single run)
npm run test:watch # Run Vitest in watch mode
```

## Project Structure

```
stream-gen-ui/
├── app/                 # Next.js App Router pages and API
├── components/          # React components
│   ├── shared/          # Reusable components
│   ├── flowtoken/       # FlowToken renderer
│   ├── llm-ui/          # llm-ui renderer
│   └── streamdown/      # Streamdown renderer
├── contexts/            # React Context providers
├── lib/                 # Utilities and helpers
├── types/               # TypeScript type definitions
└── public/              # Static assets
```

## Environment Variables

**None required.** The application uses mock data for demonstrations.

## Testing

### Running Tests

```bash
# Run all tests once
npm run test

# Run tests in watch mode
npm run test:watch
```

### Test Structure

Tests are co-located with source files:
- `components/shared/*.test.tsx` - Component tests
- `lib/*.test.ts` - Utility tests
- `app/api/chat/route.test.ts` - API tests

### Testing Conventions

```typescript
// Import testing utilities
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, it, expect, vi } from 'vitest';

// Test structure
describe('ComponentName', () => {
  it('renders correctly', () => {
    render(<Component prop="value" />);
    expect(screen.getByRole('button')).toBeInTheDocument();
  });

  it('handles user interaction', async () => {
    const user = userEvent.setup();
    const mockFn = vi.fn();
    render(<Component onClick={mockFn} />);
    await user.click(screen.getByRole('button'));
    expect(mockFn).toHaveBeenCalled();
  });
});
```

## Code Style

### TypeScript

- Strict mode enabled
- All components use explicit return types
- Props interfaces defined in `types/index.ts`

### Imports

```typescript
// React imports first
import { useState, useCallback, useMemo } from 'react';
import type { ReactElement, FormEvent } from 'react';

// External libraries
import { useChat } from '@ai-sdk/react';

// Internal components (use @/ alias)
import { Header } from '@/components/shared/Header';
import { cn } from '@/lib/utils';
import type { ContactCardProps } from '@/types';
```

### Component Structure

```typescript
// Interface first
export interface ComponentProps {
  prop: string;
  optionalProp?: boolean;
}

// Export component
export function Component({
  prop,
  optionalProp = false,
}: ComponentProps): ReactElement {
  // Hooks
  const [state, setState] = useState(false);
  const memoizedValue = useMemo(() => compute(prop), [prop]);
  const callback = useCallback(() => setState(true), []);

  // Render
  return (
    <div className="...">
      {/* ... */}
    </div>
  );
}
```

### Styling

- Use Tailwind CSS utility classes
- Use `cn()` helper for conditional classes
- Follow responsive-first approach

```typescript
import { cn } from '@/lib/utils';

<div
  className={cn(
    'base-classes',
    isActive && 'active-classes',
    isDisabled && 'disabled-classes'
  )}
>
```

## Adding New Components

### Shared Component

1. Create file in `components/shared/`
2. Add props interface to `types/index.ts`
3. Create co-located test file
4. Import using `@/` alias

### Implementation Renderer

1. Create renderer in `components/{implementation}/`
2. Add error boundary wrapper
3. Use `React.memo` for streaming performance
4. Accept `content` and `isStreaming` props

## Common Tasks

### Adding a New Custom Component

1. **Define props interface** in `types/index.ts`:
```typescript
export interface NewComponentProps {
  field1: string;
  field2?: number;
}
```

2. **Create component** in `components/shared/`:
```typescript
export function NewComponent({ field1, field2 }: NewComponentProps): ReactElement {
  return <div>...</div>;
}
```

3. **Add to renderers**:

FlowToken:
```typescript
customComponents={{
  newcomponent: NewComponent,
}}
```

llm-ui:
```typescript
const newComponentBlock = createBlockMatcher('NEWCOMPONENT', NewComponent);
// Add to blocks array in useLLMOutput
```

Streamdown:
```typescript
// Add to parseContent() regex and rendering logic
```

4. **Add test content** in `lib/test-content.ts`

### Adding a New Content Preset

1. Add keyword mapping in `PRESET_KEYWORDS`:
```typescript
['keyword', 'preset_name'],
```

2. Add content for each format:
```typescript
const FLOWTOKEN_PRESET_NAME = `...`;
const LLM_UI_PRESET_NAME = `...`;
```

3. Add to preset maps:
```typescript
const FLOWTOKEN_PRESETS: Record<PresetKey, string> = {
  preset_name: FLOWTOKEN_PRESET_NAME,
  // ...
};
```

4. Update `PresetOption` array in `PresetSelector.tsx` if adding UI button

## Troubleshooting

### Port 3000 in use
```bash
npm run dev -- -p 3001
```

### Module not found
```bash
rm -rf node_modules
npm install
```

### TypeScript errors
```bash
npm run lint
npx tsc --noEmit
```

### Test failures
```bash
npm run test -- --reporter=verbose
```

## Deployment

See `README.md` for Vercel deployment instructions.

**Quick deploy:**
```bash
# Install Vercel CLI
npm i -g vercel

# Deploy
vercel

# Deploy to production
vercel --prod
```
