const PREFIX = 'jiasuge:';

export const storage = {
  get<T>(key: string, fallback: T): T {
    try {
      const raw = localStorage.getItem(PREFIX + key);
      if (raw == null) return fallback;
      return JSON.parse(raw) as T;
    } catch { return fallback; }
  },
  set<T>(key: string, value: T): void {
    try { localStorage.setItem(PREFIX + key, JSON.stringify(value)); } catch {}
  },
  remove(key: string) { try { localStorage.removeItem(PREFIX + key); } catch {} },
  has(key: string): boolean { try { return localStorage.getItem(PREFIX + key) != null; } catch { return false; } }
};

export const CURRENT_USER_KEY = 'currentUserId';
export const ALL_USER_IDS_KEY = 'allUserIds';