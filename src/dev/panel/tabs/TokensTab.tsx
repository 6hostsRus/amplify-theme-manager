import React from 'react';
import type { DevPanelState } from '../useDevPanelState';
import { parseJson } from '../useDevPanelState';
import { HslColorInput } from '../../controls/HslColorInput';
import { UnitInput } from '../../controls/UnitInput';
import { Combobox } from '../../Combobox';

const HEX_RE = /^#([0-9a-f]{3}|[0-9a-f]{6}|[0-9a-f]{8})$/i;
const looksHex = (s: any) => typeof s === 'string' && HEX_RE.test(s);
const pretty = (v: unknown) => JSON.stringify(v, null, 2);

function isObj(v: unknown): v is Record<string, unknown> {
     return !!v && typeof v === 'object' && !Array.isArray(v);
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

export const TokensTab: React.FC<{ state: DevPanelState }> = ({ state }) => {
     const {
          path,
          setPath,
          pathValueText,
          setPathValueText,
          mergeText,
          setMergeText,
          tokenFilter,
          setTokenFilter,
          baseTheme,
          applyPath,
          applyMerge,
          copyDiff,
          copyFull,
          exportFiles,
          manager,
          setStatus,
          tokenPaths,
          buildProspective,
     } = state;

     const [comboboxFilter, setComboboxFilter] = React.useState('');
     const filteredPaths = React.useMemo(() => {
          const q = comboboxFilter.trim().toLowerCase();
          if (!q) return tokenPaths.slice(0, 100);
          return tokenPaths
               .filter((p) => p.toLowerCase().includes(q))
               .slice(0, 100);
     }, [tokenPaths, comboboxFilter]);

     const tokenLeaves = React.useMemo(
          () => gatherTokenLeaves(baseTheme?.tokens ?? {}),
          [baseTheme]
     );
     const filteredLeaves = React.useMemo(() => {
          const q = tokenFilter.trim().toLowerCase();
          if (!q) return tokenLeaves.slice(0, 300);
          return tokenLeaves
               .filter((t) => t.path.toLowerCase().includes(q))
               .slice(0, 600);
     }, [tokenLeaves, tokenFilter]);

     const pathParsed = parseJson<any>(pathValueText);
     const currentVal = pathParsed.ok
          ? pathParsed.value?.value ?? pathParsed.value
          : undefined;

     const buttonStyle: React.CSSProperties = {
          padding: '8px 12px',
          borderRadius: 8,
          border: '1px solid rgba(255,255,255,.15)',
          background: 'rgba(255,255,255,.06)',
          color: 'inherit',
          cursor: 'pointer',
          fontSize: 12,
     };
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

     return (
          <div style={{ flex: 1, overflow: 'auto' }}>
               <section style={{ padding: 12 }}>
                    <strong style={{ display: 'block', marginBottom: 6 }}>
                         Path Mode
                    </strong>
                    <Combobox
                         label="Token Path"
                         value={path}
                         onChange={setPath}
                         onInput={(e) => setComboboxFilter(e.target.value)}
                         options={filteredPaths}
                         placeholder="tokens.colors.font.primary"
                         style={{ marginBottom: 8 }}
                    />
                    <textarea
                         style={{ ...inputStyle, minHeight: 80 }}
                         value={pathValueText}
                         onChange={(e) => setPathValueText(e.target.value)}
                         spellCheck={false}
                    />
                    <div style={{ height: 8 }} />
                    {typeof currentVal === 'string' && looksHex(currentVal) && (
                         <div style={{ display: 'grid', gap: 8 }}>
                              <label style={{ fontSize: 12, opacity: 0.8 }}>
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
                              flexWrap: 'wrap',
                         }}
                    >
                         <button style={buttonStyle} onClick={applyPath}>
                              Apply Path
                         </button>
                         <button
                              style={buttonStyle}
                              onClick={() => {
                                   setPathValueText('{"value":"#0ea5e9"}');
                                   setStatus('Path value reset');
                              }}
                         >
                              Reset Value
                         </button>
                         <button
                              style={buttonStyle}
                              onClick={() => {
                                   manager.reset();
                                   setStatus('Theme reset');
                              }}
                         >
                              Reset Theme
                         </button>
                         <button style={buttonStyle} onClick={copyFull}>
                              Copy Full
                         </button>
                         <button style={buttonStyle} onClick={copyDiff}>
                              Copy Diff
                         </button>
                         <button style={buttonStyle} onClick={exportFiles}>
                              Export
                         </button>
                    </div>
               </section>

               <section style={{ padding: 12 }}>
                    <strong style={{ display: 'block', marginBottom: 6 }}>
                         Token Browser
                    </strong>
                    <input
                         style={inputStyle}
                         placeholder="Filter by path"
                         value={tokenFilter}
                         onChange={(e) => setTokenFilter(e.target.value)}
                    />
                    <div style={{ height: 8 }} />
                    <div
                         style={{
                              display: 'grid',
                              gap: 8,
                              maxHeight: 300,
                              overflow: 'auto',
                              borderTop: '1px solid rgba(255,255,255,.08)',
                              paddingTop: 8,
                         }}
                    >
                         {filteredLeaves.map((leaf) => (
                              <div
                                   key={leaf.path}
                                   style={{
                                        display: 'grid',
                                        gridTemplateColumns: '1fr auto',
                                        gap: 8,
                                        alignItems: 'center',
                                   }}
                              >
                                   <div style={{ fontSize: 12, opacity: 0.9 }}>
                                        {leaf.path}
                                   </div>
                                   <div
                                        style={{
                                             display: 'flex',
                                             gap: 8,
                                             alignItems: 'center',
                                             flexWrap: 'wrap',
                                        }}
                                   >
                                        {/* Color input only if valid token path */}
                                        {leaf.path.startsWith('tokens.') &&
                                             typeof leaf.value === 'string' &&
                                             looksHex(leaf.value) && (
                                                  <input
                                                       type="color"
                                                       value={leaf.value}
                                                       onChange={(e) => {
                                                            manager.setByPath(
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
                                                  typeof leaf.value === 'string'
                                                       ? leaf.value
                                                       : JSON.stringify(
                                                              leaf.value
                                                         )
                                             }
                                             onBlur={(e) => {
                                                  if (
                                                       !leaf.path.startsWith(
                                                            'tokens.'
                                                       )
                                                  ) {
                                                       setStatus(
                                                            'Blocked (read-only outside tokens.*)'
                                                       );
                                                       e.target.value =
                                                            typeof leaf.value ===
                                                            'string'
                                                                 ? leaf.value
                                                                 : JSON.stringify(
                                                                        leaf.value
                                                                   );
                                                       return;
                                                  }
                                                  let val: any = e.target.value;
                                                  try {
                                                       val = JSON.parse(val);
                                                  } catch {}
                                                  manager.setByPath(leaf.path, {
                                                       value: val,
                                                  });
                                                  setStatus(`Set ${leaf.path}`);
                                             }}
                                             readOnly={
                                                  !leaf.path.startsWith(
                                                       'tokens.'
                                                  )
                                             }
                                        />
                                   </div>
                              </div>
                         ))}
                         {filteredLeaves.length === 0 && (
                              <div style={{ opacity: 0.7, fontSize: 12 }}>
                                   No tokens match.
                              </div>
                         )}
                    </div>
               </section>

               <section style={{ padding: 12 }}>
                    <strong style={{ display: 'block', marginBottom: 6 }}>
                         JSON Merge
                    </strong>
                    <textarea
                         style={{ ...inputStyle, minHeight: 160 }}
                         value={mergeText}
                         onChange={(e) => setMergeText(e.target.value)}
                         spellCheck={false}
                    />
                    <div style={{ height: 8 }} />
                    <button style={buttonStyle} onClick={applyMerge}>
                         Apply Merge
                    </button>
               </section>

               <section style={{ padding: 12 }}>
                    <strong style={{ display: 'block', marginBottom: 6 }}>
                         Prospective Theme (read-only)
                    </strong>
                    <textarea
                         style={{
                              ...inputStyle,
                              minHeight: 160,
                              opacity: 0.85,
                         }}
                         readOnly
                         value={pretty(buildProspective())}
                         spellCheck={false}
                    />
               </section>
          </div>
     );
};
