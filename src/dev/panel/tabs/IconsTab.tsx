import React from 'react';
import type { DevPanelState } from '../useDevPanelState';
import * as IconPresets from '../../../icons/presets';
import { makePathIcon } from '../../../icons/manager';

export const IconsTab: React.FC<{ state: DevPanelState }> = ({ state }) => {
     const { icons } = state;
     const currentIcons = icons.get();

     const [preset, setPreset] = React.useState<'minimal' | 'feather'>(
          'minimal'
     );
     const [loadingPreset, setLoadingPreset] = React.useState(false);
     const [iconKey, setIconKey] = React.useState('alert');
     const [pathData, setPathData] = React.useState('M12 2L2 22h20L12 2z');
     const [iconName, setIconName] = React.useState('CustomTriangle');

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
          <div style={{ padding: 12 }}>
               <strong style={{ display: 'block', marginBottom: 8 }}>
                    Icons
               </strong>
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
          </div>
     );
};
