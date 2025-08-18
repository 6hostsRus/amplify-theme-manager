export type Snapshot = { id: string; name: string; createdAt: number; patch: any };

const KEY = '__atm_snapshots__';
const STATE_KEY = '__atm_panel_state__';

export type PanelState = {
  open?: boolean;
  tab?: 'tokens'|'presets'|'icons'|'inspect';
  path?: string;
  pathValueText?: string;
  mergeText?: string;
  filter?: string;
};

function readList(): Snapshot[] {
  try { return JSON.parse(localStorage.getItem(KEY) || '[]'); } catch { return []; }
}
function writeList(list: Snapshot[]) {
  localStorage.setItem(KEY, JSON.stringify(list));
}
function newId(): string {
  return String(Date.now()) + '-' + Math.random().toString(36).slice(2, 8);
}

export const Snapshots = {
  list(): Snapshot[] { return readList(); },
  save(name: string, patch: any): Snapshot {
    const next: Snapshot = { id: newId(), name, createdAt: Date.now(), patch };
    const list = readList(); list.unshift(next); writeList(list); return next;
  },
  remove(id: string) { writeList(readList().filter(s => s.id !== id)); },
  clear() { localStorage.removeItem(KEY); },
  exportAll(): Snapshot[] { return readList(); },
  importAll(items: any[]): number {
    if (!Array.isArray(items)) return 0;
    const valid: Snapshot[] = [];
    for (const it of items) {
      if (!it || typeof it !== 'object') continue;
      const name = typeof it.name === 'string' ? it.name : 'Imported Snapshot';
      if (it.patch === undefined) continue;
      valid.push({ id: newId(), name, createdAt: Date.now(), patch: it.patch });
    }
    if (!valid.length) return 0;
    writeList([...valid, ...readList()]);
    return valid.length;
  }
};

export const PanelStorage = {
  load(): PanelState { try { return JSON.parse(localStorage.getItem(STATE_KEY) || '{}'); } catch { return {}; } },
  save(next: PanelState) { localStorage.setItem(STATE_KEY, JSON.stringify(next)); }
};
