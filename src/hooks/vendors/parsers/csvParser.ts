
import { VendorFormData } from "@/services/vendorService";

interface ParsedVendor extends VendorFormData {
  // Additional fields for validation
}

export const parseCSV = async (file: File): Promise<ParsedVendor[]> => {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = (e) => {
      try {
        const text = e.target?.result as string;
        const lines = text.split('\n').filter(line => line.trim());
        
        if (lines.length < 2) {
          throw new Error('CSV file must contain headers and at least one data row');
        }

        const headers = lines[0].split(',').map(h => h.trim().toLowerCase());
        const vendors: ParsedVendor[] = [];

        for (let i = 1; i < lines.length; i++) {
          const values = lines[i].split(',').map(v => v.trim());
          const vendor: any = {};

          headers.forEach((header, index) => {
            const value = values[index] || '';
            switch (header) {
              case 'name':
                vendor.name = value;
                break;
              case 'email':
                vendor.email = value;
                break;
              case 'phone':
                vendor.phone = value;
                break;
              case 'contact_person':
              case 'contact person':
                vendor.contact_person = value;
                break;
              case 'vendor_type':
              case 'type':
                vendor.vendor_type = value || 'service';
                break;
              case 'status':
                vendor.status = value || 'active';
                break;
              case 'address':
                vendor.address = value;
                break;
              case 'city':
                vendor.city = value;
                break;
              case 'state':
                vendor.state = value;
                break;
              case 'zip_code':
              case 'zip':
                vendor.zip_code = value;
                break;
              case 'website':
                vendor.website = value;
                break;
              case 'description':
                vendor.description = value;
                break;
            }
          });

          if (vendor.name) {
            vendors.push(vendor);
          }
        }

        resolve(vendors);
      } catch (error) {
        reject(error);
      }
    };
    reader.onerror = () => reject(new Error('Failed to read CSV file'));
    reader.readAsText(file);
  });
};
