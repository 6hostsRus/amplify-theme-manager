import React from 'react';
import type { DevPanelState } from '../useDevPanelState';
import { Snapshots } from '../helpers/snapshots';
import { deepDiff } from '../../../dev/diff';

export const SnapshotsTab: React.FC<{ state: DevPanelState }> = ({ state }) => {
     const { baseTheme, buildProspective, manager, setStatus } = state;
     const [list, setList] = React.useState(() => Snapshots.list());
     const refresh = () => setList(Snapshots.list());

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
          <div style={{ padding: 12 }}>
               <strong style={{ display: 'block', marginBottom: 6 }}>
                    Snapshots
               </strong>
               <div
                    style={{
                         display: 'flex',
                         gap: 8,
                         flexWrap: 'wrap',
                         alignItems: 'center',
                         marginBottom: 8,
                    }}
               >
                    <input
                         style={{ ...inputStyle, maxWidth: 220 }}
                         placeholder="Snapshot name (optional)"
                         id="atm__snap_name_v3"
                    />
                    <button
                         style={buttonStyle}
                         onClick={() => {
                              const el = document.getElementById(
                                   'atm__snap_name_v3'
                              ) as HTMLInputElement | null;
                              const name =
                                   (el?.value || '').trim() ||
                                   new Date().toLocaleString();
                              const diff =
                                   deepDiff(
                                        baseTheme as any,
                                        buildProspective() as any
                                   ) ?? {};
                              Snapshots.save(name, diff);
                              refresh();
                              setStatus('Saved snapshot: ' + name);
                         }}
                    >
                         Save Diff
                    </button>
                    <button
                         style={buttonStyle}
                         onClick={() => {
                              Snapshots.clear();
                              refresh();
                              setStatus('Cleared snapshots');
                         }}
                    >
                         Clear All
                    </button>
                    <button
                         style={buttonStyle}
                         onClick={() => {
                              const data = Snapshots.exportAll();
                              const blob = new Blob(
                                   [JSON.stringify(data, null, 2)],
                                   {
                                        type: 'application/json',
                                   }
                              );
                              const url = URL.createObjectURL(blob);
                              const a = document.createElement('a');
                              a.href = url;
                              a.download = 'snapshots.json';
                              a.click();
                              setTimeout(() => URL.revokeObjectURL(url), 500);
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
                                   const f = e.target.files?.[0];
                                   if (!f) return;
                                   try {
                                        const text = await f.text();
                                        const json = JSON.parse(text);
                                        const n = Snapshots.importAll(json);
                                        refresh();
                                        setStatus(
                                             n
                                                  ? `Imported ${n} snapshot(s)`
                                                  : 'No snapshots imported'
                                        );
                                   } catch (err: any) {
                                        setStatus(
                                             'Import failed: ' +
                                                  (err?.message || err)
                                        );
                                   } finally {
                                        (e.target as HTMLInputElement).value =
                                             '';
                                   }
                              }}
                         />
                         <span
                              style={{
                                   padding: '6px 10px',
                                   borderRadius: 6,
                                   border: '1px solid rgba(255,255,255,.15)',
                                   background: 'rgba(255,255,255,.06)',
                              }}
                         >
                              Import
                         </span>
                    </label>
               </div>
               <div
                    style={{
                         display: 'grid',
                         gap: 6,
                         maxHeight: 200,
                         overflow: 'auto',
                    }}
               >
                    {list.map((s) => (
                         <div
                              key={s.id}
                              style={{
                                   display: 'grid',
                                   gridTemplateColumns: '1fr auto auto',
                                   gap: 8,
                                   alignItems: 'center',
                              }}
                         >
                              <div style={{ fontSize: 12, opacity: 0.9 }}>
                                   {s.name}{' '}
                                   <span style={{ opacity: 0.6 }}>
                                        (
                                        {new Date(s.createdAt).toLocaleString()}
                                        )
                                   </span>
                              </div>
                              <button
                                   style={buttonStyle}
                                   onClick={() => {
                                        manager.mergeTheme(s.patch as any);
                                        setStatus(
                                             'Applied snapshot: ' + s.name
                                        );
                                   }}
                              >
                                   Apply
                              </button>
                              <button
                                   style={buttonStyle}
                                   onClick={() => {
                                        Snapshots.remove(s.id);
                                        refresh();
                                        setStatus(
                                             'Removed snapshot: ' + s.name
                                        );
                                   }}
                              >
                                   Delete
                              </button>
                         </div>
                    ))}
                    {!list.length && (
                         <div style={{ opacity: 0.7, fontSize: 12 }}>
                              No snapshots yet.
                         </div>
                    )}
               </div>
          </div>
     );
};
