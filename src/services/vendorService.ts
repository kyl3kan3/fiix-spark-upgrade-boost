import { supabase } from "@/integrations/supabase/client";
import { Database } from "@/integrations/supabase/types";

export type Vendor = Database['public']['Tables']['vendors']['Row'];
export type VendorContract = Database['public']['Tables']['vendor_contracts']['Row'];
export type VendorAsset = Database['public']['Tables']['vendor_assets']['Row'];
export type VendorContractFormData = Omit<VendorContract, 'id' | 'created_at' | 'updated_at'>;

export interface VendorWithContracts extends Vendor {
  contracts?: VendorContract[];
}

export interface VendorFormData {
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
  logo_url?: string | null;
}

export const getAllVendors = async (): Promise<Vendor[]> => {
  const { data, error } = await supabase
    .from('vendors')
    .select('*')
    .order('name');

  if (error) {
    console.error('Error fetching vendors:', error);
    throw error;
  }

  return data || [];
};

export const getVendorById = async (id: string): Promise<VendorWithContracts | null> => {
  const { data, error } = await supabase
    .from('vendors')
    .select(`
      *,
      contracts:vendor_contracts(*)
    `)
    .eq('id', id)
    .single();

  if (error) {
    console.error('Error fetching vendor:', error);
    throw error;
  }

  return data;
};

export const createVendor = async (vendorData: VendorFormData): Promise<Vendor> => {
  const { data, error } = await supabase
    .from("vendors")
    .insert([vendorData])
    .select()
    .single();

  if (error) {
    console.error("Error creating vendor:", error);
    throw new Error(error.message);
  }

  return data;
};

export const updateVendor = async (id: string, vendorData: Partial<VendorFormData>): Promise<Vendor> => {
  const { data, error } = await supabase
    .from('vendors')
    .update(vendorData)
    .eq('id', id)
    .select()
    .single();

  if (error) {
    console.error('Error updating vendor:', error);
    throw error;
  }

  return data;
};

export const deleteVendor = async (id: string): Promise<void> => {
  const { error } = await supabase
    .from('vendors')
    .delete()
    .eq('id', id);

  if (error) {
    console.error('Error deleting vendor:', error);
    throw error;
  }
};

export const getVendorContracts = async (vendorId: string): Promise<VendorContract[]> => {
  const { data, error } = await supabase
    .from('vendor_contracts')
    .select('*')
    .eq('vendor_id', vendorId)
    .order('created_at', { ascending: false });

  if (error) {
    console.error('Error fetching vendor contracts:', error);
    throw error;
  }

  return data || [];
};

export const createVendorContract = async (contractData: VendorContractFormData): Promise<VendorContract> => {
  const { data, error } = await supabase
    .from('vendor_contracts')
    .insert(contractData)
    .select()
    .single();

  if (error) {
    console.error('Error creating vendor contract:', error);
    throw error;
  }

  return data;
};

export const getVendorAssets = async (vendorId: string) => {
  const { data, error } = await supabase
    .from('vendor_assets')
    .select(`
      *,
      asset:assets(*)
    `)
    .eq('vendor_id', vendorId);

  if (error) {
    console.error('Error fetching vendor assets:', error);
    throw error;
  }

  return data || [];
};
