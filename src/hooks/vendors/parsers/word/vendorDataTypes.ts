
export interface VendorData {
  name: string;
  email: string;
  phone: string;
  contact_person: string;
  contact_title: string;
  vendor_type: "service" | "supplier" | "contractor" | "consultant";
  status: "active" | "inactive" | "suspended";
  address: string;
  city: string;
  state: string;
  zip_code: string;
  website: string;
  description: string;
  rating: number | null;
  logo_url?: string | null; // Add logo URL field
}

export const createEmptyVendor = (): VendorData => ({
  name: '',
  email: '',
  phone: '',
  contact_person: '',
  contact_title: '',
  vendor_type: 'service',
  status: 'active',
  address: '',
  city: '',
  state: '',
  zip_code: '',
  website: '',
  description: '',
  rating: null,
  logo_url: null
});
