import React, { PropsWithChildren } from 'react';

type Listener = () => void;

export type ThemeManager<TTheme = any> = {
     get(): TTheme;
     setByPath(path: string, value: any): void;
     mergeTheme(patch: Partial<TTheme>): void;
     reset(): void;
     subscribe(fn: Listener): () => void;
};

function isObj(v: unknown): v is Record<string, unknown> {
     return !!v && typeof v === 'object' && !Array.isArray(v);
}

function deepMerge(a: any, b: any): any {
     if (Array.isArray(a) || Array.isArray(b)) return b ?? a;
     if (!isObj(a) || !isObj(b)) return b ?? a;
     const out: any = { ...a };
     for (const k of Object.keys(b)) out[k] = deepMerge(a?.[k], (b as any)[k]);
     return out;
}

const BRACKET_SEG = /\[("([^\"]*)"|'([^\']*)'|(\d+))\]/g;
function splitPath(input: string): (string | number)[] {
     const parts: (string | number)[] = [];
     for (const seg of input.split('.')) {
          if (!seg) continue;
          const basics = seg.replace(BRACKET_SEG, '');
          if (basics) parts.push(basics);
          BRACKET_SEG.lastIndex = 0;
          let m: RegExpExecArray | null;
          while ((m = BRACKET_SEG.exec(seg))) {
               const str = m[2] ?? m[3];
               const num = m[4];
               parts.push(num !== undefined ? Number(num) : str);
          }
     }
     return parts;
}

function setAtPath(obj: any, path: string, value: any) {
     const segs = splitPath(path);
     if (!segs.length) return obj;
     const clone =
          typeof structuredClone === 'function'
               ? structuredClone(obj)
               : JSON.parse(JSON.stringify(obj));
     let cur: any = clone;
     for (let i = 0; i < segs.length - 1; i++) {
          const k = segs[i] as any;
          if (typeof k === 'number')
               cur[k] = Array.isArray(cur[k]) ? [...cur[k]] : [];
          else cur[k] = isObj(cur[k]) ? { ...cur[k] } : {};
          cur = cur[k];
     }
     cur[segs[segs.length - 1] as any] = value;
     return clone;
}

export function createThemeManager<TTheme = any>(
     initial?: TTheme
): ThemeManager<TTheme> {
     let theme: TTheme = initial ?? ({} as TTheme);
     const subs = new Set<Listener>();
     const notify = () => subs.forEach((fn) => fn());
     return {
          get: () => theme,
          setByPath: (path, value) => {
               theme = setAtPath(theme, path, value) as TTheme;
               notify();
          },
          mergeTheme: (patch) => {
               theme = deepMerge(theme, patch);
               notify();
          },
          reset: () => {
               theme = initial ?? ({} as TTheme);
               notify();
          },
          subscribe: (fn) => {
               subs.add(fn);
               return () => subs.delete(fn);
          },
     };
}

const Ctx = React.createContext<ThemeManager<any> | null>(null);

export function AmplifyThemeManagerProvider<TTheme = any>({
     children,
     initialTheme,
}: React.PropsWithChildren<{ initialTheme?: TTheme }>) {
     const manager = React.useMemo(
          () => createThemeManager(initialTheme),
          [initialTheme]
     );
     return <Ctx.Provider value={manager}>{children}</Ctx.Provider>;
}

export function useThemeManager<TTheme = any>(): ThemeManager<TTheme> {
     const ctx = React.useContext(Ctx);
     if (!ctx) throw new Error('Missing AmplifyThemeManagerProvider');
     return ctx as ThemeManager<TTheme>;
}

/* Color Mode Integration */
export type ColorModeSetting = 'light' | 'dark' | 'system';
export interface ColorModeContextValue {
     mode: ColorModeSetting; // user setting
     setMode: (m: ColorModeSetting) => void;
     resolvedMode: 'light' | 'dark'; // after applying system preference
}
const COLOR_MODE_KEY = 'ATM:colorMode';
const ColorModeCtx = React.createContext<ColorModeContextValue | null>(null);

function getSystemPref(): 'light' | 'dark' {
     if (typeof window === 'undefined') return 'light';
     return window.matchMedia('(prefers-color-scheme: dark)').matches
          ? 'dark'
          : 'light';
}
function loadStoredMode(): ColorModeSetting {
     if (typeof window === 'undefined') return 'system';
     try {
          const v = localStorage.getItem(COLOR_MODE_KEY);
          if (v === 'light' || v === 'dark' || v === 'system') return v;
     } catch {}
     return 'system';
}

export const AmplifyColorModeProvider: React.FC<
     PropsWithChildren<{ initialMode?: ColorModeSetting }>
> = ({ initialMode, children }) => {
     const [mode, setModeState] = React.useState<ColorModeSetting>(
          initialMode ?? loadStoredMode()
     );
     const [system, setSystem] = React.useState<'light' | 'dark'>(
          getSystemPref()
     );

     // Persist user mode
     React.useEffect(() => {
          if (typeof window === 'undefined') return;
          try {
               localStorage.setItem(COLOR_MODE_KEY, mode);
          } catch {}
     }, [mode]);

     // Listen for system changes when in 'system' mode (light weight)
     React.useEffect(() => {
          if (typeof window === 'undefined') return;
          const mq = window.matchMedia('(prefers-color-scheme: dark)');
          const handler = () => setSystem(mq.matches ? 'dark' : 'light');
          handler();
          mq.addEventListener
               ? mq.addEventListener('change', handler)
               : mq.addListener(handler);
          return () => {
               mq.removeEventListener
                    ? mq.removeEventListener('change', handler)
                    : mq.removeListener(handler);
          };
     }, []);

     const setMode = React.useCallback((m: ColorModeSetting) => {
          setModeState(m);
     }, []);

     const resolvedMode = mode === 'system' ? system : mode;

     const value = React.useMemo(
          () => ({ mode, setMode, resolvedMode }),
          [mode, setMode, resolvedMode]
     );

     return (
          <ColorModeCtx.Provider value={value}>
               {children}
          </ColorModeCtx.Provider>
     );
};

export function useColorMode(): ColorModeContextValue {
     const ctx = React.useContext(ColorModeCtx);
     if (!ctx) throw new Error('Missing AmplifyColorModeProvider');
     return ctx;
}

/**
 * Recursively enumerate all valid token paths in the theme object.
 */
export function enumerateTokenPaths(obj: any, prefix = ''): string[] {
     const paths: string[] = [];
     if (obj && typeof obj === 'object') {
          for (const key of Object.keys(obj)) {
               const next = prefix ? `${prefix}.${key}` : key;
               if (
                    obj[key] &&
                    typeof obj[key] === 'object' &&
                    !Array.isArray(obj[key])
               ) {
                    paths.push(...enumerateTokenPaths(obj[key], next));
               } else {
                    paths.push(next);
               }
          }
     }
     return paths;
}
