
import { VendorFormData } from "@/services/vendorService";

export interface ParsedVendor {
  name: string;
  email?: string;
  phone?: string;
  address?: string;
  city?: string;
  state?: string;
  zip_code?: string;
  contact_person?: string;
  contact_title?: string;
  website?: string;
  description?: string;
  vendor_type: "service" | "supplier" | "contractor" | "consultant";
  status: "active" | "inactive" | "suspended";
  rating?: number;
}

export interface ImportError {
  row: number;
  message: string;
}

export interface ImportResults {
  successful: number;
  failed: number;
  errors: ImportError[];
}
