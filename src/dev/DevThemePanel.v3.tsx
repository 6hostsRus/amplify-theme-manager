// Backward compatibility re-export. The monolithic implementation was removed in favor
// of the modular panel under ./panel/DevThemePanelV3. (Avoid duplicating logic.)
import { PRESETS, findPresetByName } from '../presets';
import { HslColorInput } from './controls/HslColorInput';
import { UnitInput } from './controls/UnitInput';
import { useIconsManager, makePathIcon } from '../icons/manager';
import { Snapshots, PanelStorage } from './snapshots';
import * as IconPresets from '../icons/presets';
import { Combobox } from './Combobox';
import { enumerateTokenPaths, useThemeManager } from '../react';
import React from 'react';
import { Theme } from '@aws-amplify/ui-react';
import { deepDiff } from './diff';
const pretty = (v: unknown) => JSON.stringify(v, null, 2);
const HEX_RE = /^#([0-9a-f]{3}|[0-9a-f]{6}|[0-9a-f]{8})$/i;
const looksHex = (s: any) => typeof s === 'string' && HEX_RE.test(s);
function parseJson<T>(
     text: string
): { ok: true; value: T } | { ok: false; error: string } {
     try {
          return { ok: true, value: JSON.parse(text) as T };
     } catch (e: any) {
          return { ok: false, error: e?.message ?? String(e) };
     }
}
function isObj(v: unknown): v is Record<string, unknown> {
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
function gatherTokenLeaves(
     obj: any,
     prefix: string[] = [],
     acc: Array<{ path: string; value: any }> = []
) {
     if (!isObj(obj)) return acc;
     for (const [k, v] of Object.entries(obj)) {
          const p = [...prefix, k];
          if (isObj(v) && 'value' in v && Object.keys(v).length === 1)
               acc.push({ path: p.join('.'), value: (v as any).value });
          else if (isObj(v)) gatherTokenLeaves(v, p, acc);
     }
     return acc;
}

export function DevThemePanelV3({
     defaultOpen,
     enabled = true,
     shortcutLabel = 'Ctrl+Shift+D',
}: {
     defaultOpen?: boolean;
     enabled?: boolean;
     shortcutLabel?: string;
}) {
     const tm = useThemeManager();
     const icons = useIconsManager();
     const baseTheme = tm.get();

     // Memoize all token paths for autocomplete
     const tokenPaths = React.useMemo(
          () => enumerateTokenPaths(baseTheme),
          [baseTheme]
     );
     const [path, setPath] = React.useState('tokens.colors.font.primary');
     const [comboboxFilter, setComboboxFilter] = React.useState('');
     const filteredPaths = React.useMemo(() => {
          const q = comboboxFilter.trim().toLowerCase();
          if (!q) return tokenPaths.slice(0, 100);
          return tokenPaths
               .filter((p) => p.toLowerCase().includes(q))
               .slice(0, 100);
     }, [tokenPaths, comboboxFilter]);

     const saved = typeof window !== 'undefined' ? PanelStorage.load() : {};
     const [open, setOpen] = React.useState(saved.open ?? !!defaultOpen);
     const [tab, setTab] = React.useState<
          'tokens' | 'presets' | 'icons' | 'inspect'
     >(saved.tab ?? 'tokens');
     const [status, setStatus] = React.useState('');

     const [pathValueText, setPathValueText] = React.useState(
          saved.pathValueText ?? '{"value":"#0ea5e9"}'
     );
     const [mergeText, setMergeText] = React.useState(saved.mergeText ?? '{}');
     const [presetName, setPresetName] = React.useState(PRESETS[0]!.name);

     const tokenLeaves = React.useMemo(
          () => gatherTokenLeaves(baseTheme?.tokens ?? {}),
          [baseTheme]
     );
     const [filter, setFilter] = React.useState(saved.filter ?? '');
     const filteredLeaves = React.useMemo(() => {
          const q = filter.trim().toLowerCase();
          if (!q) return tokenLeaves.slice(0, 300);
          return tokenLeaves
               .filter((t) => t.path.toLowerCase().includes(q))
               .slice(0, 600);
     }, [tokenLeaves, filter]);

     React.useEffect(() => {
          if (!enabled) return;
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
     }, [enabled]);

     React.useEffect(() => {
          if (typeof window === 'undefined') return;
          PanelStorage.save({
               open,
               tab,
               path,
               pathValueText,
               mergeText,
               filter,
          });
     }, [open, tab, path, pathValueText, mergeText, filter]);

     function applyPath() {
          const parsed = parseJson<any>(pathValueText);
          if (!parsed.ok)
               return setStatus(`Path value JSON error: ${parsed.error}`);
          try {
               tm.setByPath(path, parsed.value);
               setStatus(`Applied ${path}`);
          } catch (e: any) {
               setStatus(`Apply error: ${e?.message ?? e}`);
          }
     }
     function applyMerge() {
          const parsed = parseJson<Partial<Theme>>(mergeText);
          if (!parsed.ok) return setStatus(`Merge JSON error: ${parsed.error}`);
          try {
               tm.mergeTheme(parsed.value);
               setStatus('Merged JSON into theme');
          } catch (e: any) {
               setStatus(`Merge error: ${e?.message ?? e}`);
          }
     }
     function applyPreset() {
          const preset = findPresetByName(presetName);
          if (!preset) return;
          tm.mergeTheme(preset.patch as any);
          setStatus(`Applied preset: ${preset.name}`);
     }
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
     function download(name: string, content: string) {
          const blob = new Blob([content], { type: 'application/json' });
          const url = URL.createObjectURL(blob);
          const a = document.createElement('a');
          a.href = url;
          a.download = name;
          a.click();
          setTimeout(() => URL.revokeObjectURL(url), 500);
     }
     function exportFiles() {
          const diff =
               deepDiff(baseTheme as any, buildProspective() as any) ?? {};
          download('theme.patch.json', pretty(diff));
          download('theme.full.json', pretty(buildProspective()));
          setStatus('Exported files');
     }

     const width = 520;
     const panelStyle: React.CSSProperties = {
          position: 'fixed',
          top: 0,
          right: 0,
          height: '100vh',
          width,
          transform: `translateX(${open ? 0 : width - 40}px)`,
          transition: 'transform .24s ease',
          zIndex: 99999,
          boxShadow: 'rgba(0,0,0,0.25) 0 10px 30px',
          background: '#0f172a',
          color: '#e2e8f0',
          borderLeft: '1px solid rgba(255,255,255,.08)',
          display: 'flex',
     };
     const tabStrip: React.CSSProperties = {
          display: 'flex',
          gap: 6,
          marginTop: 8,
          borderBottom: '1px solid rgba(255,255,255,.08)',
          paddingBottom: 8,
     };
     const tabBtn = (active: boolean): React.CSSProperties => ({
          padding: '6px 10px',
          borderRadius: 8,
          cursor: 'pointer',
          border: '1px solid rgba(255,255,255,.15)',
          background: active ? 'rgba(255,255,255,.1)' : 'transparent',
          color: 'inherit',
          fontSize: 12,
     });
     const inputStyle: React.CSSProperties = {
          width: '100%',
          fontFamily: 'ui-monospace, Menlo, Consolas, monospace',
          fontSize: 12,
          padding: 8,
          borderRadius: 8,
          border: '1px solid rgba(255,255,255,.15)',
          background: 'rgba(0,0,0,.25)',
          color: 'inherit',
     };
     const buttonStyle: React.CSSProperties = {
          padding: '8px 12px',
          borderRadius: 8,
          border: '1px solid rgba(255,255,255,.15)',
          background: 'rgba(255,255,255,.06)',
          color: 'inherit',
          cursor: 'pointer',
          fontSize: 12,
     };
     const sectionStyle: React.CSSProperties = { padding: 12 };

     const pathParsed = parseJson<any>(pathValueText);
     const currentVal = pathParsed.ok
          ? pathParsed.value?.value ?? pathParsed.value
          : undefined;

     return (
          <aside style={panelStyle} aria-label="Amplify Theme Dev Panel V3">
               <div
                    style={{
                         position: 'absolute',
                         left: -40,
                         top: 80,
                         width: 40,
                         height: 120,
                         borderRadius: '8px 0 0 8px',
                         background: '#2563eb',
                         color: 'white',
                         cursor: 'pointer',
                         writingMode: 'vertical-rl' as any,
                         textOrientation: 'mixed' as any,
                         display: 'flex',
                         alignItems: 'center',
                         justifyContent: 'center',
                         userSelect: 'none',
                         fontWeight: 700,
                         letterSpacing: 1,
                    }}
                    onClick={() => setOpen(!open)}
                    title={`Toggle (${shortcutLabel})`}
               >
                    Theme
               </div>

               <div style={{ flex: 1, overflow: 'auto' }}>
                    <header style={{ padding: 12 }}>
                         <div
                              style={{
                                   display: 'flex',
                                   alignItems: 'center',
                                   gap: 8,
                                   flexWrap: 'wrap',
                              }}
                         >
                              <strong>Amplify Theme Dev Panel</strong>
                              <span style={{ opacity: 0.7, fontSize: 12 }}>
                                   ({shortcutLabel})
                              </span>
                              <div
                                   style={{
                                        marginLeft: 'auto',
                                        display: 'flex',
                                        gap: 8,
                                        flexWrap: 'wrap',
                                   }}
                              >
                                   <button
                                        style={buttonStyle}
                                        onClick={() => tm.reset()}
                                   >
                                        Reset Theme
                                   </button>
                                   <button
                                        style={buttonStyle}
                                        onClick={copyFull}
                                   >
                                        Copy Full JSON
                                   </button>
                                   <button
                                        style={buttonStyle}
                                        onClick={copyDiff}
                                   >
                                        Copy Diff JSON
                                   </button>
                                   <button
                                        style={buttonStyle}
                                        onClick={exportFiles}
                                   >
                                        Export
                                   </button>
                              </div>
                         </div>
                         {status && (
                              <div
                                   style={{
                                        marginTop: 6,
                                        fontSize: 12,
                                        opacity: 0.85,
                                   }}
                              >
                                   {status}
                              </div>
                         )}

                         <div style={tabStrip}>
                              <button
                                   style={tabBtn(tab === 'tokens')}
                                   onClick={() => setTab('tokens')}
                              >
                                   Tokens
                              </button>
                              <button
                                   style={tabBtn(tab === 'presets')}
                                   onClick={() => setTab('presets')}
                              >
                                   Presets
                              </button>
                              <button
                                   style={tabBtn(tab === 'icons')}
                                   onClick={() => setTab('icons')}
                              >
                                   Icons
                              </button>
                              <button
                                   style={tabBtn(tab === 'inspect')}
                                   onClick={() => setTab('inspect')}
                              >
                                   Inspector
                              </button>
                         </div>
                    </header>

                    {/* TOKENS */}
                    {tab === 'tokens' && (
                         <div>
                              <section style={sectionStyle}>
                                   <div
                                        style={{
                                             fontWeight: 700,
                                             marginBottom: 6,
                                        }}
                                   >
                                        Path Mode
                                   </div>

                                   <Combobox
                                        label="Token Path"
                                        value={path}
                                        onChange={setPath}
                                        onInput={(e) =>
                                             setComboboxFilter(e.target.value)
                                        }
                                        options={filteredPaths}
                                        placeholder="tokens.colors.font.primary"
                                        style={{ marginBottom: 8 }}
                                   />
                                   <div style={{ height: 8 }} />
                                   <textarea
                                        style={{ ...inputStyle, minHeight: 80 }}
                                        value={pathValueText}
                                        onChange={(e) =>
                                             setPathValueText(e.target.value)
                                        }
                                        spellCheck={false}
                                   />
                                   <div style={{ height: 8 }} />

                                   {typeof currentVal === 'string' &&
                                        looksHex(currentVal) && (
                                             <div
                                                  style={{
                                                       display: 'grid',
                                                       gap: 8,
                                                  }}
                                             >
                                                  <label
                                                       style={{
                                                            fontSize: 12,
                                                            opacity: 0.8,
                                                       }}
                                                  >
                                                       HSL
                                                  </label>
                                                  <HslColorInput
                                                       value={currentVal}
                                                       onHexChange={(hex) =>
                                                            setPathValueText(
                                                                 pretty({
                                                                      value: hex,
                                                                 })
                                                            )
                                                       }
                                                  />
                                             </div>
                                        )}

                                   {(typeof currentVal === 'number' ||
                                        (typeof currentVal === 'string' &&
                                             /^-?\d+(\.\d+)?(px|rem|%)?$/.test(
                                                  currentVal
                                             ))) && (
                                        <div style={{ marginTop: 8 }}>
                                             <UnitInput
                                                  value={currentVal as any}
                                                  onCommit={(out) =>
                                                       setPathValueText(
                                                            pretty({
                                                                 value: out,
                                                            })
                                                       )
                                                  }
                                                  label="Value"
                                             />
                                        </div>
                                   )}

                                   <div
                                        style={{
                                             display: 'flex',
                                             gap: 8,
                                             marginTop: 8,
                                        }}
                                   >
                                        <button
                                             style={buttonStyle}
                                             onClick={applyPath}
                                        >
                                             Apply Path
                                        </button>
                                        <button
                                             style={buttonStyle}
                                             onClick={() => {
                                                  setPathValueText(
                                                       '{"value":"#0ea5e9"}'
                                                  );
                                                  setStatus('Path value reset');
                                             }}
                                        >
                                             Reset Value
                                        </button>
                                   </div>
                              </section>

                              <section style={sectionStyle}>
                                   <div
                                        style={{
                                             fontWeight: 700,
                                             marginBottom: 6,
                                        }}
                                   >
                                        Token Browser
                                   </div>
                                   <input
                                        style={inputStyle}
                                        placeholder="Filter by path (e.g., colors.brand)"
                                        value={filter}
                                        onChange={(e) =>
                                             setFilter(e.target.value)
                                        }
                                   />
                                   <div style={{ height: 8 }} />
                                   <div
                                        style={{
                                             display: 'grid',
                                             gap: 8,
                                             maxHeight: 300,
                                             overflow: 'auto',
                                             borderTop:
                                                  '1px solid rgba(255,255,255,.08)',
                                             paddingTop: 8,
                                        }}
                                   >
                                        {filteredLeaves.map((leaf) => (
                                             <div
                                                  key={leaf.path}
                                                  style={{
                                                       display: 'grid',
                                                       gridTemplateColumns:
                                                            '1fr auto',
                                                       gap: 8,
                                                       alignItems: 'center',
                                                  }}
                                             >
                                                  <div
                                                       style={{
                                                            fontSize: 12,
                                                            opacity: 0.9,
                                                       }}
                                                  >
                                                       {leaf.path}
                                                  </div>
                                                  <div
                                                       style={{
                                                            display: 'flex',
                                                            gap: 8,
                                                            alignItems:
                                                                 'center',
                                                            flexWrap: 'wrap',
                                                       }}
                                                  >
                                                       {typeof leaf.value ===
                                                            'string' &&
                                                            looksHex(
                                                                 leaf.value
                                                            ) && (
                                                                 <input
                                                                      type="color"
                                                                      value={
                                                                           leaf.value
                                                                      }
                                                                      onChange={(
                                                                           e
                                                                      ) => {
                                                                           tm.setByPath(
                                                                                leaf.path,
                                                                                {
                                                                                     value: e
                                                                                          .target
                                                                                          .value,
                                                                                }
                                                                           );
                                                                           setStatus(
                                                                                `Set ${leaf.path}`
                                                                           );
                                                                      }}
                                                                 />
                                                            )}
                                                       <input
                                                            style={{
                                                                 ...inputStyle,
                                                                 width: 200,
                                                            }}
                                                            defaultValue={
                                                                 typeof leaf.value ===
                                                                 'string'
                                                                      ? leaf.value
                                                                      : JSON.stringify(
                                                                             leaf.value
                                                                        )
                                                            }
                                                            onBlur={(e) => {
                                                                 let val: any =
                                                                      e.target
                                                                           .value;
                                                                 try {
                                                                      val =
                                                                           JSON.parse(
                                                                                val
                                                                           );
                                                                 } catch {}
                                                                 tm.setByPath(
                                                                      leaf.path,
                                                                      {
                                                                           value: val,
                                                                      }
                                                                 );
                                                                 setStatus(
                                                                      `Set ${leaf.path}`
                                                                 );
                                                            }}
                                                       />
                                                  </div>
                                             </div>
                                        ))}
                                        {filteredLeaves.length === 0 && (
                                             <div
                                                  style={{
                                                       opacity: 0.7,
                                                       fontSize: 12,
                                                  }}
                                             >
                                                  No tokens match.
                                             </div>
                                        )}
                                   </div>
                              </section>

                              <section style={sectionStyle}>
                                   <div
                                        style={{
                                             fontWeight: 700,
                                             marginBottom: 6,
                                        }}
                                   >
                                        JSON Merge
                                   </div>
                                   <textarea
                                        style={{
                                             ...inputStyle,
                                             minHeight: 160,
                                        }}
                                        value={mergeText}
                                        onChange={(e) =>
                                             setMergeText(e.target.value)
                                        }
                                        spellCheck={false}
                                   />
                                   <div style={{ height: 8 }} />
                                   <button
                                        style={buttonStyle}
                                        onClick={applyMerge}
                                   >
                                        Apply Merge
                                   </button>
                              </section>

                              <section style={sectionStyle}>
                                   <div
                                        style={{
                                             fontWeight: 700,
                                             marginBottom: 6,
                                        }}
                                   >
                                        Snapshots
                                   </div>
                                   <div
                                        style={{
                                             display: 'flex',
                                             gap: 8,
                                             flexWrap: 'wrap',
                                             alignItems: 'center',
                                        }}
                                   >
                                        <input
                                             style={inputStyle}
                                             placeholder="Snapshot name (optional)"
                                             id="atm__snap_name"
                                        />
                                        <button
                                             style={buttonStyle}
                                             onClick={() => {
                                                  const el =
                                                       document.getElementById(
                                                            'atm__snap_name'
                                                       ) as HTMLInputElement | null;
                                                  const name =
                                                       (
                                                            el?.value || ''
                                                       ).trim() ||
                                                       new Date().toLocaleString();
                                                  const diff =
                                                       deepDiff(
                                                            baseTheme as any,
                                                            buildProspective() as any
                                                       ) ?? {};
                                                  Snapshots.save(name, diff);
                                                  setStatus(
                                                       'Saved snapshot: ' + name
                                                  );
                                             }}
                                        >
                                             Save Snapshot (diff)
                                        </button>
                                        <button
                                             style={buttonStyle}
                                             onClick={() => {
                                                  Snapshots.clear();
                                                  setStatus(
                                                       'Cleared snapshots'
                                                  );
                                             }}
                                        >
                                             Clear All
                                        </button>
                                        <button
                                             style={buttonStyle}
                                             onClick={() => {
                                                  const data =
                                                       Snapshots.exportAll();
                                                  const blob = new Blob(
                                                       [
                                                            JSON.stringify(
                                                                 data,
                                                                 null,
                                                                 2
                                                            ),
                                                       ],
                                                       {
                                                            type: 'application/json',
                                                       }
                                                  );
                                                  const url =
                                                       URL.createObjectURL(
                                                            blob
                                                       );
                                                  const a =
                                                       document.createElement(
                                                            'a'
                                                       );
                                                  a.href = url;
                                                  a.download = 'snapshots.json';
                                                  a.click();
                                                  setTimeout(
                                                       () =>
                                                            URL.revokeObjectURL(
                                                                 url
                                                            ),
                                                       500
                                                  );
                                             }}
                                        >
                                             Export All
                                        </button>
                                        <label
                                             style={{
                                                  display: 'inline-flex',
                                                  alignItems: 'center',
                                                  gap: 6,
                                                  cursor: 'pointer',
                                             }}
                                        >
                                             <input
                                                  type="file"
                                                  accept="application/json"
                                                  style={{ display: 'none' }}
                                                  onChange={async (e) => {
                                                       const f =
                                                            e.target.files?.[0];
                                                       if (!f) return;
                                                       try {
                                                            const text =
                                                                 await f.text();
                                                            const json =
                                                                 JSON.parse(
                                                                      text
                                                                 );
                                                            const n =
                                                                 Snapshots.importAll(
                                                                      json
                                                                 );
                                                            setStatus(
                                                                 n
                                                                      ? `Imported ${n} snapshot(s)`
                                                                      : 'No snapshots imported'
                                                            );
                                                       } catch (err: any) {
                                                            setStatus(
                                                                 'Import failed: ' +
                                                                      (err?.message ||
                                                                           err)
                                                            );
                                                       } finally {
                                                            (
                                                                 e.target as HTMLInputElement
                                                            ).value = '';
                                                       }
                                                  }}
                                             />
                                             <span
                                                  style={{
                                                       padding: '6px 10px',
                                                       borderRadius: 6,
                                                       border: '1px solid rgba(255,255,255,.15)',
                                                       background:
                                                            'rgba(255,255,255,.06)',
                                                  }}
                                             >
                                                  Import
                                             </span>
                                        </label>
                                   </div>
                                   <div
                                        style={{
                                             marginTop: 8,
                                             display: 'grid',
                                             gap: 6,
                                             maxHeight: 160,
                                             overflow: 'auto',
                                        }}
                                   >
                                        {Snapshots.list().map((s) => (
                                             <div
                                                  key={s.id}
                                                  style={{
                                                       display: 'grid',
                                                       gridTemplateColumns:
                                                            '1fr auto auto',
                                                       gap: 8,
                                                       alignItems: 'center',
                                                  }}
                                             >
                                                  <div
                                                       style={{
                                                            fontSize: 12,
                                                            opacity: 0.9,
                                                       }}
                                                  >
                                                       {s.name}{' '}
                                                       <span
                                                            style={{
                                                                 opacity: 0.6,
                                                            }}
                                                       >
                                                            (
                                                            {new Date(
                                                                 s.createdAt
                                                            ).toLocaleString()}
                                                            )
                                                       </span>
                                                  </div>
                                                  <button
                                                       style={buttonStyle}
                                                       onClick={() => {
                                                            tm.mergeTheme(
                                                                 s.patch as any
                                                            );
                                                            setStatus(
                                                                 'Applied snapshot: ' +
                                                                      s.name
                                                            );
                                                       }}
                                                  >
                                                       Apply
                                                  </button>
                                                  <button
                                                       style={buttonStyle}
                                                       onClick={() => {
                                                            Snapshots.remove(
                                                                 s.id
                                                            );
                                                            setStatus(
                                                                 'Removed snapshot: ' +
                                                                      s.name
                                                            );
                                                       }}
                                                  >
                                                       Delete
                                                  </button>
                                             </div>
                                        ))}
                                        {Snapshots.list().length === 0 && (
                                             <div
                                                  style={{
                                                       opacity: 0.7,
                                                       fontSize: 12,
                                                  }}
                                             >
                                                  No snapshots yet.
                                             </div>
                                        )}
                                   </div>
                              </section>
                         </div>
                    )}

                    {/* PRESETS */}
                    {tab === 'presets' && (
                         <section style={sectionStyle}>
                              <div style={{ fontWeight: 700, marginBottom: 6 }}>
                                   Presets
                              </div>
                              <select
                                   style={{ ...inputStyle, width: 'auto' }}
                                   value={presetName}
                                   onChange={(e) =>
                                        setPresetName(e.target.value)
                                   }
                              >
                                   {PRESETS.map((p) => (
                                        <option key={p.name} value={p.name}>
                                             {p.name}
                                        </option>
                                   ))}
                              </select>
                              <div style={{ height: 8 }} />
                              <button style={buttonStyle} onClick={applyPreset}>
                                   Apply Preset
                              </button>
                              <div
                                   style={{
                                        marginTop: 6,
                                        fontSize: 12,
                                        opacity: 0.8,
                                   }}
                              >
                                   {findPresetByName(presetName)?.description}
                              </div>
                         </section>
                    )}

                    {/* ICONS */}
                    {tab === 'icons' && <IconsTab />}

                    {/* INSPECTOR */}
                    {tab === 'inspect' && (
                         <section style={sectionStyle}>
                              <div style={{ fontWeight: 700, marginBottom: 6 }}>
                                   Inspector (read-only)
                              </div>
                              <textarea
                                   style={{
                                        ...inputStyle,
                                        minHeight: 260,
                                        opacity: 0.9,
                                   }}
                                   value={pretty(baseTheme)}
                                   readOnly
                                   spellCheck={false}
                              />
                         </section>
                    )}
               </div>
          </aside>
     );
}

function IconsTab() {
     const icons = useIconsManager();
     const [preset, setPreset] = React.useState<'minimal' | 'feather'>(
          'minimal'
     );
     const [loadingPreset, setLoadingPreset] = React.useState(false);
     const [iconKey, setIconKey] = React.useState('alert');
     const [pathData, setPathData] = React.useState('M12 2L2 22h20L12 2z');
     const [iconName, setIconName] = React.useState('CustomTriangle');
     const currentIcons = icons.get();

     const inputStyle: React.CSSProperties = {
          width: '100%',
          fontFamily: 'ui-monospace, Menlo, Consolas, monospace',
          fontSize: 12,
          padding: 8,
          borderRadius: 8,
          border: '1px solid rgba(255,255,255,.15)',
          background: 'rgba(0,0,0,.25)',
          color: 'inherit',
     };
     const buttonStyle: React.CSSProperties = {
          padding: '8px 12px',
          borderRadius: 8,
          border: '1px solid rgba(255,255,255,.15)',
          background: 'rgba(255,255,255,.06)',
          color: 'inherit',
          cursor: 'pointer',
          fontSize: 12,
     };
     const sectionStyle: React.CSSProperties = { padding: 12 };

     const knownKeys = [
          'alert',
          'rating.full',
          'rating.empty',
          'password.show',
          'password.hide',
          'storage.folder',
          'storage.file',
     ];

     return (
          <section style={sectionStyle}>
               <div style={{ fontWeight: 700, marginBottom: 8 }}>Icons</div>
               <div
                    style={{
                         display: 'grid',
                         gap: 8,
                         alignItems: 'center',
                         gridTemplateColumns: '1fr auto',
                         marginBottom: 8,
                    }}
               >
                    <div>
                         <div
                              style={{
                                   fontSize: 12,
                                   opacity: 0.8,
                                   marginBottom: 4,
                              }}
                         >
                              Preset
                         </div>
                         <select
                              value={preset}
                              onChange={(e) => setPreset(e.target.value as any)}
                              style={{ ...inputStyle, width: 'auto' }}
                         >
                              <option value="minimal">
                                   Minimal (built-in)
                              </option>
                              <option value="feather">
                                   Feather (react-icons)
                              </option>
                         </select>
                    </div>
                    <button
                         style={buttonStyle}
                         onClick={async () => {
                              setLoadingPreset(true);
                              try {
                                   const map = await IconPresets.buildPreset(
                                        preset
                                   );
                                   icons.setAll(map);
                              } finally {
                                   setLoadingPreset(false);
                              }
                         }}
                    >
                         {loadingPreset ? 'Applying…' : 'Apply Preset'}
                    </button>
               </div>

               <div style={{ margin: '8px 0', fontSize: 12 }}>
                    <strong>Registered:</strong>{' '}
                    {Object.keys(currentIcons).length
                         ? Object.keys(currentIcons).join(', ')
                         : '—'}
               </div>

               <div style={{ display: 'grid', gap: 8, maxWidth: 560 }}>
                    <label style={{ fontSize: 12, opacity: 0.8 }}>
                         Icon Key
                    </label>
                    <select
                         value={iconKey}
                         onChange={(e) => setIconKey(e.target.value)}
                         style={{ ...inputStyle, width: 'auto' }}
                    >
                         {knownKeys.map((k) => (
                              <option key={k} value={k}>
                                   {k}
                              </option>
                         ))}
                    </select>
                    <label style={{ fontSize: 12, opacity: 0.8 }}>
                         SVG path (d)
                    </label>
                    <textarea
                         style={{ ...inputStyle, minHeight: 100 }}
                         value={pathData}
                         onChange={(e) => setPathData(e.target.value)}
                    />
                    <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
                         <button
                              style={buttonStyle}
                              onClick={() => {
                                   const Comp = makePathIcon(
                                        pathData.trim(),
                                        iconName || 'PathIcon'
                                   );
                                   icons.set(iconKey, Comp);
                              }}
                         >
                              Set from Path
                         </button>
                         <input
                              style={{ ...inputStyle, width: 240 }}
                              placeholder="optional display name"
                              value={iconName}
                              onChange={(e) => setIconName(e.target.value)}
                         />
                         <button
                              style={buttonStyle}
                              onClick={() => icons.remove(iconKey)}
                         >
                              Remove
                         </button>
                         <button
                              style={buttonStyle}
                              onClick={() => icons.reset()}
                         >
                              Reset All
                         </button>
                    </div>
               </div>
          </section>
     );
}
