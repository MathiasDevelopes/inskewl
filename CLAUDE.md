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

- **`ApiClient`** — thin fetch wrapper; always sends `credentials: 'include'` to reuse the user's existing browser session. Authentication is handled entirely by the browser — the userscript never manages tokens or login flows.
- **`Session`** — facade that lazily initialises all endpoints and caches the learner ID. Inject `Session` into modules rather than constructing endpoints directly.
- **Endpoints** (`src/api/endpoints/`) — one class per resource (User, Timetable, Calendar, Attendance, School, Assessment, Inbox, Events).
- **Types** (`src/api/types/`) — Zod schemas for every endpoint response. All API responses are parsed through Zod at runtime; a schema mismatch throws immediately. When the upstream API changes, update the schema here.

> **Important:** The VIS InSchool API is entirely reverse-engineered — there is no official documentation. Response shapes can vary between students (different school configurations, roles, or data), so some Zod schemas are intentionally broad (e.g. `z.unknown()`, optional fields, loose unions) to avoid breaking for users whose accounts return different payloads. Do not tighten a schema unless you have verified the stricter shape against live data from multiple accounts. New schemas must also be validated via live testing using `window.testAllApiSchemas()` in the browser console.
>
> `getWithSchema` / `postWithSchema` use `safeParse` rather than `parse`. On a schema mismatch they emit a `console.warn` and return the raw response cast as `T`, so features degrade gracefully instead of failing silently when the upstream API adds or changes fields.

### Features

| Module | File | Description |
|--------|------|-------------|
| Timetable Exporter | `src/modules/timetable-exporter/` | Exports the school timetable as an ICS file compatible with Outlook/Google Calendar/Apple Calendar |
| Visma Wrapped | `src/modules/vismawrapped.ts` | "Wrapped"-style UI showing teacher frequency stats |

### Build Pipeline

Rollup bundles the project to an IIFE (required format for userscripts). `rollup-plugin-userscript-metablock` reads `meta.json` and prepends the `// ==UserScript==` header block. TypeScript targets ES2023 in strict mode.

### CI/CD

`.github/workflows/release.yml` builds on `v*` tags and publishes a draft GitHub Release containing `dist/inskewl.user.js`.
