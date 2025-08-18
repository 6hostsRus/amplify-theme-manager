import React from 'react';
import type { ComponentType, PropsWithChildren } from 'react';
import * as UI from '@aws-amplify/ui-react';

export type IconComponent = ComponentType<any>;
export type IconMap = Record<string, IconComponent>;

export type IconsManager = {
  get(): IconMap;
  setAll(map: IconMap): void;
  set(name: string, comp: IconComponent): void;
  remove(name: string): void;
  reset(): void;
  subscribe(fn: (map: IconMap) => void): () => void;
};

export function createIconsManager(initial?: IconMap): IconsManager {
  let store: IconMap = { ...(initial ?? {}) };
  const subs = new Set<(m: IconMap) => void>();
  const notify = () => subs.forEach((fn) => fn(store));
  return {
    get: () => store,
    setAll: (map) => { store = { ...map }; notify(); },
    set: (name, comp) => { store = { ...store, [name]: comp }; notify(); },
    remove: (name) => { const { [name]: _, ...rest } = store; store = rest; notify(); },
    reset: () => { store = {}; notify(); },
    subscribe: (fn) => { subs.add(fn); return () => subs.delete(fn); }
  };
}

const IconProvider = (UI as any).IconProvider ?? (UI as any).IconsProvider;

const IconsCtx = React.createContext<IconsManager | null>(null);

export function AmplifyIconsProvider({ children, manager }: PropsWithChildren<{ manager: IconsManager }>) {
  const [icons, setIcons] = React.useState(manager.get());
  React.useEffect(() => manager.subscribe(setIcons), [manager]);
  return (
    <IconsCtx.Provider value={manager}>
      {IconProvider ? <IconProvider icons={icons}>{children}</IconProvider> : children}
    </IconsCtx.Provider>
  );
}

export function useIconsManager(): IconsManager {
  const ctx = React.useContext(IconsCtx);
  if (!ctx) throw new Error('useIconsManager must be used inside AmplifyIconsProvider');
  return ctx;
}

export function makePathIcon(d: string, displayName = 'PathIcon') {
  const C = (props: React.SVGProps<SVGSVGElement>) => (
    <svg viewBox="0 0 24 24" aria-hidden="true" focusable="false" width="1em" height="1em" {...props}>
      <path d={d} fill="currentColor" />
    </svg>
  );
  (C as any).displayName = displayName;
  return C;
}
