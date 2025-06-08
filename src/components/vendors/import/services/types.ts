
// Types for text analysis and categorization

export interface EntityClassification {
  companyName?: string;
  contactPerson?: string;
  products?: string[];
  services?: string[];
  email?: string;
  phone?: string;
  website?: string;
  address?: string;
  city?: string;
  state?: string;
  zipCode?: string;
  notes?: string;
  rawText: string;
}
