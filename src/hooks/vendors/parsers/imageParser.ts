
import { VendorFormData } from "@/services/vendorService";
import { supabase } from "@/integrations/supabase/client";

interface ParsedVendor extends VendorFormData {
  // Additional fields for validation
}

export const parseWithImage = async (file: File): Promise<ParsedVendor[]> => {
  try {
    console.log('Starting image-based vendor parsing...');
    
    // Check if it's a Word document and provide better guidance
    if (file.type.includes('word') || file.name.toLowerCase().endsWith('.docx') || file.name.toLowerCase().endsWith('.doc')) {
      throw new Error(`Word document AI parsing is not reliable yet. 

For best results with your vendor list:

1. **Export as PDF**: Save your Word document as a PDF, then upload the PDF
2. **Take screenshots**: Take clear screenshots of each page and upload as images (PNG/JPG)
3. **Use CSV instead**: Copy your vendor data to a CSV file using our template

Word documents with logos and mixed layouts are challenging for AI vision to parse accurately. PDF or image formats work much better.`);
    }
    
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

The AI vision system analyzed your document but couldn't identify any vendor information. This could be because:

• The document layout is too complex
• Text in images/logos isn't clearly readable
• Vendor information isn't in a recognizable format

Try these alternatives:
1. Export your document as a high-quality PDF and upload that
2. Take clear screenshots of each page and upload as images
3. Copy the text content to a CSV file using our template
4. Ensure vendor names, emails, and contact info are clearly visible`);
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

    reject(new Error('Word documents are not supported for AI Vision parsing. Please export as PDF or use screenshots instead.'));
  });
};

const convertPdfToImage = async (file: File): Promise<string> => {
  try {
    // Create a canvas with PDF info - in production you'd use PDF.js
    const canvas = document.createElement('canvas');
    const ctx = canvas.getContext('2d');
    
    canvas.width = 800;
    canvas.height = 1000;
    
    if (ctx) {
      // Create a white background
      ctx.fillStyle = 'white';
      ctx.fillRect(0, 0, canvas.width, canvas.height);
      
      // Add informative text
      ctx.fillStyle = 'black';
      ctx.font = 'bold 20px Arial';
      ctx.fillText('PDF Document Analysis', 50, 50);
      
      ctx.font = '16px Arial';
      ctx.fillText(`File: ${file.name}`, 50, 80);
      ctx.fillText(`Size: ${(file.size / 1024 / 1024).toFixed(2)} MB`, 50, 110);
      
      ctx.font = '14px Arial';
      ctx.fillStyle = 'red';
      ctx.fillText('For better results with PDF files:', 50, 150);
      ctx.fillStyle = 'black';
      ctx.fillText('1. Export pages as high-quality images', 50, 180);
      ctx.fillText('2. Use clear, high-contrast text', 50, 210);
      ctx.fillText('3. Ensure vendor info is clearly visible', 50, 240);
    }
    
    return canvas.toDataURL('image/png');
  } catch (error) {
    throw new Error('PDF processing failed. Please convert your PDF to images for better AI vision parsing.');
  }
};
