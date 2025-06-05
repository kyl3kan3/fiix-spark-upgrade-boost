
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
  try {
    // Create a simple canvas with PDF info for now
    // In a production environment, you'd use PDF.js or similar library
    const canvas = document.createElement('canvas');
    const ctx = canvas.getContext('2d');
    
    canvas.width = 800;
    canvas.height = 1000;
    
    if (ctx) {
      // Create a white background
      ctx.fillStyle = 'white';
      ctx.fillRect(0, 0, canvas.width, canvas.height);
      
      // Add some text indicating this is a PDF placeholder
      ctx.fillStyle = 'black';
      ctx.font = '16px Arial';
      ctx.fillText('PDF Document Content', 50, 50);
      ctx.fillText(`File: ${file.name}`, 50, 80);
      ctx.fillText('Please convert to image manually for better results', 50, 110);
    }
    
    return canvas.toDataURL('image/png');
  } catch (error) {
    throw new Error('PDF to image conversion failed. Please convert your PDF to an image manually and upload the image file.');
  }
};

const convertWordToImage = async (file: File): Promise<string> => {
  try {
    // Read the file as text and create a canvas representation
    const arrayBuffer = await file.arrayBuffer();
    
    // For Word documents, we'll create a simple canvas with file info
    // In a production environment, you'd use a proper Word rendering library
    const canvas = document.createElement('canvas');
    const ctx = canvas.getContext('2d');
    
    canvas.width = 800;
    canvas.height = 1000;
    
    if (ctx) {
      // Create a white background
      ctx.fillStyle = 'white';
      ctx.fillRect(0, 0, canvas.width, canvas.height);
      
      // Add some text indicating this is a Word document
      ctx.fillStyle = 'black';
      ctx.font = '16px Arial';
      ctx.fillText('Word Document Content', 50, 50);
      ctx.fillText(`File: ${file.name}`, 50, 80);
      ctx.fillText(`Size: ${(file.size / 1024).toFixed(2)} KB`, 50, 110);
      
      // Try to extract some basic text if possible
      try {
        // For .docx files, we could potentially extract some text
        // This is a simplified approach - in production you'd use mammoth.js or similar
        const textDecoder = new TextDecoder('utf-8', { fatal: false });
        const text = textDecoder.decode(arrayBuffer);
        
        // Look for common patterns that might indicate vendor information
        const lines = text.split(/[\n\r]+/).slice(0, 20); // First 20 lines
        let yPosition = 150;
        
        ctx.font = '12px Arial';
        lines.forEach((line, index) => {
          if (line.trim() && yPosition < canvas.height - 50) {
            // Clean up the line and truncate if too long
            const cleanLine = line.replace(/[^\w\s@.-]/g, '').trim();
            if (cleanLine.length > 0 && cleanLine.length < 100) {
              ctx.fillText(cleanLine.substring(0, 80), 50, yPosition);
              yPosition += 20;
            }
          }
        });
      } catch (textError) {
        console.log('Could not extract text from Word document:', textError);
        ctx.fillText('Unable to extract text preview', 50, 150);
      }
    }
    
    return canvas.toDataURL('image/png');
  } catch (error) {
    throw new Error('Word document to image conversion failed. Please convert your document to an image (screenshot) and upload the image file.');
  }
};
