# Phase 1: Frontend Reorganization - Research

**Researched:** 2026-01-20
**Domain:** Next.js 16 Project Restructuring & Monorepo Preparation
**Confidence:** HIGH

## Summary

Moving a Next.js 16 project into a subdirectory is a well-established pattern for monorepo organization and frontend/backend separation. The standard approach keeps configuration files (package.json, next.config.ts, tsconfig.json) at the repository root while moving application code (app/, components/, lib/, etc.) into a frontend/ subdirectory.

This reorganization requires coordinated updates to multiple configuration files: TypeScript path aliases, build tool configurations (Vitest), and CSS processing (Tailwind). Next.js itself has no special configuration for subdirectory structure - the framework is designed to work from any location as long as configuration files reference the correct paths.

The primary risk is incomplete path updates leading to broken imports or build failures. The benefit is clean separation that prepares for future backend integration without mixing concerns.

**Primary recommendation:** Move frontend code in a single atomic operation with all configuration updates applied simultaneously, verify with build and test runs before committing.

## Standard Stack

The established libraries/tools for Next.js monorepo organization:

### Core
| Library | Version | Purpose | Why Standard |
|---------|---------|---------|--------------|
| Next.js | 16.x | Frontend framework | App Router is the current standard (replaces Pages Router) |
| TypeScript | 5.x | Type safety and path aliases | Required for @/* path resolution |
| npm/pnpm/yarn | Latest | Package management | npm scripts handle working directory automatically |

### Supporting
| Library | Version | Purpose | When to Use |
|---------|---------|---------|-------------|
| Turborepo | Latest | Monorepo build orchestration | Optional for Phase 1, recommended when adding backend |
| vite-tsconfig-paths | Latest | Test path alias support | Required for Vitest when using @/* imports |

### Alternatives Considered
| Instead of | Could Use | Tradeoff |
|------------|-----------|----------|
| Root configs with npm --prefix | Nested package.json | More complex dependency management, harder to share types |
| @/* aliases | Relative imports | More verbose, breaks on file moves, harder to refactor |
| Manual Vitest aliases | vite-tsconfig-paths plugin | Duplicates tsconfig.json, harder to maintain |

**Installation:**
```bash
# No new packages required for Phase 1
# vite-tsconfig-paths already in devDependencies (check if installed)
npm install --save-dev vite-tsconfig-paths  # Only if not already present
```

## Architecture Patterns

### Recommended Project Structure
```
stream-gen-ui/
├── frontend/                    # Next.js application (moved from root)
│   ├── app/                     # App Router pages and API routes
│   ├── components/              # React components
│   ├── contexts/                # React contexts
│   ├── lib/                     # Utilities
│   ├── types/                   # TypeScript types
│   ├── public/                  # Static assets
│   └── vitest.setup.ts          # Test setup
├── .planning/                   # Project planning (stays at root)
├── .claude/                     # Claude config (stays at root)
├── package.json                 # Dependencies (stays at root)
├── tsconfig.json                # TypeScript config (stays at root, updated)
├── next.config.ts               # Next.js config (stays at root)
├── vitest.config.ts             # Vitest config (stays at root, updated)
├── eslint.config.mjs            # ESLint config (stays at root)
├── postcss.config.mjs           # PostCSS config (stays at root)
└── .gitignore                   # Git ignores (stays at root, updated)
```

### Pattern 1: Configuration at Root, Code in Subdirectory
**What:** Keep all tool configuration files at repository root, move only source code
**When to use:** Monorepo preparation, frontend/backend separation
**Why:**
- npm scripts run from package.json location by default
- Easier to add backend/ sibling directory later
- Simpler deployment configuration
- Standard monorepo convention

**Example:**
```json
// package.json (stays at root)
{
  "scripts": {
    "dev": "next dev",           // Next.js finds frontend/ automatically
    "build": "next build",        // via tsconfig.json baseUrl
    "test": "vitest run"
  }
}
```

### Pattern 2: Path Alias Updates
**What:** Update @/* alias to point to frontend/ subdirectory
**When to use:** Always when moving Next.js to subdirectory
**Why:** Preserves existing import statements, avoids mass refactoring

**Example:**
```json
// tsconfig.json
{
  "compilerOptions": {
    "baseUrl": ".",                    // Root of repository
    "paths": {
      "@/*": ["./frontend/*"]           // Updated from "./*"
    }
  },
  "include": [
    "frontend/next-env.d.ts",          // Updated from "next-env.d.ts"
    "frontend/**/*.ts",                // Updated from "**/*.ts"
    "frontend/**/*.tsx",               // Updated from "**/*.tsx"
    // ... other patterns
  ]
}
```

### Pattern 3: Next.js Working Directory Configuration
**What:** Next.js CLI automatically uses directory containing app/ or pages/
**When to use:** Always for subdirectory organization
**Why:** No special next.config.ts changes needed

**Note:** Next.js 16 does NOT require basePath configuration for subdirectory structure. The basePath option is only for deploying under a URL path like /blog or /docs, not for file system organization.

**Source:** [Next.js basePath documentation](https://nextjs.org/docs/app/api-reference/config/next-config-js/basePath)

### Pattern 4: Test Configuration Alignment
**What:** Vitest must resolve same paths as TypeScript
**When to use:** Any project using Vitest with path aliases
**Why:** Test imports fail without matching resolution

**Example:**
```typescript
// vitest.config.ts
import react from '@vitejs/plugin-react';
import { resolve } from 'path';
import { defineConfig } from 'vitest/config';

export default defineConfig({
  plugins: [react()],
  test: {
    environment: 'jsdom',
    globals: true,
    setupFiles: ['./frontend/vitest.setup.ts'],  // Updated path
  },
  resolve: {
    alias: {
      '@': resolve(__dirname, './frontend'),     // Updated from './'
    },
  },
});
```

**Alternative (Recommended):**
```typescript
// vitest.config.ts with vite-tsconfig-paths
import react from '@vitejs/plugin-react';
import tsconfigPaths from 'vite-tsconfig-paths';
import { defineConfig } from 'vitest/config';

export default defineConfig({
  plugins: [
    react(),
    tsconfigPaths()  // Auto-reads tsconfig.json paths
  ],
  test: {
    environment: 'jsdom',
    globals: true,
    setupFiles: ['./frontend/vitest.setup.ts'],
  },
});
```

### Anti-Patterns to Avoid

- **Moving config files to subdirectory:** Keep package.json, tsconfig.json, next.config.ts at root for simpler monorepo setup
- **Using npm --prefix in scripts:** Unnecessary - Next.js finds code via tsconfig paths
- **Splitting configuration updates:** Apply all path changes atomically to avoid broken intermediate states
- **Forgetting .gitignore updates:** Build artifacts like .next/ need path updates too
- **Partial migration:** Move all frontend code at once, not incrementally

## Don't Hand-Roll

Problems that look simple but have existing solutions:

| Problem | Don't Build | Use Instead | Why |
|---------|-------------|-------------|-----|
| Path alias resolution in tests | Manual Vitest alias config | vite-tsconfig-paths plugin | Syncs automatically with tsconfig.json, prevents drift |
| Monorepo task orchestration | Custom shell scripts | Turborepo (later phases) | Handles caching, parallelization, dependency graphs |
| Build directory configuration | Custom next.config.ts distDir | Standard .next/ location | Deployment tools expect defaults |
| Import path updates | Manual find/replace | Keep @/* aliases working | Aliases survive file moves, relative imports don't |

**Key insight:** Next.js is designed for flexibility - the less you configure, the better. Default conventions (like .next/ build output location) work with deployment platforms and tooling.

## Common Pitfalls

### Pitfall 1: Incomplete TypeScript Configuration Updates
**What goes wrong:** Build succeeds but IDE shows errors, or vice versa
**Why it happens:** tsconfig.json has multiple path-related settings that must all be updated together
**How to avoid:**
- Update compilerOptions.paths["@/*"]
- Update include array patterns
- Verify with `tsc --noEmit`
**Warning signs:**
- Red squiggles in VS Code for working imports
- "Cannot find module" errors in different contexts

### Pitfall 2: Forgetting Vitest Setup File Path
**What goes wrong:** Tests fail with "setup file not found"
**Why it happens:** vitest.config.ts setupFiles path still points to root
**How to avoid:** Update setupFiles to './frontend/vitest.setup.ts'
**Warning signs:** Test runner can't initialize, imports in tests work but setup fails

### Pitfall 3: .gitignore Path Specificity
**What goes wrong:** Build artifacts tracked in git or CI/CD breaks
**Why it happens:** Patterns like /.next/ are root-specific
**How to avoid:**
- Keep patterns as relative: .next/ not /.next/
- Or update to frontend/.next/ for specificity
**Warning signs:**
- Git shows .next/ changes
- Deployment fails with "build output not found"

### Pitfall 4: ESLint Configuration Ignores
**What goes wrong:** ESLint fails on build output or complains about missing files
**Why it happens:** globalIgnores patterns need path updates
**How to avoid:** Update ignore patterns to match new structure
**Warning signs:** CI lint stage errors, build output getting linted

### Pitfall 5: Mock API Route Confusion
**What goes wrong:** Uncertainty whether to keep app/api/chat in frontend
**Why it happens:** API routes are typically backend, but this is a mock for demo
**How to avoid:**
- Keep mock API in frontend/ for Phase 1
- It will be replaced entirely when real backend is added
- Document as temporary in code comments
**Warning signs:** Premature backend work, scope creep

### Pitfall 6: Documentation Path Staleness
**What goes wrong:** Developer docs reference old paths, causing confusion
**Why it happens:** Documentation lives in separate files not caught by compiler
**How to avoid:**
- Grep all .md files for old paths
- Update .planning/codebase/*.md files
- Update docs/*.md files
**Warning signs:** New developers can't find files, onboarding confusion

### Pitfall 7: CSS Import Path in Tailwind Config
**What goes wrong:** Tailwind classes don't apply, build output missing styles
**Why it happens:** postcss.config.mjs doesn't need updates BUT if there's a tailwind.config.js it does
**How to avoid:** Check for tailwind.config.js/ts and update content paths
**Warning signs:** No styling in development, "class not found" warnings

**Note:** Current project uses Tailwind CSS v4 with @tailwindcss/postcss plugin which doesn't require a separate tailwind.config file. The @import "tailwindcss" directive in globals.css auto-discovers all files. No configuration update needed for Tailwind.

## Code Examples

Verified patterns from official sources:

### Moving to src/ Subdirectory (Official Next.js Pattern)
```bash
# Source: https://nextjs.org/docs/app/api-reference/file-conventions/src-folder
# Move app directory to src
mv app src/app
mv components src/components
mv lib src/lib
# etc.

# Update tsconfig.json
{
  "compilerOptions": {
    "paths": {
      "@/*": ["./src/*"]
    }
  }
}
```

**Adaptation for frontend/ directory:**
```bash
# Create frontend directory
mkdir frontend

# Move application code
mv app frontend/
mv components frontend/
mv contexts frontend/
mv lib frontend/
mv types frontend/
mv public frontend/
mv vitest.setup.ts frontend/

# Update tsconfig.json
{
  "compilerOptions": {
    "paths": {
      "@/*": ["./frontend/*"]
    }
  },
  "include": [
    "frontend/next-env.d.ts",
    "frontend/**/*.ts",
    "frontend/**/*.tsx",
    "frontend/**/*.mts",
    ".next/types/**/*.ts",
    ".next/dev/types/**/*.ts"
  ]
}
```

### TypeScript Path Alias Configuration
```json
// Source: https://nextjs.org/docs/13/app/building-your-application/configuring/absolute-imports-and-module-aliases
{
  "compilerOptions": {
    "baseUrl": ".",
    "paths": {
      "@/*": ["./frontend/*"],
      "@components/*": ["./frontend/components/*"],  // Optional specific aliases
      "@lib/*": ["./frontend/lib/*"]
    }
  }
}
```

### Vitest Configuration with vite-tsconfig-paths
```typescript
// Source: https://nextjs.org/docs/app/guides/testing/vitest
import react from '@vitejs/plugin-react'
import tsconfigPaths from 'vite-tsconfig-paths'
import { defineConfig } from 'vitest/config'

export default defineConfig({
  plugins: [react(), tsconfigPaths()],
  test: {
    environment: 'jsdom',
  },
})
```

### Package.json Scripts (No Changes Needed)
```json
// Source: Next.js automatically finds app/ directory via tsconfig
{
  "scripts": {
    "dev": "next dev",      // Finds frontend/app via tsconfig baseUrl + paths
    "build": "next build",
    "start": "next start",
    "lint": "eslint",
    "test": "vitest run"
  }
}
```

## State of the Art

| Old Approach | Current Approach | When Changed | Impact |
|--------------|------------------|--------------|--------|
| Pages Router | App Router | Next.js 13+ (2023) | This project already uses App Router, no migration needed |
| baseUrl without paths | baseUrl + paths | TypeScript 4.1+ | More flexible, @/* works without baseUrl: "src" |
| Manual Vitest aliases | vite-tsconfig-paths plugin | 2024+ | Single source of truth for path resolution |
| Monorepo with Lerna | Turborepo | 2022+ | Better performance, official Vercel recommendation |
| next.config.js | next.config.ts | Next.js 15+ | TypeScript config files now standard |
| Tailwind v3 config file | Tailwind v4 @import | Tailwind CSS v4 (2024) | Config-free by default, auto-discovery |

**Deprecated/outdated:**
- **Pages Router (`pages/` directory):** Still supported but App Router is the future
- **baseUrl: "src"** without paths: Works but paths object is more explicit
- **Separate tailwind.config.js with v4:** Not needed, @import "tailwindcss" in CSS is sufficient

## Open Questions

None - all research domains were successfully investigated with HIGH confidence sources.

## Sources

### Primary (HIGH confidence)
- [Next.js Official: Project Structure](https://nextjs.org/docs/app/getting-started/project-structure) - Required configuration files
- [Next.js Official: src Directory](https://nextjs.org/docs/app/api-reference/file-conventions/src-folder) - Moving app to subdirectory
- [Next.js Official: Absolute Imports and Module Path Aliases](https://nextjs.org/docs/13/app/building-your-application/configuring/absolute-imports-and-module-aliases) - TypeScript path configuration
- [Next.js Official: Vitest Testing](https://nextjs.org/docs/app/guides/testing/vitest) - vite-tsconfig-paths usage
- [Next.js Official: basePath Config](https://nextjs.org/docs/app/api-reference/config/next-config-js/basePath) - Confirms basePath is for URL paths, not file structure

### Secondary (MEDIUM confidence)
- [A Simple Monorepo Setup with Next.js and Express.js](https://medium.com/@serdar.ulutas/a-simple-monorepo-setup-with-next-js-and-express-js-4bbe0e99b259) - Real-world monorepo pattern
- [How to Build a Monorepo with Next.js](https://dev.to/rajeshnatarajan/how-to-build-a-monorepo-with-nextjs-3ljg) - Turborepo integration patterns
- [Migrating a Large-Scale Monorepo from Next.js 14 to 16](https://dev.to/abhilashlr/migrating-a-large-scale-monorepo-from-nextjs-14-to-16-a-real-world-journey-5383) - Next.js 16 migration experience
- [Setting Up Vitest to Support TypeScript Path Aliases](https://www.timsanteford.com/posts/setting-up-vitest-to-support-typescript-path-aliases/) - vite-tsconfig-paths configuration
- [10 Mistakes I Made While Learning Next.js](https://dev.to/raajaryan/10-mistakes-i-made-while-learning-nextjs-so-you-dont-have-to-96i) - Common pitfalls
- [Next.js Best Practices in 2025](https://medium.com/@GoutamSingha/next-js-best-practices-in-2025-build-faster-cleaner-scalable-apps-7efbad2c3820) - Current best practices

### Tertiary (LOW confidence)
- WebSearch results for "Next.js monorepo 2026" - Multiple sources confirming Turborepo remains standard
- GitHub discussions on npm working directory behavior - Community knowledge, not authoritative

## Metadata

**Confidence breakdown:**
- Standard stack: HIGH - Official Next.js docs confirm all patterns
- Architecture: HIGH - Multiple verified sources agree on structure
- Pitfalls: HIGH - Derived from official docs and verified migration guides
- Tailwind CSS v4: HIGH - Current project uses v4, no config file present

**Research date:** 2026-01-20
**Valid until:** 2026-02-20 (30 days - stable Next.js patterns)
**Next.js version researched:** 16.x (current project version)
**TypeScript version researched:** 5.x (current project version)
