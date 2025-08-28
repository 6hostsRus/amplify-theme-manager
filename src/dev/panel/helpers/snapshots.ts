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

export interface SnapshotEntry {
     id: string;
     name: string;
     createdAt: number;
     patch: any;
}

const SNAP_KEY = 'DevThemePanelV3:snapshots';

function load(): SnapshotEntry[] {
     if (typeof window === 'undefined') return [];
     try {
          const raw = localStorage.getItem(SNAP_KEY);
          return raw ? (JSON.parse(raw) as SnapshotEntry[]) : [];
     } catch {
          return [];
     }
}

function save(all: SnapshotEntry[]) {
     if (typeof window === 'undefined') return;
     try {
          localStorage.setItem(SNAP_KEY, JSON.stringify(all));
     } catch {
          /* ignore */
     }
}

export const Snapshots = {
     list(): SnapshotEntry[] {
          return load();
     },
     save(name: string, patch: any) {
          const all = load();
          all.unshift({
               id: Math.random().toString(36).slice(2),
               name,
               createdAt: Date.now(),
               patch,
          });
          save(all.slice(0, 200));
     },
     remove(id: string) {
          save(load().filter((s) => s.id !== id));
     },
     clear() {
          save([]);
     },
     exportAll() {
          return load();
     },
     importAll(data: any): number {
          if (!Array.isArray(data)) return 0;
          const valid = data.filter(
               (x) => x && typeof x === 'object' && 'patch' in x && 'name' in x
          );
          save(valid as SnapshotEntry[]);
          return valid.length;
     },
};
