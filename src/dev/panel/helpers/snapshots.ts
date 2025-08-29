// Unified snapshot + panel state storage (merged from former src/dev/snapshots.ts and this file)

export type Snapshot = {
     id: string;
     name: string;
     createdAt: number;
     patch: any;
};
export type SnapshotEntry = Snapshot; // backward alias

const KEY = '__atm_snapshots__';
const LEGACY_KEY = 'DevThemePanelV3:snapshots';
const STATE_KEY = '__atm_panel_state__';
const MAX_SNAPSHOTS = 200;

export type PanelState = {
     open?: boolean;
     tab?: 'tokens' | 'presets' | 'icons' | 'inspect' | 'snapshots';
     path?: string;
     pathValueText?: string;
     mergeText?: string;
     filter?: string;
};

function ls(): Storage | null {
     if (typeof window === 'undefined') return null;
     try {
          return window.localStorage;
     } catch {
          return null;
     }
}

function safeParse<T>(raw: string | null, fallback: T): T {
     if (!raw) return fallback;
     try {
          return JSON.parse(raw) as T;
     } catch {
          return fallback;
     }
}

function migrateAndLoad(): Snapshot[] {
     const store = ls();
     if (!store) return [];
     const primary = safeParse<Snapshot[]>(store.getItem(KEY), []);
     const legacy = safeParse<Snapshot[]>(store.getItem(LEGACY_KEY), []);
     if (!legacy.length) return primary;
     // Merge (legacy appended after primary so newer KEY items keep order)
     const map = new Map<string, Snapshot>();
     [...primary, ...legacy].forEach((s) => {
          if (!map.has(s.id)) map.set(s.id, s);
     });
     const merged = Array.from(map.values()).sort(
          (a, b) => b.createdAt - a.createdAt
     );
     // Persist under canonical key only
     writeList(merged);
     // Optionally clear legacy
     try {
          store.removeItem(LEGACY_KEY);
     } catch {
          /* ignore */
     }
     return merged;
}

let cache: Snapshot[] | null = null;

function readList(): Snapshot[] {
     if (cache) return cache;
     cache = migrateAndLoad();
     return cache;
}

function writeList(list: Snapshot[]) {
     cache = list.slice(0, MAX_SNAPSHOTS);
     const store = ls();
     if (!store) return;
     try {
          store.setItem(KEY, JSON.stringify(cache));
     } catch {
          /* ignore */
     }
}

function newId(): string {
     return (
          Date.now().toString(36) +
          '-' +
          Math.random().toString(36).slice(2, 10)
     );
}

export function exportSnapshot(theme: any): string {
     return JSON.stringify(theme, null, 2);
}

export function importSnapshot(raw: string): any | null {
     try {
          return JSON.parse(raw);
     } catch {
          return null;
     }
}

export const Snapshots = {
     list(): Snapshot[] {
          return readList();
     },
     save(name: string, patch: any): Snapshot {
          const next: Snapshot = {
               id: newId(),
               name,
               createdAt: Date.now(),
               patch,
          };
          writeList([next, ...readList()]);
          return next;
     },
     remove(id: string) {
          writeList(readList().filter((s) => s.id !== id));
     },
     clear() {
          const store = ls();
          if (!store) return;
          try {
               store.removeItem(KEY);
               store.removeItem(LEGACY_KEY);
          } catch {
               /* ignore */
          }
          cache = [];
     },
     exportAll(): Snapshot[] {
          return readList();
     },
     importAll(items: any[]): number {
          if (!Array.isArray(items)) return 0;
          const valid: Snapshot[] = [];
          for (const it of items) {
               if (!it || typeof it !== 'object') continue;
               if (it.patch === undefined) continue;
               const name =
                    typeof (it as any).name === 'string'
                         ? (it as any).name
                         : 'Imported Snapshot';
               valid.push({
                    id: newId(),
                    name,
                    createdAt: Date.now(),
                    patch: (it as any).patch,
               });
          }
          if (!valid.length) return 0;
          writeList([...valid, ...readList()]);
          return valid.length;
     },
};

export const PanelStorage = {
     load(): PanelState {
          const store = ls();
          if (!store) return {};
          return safeParse<PanelState>(store.getItem(STATE_KEY), {});
     },
     save(next: PanelState) {
          const store = ls();
          if (!store) return;
          try {
               store.setItem(STATE_KEY, JSON.stringify(next));
          } catch {
               /* ignore */
          }
     },
};
