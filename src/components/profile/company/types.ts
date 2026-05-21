
export interface CompanyInfo {
 companyName?: string;
 industry?: string | null;
 address?: string | null;
 city?: string | null;
 state?: string | null;
 zipCode?: string | null;
 phone?: string | null;
 email?: string | null;
 website?: string | null;
 logo?: string | null;
}

export interface CompanyInfoContextType {
 companyInfo: CompanyInfo | null;
 isLoading: boolean;
 error: string | null;
 updateCompanyInfo: (data: CompanyInfo) => Promise<boolean>;
 fetchCompanyInfo: () => Promise<void>;
}
