import React from 'react';
import { ThemeProvider, Theme, defaultTheme } from '@aws-amplify/ui-react';
import { useThemeManager, useColorMode } from './react';

type AmplifyManagedProviderProps = React.PropsWithChildren<{
     // Patch applied only when resolvedMode === 'dark'
     darkPatch?: Partial<Theme>;
     // Full dark theme override (applied after darkPatch)
     darkTheme?: Partial<Theme>;
}>;

function isObj(v: any): v is Record<string, any> {
     return !!v && typeof v === 'object' && !Array.isArray(v);
}
function deepMerge(a: any, b: any): any {
     if (Array.isArray(a) || Array.isArray(b)) return b ?? a;
     if (!isObj(a) || !isObj(b)) return b ?? a;
     const out: any = { ...a };
     for (const k of Object.keys(b)) out[k] = deepMerge(a?.[k], b[k]);
     return out;
}

function pruneInvalidComponents(obj: any): any {
     // Keep only plain object children (recursively) – remove primitives/arrays.
     if (!obj || typeof obj !== 'object' || Array.isArray(obj))
          return undefined;
     const out: any = {};
     for (const [k, v] of Object.entries(obj)) {
          if (v && typeof v === 'object' && !Array.isArray(v)) {
               out[k] = pruneInvalidComponents(v) ?? {};
          }
     }
     return out;
}

// Defensive: ensure theme shape matches Amplify expectations and never throws.
function sanitizeTheme(t: any): any {
     if (!t || typeof t !== 'object' || Array.isArray(t)) return {};
     const out: any = { ...t };

     // tokens must be object
     if ('tokens' in out) {
          if (
               !out.tokens ||
               typeof out.tokens !== 'object' ||
               Array.isArray(out.tokens)
          ) {
               out.tokens = {};
          }
     }
     // components optional but if present must be object-of-objects
     if ('components' in out) {
          const pruned = pruneInvalidComponents(out.components);
          if (pruned) out.components = pruned;
          else delete out.components;
     }
     return out;
}

export function AmplifyManagedProvider({
     children,
     darkPatch,
     darkTheme,
}: AmplifyManagedProviderProps) {
     const tm = useThemeManager();
     const { resolvedMode } = useColorMode();
     const [, force] = React.useState(0);

     // Subscribe once
     React.useEffect(() => tm.subscribe(() => force((x) => x + 1)), [tm]);

     // Capture current immutable base theme reference
     const baseTheme = tm.get();

     const activeTheme = React.useMemo(() => {
          let themed: any = baseTheme;
          if (resolvedMode === 'dark') {
               if (darkPatch) themed = deepMerge(themed, darkPatch);
               if (darkTheme) themed = deepMerge(themed, darkTheme);
          }
          const sanitized = sanitizeTheme(themed);
          // Final minimal validation: ensure sanitized.components (if any) is object so createTheme won't break.
          if (
               sanitized.components &&
               (typeof sanitized.components !== 'object' ||
                    Array.isArray(sanitized.components))
          ) {
               delete sanitized.components;
          }
          // Fallback if theme somehow empty (avoid runtime error)
          return Object.keys(sanitized).length ? sanitized : defaultTheme;
     }, [baseTheme, resolvedMode, darkPatch, darkTheme]);

     return (
          <ThemeProvider
               theme={activeTheme}
               data-amplify-color-mode={resolvedMode}
          >
               {children}
          </ThemeProvider>
     );
}
