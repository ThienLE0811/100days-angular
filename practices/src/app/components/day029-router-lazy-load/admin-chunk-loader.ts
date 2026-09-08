import { signal } from '@angular/core';

export type AdminChunkStatus = 'idle' | 'loading' | 'ready';

const SIMULATED_SLOW_NETWORK_DELAY_MS = 2500;

export const adminChunkStatus = signal<AdminChunkStatus>('idle');
export const adminChunkElapsedMs = signal(0);

let loadPromise: Promise<typeof import('./admin-panel/admin-panel')> | null = null;

export function loadAdminPanelModule() {
  if (!loadPromise) {
    adminChunkStatus.set('loading');
    const startedAt = performance.now();

    loadPromise = new Promise<void>((resolve) => setTimeout(resolve, SIMULATED_SLOW_NETWORK_DELAY_MS))
      .then(() => import('./admin-panel/admin-panel'))
      .then((module) => {
        adminChunkElapsedMs.set(Math.round(performance.now() - startedAt));
        adminChunkStatus.set('ready');
        return module;
      });
  }

  return loadPromise;
}

export function resetAdminChunkDemo(): void {
  loadPromise = null;
  adminChunkStatus.set('idle');
  adminChunkElapsedMs.set(0);
}
