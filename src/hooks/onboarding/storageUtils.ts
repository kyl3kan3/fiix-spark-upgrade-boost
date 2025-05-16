
export const getInitialEmail = (): string => {
  return localStorage.getItem("pending_auth_email") || "";
};

export const getInitialCompanyName = (): string => {
  return localStorage.getItem("pending_company_name") || "";
};

export const clearOnboardingStorage = (): void => {
  localStorage.removeItem("pending_auth_email");
  localStorage.removeItem("pending_company_name");
};

export const setSetupComplete = (): void => {
  localStorage.setItem('maintenease_setup_complete', 'true');
};
