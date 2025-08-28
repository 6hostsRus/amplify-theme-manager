import React from 'react';
import { useThemeManager, enumerateTokenPaths } from '../../react';
import { useIconsManager } from '../../icons/manager';
import { loadPanelPrefs, savePanelPrefs } from './panelStorage';
import { TabId, DEFAULT_TAB } from './tabs/registry';
import { PRESETS, findPresetByName } from '../../presets';
import { deepDiff } from '../../dev/diff'; // existing path (original import was './diff')
import { Snapshots } from './helpers/snapshots';

const pretty = (v: unknown) => JSON.stringify(v, null, 2);

function isObj(v: any): v is Record<string, any> {
     return !!v && typeof v === 'object' && !Array.isArray(v);
}
function deepMergeLoose(a: any, b: any): any {
     if (Array.isArray(a) || Array.isArray(b)) return b ?? a;
     if (!isObj(a) || !isObj(b)) return b ?? a;
     const out: any = { ...a };
     for (const k of Object.keys(b)) out[k] = deepMergeLoose(a?.[k], b[k]);
     return out;
}
function setByPathLoose(obj: any, path: string, value: any) {
     const parts = path.split('.').filter(Boolean);
     const clone =
          typeof structuredClone === 'function'
               ? structuredClone(obj)
               : JSON.parse(JSON.stringify(obj));
     let cur: any = clone;
     for (let i = 0; i < parts.length - 1; i++) {
          const k = parts[i]!;
          cur[k] = isObj(cur[k]) ? { ...cur[k] } : {};
          cur = cur[k];
     }
     cur[parts[parts.length - 1]!] = value;
     return clone;
}
export function parseJson<T>(
     text: string
): { ok: true; value: T } | { ok: false; error: string } {
     try {
          return { ok: true, value: JSON.parse(text) as T };
     } catch (e: any) {
          return { ok: false, error: e?.message ?? String(e) };
     }
}

export interface DevPanelState {
     open: boolean;
     setOpen(v: boolean): void;
     activeTab: TabId;
     setActiveTab(id: TabId): void;
     status: string;
     setStatus(s: string): void;

     // Token editing
     path: string;
     setPath(v: string): void;
     pathValueText: string;
     setPathValueText(v: string): void;
     mergeText: string;
     setMergeText(v: string): void;
     tokenFilter: string;
     setTokenFilter(v: string): void;

     // Presets
     presetName: string;
     setPresetName(name: string): void;
     applyPreset(): void;

     // Computed
     baseTheme: any;
     tokenPaths: string[];
     buildProspective(): any;

     // Actions
     applyPath(): void;
     applyMerge(): void;
     copyFull(): void;
     copyDiff(): void;
     exportFiles(): void;

     // Managers
     manager: ReturnType<typeof useThemeManager>;
     icons: ReturnType<typeof useIconsManager>;
}

export function useDevPanelState(): DevPanelState {
     const manager = useThemeManager();
     const icons = useIconsManager();
     const baseTheme = manager.get();

     const prefsRef = React.useRef(loadPanelPrefs());

     const [open, setOpen] = React.useState(prefsRef.current.open ?? true);
     const [activeTab, setActiveTab] = React.useState<TabId>(
          (prefsRef.current.tab as TabId) || DEFAULT_TAB
     );
     const [status, setStatus] = React.useState('');
     const [path, setPath] = React.useState(
          prefsRef.current.path || 'tokens.colors.font.primary'
     );
     const [pathValueText, setPathValueText] = React.useState(
          prefsRef.current.pathValueText ?? '{"value":"#0ea5e9"}'
     );
     const [mergeText, setMergeText] = React.useState(
          prefsRef.current.mergeText ?? '{}'
     );
     const [tokenFilter, setTokenFilter] = React.useState(
          prefsRef.current.filter ?? ''
     );
     const [presetName, setPresetName] = React.useState(
          prefsRef.current.presetName || PRESETS[0]!.name
     );

     // Persist
     React.useEffect(() => {
          savePanelPrefs({
               open,
               tab: activeTab,
               path,
               pathValueText,
               mergeText,
               filter: tokenFilter,
               presetName,
          });
     }, [
          open,
          activeTab,
          path,
          pathValueText,
          mergeText,
          tokenFilter,
          presetName,
     ]);

     // Shortcut
     React.useEffect(() => {
          const onKey = (e: KeyboardEvent) => {
               if (
                    (e.ctrlKey || e.metaKey) &&
                    e.shiftKey &&
                    e.key.toLowerCase() === 'd'
               ) {
                    e.preventDefault();
                    setOpen((o) => !o);
               }
          };
          window.addEventListener('keydown', onKey);
          return () => window.removeEventListener('keydown', onKey);
     }, []);

     const tokenPaths = React.useMemo(
          () => enumerateTokenPaths(baseTheme),
          [baseTheme]
     );

     function buildProspective(): any {
          let working: any = baseTheme;
          const m = parseJson<any>(mergeText);
          if (m.ok)
               working = deepMergeLoose(
                    typeof structuredClone === 'function'
                         ? structuredClone(working)
                         : JSON.parse(JSON.stringify(working)),
                    m.value
               );
          const pv = parseJson<any>(pathValueText);
          if (pv.ok && path.trim())
               working = setByPathLoose(working, path.trim(), pv.value);
          return working;
     }

     function applyPath() {
          if (!path.startsWith('tokens.')) {
               setStatus('Blocked: only paths under tokens.* are editable');
               return;
          }
          const parsed = parseJson<any>(pathValueText);
          if (!parsed.ok)
               return setStatus(`Path value JSON error: ${parsed.error}`);
          try {
               manager.setByPath(path, parsed.value);
               setStatus(`Applied ${path}`);
          } catch (e: any) {
               setStatus(`Apply error: ${e?.message ?? e}`);
          }
     }
     function applyMerge() {
          const parsed = parseJson<any>(mergeText);
          if (!parsed.ok) return setStatus(`Merge JSON error: ${parsed.error}`);
          try {
               manager.mergeTheme(parsed.value);
               setStatus('Merged JSON into theme');
          } catch (e: any) {
               setStatus(`Merge error: ${e?.message ?? e}`);
          }
     }
     function applyPreset() {
          const preset = findPresetByName(presetName);
          if (!preset) return;
          manager.mergeTheme(preset.patch as any);
          setStatus(`Applied preset: ${preset.name}`);
     }
     function copyDiff() {
          const diff =
               deepDiff(baseTheme as any, buildProspective() as any) ?? {};
          navigator.clipboard?.writeText(pretty(diff));
          setStatus('Copied theme diff JSON');
     }
     function copyFull() {
          navigator.clipboard?.writeText(pretty(buildProspective()));
          setStatus('Copied full JSON');
     }
     function exportFiles() {
          const diff =
               deepDiff(baseTheme as any, buildProspective() as any) ?? {};
          const download = (name: string, content: string) => {
               const blob = new Blob([content], { type: 'application/json' });
               const url = URL.createObjectURL(blob);
               const a = document.createElement('a');
               a.href = url;
               a.download = name;
               a.click();
               setTimeout(() => URL.revokeObjectURL(url), 500);
          };
          download('theme.patch.json', pretty(diff));
          download('theme.full.json', pretty(buildProspective()));
          setStatus('Exported files');
     }

     return {
          open,
          setOpen,
          activeTab,
          setActiveTab,
          status,
          setStatus,
          path,
          setPath,
          pathValueText,
          setPathValueText,
          mergeText,
          setMergeText,
          tokenFilter,
          setTokenFilter,
          presetName,
          setPresetName,
          applyPreset,
          baseTheme,
          tokenPaths,
          buildProspective,
          applyPath,
          applyMerge,
          copyDiff,
          copyFull,
          exportFiles,
          manager,
          icons,
     };
}
