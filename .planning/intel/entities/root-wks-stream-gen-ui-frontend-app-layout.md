---
path: /root/wks/stream-gen-ui/frontend/app/layout.tsx
type: component
updated: 2026-01-21
status: active
---

# layout.tsx

## Purpose

Root layout component for the Next.js application that configures global fonts (Geist Sans and Geist Mono), metadata, and wraps the app with context providers. Serves as the top-level layout wrapper for all pages.

## Exports

- **metadata**: Metadata object containing page title "stream-gen-ui" and description about streaming UI comparison
- **RootLayout** (default): Root layout component that renders HTML structure with font variables, ViewRawProvider context, and Toaster for notifications

## Dependencies

- next/font/google (Geist, Geist_Mono fonts)
- sonner (Toaster component)
- [[view-raw-context]] (@/contexts/ViewRawContext)
- [[utils]] (@/lib/utils - cn function)
- ./globals.css

## Used By

TBD

## Notes

- Uses CSS variable approach for fonts (--font-geist-sans, --font-geist-mono)
- ViewRawProvider wraps entire application for global raw view state management
- Toaster from sonner is imported but not rendered in the layout (may need to be added)