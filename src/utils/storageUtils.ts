
import { AUTH_STORAGE_KEYS } from "@/constants/authConstants";

export const setStorageItem = (key: string, value: string): void => {
  try {
    localStorage.setItem(key, value);
  } catch (error) {
    console.warn(`Failed to set localStorage item: ${key}`, error);
  }
};

export const getStorageItem = (key: string): string | null => {
  try {
    return localStorage.getItem(key);
  } catch (error) {
    console.warn(`Failed to get localStorage item: ${key}`, error);
    return null;
  }
};

export const removeStorageItem = (key: string): void => {
  try {
    localStorage.removeItem(key);
  } catch (error) {
    console.warn(`Failed to remove localStorage item: ${key}`, error);
  }
};

export const clearAuthStorage = (): void => {
  Object.values(AUTH_STORAGE_KEYS).forEach(removeStorageItem);
};

export const setRememberMe = (remember: boolean): void => {
  if (remember) {
    setStorageItem(AUTH_STORAGE_KEYS.REMEMBER_ME, "true");
  } else {
    removeStorageItem(AUTH_STORAGE_KEYS.REMEMBER_ME);
  }
};

export const getRememberMe = (): boolean => {
  return getStorageItem(AUTH_STORAGE_KEYS.REMEMBER_ME) === "true";
};
