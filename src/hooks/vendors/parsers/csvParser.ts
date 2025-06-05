
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

        // Handle both comma and semicolon separators
        const separator = text.includes(';') && !text.includes(',') ? ';' : ',';
        const headers = lines[0].split(separator).map(h => h.trim().toLowerCase().replace(/['"]/g, ''));
        const vendors: ParsedVendor[] = [];

        console.log('CSV Headers found:', headers);

        for (let i = 1; i < lines.length; i++) {
          const values = parseCSVLine(lines[i], separator);
          const vendor: any = {
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
            rating: null
          };

          headers.forEach((header, index) => {
            const value = (values[index] || '').trim().replace(/['"]/g, '');
            
            // Map various header variations to our fields
            switch (header) {
              case 'name':
              case 'vendor name':
              case 'company name':
              case 'company':
              case 'business name':
                vendor.name = value;
                break;
              case 'email':
              case 'email address':
              case 'e-mail':
              case 'contact email':
                vendor.email = value;
                break;
              case 'phone':
              case 'phone number':
              case 'tel':
              case 'telephone':
              case 'contact phone':
                vendor.phone = value;
                break;
              case 'contact_person':
              case 'contact person':
              case 'contact name':
              case 'representative':
              case 'contact':
                vendor.contact_person = value;
                break;
              case 'contact_title':
              case 'contact title':
              case 'title':
              case 'position':
                vendor.contact_title = value;
                break;
              case 'vendor_type':
              case 'type':
              case 'category':
              case 'service type':
                const lowerType = value.toLowerCase();
                if (['service', 'supplier', 'contractor', 'consultant'].includes(lowerType)) {
                  vendor.vendor_type = lowerType;
                } else if (lowerType.includes('supplier') || lowerType.includes('supply')) {
                  vendor.vendor_type = 'supplier';
                } else if (lowerType.includes('contractor') || lowerType.includes('contract')) {
                  vendor.vendor_type = 'contractor';
                } else if (lowerType.includes('consultant') || lowerType.includes('consult')) {
                  vendor.vendor_type = 'consultant';
                } else {
                  vendor.vendor_type = 'service';
                }
                break;
              case 'status':
                const lowerStatus = value.toLowerCase();
                if (['active', 'inactive', 'suspended'].includes(lowerStatus)) {
                  vendor.status = lowerStatus;
                } else if (lowerStatus.includes('active') || lowerStatus === 'yes' || lowerStatus === 'y') {
                  vendor.status = 'active';
                } else if (lowerStatus.includes('inactive') || lowerStatus === 'no' || lowerStatus === 'n') {
                  vendor.status = 'inactive';
                } else {
                  vendor.status = 'active';
                }
                break;
              case 'address':
              case 'street address':
              case 'street':
                vendor.address = value;
                break;
              case 'city':
                vendor.city = value;
                break;
              case 'state':
              case 'province':
                vendor.state = value;
                break;
              case 'zip_code':
              case 'zip':
              case 'postal code':
              case 'zipcode':
                vendor.zip_code = value;
                break;
              case 'website':
              case 'web':
              case 'url':
              case 'site':
                // Clean up website URLs
                let cleanWebsite = value;
                if (cleanWebsite && !cleanWebsite.startsWith('http')) {
                  cleanWebsite = `https://${cleanWebsite}`;
                }
                vendor.website = cleanWebsite;
                break;
              case 'description':
              case 'notes':
              case 'details':
              case 'comments':
                vendor.description = value;
                break;
              case 'rating':
                const ratingNum = parseFloat(value);
                if (!isNaN(ratingNum) && ratingNum >= 1 && ratingNum <= 5) {
                  vendor.rating = Math.round(ratingNum);
                }
                break;
            }
          });

          // Only add vendor if it has a name
          if (vendor.name && vendor.name.trim()) {
            console.log('Parsed vendor:', vendor);
            vendors.push(vendor);
          } else {
            console.log('Skipping row with missing name:', values);
          }
        }

        console.log(`Successfully parsed ${vendors.length} vendors from CSV`);
        resolve(vendors);
      } catch (error) {
        console.error('CSV parsing error:', error);
        reject(error);
      }
    };
    reader.onerror = () => reject(new Error('Failed to read CSV file'));
    reader.readAsText(file);
  });
};

// Helper function to properly parse CSV lines with quoted values
const parseCSVLine = (line: string, separator: string): string[] => {
  const result: string[] = [];
  let current = '';
  let inQuotes = false;
  
  for (let i = 0; i < line.length; i++) {
    const char = line[i];
    
    if (char === '"') {
      inQuotes = !inQuotes;
    } else if (char === separator && !inQuotes) {
      result.push(current);
      current = '';
    } else {
      current += char;
    }
  }
  
  result.push(current);
  return result;
};
