
export interface CompanyInfo {
  companyName?: string;
  industry?: string;
  address?: string;
  city?: string;
  state?: string;
  zipCode?: string;
  phone?: string;
  email?: string;
  website?: string;
  logo?: string | null;
}

export interface CompanyInfoContextType {
  companyInfo: CompanyInfo | null;
  isLoading: boolean;
  error: string | null;
  updateCompanyInfo: (data: CompanyInfo) => Promise<boolean>;
  fetchCompanyInfo: () => Promise<void>;
}
