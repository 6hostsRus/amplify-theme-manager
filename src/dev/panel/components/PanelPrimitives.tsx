import React from 'react';

export const PanelShell: React.FC<
     React.PropsWithChildren<{
          open: boolean;
          onToggle(): void;
          width?: number;
          shortcutLabel?: string;
     }>
> = ({
     children,
     open,
     onToggle,
     width = 520,
     shortcutLabel = 'Ctrl+Shift+D',
}) => (
     <div
          style={{
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
               flexDirection: 'column',
               fontSize: 12,
               fontFamily: 'system-ui, sans-serif',
          }}
     >
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
               onClick={onToggle}
               title={`Toggle (${shortcutLabel})`}
          >
               Theme
          </div>
          {children}
     </div>
);

export const TabBar: React.FC<React.PropsWithChildren<{}>> = ({ children }) => (
     <div
          style={{
               display: 'flex',
               borderBottom: '1px solid rgba(255,255,255,.08)',
               padding: '6px 6px 4px',
               gap: 4,
               flexWrap: 'wrap',
          }}
     >
          {children}
     </div>
);

export const TabButton: React.FC<
     React.PropsWithChildren<{
          active?: boolean;
          onClick(): void;
          title?: string;
     }>
> = ({ active, onClick, children, title }) => (
     <button
          title={title}
          onClick={onClick}
          style={{
               padding: '6px 10px',
               borderRadius: 8,
               cursor: 'pointer',
               border: '1px solid rgba(255,255,255,.15)',
               background: active ? 'rgba(255,255,255,.12)' : 'transparent',
               color: 'inherit',
               fontSize: 12,
          }}
     >
          {children}
     </button>
);
