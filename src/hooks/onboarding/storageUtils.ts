
import { getStorageItem, removeStorageItem, setStorageItem } from "@/utils/storageUtils";
import { logger } from "@/lib/logger";

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
 logger.log("Local storage setup complete flag set to true");
};

export const isSetupCompleteInLocalStorage = (): boolean => {
 return getStorageItem('maintenease_setup_complete') === 'true';
};
