
import { VendorFormData } from "@/services/vendorService";

export interface ParsedVendor extends VendorFormData {}

export interface EdgeFunctionResponse {
  success: boolean;
  vendors?: ParsedVendor[];
  error?: string;
  details?: string;
  totalBlocks?: number;
  message?: string;
}

export interface ImportResult {
  successful: number;
  failed: number;
  total: number;
}
