
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
