// ─── PageCache Context ────────────────────────────────────────────────────────
// Lightweight in-memory cache that survives React Router navigation.
// Pages store their fetched data here and restore it on remount so the user
// never sees a blank slate when navigating back to a page they already visited.
//
// Usage in a hook:
//   const { get, set } = usePageCache();
//   const cached = get<MyData>('my-page-key');
//   if (cached) { setData(cached); } else { fetchAndSet(); }

import { createContext, useContext, useRef, ReactNode } from 'react';

type CacheStore = Record<string, unknown>;

interface PageCacheContext {
    get: <T>(key: string) => T | undefined;
    set: <T>(key: string, value: T) => void;
    clear: (key: string) => void;
    clearAll: () => void;
}

const Ctx = createContext<PageCacheContext | null>(null);

export function PageCacheProvider({ children }: { children: ReactNode }) {
    // useRef so updates never trigger re-renders — cache is purely imperative
    const store = useRef<CacheStore>({});

    const get = <T,>(key: string): T | undefined => store.current[key] as T | undefined;
    const set = <T,>(key: string, value: T): void => { store.current[key] = value; };
    const clear = (key: string): void => { delete store.current[key]; };
    const clearAll = (): void => { store.current = {}; };

    return <Ctx.Provider value={{ get, set, clear, clearAll }}>{children}</Ctx.Provider>;
}

/** Must be used inside <PageCacheProvider> */
export function usePageCache(): PageCacheContext {
    const ctx = useContext(Ctx);
    if (!ctx) throw new Error('usePageCache must be used inside <PageCacheProvider>');
    return ctx;
}
