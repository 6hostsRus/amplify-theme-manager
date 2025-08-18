export type HSL = { h: number; s: number; l: number };
export function clamp(n: number, min = 0, max = 1) { return Math.min(max, Math.max(min, n)); }
export function hexToHsl(hex: string): HSL | null {
  const m = hex.trim().toLowerCase().match(/^#([0-9a-f]{3,8})$/i);
  if (!m) return null;
  let h = m[1]!;
  if (h.length === 3 || h.length === 4) {
    const r = parseInt(h[0] + h[0], 16), g = parseInt(h[1] + h[1], 16), b = parseInt(h[2] + h[2], 16);
    return rgbToHsl(r, g, b);
  }
  const r = parseInt(h.slice(0,2),16), g = parseInt(h.slice(2,4),16), b = parseInt(h.slice(4,6),16);
  return rgbToHsl(r,g,b);
}
export function hslToHex({h,s,l}: HSL): string {
  const { r, g, b } = hslToRgb(h, s, l);
  return '#' + [r,g,b].map(n => n.toString(16).padStart(2,'0')).join('');
}
export function rgbToHsl(r:number,g:number,b:number): HSL {
  r/=255; g/=255; b/=255;
  const max = Math.max(r,g,b), min = Math.min(r,g,b);
  let h=0, s=0, l=(max+min)/2;
  if (max!==min) {
    const d = max-min;
    s = l>0.5 ? d/(2-max-min) : d/(max+min);
    switch(max){
      case r: h=(g-b)/d + (g<b?6:0); break;
      case g: h=(b-r)/d + 2; break;
      case b: h=(r-g)/d + 4; break;
    }
    h*=60;
  }
  return { h, s:s*100, l:l*100 };
}
function hue2rgb(p:number,q:number,t:number){
  if (t<0) t+=1; if (t>1) t-=1;
  if (t<1/6) return p+(q-p)*6*t;
  if (t<1/2) return q;
  if (t<2/3) return p+(q-p)*(2/3 - t)*6;
  return p;
}
export function hslToRgb(h:number,s:number,l:number){
  h = ((h%360)+360)%360; s = clamp(s/100); l = clamp(l/100);
  if (s===0){ const v=Math.round(l*255); return {r:v,g:v,b:v}; }
  const q = l<0.5 ? l*(1+s) : l+s-l*s;
  const p = 2*l - q;
  const r = Math.round(hue2rgb(p,q,(h/360)+1/3)*255);
  const g = Math.round(hue2rgb(p,q,(h/360))*255);
  const b = Math.round(hue2rgb(p,q,(h/360)-1/3)*255);
  return { r,g,b };
}
