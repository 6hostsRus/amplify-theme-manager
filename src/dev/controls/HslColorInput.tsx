import React from 'react';
import { hexToHsl, hslToHex, clamp } from './color';

export function HslColorInput({ value, onHexChange, disabled }: { value: string; onHexChange: (hex: string) => void; disabled?: boolean; }) {
  const startHex = value.startsWith('#') ? value : '#000000';
  const parsed = hexToHsl(startHex) ?? { h: 0, s: 0, l: 0 };
  const [h, setH] = React.useState(parsed.h);
  const [s, setS] = React.useState(parsed.s);
  const [l, setL] = React.useState(parsed.l);
  React.useEffect(() => { onHexChange(hslToHex({ h, s, l })); }, [h,s,l]);
  return (
    <div style={{ display:'grid', gridTemplateColumns:'32px 1fr 64px', gap:8, alignItems:'center' }}>
      <label style={{ fontSize:12, opacity:.8 }}>H</label>
      <input type="range" min={0} max={360} value={h} onChange={(e)=>setH(Number(e.target.value))} disabled={disabled}/>
      <input type="number" min={0} max={360} value={Math.round(h)} onChange={(e)=>setH(clamp(Number(e.target.value),0,360))} disabled={disabled}/>
      <label style={{ fontSize:12, opacity:.8 }}>S</label>
      <input type="range" min={0} max={100} value={s} onChange={(e)=>setS(Number(e.target.value))} disabled={disabled}/>
      <input type="number" min={0} max={100} value={Math.round(s)} onChange={(e)=>setS(clamp(Number(e.target.value),0,100))} disabled={disabled}/>
      <label style={{ fontSize:12, opacity:.8 }}>L</label>
      <input type="range" min={0} max={100} value={l} onChange={(e)=>setL(Number(e.target.value))} disabled={disabled}/>
      <input type="number" min={0} max={100} value={Math.round(l)} onChange={(e)=>setL(clamp(Number(e.target.value),0,100))} disabled={disabled}/>
    </div>
  );
}
