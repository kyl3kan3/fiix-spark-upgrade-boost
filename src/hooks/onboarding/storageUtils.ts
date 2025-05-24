
import { getStorageItem, removeStorageItem, setStorageItem } from "@/utils/storageUtils";

export const getInitialEmail = (): string => {
  return getStorageItem("pending_auth_email") || "";
};

export const getInitialCompanyName = (): string => {
  return getStorageItem("pending_company_name") || "";
};

export const clearOnboardingStorage = (): void => {
  removeStorageItem("pending_auth_email");
  removeStorageItem("pending_company_name");
};

export const setSetupComplete = (): void => {
  setStorageItem('maintenease_setup_complete', 'true');
  console.log("Local storage setup complete flag set to true");
};

export const isSetupCompleteInLocalStorage = (): boolean => {
  return getStorageItem('maintenease_setup_complete') === 'true';
};
