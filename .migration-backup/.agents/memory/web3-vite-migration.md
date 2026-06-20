---
name: Web3 Vite migration patterns
description: Key patterns when migrating wagmi/RainbowKit from Next.js to Vite
---

# Web3 Next.js → Vite migration

## Rules

- `wagmiConfig` must use `ssr: false` (Vite is CSR only, not SSR like Next.js)
- Replace `process.env.NEXT_PUBLIC_*` with `import.meta.env.VITE_*`
- Remove `<style jsx>` tags — use regular CSS keyframes in index.css instead
- `"use client"` directives are harmless in Vite (treated as comments)
- wagmi v2 peer dep warning with React 19 (`use-sync-external-store` expects ^18) is benign — app works fine

**Why:** Vite is a pure client-side renderer; SSR-specific Next.js patterns fail silently or throw in Vite context.

**How to apply:** Any time wagmi/RainbowKit is added to a Vite artifact migrated from Next.js.
