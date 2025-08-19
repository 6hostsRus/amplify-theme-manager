# AI Assistant Guidelines (amplify-theme-manager)

Concise, project-specific rules so an AI agent can be productive quickly.

## 1. Purpose

Runtime theme + icon management for AWS Amplify UI React with an in-browser dev panel (`DevThemePanelV3`) enabling live token edits, presets, icon management, snapshots, and (to add) auto dark-mode toggling. Design goals: immutable theme updates, tiny dependency surface, clear public API.

## 2. Core Source Map

-    src/react.tsx: ThemeManager (parse paths, immutable setAtPath, deepMerge, context).
-    src/dev/DevThemePanel.v3.tsx: Side panel (tabs: tokens | presets | icons | inspect | snapshots).
-    src/presets.ts: Theme presets + lookup.
-    src/icons/manager.tsx & src/icons/presets.tsx: Observable icons registry + lazy feather set + `makePathIcon`.
-    src/AmplifyManagedProvider.tsx: Bridges ThemeManager to `<AmplifyProvider theme={...}>` for live updates.
-    example/ (Vite; root = example/src): Kitchen sink via examples/\*.tsx + kitchen-sink.tsx.

## 3. Build & Dev

-    Install: pnpm install
-    Library build: pnpm build (tsup -> ESM + d.ts)
-    Watch dev (library + example): pnpm dev (tsup --watch) in one terminal, pnpm example (Vite) in another.
-    Type check: pnpm typecheck
     Ensure new public files are exported in src/index.ts and mapped in tsup.config.ts + package.json "exports".

## 4. Public API Pattern

Export everything via src/index.ts. For a new subpath (e.g. icons/foo):

1. Create file.
2. Add tsup entry (tsup.config.ts).
3. Add package.json exports mapping.
4. Re-export in index or rely on subpath.

## 5. Theme Update Rules

Always mutate through ThemeManager methods: setByPath, mergeTheme, reset. Do not directly mutate stored theme objects. Paths allow dot + bracket notation; arrays are replaced (not merged) by deepMerge. Tokens commonly shaped { value: ... }.

## 6. Dev Panel Conventions

Inline style objects only. To add a tab: extend the tab union, add button, conditional render block, persist needed state via PanelStorage (localStorage). Memoize heavy computations.

## 7. Icons

Use iconsManager.set / setAll / remove / reset; never mutate internal map. Custom SVG via makePathIcon (24x24, currentColor). Lazy feather import with graceful fallback.

## 8. Presets

Add to PRESETS with minimal diff patches; avoid full theme dumps. Use findPresetByName for lookup.

## 9. Auto Dark-Mode Toggling (New Support)

Goal: Seamlessly switch theme on system or user preference.
Pattern:

-    Add optional dual theme store fields: baseThemeLight, baseThemeDark (immutable).
-    Detect system preference via window.matchMedia('(prefers-color-scheme: dark)').
-    Store user override ('light' | 'dark' | 'system') in PanelStorage; when 'system', follow matchMedia; otherwise force selection.
-    Expose hook useColorMode() returning { mode, setMode, resolvedMode }.
-    AmplifyManagedProvider: derive activeTheme each render (memo) from manager state + resolvedMode.
-    Provide utility applyModePatch(lightTheme, darkPatch) if dark mode is a patch over light.
-    Ensure subscription batching (single manager.notify on mode change).
-    No additional runtime deps; isolate browser-only logic behind typeof window checks (SSR safety).

## 10. Example Integration

In kitchen-sink.tsx wrap App with AmplifyThemeManagerProvider + AmplifyManagedProvider. Add a minimal toggle UI in DevThemePanel (mode dropdown). Live modifications still go through ThemeManager; mode switch triggers re-render.

## 11. Adding New API

1. Implement under src/.
2. Export in src/index.ts.
3. (If subpath) tsup + exports update.
4. pnpm typecheck && pnpm build.
5. Add example component demonstrating usage.

## 12. Manual QA Focus

Verify: token path edits, array replacement semantics, preset application diff, icon preset lazy load fallback, dark-mode auto switch (system + override), snapshot export/import, performance (no excessive re-renders).

## 13. Common Pitfalls

-    Forgetting export mappings -> consumer import fails.
-    Direct object mutation -> UI not updating.
-    Missing styles import '@aws-amplify/ui-react/styles.css'.
-    Not wrapping app with AmplifyManagedProvider -> no live theme reflection.
-    Dark mode: forgetting to unsubscribe matchMedia on cleanup.

## 14. Release Checklist

Bump version, pnpm clean && pnpm build, verify dist entries, update README for new surface (e.g. dark mode API), npm publish --access public.

Ask before adding dependencies or altering existing immutable update semantics.
