const KEY = 'DevThemePanelV3:prefs';

export interface PanelPrefs {
     open?: boolean;
     tab?: string;
     path?: string;
     pathValueText?: string;
     mergeText?: string;
     filter?: string;
     presetName?: string;
     mode?: 'light' | 'dark' | 'system';
}

export function loadPanelPrefs(): PanelPrefs {
     if (typeof window === 'undefined') return {};
     try {
          const raw = localStorage.getItem(KEY);
          return raw ? (JSON.parse(raw) as PanelPrefs) : {};
     } catch {
          return {};
     }
}

export function savePanelPrefs(prefs: PanelPrefs) {
     if (typeof window === 'undefined') return;
     try {
          localStorage.setItem(KEY, JSON.stringify(prefs));
     } catch {
          /* ignore */
     }
}
