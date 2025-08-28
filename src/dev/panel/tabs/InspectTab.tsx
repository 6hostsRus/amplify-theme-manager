import React from 'react';
import type { DevPanelState } from '../useDevPanelState';

const pretty = (v: unknown) => JSON.stringify(v, null, 2);

export const InspectTab: React.FC<{ state: DevPanelState }> = ({ state }) => {
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
                    Inspector (read-only)
               </strong>
               <textarea
                    style={{ ...inputStyle, minHeight: 260, opacity: 0.9 }}
                    value={pretty(state.baseTheme)}
                    readOnly
                    spellCheck={false}
               />
          </div>
     );
};
