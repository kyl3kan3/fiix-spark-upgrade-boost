
import { VendorFormData } from "@/services/vendorService";
import { supabase } from "@/integrations/supabase/client";

interface ParsedVendor extends VendorFormData {
  // Additional fields for validation
}

export const parseWithImage = async (file: File): Promise<ParsedVendor[]> => {
  try {
    console.log('Starting image-based vendor parsing...');
    
    // Convert file to image data URL
    const imageDataUrl = await convertFileToImage(file);
    
    console.log('Calling OpenAI Vision API...');
    
    // Call the edge function to process with OpenAI Vision
    const { data, error } = await supabase.functions.invoke('parse-vendor-image', {
      body: {
        imageData: imageDataUrl
      }
    });

    if (error) {
      console.error('Edge function error:', error);
      throw new Error(`Vision parsing failed: ${error.message}`);
    }

    if (!data || !data.vendors) {
      throw new Error('No vendor data returned from vision API');
    }

    const vendors = data.vendors as ParsedVendor[];
    console.log(`Successfully parsed ${vendors.length} vendors using OpenAI Vision`);

    // Validate and clean the vendor data
    const validatedVendors = vendors.map(vendor => ({
      name: vendor.name || '',
      email: vendor.email || '',
      phone: vendor.phone || '',
      contact_person: vendor.contact_person || '',
      contact_title: vendor.contact_title || '',
      vendor_type: vendor.vendor_type || 'service',
      status: vendor.status || 'active',
      address: vendor.address || '',
      city: vendor.city || '',
      state: vendor.state || '',
      zip_code: vendor.zip_code || '',
      website: vendor.website || '',
      description: vendor.description || '',
      rating: vendor.rating || null
    }));

    if (validatedVendors.length === 0) {
      throw new Error(`No vendor data found in the document. 

The AI vision system analyzed your document but couldn't identify any vendor information. Please ensure your document contains:
- Company/vendor names
- Contact information (email, phone)
- Addresses or other vendor details

Try using a document with clearer formatting or more structured vendor listings.`);
    }

    return validatedVendors;
  } catch (error) {
    console.error("Image parser error:", error);
    throw error;
  }
};

const convertFileToImage = async (file: File): Promise<string> => {
  return new Promise((resolve, reject) => {
    // For image files, convert directly to data URL
    if (file.type.startsWith('image/')) {
      const reader = new FileReader();
      reader.onload = (e) => {
        resolve(e.target?.result as string);
      };
      reader.onerror = () => reject(new Error('Failed to read image file'));
      reader.readAsDataURL(file);
      return;
    }

    // For PDF files, we'll need to render the first page as an image
    if (file.type === 'application/pdf') {
      convertPdfToImage(file).then(resolve).catch(reject);
      return;
    }

    // For Word documents, we'll create a canvas representation
    if (file.type.includes('word') || file.name.toLowerCase().endsWith('.docx') || file.name.toLowerCase().endsWith('.doc')) {
      convertWordToImage(file).then(resolve).catch(reject);
      return;
    }

    reject(new Error('Unsupported file type for image conversion'));
  });
};

const convertPdfToImage = async (file: File): Promise<string> => {
  // For now, we'll return an error suggesting the user convert manually
  // In a full implementation, you'd use a library like PDF.js
  throw new Error('PDF to image conversion not yet implemented. Please convert your PDF to an image manually and upload the image file.');
};

const convertWordToImage = async (file: File): Promise<string> => {
  // For Word documents, we'll create a simple text-based image
  // In a full implementation, you'd render the actual document
  throw new Error('Word document to image conversion not yet implemented. Please convert your document to an image (screenshot) and upload the image file.');
};
