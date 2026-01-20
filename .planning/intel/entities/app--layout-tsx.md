---
source: /root/wks/stream-gen-ui/app/layout.tsx
indexed: 2026-01-20T00:00:00.000Z
---

# layout.tsx

## Purpose

Root layout component for the Next.js application that sets up global HTML structure, font loading (Geist Sans and Mono), metadata, and wraps all pages with the ViewRawProvider context. Establishes the foundational styling and state management for the entire application.

## Exports

| Name | Type | Purpose |
|------|------|---------|
| metadata | const (Metadata) | Next.js metadata object with title and description for SEO |
| default (RootLayout) | function (React component) | Root layout component that wraps all pages |

## Dependencies

| Import | Purpose |
|--------|---------|
| Metadata (next) | TypeScript type for Next.js metadata export |
| Geist, Geist_Mono (next/font/google) | Google font loaders for application typography |
| ViewRawProvider (@/contexts/ViewRawContext) | Context provider for "View Raw" toggle state |
| cn (@/lib/utils) | Utility for merging Tailwind CSS classes |
| ./globals.css | Global CSS styles including Tailwind directives |

## Used By

Entry point - This is the Next.js root layout. All pages are rendered as children of this component.
