import React from 'react';

export function Combobox({
     value,
     options,
     onChange,
     onInput,
     placeholder,
     style,
     label,
}: {
     value: string;
     options: string[];
     onChange: (v: string) => void;
     onInput?: (e: React.ChangeEvent<HTMLInputElement>) => void;
     placeholder?: string;
     style?: React.CSSProperties;
     label?: string;
}) {
     const [open, setOpen] = React.useState(false);
     const inputRef = React.useRef<HTMLInputElement>(null);

     return (
          <div style={{ position: 'relative', width: '100%' }}>
               {label && (
                    <label
                         style={{ fontSize: 12, opacity: 0.8, marginBottom: 4 }}
                    >
                         {label}
                    </label>
               )}
               <input
                    ref={inputRef}
                    style={{
                         width: '100%',
                         fontFamily: 'ui-monospace, Menlo, Consolas, monospace',
                         fontSize: 12,
                         padding: 8,
                         borderRadius: 8,
                         border: '1px solid rgba(255,255,255,.15)',
                         background: 'rgba(0,0,0,.25)',
                         color: 'inherit',
                         ...style,
                    }}
                    value={value}
                    onChange={(e) => {
                         onChange(e.target.value);
                         onInput?.(e);
                         setOpen(true);
                    }}
                    onFocus={() => setOpen(true)}
                    onBlur={() => setTimeout(() => setOpen(false), 120)}
                    placeholder={placeholder}
                    autoComplete="off"
               />
               {open && options.length > 0 && (
                    <div
                         style={{
                              position: 'absolute',
                              top: '100%',
                              left: 0,
                              right: 0,
                              background: '#1e293b',
                              border: '1px solid rgba(255,255,255,.12)',
                              borderRadius: 8,
                              zIndex: 10,
                              maxHeight: 180,
                              overflowY: 'auto',
                              boxShadow: '0 2px 12px rgba(0,0,0,0.18)',
                         }}
                    >
                         {options.map((opt) => (
                              <div
                                   key={opt}
                                   style={{
                                        padding: '8px 12px',
                                        cursor: 'pointer',
                                        fontSize: 12,
                                        borderBottom:
                                             '1px solid rgba(255,255,255,.06)',
                                        background:
                                             opt === value
                                                  ? 'rgba(255,255,255,.08)'
                                                  : 'transparent',
                                   }}
                                   onMouseDown={() => {
                                        onChange(opt);
                                        setOpen(false);
                                        inputRef.current?.blur();
                                   }}
                              >
                                   {opt}
                              </div>
                         ))}
                    </div>
               )}
          </div>
     );
}
