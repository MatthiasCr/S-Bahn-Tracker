import { createContext, useContext, useState, useSyncExternalStore, type ReactNode } from 'react';

type Listener = () => void;

type TickerStore = {
    subscribe: (listener: Listener) => () => void;
    getSnapshot: () => number;
};

const TickerContext = createContext<TickerStore | null>(null);

function createTickerStore(): TickerStore {
    let frameId: number | null = null;
    let timestamp = typeof performance !== 'undefined' ? performance.now() : 0;
    const listeners = new Set<Listener>();

    // interval until next notification (next animation frame)
    const interval = 1000 / 30;
    let lastNotified = performance.now();

    const tick = (now: number) => {
        if (now - lastNotified >= interval) {
            // throttle animation to ~30 frames
            lastNotified = now;
            timestamp = now;
            listeners.forEach((listener) => listener());
        }
        frameId = requestAnimationFrame(tick);
    };


    const start = () => {
        if (frameId == null) {
            frameId = requestAnimationFrame(tick);
        }
    };

    const stop = () => {
        if (frameId != null) {
            cancelAnimationFrame(frameId);
            frameId = null;
        }
    };

    return {
        subscribe(listener: Listener) {
            listeners.add(listener);
            start();
            return () => {
                listeners.delete(listener);
                if (listeners.size === 0) {
                    stop();
                }
            };
        },
        getSnapshot() {
            return timestamp;
        },
    };
}

export function TickerProvider({ children }: { children: ReactNode }) {
    const [store] = useState<TickerStore>(() => createTickerStore());
    return <TickerContext.Provider value={store}>{children}</TickerContext.Provider>;
}

export function useTicker(): number {
    const store = useContext(TickerContext);
    if (store == null) {
        throw new Error('useTicker must be used within a TickerProvider');
    }
    return useSyncExternalStore(store.subscribe, store.getSnapshot, store.getSnapshot);
}
