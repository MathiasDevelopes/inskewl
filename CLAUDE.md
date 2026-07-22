# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

**inskewl** is a browser userscript (Violetmonkey/Tampermonkey) that adds quality-of-life features to VIS InSchool — a Norwegian school management system at `https://*.inschool.visma.no/*`. It is written in TypeScript, bundled to an IIFE with Rollup, and distributed as a `.user.js` file.

## Commands

```bash
npm run build   # Build dist/inskewl.user.js
npm run dev     # Rebuild on file changes (watch mode)
```

There is no lint or test runner configured. API schemas can be tested at runtime by calling `window.testAllApiSchemas()` in the browser console after installing the script.

## Architecture

### Module System (`src/modules/core/`)

The core of the project is a plugin system built around URL-based lifecycle management:

- **`VismaModule`** — abstract base class every feature module must extend. Modules declare which URL patterns they activate on.
- **`ModuleLoader`** — orchestrates loading/unloading modules when the URL changes.
- **`UrlWatcher`** — patches `history.pushState`/`replaceState` to detect SPA navigation and fire URL-change callbacks.
- **`DomInjector`** / **`Injectable`** — modules declare `Injectable` objects (a target CSS selector, placement strategy, and `render()` function). `DomInjector` inserts/removes those elements on load/unload.

To add a new feature: extend `VismaModule`, implement `injectables()`, and register it in `src/main.ts`.

### API Layer (`src/api/`)

Validation is **feature-driven**: the API is undocumented and unstable, so each module validates only the fields it actually consumes, instead of endpoints enforcing whole-response schemas.

- **`ApiClient`** — thin fetch wrapper; always sends `credentials: 'include'` to reuse the user's existing browser session. Authentication is handled entirely by the browser — the userscript never manages tokens or login flows.
- **`Session`** — facade that lazily initialises all endpoints and caches the learner ID. Inject `Session` into modules rather than constructing endpoints directly.
- **Endpoints** (`src/api/endpoints/`) — one class per resource. Endpoints only build requests (URL, query params, learner-ID injection). Every schema-validated method takes a **required Zod schema argument** and returns `z.output` of it; `getWithSchema`/`postWithSchema` `safeParse` and throw on mismatch.
- **Catalog schemas** (`src/api/types/`) — documentation of known upstream response shapes, *not* an enforced contract. Modules derive feature schemas from them via `.pick()` so transforms (e.g. `dd/mm/yyyy` → `Date`) and field docs come along.
- **Feature schemas** — each module owns a `schemas.ts` picking exactly the fields it needs (e.g. `src/modules/attendance-calculator/attendance-calculator.schemas.ts`). An upstream change to a field no module picks breaks nothing; a change to a picked field throws immediately, scoped to that module.

> **Important:** The VIS InSchool API is entirely reverse-engineered — there is no official documentation. Response shapes can vary between students (different school configurations, roles, or data), so keep catalog schemas broad (`z.unknown()`, optional fields, loose unions) unless the stricter shape is verified against live data from multiple accounts. When upstream adds/renames a field, update the catalog schema; picks referencing renamed/removed catalog keys then fail at compile time, pointing at exactly the affected features. Run `window.testAllApiSchemas()` in the browser console to validate the full catalog against live responses — it is the drift-detection net for fields no feature consumes.

### Features

| Module | File | Description |
|--------|------|-------------|
| Timetable Exporter | `src/modules/timetable-exporter/` | Exports the school timetable as an ICS file compatible with Outlook/Google Calendar/Apple Calendar |
| Visma Wrapped | `src/modules/vismawrapped.ts` | "Wrapped"-style UI showing teacher frequency stats |

### Build Pipeline

Rollup bundles the project to an IIFE (required format for userscripts). `rollup-plugin-userscript-metablock` reads `meta.json` and prepends the `// ==UserScript==` header block. TypeScript targets ES2023 in strict mode.

### CI/CD

`.github/workflows/release.yml` builds on `v*` tags and publishes a draft GitHub Release containing `dist/inskewl.user.js`.
