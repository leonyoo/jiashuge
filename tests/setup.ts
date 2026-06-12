import { vi, beforeEach } from 'vitest';

const memStore = new Map<string, string>();
const fakeStorage = {
  getItem: (k: string) => memStore.get(k) ?? null,
  setItem: (k: string, v: string) => { memStore.set(k, v); },
  removeItem: (k: string) => { memStore.delete(k); },
  clear: () => memStore.clear(),
  length: 0,
  key: () => null
};
Object.defineProperty(window, 'localStorage', { value: fakeStorage, configurable: true });

window.alert = vi.fn();
window.confirm = vi.fn(() => true);

beforeEach(() => { memStore.clear(); vi.useFakeTimers(); vi.setSystemTime(new Date('2026-06-11T08:00:00Z')); });


