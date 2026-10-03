# AGENTS.md

This file provides guidance to AI coding agents (Claude Code, Codex, etc.) when working with code in this repository. `CLAUDE.md` is a symlink to this file.

## Project Overview

**inskewl** is a browser userscript (Violetmonkey/Tampermonkey) that adds quality-of-life features to VIS InSchool — a Norwegian school management system at `https://*.inschool.visma.no/*`. It is written in TypeScript, bundled to an IIFE with Rollup (esbuild for transpiling, terser for minifying), and distributed as a `.user.js` file. The repo is an npm workspace: the app lives in `src/`, shared packages in `packages/`, and user docs (Norwegian, MkDocs) in `docs/`.

## Commands

```bash
npm run build         # Build dist/inskewl.user.js (minified with terser)
npm run build:debug   # Same, but unminified and readable
npm run dev           # Rebuild on file changes (watch mode, unminified)
npx tsc --noEmit      # Type check (esbuild does not type check; CI runs this)
npm run docs:build    # Build the MkDocs site (needs Python + requirements.txt)
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

### Shared Core Package (`packages/core/`)

`@inskewl/core` holds small utilities shared by the app and workspace packages (currently `createLogger`). Workspace packages such as `@inskewl/api-client` must depend on it rather than importing from `src/` via relative paths, so they stay publishable on their own.

### API Client Package (`packages/api-client/`)

`@inskewl/api-client` contains the whole API layer (client, `Session`, endpoints and catalog schemas, under `packages/api-client/src/`). The app only wires it up in `src/api/client.ts`, which exports the shared `api` `Session` built with `IncludeAuthProvider`. `src/api/testSchemas.ts` implements `window.testAllApiSchemas()`.

### API Layer (`packages/api-client/src/`)

Validation is **feature-driven**: the API is undocumented and unstable, so each module validates only the fields it actually consumes, instead of endpoints enforcing whole-response schemas.

- **`ApiClient`** — thin fetch wrapper (`apiClient.ts`) that delegates auth to an `AuthProvider`. The app uses `IncludeAuthProvider`, which sends `credentials: 'include'` to reuse the user's existing browser session. Authentication is handled entirely by the browser — the userscript never manages tokens or login flows.
- **`Session`** — facade that lazily initialises all endpoints and caches the learner ID. Inject `Session` into modules rather than constructing endpoints directly.
- **Endpoints** (`packages/api-client/src/endpoints/`) — one class per resource. Endpoints only build requests (URL, query params, learner-ID injection). Every schema-validated method takes a **required Zod schema argument** and returns `z.output` of it; `getWithSchema`/`postWithSchema` `safeParse` and throw on mismatch.
- **Catalog schemas** (`packages/api-client/src/types/`) — documentation of known upstream response shapes, *not* an enforced contract. Modules derive feature schemas from them via `.pick()` so transforms (e.g. `dd/mm/yyyy` → `Date`) and field docs come along.
- **Feature schemas** — each module owns a `schemas.ts` picking exactly the fields it needs (e.g. `src/modules/attendance-calculator/attendance-calculator.schemas.ts`). An upstream change to a field no module picks breaks nothing; a change to a picked field throws immediately, scoped to that module.

> **Important:** The VIS InSchool API is entirely reverse-engineered — there is no official documentation. Response shapes can vary between students (different school configurations, roles, or data), so keep catalog schemas broad (`z.unknown()`, optional fields, loose unions) unless the stricter shape is verified against live data from multiple accounts. When upstream adds/renames a field, update the catalog schema; picks referencing renamed/removed catalog keys then fail at compile time, pointing at exactly the affected features. Run `window.testAllApiSchemas()` in the browser console to validate the full catalog against live responses — it is the drift-detection net for fields no feature consumes.

### Features

| Module | File | Description |
|--------|------|-------------|
| Timetable Exporter | `src/modules/timetable-exporter/` | Exports the school timetable as an ICS file compatible with Outlook/Google Calendar/Apple Calendar |
| Attendance Calculator | `src/modules/attendance-calculator/` | Simulates how future absence affects the per-subject absence percentage (split into `.data`, `.view`, `.ui`, `.helpers`, `.schemas` files) |

### Build Pipeline

Rollup (`rollup.config.js`) bundles the project to an IIFE (required format for userscripts). `rollup-plugin-esbuild` transpiles TypeScript (ES2024 target, no type checking, no `tslib`), and `@rollup/plugin-terser` minifies unless `MINIFY=false` (`build:debug` and `dev`). `rollup-plugin-userscript-metablock` reads `meta.json` and prepends the `// ==UserScript==` header block; `BUILD_VERSION`, `UPDATE_URL` and `DOWNLOAD_URL` env vars override the version and URLs. TypeScript 7 (`tsc --noEmit`) does the type checking, in strict mode (plus `noUncheckedIndexedAccess`, `erasableSyntaxOnly`, `verbatimModuleSyntax`, `noImplicitOverride`, `noUnusedLocals`).

`rollup.docs.config.js` builds the assets embedded in the MkDocs site.

### CI/CD

- `ci.yml` runs `tsc --noEmit` and `npm run build` on pull requests.
- `docs.yml` builds the MkDocs site (`mkdocs build --strict`) on pull requests and deploys it to GitHub Pages on pushes to `main`.
- `main-artifact.yml` builds a `-dev.N` userscript artifact on every push to `main`.
- `release.yml` builds `dist/inskewl.user.js` and creates a **draft** GitHub Release. Run it manually (`workflow_dispatch`) with a `tag` (e.g. `v1.2.0`) and optional `ref` input; publishing the draft creates the tag. Pushing a `v*` tag also triggers it. Releases are cut from a version-bump commit (`npm version`) merged to `main`.
