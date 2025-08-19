# AI Assistant Guidelines for amplify-theme-manager

Concise, project-specific rules so an AI agent can be productive quickly.

## 1. Purpose & Big Picture

This package provides a runtime **theme + icon management developer panel** for AWS Amplify UI React. It exposes hooks/providers (`AmplifyThemeManagerProvider`, `useThemeManager`, `AmplifyIconsProvider`, `useIconsManager`) and a side panel component `DevThemePanelV3` for editing tokens, applying presets, managing icons, and exporting JSON diffs/full themes. The design favors **immutable updates** (copy-on-write) and **minimal external deps**.

## 2. Key Source Layout

-    `src/react.tsx`: Core theme manager: path parsing (`splitPath`), immutable set (`setAtPath`), deep merge, context provider/hook.
-    `src/dev/DevThemePanel.v3.tsx`: Full panel UI (no CSS framework) with tabs: tokens, presets, icons, inspector, snapshots. Pure React + inline styles.
-    `src/presets.ts`: Theme preset definitions + `findPresetByName`.
-    `src/icons/manager.tsx`: Icons registry (observer pattern) + provider bridging to Amplify's `IconProvider` (fallback safe).
-    `src/icons/presets.tsx`: Minimal + feather icon presets (dynamic import of `react-icons`).
-    `example/`: Vite playground (`vite.config.ts` sets root to `example/src`). Kitchen sink examples live under `example/examples`, rendered via `example/src/kitchen-sink.tsx`.
-    `tsup.config.ts`: Build entries (multi-entry to expose internal modules under subpaths). No code-splitting.

## 3. Build & Dev Workflows

-    Install: `pnpm install` (peer deps required in consumer env; here for dev/testing).
-    Library build: `pnpm run build` (tsup -> ESM + d.ts in `dist/`). Entry points must stay declared in `tsup.config.ts` & reflected in `package.json.exports`.
-    Dev watch: `pnpm run dev` (tsup --watch) while running the example for live testing.
-    Example playground: `pnpm run example` (Vite dev server; serves from `example/src`). Ensure `example/src/index.html` references the desired entry (e.g., `kitchen-sink.tsx`).
-    Type check: `pnpm run typecheck`.

## 4. Import/Export Conventions

-    Public API aggregated in `src/index.ts`. Add new public symbols there AND (if a new deep path) add a tsup entry + package.json export mapping.
-    Subpath exports follow pattern: add source `src/icons/foo.ts`, add tsup entry `'icons/foo': 'src/icons/foo.ts'`, then add `"./icons/foo"` export block.
-    Keep peer dependencies (React, Amplify UI, react-icons) out of bundle: add to `external` in `tsup.config.ts`.

## 5. Theme Management Patterns

-    All theme updates via `ThemeManager`: `setByPath`, `mergeTheme`, `reset`.
-    Paths support dot + bracket (`a.b[0]['c.d']`). Use `setByPath` (from `createThemeManager`) for mutations; do NOT mutate internal state objects directly.
-    Deep merges intentionally overwrite arrays entirely (see `deepMerge`). Reflect this when designing patches.
-    Tokens often shaped `{ value: ... }`; panel identifies leaf tokens as objects with only a `value` key.

## 6. Dev Panel Architecture

-    Inline styles only; maintain style objects for consistency. Add new tab by extending union `'tokens'|'presets'|'icons'|'inspect'` and tab strip.
-    State persisted via `PanelStorage` (localStorage) – replicate key usage if new persisted fields added.
-    Keep performance: expensive computations (e.g., tokenLeaves) are memoized.

## 7. Icons System

-    Icons registry is a simple observable store; always use `icons.set / setAll / remove / reset`.
-    Custom SVG icons built with `makePathIcon(d, name)` (24x24 viewBox, currentColor fill). Maintain this pattern for consistency.
-    Feather preset loaded lazily; failure falls back to `minimal`.

## 8. Presets

-    Add new presets by pushing to `PRESETS` and ensuring descriptive `name` & `description`. Keep patch minimal & focused (avoid full theme dumps).

## 9. Example / Kitchen Sink

-    Organized examples under `example/examples/*.tsx` each exporting a `*Examples` component.
-    Barrel file `example/examples/index.ts` used in `kitchen-sink.tsx` to assemble sections.
-    When adding a new public component/hook, create an example variant showing typical & edge props.

## 10. Coding Conventions

-    TS strict mode; prefer explicit return types on exported functions if inference is non-trivial.
-    Avoid runtime dependencies beyond React & Amplify UI to keep bundle slim.
-    Use functional React components; minimal hooks; no class components.
-    Prefer small pure helper functions (e.g., `deepMerge`, `splitPath`).

## 11. Adding New Surface API

1. Implement file under `src/...`.
2. Export from appropriate barrel (e.g., `src/index.ts`).
3. If a new subpath is needed (nested import), add tsup entry + package.json export.
4. Run `pnpm typecheck && pnpm build`.
5. Update README with concise usage & add example under `example/examples`.

## 12. Testing / Manual QA

-    No automated tests present yet; rely on kitchen sink for visual/regression. When changing theme logic, verify: path updates, merge behavior (arrays replaced), snapshots export/import, icon preset switching, and accessibility (panel toggling via shortcut).

## 13. Common Pitfalls

-    Forgetting to add new entry to `exports` -> consumer import failures.
-    Mutating theme object directly -> updates not reflected; must use manager methods.
-    Missing `@aws-amplify/ui-react/styles.css` in example -> unstyled components.
-    Vite root mismatch: keep `vite.config.ts` root aligned with playground location.

## 14. Release Checklist

-    Bump version in `package.json` (semver).
-    `pnpm clean && pnpm build` (ensure fresh dist).
-    Spot-check dist for expected entry files.
-    `npm publish --access public`.

Ask for clarification if proposing structural changes or adding dependencies.
