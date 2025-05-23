
import { CompanyInfo } from "@/components/profile/company/types";

export interface CompanyData {
  id?: string;
  name: string;
  industry?: string;
  address?: string;
  city?: string;
  state?: string;
  zip_code?: string;
  phone?: string;
  email?: string;
  website?: string;
  logo?: string;
  created_at?: string;
  updated_at?: string;
  created_by?: string;
}
