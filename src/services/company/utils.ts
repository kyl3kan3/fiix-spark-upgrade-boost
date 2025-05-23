
import { CompanyInfo } from "@/components/profile/company/types";
import { CompanyData } from "./types";

/**
 * Converts the database company object to CompanyInfo format used in the UI
 */
export const mapCompanyToCompanyInfo = (company: CompanyData | null): CompanyInfo => {
  if (!company) return {};
  
  return {
    companyName: company.name,
    industry: company.industry,
    address: company.address,
    city: company.city,
    state: company.state,
    zipCode: company.zip_code,
    phone: company.phone,
    email: company.email,
    website: company.website,
    logo: company.logo
  };
};

/**
 * Converts CompanyInfo format used in the UI to database company object
 */
export const mapCompanyInfoToCompanyData = (info: Partial<CompanyInfo>): Partial<CompanyData> => {
  // Ensure name is properly set from companyName
  const name = info.companyName || "";
  
  return {
    name: name, // Always return a name value, even if empty
    industry: info.industry,
    address: info.address,
    city: info.city,
    state: info.state,
    zip_code: info.zipCode,
    phone: info.phone,
    email: info.email,
    website: info.website,
    logo: info.logo
  };
};
