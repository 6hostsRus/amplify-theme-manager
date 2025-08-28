import React from 'react';
import { useDevPanelState } from './useDevPanelState';
import { TABS, TabId } from './tabs/registry';
import { TokensTab } from './tabs/TokensTab';
import { PresetsTab } from './tabs/PresetsTab';
import { IconsTab } from './tabs/IconsTab';
import { InspectTab } from './tabs/InspectTab';
import { SnapshotsTab } from './tabs/SnapshotsTab';
import { PanelShell, TabBar, TabButton } from './components/PanelPrimitives';
import { useColorMode } from '../../react';

export const DevThemePanelV3: React.FC = () => {
     const state = useDevPanelState();
     const { mode, setMode, resolvedMode } = useColorMode();

     const renderTab = (id: TabId) => {
          switch (id) {
               case 'tokens':
                    return <TokensTab state={state} />;
               case 'presets':
                    return <PresetsTab state={state} />;
               case 'icons':
                    return <IconsTab state={state} />;
               case 'inspect':
                    return <InspectTab state={state} />;
               case 'snapshots':
                    return <SnapshotsTab state={state} />;
               default:
                    return null;
          }
     };

     return (
          <PanelShell
               open={state.open}
               onToggle={() => state.setOpen(!state.open)}
               shortcutLabel="Ctrl+Shift+D"
          >
               <header style={{ padding: '8px 10px 4px' }}>
                    <div
                         style={{
                              display: 'flex',
                              alignItems: 'center',
                              gap: 8,
                              flexWrap: 'wrap',
                         }}
                    >
                         <strong>Amplify Theme Dev Panel</strong>
                         <span style={{ fontSize: 11, opacity: 0.7 }}>
                              mode: {mode} (resolved: {resolvedMode})
                         </span>
                         {state.status && (
                              <span style={{ fontSize: 11, opacity: 0.8 }}>
                                   {state.status}
                              </span>
                         )}
                         <div
                              style={{
                                   marginLeft: 'auto',
                                   display: 'flex',
                                   gap: 4,
                              }}
                         >
                              <select
                                   style={{
                                        fontSize: 11,
                                        background: 'rgba(255,255,255,.06)',
                                        color: 'inherit',
                                        border: '1px solid rgba(255,255,255,.15)',
                                        borderRadius: 6,
                                        padding: '4px 6px',
                                   }}
                                   value={mode}
                                   onChange={(e) =>
                                        setMode(e.target.value as any)
                                   }
                                   title="Color Mode"
                              >
                                   <option value="system">system</option>
                                   <option value="light">light</option>
                                   <option value="dark">dark</option>
                              </select>
                         </div>
                    </div>
               </header>
               <TabBar>
                    {TABS.map((t) => (
                         <TabButton
                              key={t.id}
                              active={state.activeTab === t.id}
                              onClick={() => state.setActiveTab(t.id)}
                              title={t.label}
                         >
                              {t.label}
                         </TabButton>
                    ))}
               </TabBar>
               {renderTab(state.activeTab)}
          </PanelShell>
     );
};
