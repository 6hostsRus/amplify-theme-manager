export type Json = null | boolean | number | string | Json[] | { [k: string]: Json };
function isObj(v: unknown): v is Record<string, unknown> { return !!v && typeof v === 'object' && !Array.isArray(v); }
export function deepDiff(base: Json, modified: Json): Json | undefined {
  if (Object.is(base, modified)) return undefined;
  if (!isObj(base) || !isObj(modified)) return modified;
  const keys = new Set([...Object.keys(base), ...Object.keys(modified)]);
  const out: Record<string, Json> = {}; let changed = false;
  for (const k of keys) {
    const b = (base as any)[k]; const m = (modified as any)[k];
    if (m === undefined) continue; // ignore deletions
    const d = deepDiff(b as Json, m as Json);
    if (d !== undefined) { out[k] = d; changed = true; }
  }
  return changed ? (out as Json) : undefined;
}
