// Custom storage adapter for Supabase auth that supports "Remember me".
// When REMEMBER flag is set (default), tokens go to localStorage (persist across browser restarts).
// When unset, tokens go to sessionStorage (cleared when the browser/tab session ends).

const REMEMBER_FLAG_KEY = "sb-remember-me";

export function setSupabaseRememberMe(remember: boolean) {
  try {
    if (remember) {
      localStorage.setItem(REMEMBER_FLAG_KEY, "true");
    } else {
      localStorage.setItem(REMEMBER_FLAG_KEY, "false");
    }
  } catch {
    // ignore
  }
}

function shouldUseLocal(): boolean {
  try {
    // Default to true (persistent) if the flag has never been set.
    const v = localStorage.getItem(REMEMBER_FLAG_KEY);
    return v === null ? true : v === "true";
  } catch {
    return true;
  }
}

function pickStorage(): Storage {
  return shouldUseLocal() ? localStorage : sessionStorage;
}

export const supabaseAuthStorage = {
  getItem: (key: string): string | null => {
    try {
      // Read from whichever storage currently holds the value, preferring the active one.
      const active = pickStorage().getItem(key);
      if (active !== null) return active;
      // Fallback: check the other storage to avoid losing an existing session
      // immediately after toggling the flag.
      const other = shouldUseLocal() ? sessionStorage.getItem(key) : localStorage.getItem(key);
      return other;
    } catch {
      return null;
    }
  },
  setItem: (key: string, value: string): void => {
    try {
      const target = pickStorage();
      target.setItem(key, value);
      // Clear from the other storage so we don't leak session info.
      const other = target === localStorage ? sessionStorage : localStorage;
      other.removeItem(key);
    } catch {
      // ignore
    }
  },
  removeItem: (key: string): void => {
    try {
      localStorage.removeItem(key);
      sessionStorage.removeItem(key);
    } catch {
      // ignore
    }
  },
};