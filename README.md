# Amplify Theme Manager (Dev Panel + Icons + Snapshots)

A helper package to **inspect, edit, snapshot, and export** AWS Amplify UI themes at runtime.

## Features
- `AmplifyThemeManagerProvider` + `useThemeManager()` (immutable set-by-path, deep merge, reset)
- Slide-out **DevThemePanelV3** with tabs: Tokens / Presets / Icons / Inspector
- **HSL** color controls + **unit-aware** numeric inputs (px/rem/%)
- JSON **diff export** (`theme.patch.json`) + **full export**
- **Snapshots** (localStorage) with **import/export** and per-item delete
- **IconProvider** integration via `AmplifyIconsProvider` + registry
- Ready-made **icon presets**: Minimal (built-in) or Feather (`react-icons`)

## Install
```bash
pnpm add @your-scope/amplify-theme-manager @aws-amplify/ui-react react react-dom
# optional for Feather icons
pnpm add react-icons
```

## Quick Start
```tsx
import '@aws-amplify/ui-react/styles.css';
import { AmplifyThemeManagerProvider, DevThemePanelV3 } from '@your-scope/amplify-theme-manager';
import { AmplifyIconsProvider, createIconsManager } from '@your-scope/amplify-theme-manager/icons/manager';

const icons = createIconsManager();

export function Root() {
  const dev = process.env.NODE_ENV !== 'production';
  return (
    <AmplifyThemeManagerProvider>
      <AmplifyIconsProvider manager={icons}>
        {/* your app */}
        {dev && <DevThemePanelV3 />}
      </AmplifyIconsProvider>
    </AmplifyThemeManagerProvider>
  );
}
```

## Tokens Tab
- **Path Mode**: Edit a JSON value at a dot path (e.g., `tokens.colors.font.primary`). HSL/Unit widgets appear for compatible values.
- **Token Browser**: Filter and edit leaf tokens (`{ value: ... }`). 
- **JSON Merge**: Paste partial theme JSON to merge.
- **Snapshots**: Save a diff, Export/Import all (import assigns **new IDs**), Apply or Delete entries.

## Icons Tab
- Apply a preset (**Minimal** built-in, or **Feather** via `react-icons`).
- Register custom icons by SVG path (creates a React component on the fly).
- Programmatic preset usage:
```ts
import * as IconPresets from '@your-scope/amplify-theme-manager/icons/presets';
IconPresets.buildPreset('feather').then(map => icons.setAll(map));
```

## API
### `useThemeManager()`
- `get()` — current theme object
- `setByPath(path, value)` — immutable update; supports `a.b[0]['c.d']`
- `mergeTheme(patch)` — deep merge
- `reset()` — restore initial theme

### `DevThemePanelV3` props
- `defaultOpen?: boolean`
- `enabled?: boolean`
- `shortcutLabel?: string` (default `Ctrl+Shift+D`)

### Icons
- `createIconsManager()` → in-memory registry
- `AmplifyIconsProvider` → wraps Amplify’s IconProvider
- `useIconsManager()` → `get/set/remove/reset/setAll`
- `makePathIcon(d: string, name?: string)`

## Build & Publish
```bash
pnpm install
pnpm run build    # outputs ESM + types to dist/
npm pack          # optional: create tarball to test
npm publish --access public
```
- Scoped packages may need `--access public`.
- React/Amplify/react-icons are **peerDependencies** (excluded from bundle).

## Example
Run the bundled playground:
```bash
pnpm install
pnpm example
```
Open the browser and press **Ctrl+Shift+D** to toggle the panel.

---

MIT © You
