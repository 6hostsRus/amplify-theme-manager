export type TabId = 'tokens' | 'presets' | 'icons' | 'inspect' | 'snapshots';
export const DEFAULT_TAB: TabId = 'tokens';

export interface TabMeta {
     id: TabId;
     label: string;
}

export const TABS: TabMeta[] = [
     { id: 'tokens', label: 'Tokens' },
     { id: 'presets', label: 'Presets' },
     { id: 'icons', label: 'Icons' },
     { id: 'inspect', label: 'Inspect' },
     { id: 'snapshots', label: 'Snapshots' },
];
