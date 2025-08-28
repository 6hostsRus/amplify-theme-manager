import React from 'react';
import type { DevPanelState } from '../useDevPanelState';
import { PRESETS, findPresetByName } from '../../../presets';

export const PresetsTab: React.FC<{ state: DevPanelState }> = ({ state }) => {
     const { presetName, setPresetName, applyPreset } = state;
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

     return (
          <div style={{ padding: 12 }}>
               <strong style={{ display: 'block', marginBottom: 6 }}>
                    Presets
               </strong>
               <select
                    style={{ ...inputStyle, width: 'auto' }}
                    value={presetName}
                    onChange={(e) => setPresetName(e.target.value)}
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
               <div style={{ marginTop: 6, fontSize: 12, opacity: 0.8 }}>
                    {findPresetByName(presetName)?.description}
               </div>
          </div>
     );
};
