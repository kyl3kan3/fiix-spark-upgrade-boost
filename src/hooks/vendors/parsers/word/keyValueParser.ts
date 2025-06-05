
import { VendorFormData } from "@/services/vendorService";

interface PartialVendor extends Partial<VendorFormData> {}

export const parseKeyValuePair = (line: string, vendor: PartialVendor): void => {
  if (!line.includes(':')) return;
  
  const [key, ...valueParts] = line.split(':');
  const value = valueParts.join(':').trim();
  const cleanKey = key.trim().toLowerCase();
  
  if (cleanKey.includes('name') || cleanKey.includes('company')) {
    vendor.name = value;
  } else if (cleanKey.includes('email')) {
    vendor.email = value;
  } else if (cleanKey.includes('phone')) {
    vendor.phone = value;
  } else if (cleanKey.includes('contact')) {
    vendor.contact_person = value;
  } else if (cleanKey.includes('address')) {
    vendor.address = value;
  } else if (cleanKey.includes('city')) {
    vendor.city = value;
  } else if (cleanKey.includes('state')) {
    vendor.state = value;
  } else if (cleanKey.includes('zip')) {
    vendor.zip_code = value;
  } else if (cleanKey.includes('website')) {
    vendor.website = value;
  }
};
