// Simple storage abstraction for session persistence
// Uses localStorage on web, in-memory fallback on native

const memoryStore: Record<string, string> = {};

function isLocalStorageAvailable(): boolean {
  try {
    if (typeof window !== 'undefined' && window.localStorage) {
      const testKey = '__storage_test__';
      window.localStorage.setItem(testKey, 'test');
      window.localStorage.removeItem(testKey);
      return true;
    }
    return false;
  } catch {
    return false;
  }
}

const useLocalStorage = isLocalStorageAvailable();

export const AppStorage = {
  async getItem(key: string): Promise<string | null> {
    try {
      if (useLocalStorage) {
        return window.localStorage.getItem(key);
      }
      return memoryStore[key] || null;
    } catch {
      return memoryStore[key] || null;
    }
  },

  async setItem(key: string, value: string): Promise<void> {
    try {
      if (useLocalStorage) {
        window.localStorage.setItem(key, value);
      }
      memoryStore[key] = value;
    } catch {
      memoryStore[key] = value;
    }
  },

  async removeItem(key: string): Promise<void> {
    try {
      if (useLocalStorage) {
        window.localStorage.removeItem(key);
      }
      delete memoryStore[key];
    } catch {
      delete memoryStore[key];
    }
  },
};
