import React from 'react';

type Unit = 'none' | 'px' | 'rem' | '%';

function splitUnit(input: string | number): { n: number; unit: Unit } {
  if (typeof input === 'number') return { n: input, unit: 'none' };
  const s = String(input).trim();
  const m = s.match(/^(-?\d+(?:\.\d+)?)(px|rem|%)$/);
  if (!m) return { n: Number(s) || 0, unit: 'none' };
  return { n: Number(m[1]), unit: m[2] as Unit };
}
function joinUnit(n: number, unit: Unit): string | number { return unit === 'none' ? n : `${n}${unit}`; }
function defaultRange(unit: Unit, n: number) {
  if (unit === '%') return { min: 0, max: 100, step: 1 };
  if (unit === 'rem') return { min: 0, max: Math.max(4, Math.ceil(n * 2) || 4), step: 0.05 };
  if (unit === 'px') return { min: 0, max: Math.max(64, Math.ceil(n * 2) || 64), step: 1 };
  if (n >= 0 && n <= 1) return { min: 0, max: 1, step: 0.01 };
  return { min: 0, max: Math.max(100, Math.ceil(n * 2) || 100), step: 1 };
}

export function UnitInput({ value, onCommit, label, disabled }:{ value: string | number; onCommit: (out: string | number) => void; label?: string; disabled?: boolean; }) {
  const { n, unit } = splitUnit(value);
  const [num, setNum] = React.useState<number>(isNaN(n) ? 0 : n);
  const [u, setU] = React.useState<Unit>(unit);
  const range = defaultRange(u, num);
  React.useEffect(()=>{ onCommit(joinUnit(num,u)); }, [num,u]);
  return (
    <div style={{ display:'grid', gridTemplateColumns:'1fr 64px 72px', gap:8, alignItems:'center' }}>
      {label && <label style={{ fontSize:12, opacity:.8 }}>{label}</label>}
      <input type="range" min={range.min} max={range.max} step={range.step} value={num} onChange={(e)=>setNum(Number(e.target.value))} disabled={disabled}/>
      <div style={{ display:'flex', gap:6 }}>
        <input type="number" step={range.step} value={num} onChange={(e)=>setNum(Number(e.target.value))} disabled={disabled} style={{ width:80 }}/>
        <select value={u} onChange={(e)=>setU(e.target.value as Unit)} disabled={disabled}>
          <option value="none">none</option>
          <option value="px">px</option>
          <option value="rem">rem</option>
          <option value="%">%</option>
        </select>
      </div>
    </div>
  );
}
