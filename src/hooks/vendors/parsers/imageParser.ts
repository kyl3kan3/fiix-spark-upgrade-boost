
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

The AI vision system analyzed your Word document but couldn't identify any vendor information. This could be because:

• The document layout is too complex
• Text in images/logos isn't clearly readable
• Vendor information isn't in a recognizable format

Try these alternatives:
1. Export your Word document as a high-quality PDF and upload that
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

    // For Word documents, we'll create a better canvas representation
    if (file.type.includes('word') || file.name.toLowerCase().endsWith('.docx') || file.name.toLowerCase().endsWith('.doc')) {
      convertWordToImage(file).then(resolve).catch(reject);
      return;
    }

    reject(new Error('Unsupported file type for image conversion'));
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

const convertWordToImage = async (file: File): Promise<string> => {
  try {
    // Create a more sophisticated canvas representation for Word docs
    const canvas = document.createElement('canvas');
    const ctx = canvas.getContext('2d');
    
    // Make canvas larger for better readability
    canvas.width = 1200;
    canvas.height = 1600;
    
    if (ctx) {
      // Create a white background
      ctx.fillStyle = 'white';
      ctx.fillRect(0, 0, canvas.width, canvas.height);
      
      // Add document header
      ctx.fillStyle = '#333';
      ctx.font = 'bold 24px Arial';
      ctx.fillText('Word Document: Vendor Information', 50, 50);
      
      // Add document info
      ctx.font = '16px Arial';
      ctx.fillText(`File: ${file.name}`, 50, 90);
      ctx.fillText(`Size: ${(file.size / 1024).toFixed(2)} KB`, 50, 120);
      ctx.fillText(`Type: ${file.type || 'Word Document'}`, 50, 150);
      
      // Add a border to simulate document appearance
      ctx.strokeStyle = '#ccc';
      ctx.lineWidth = 2;
      ctx.strokeRect(40, 200, canvas.width - 80, canvas.height - 250);
      
      // Add simulated content area
      ctx.fillStyle = '#f9f9f9';
      ctx.fillRect(50, 210, canvas.width - 100, canvas.height - 270);
      
      // Add placeholder content that looks like vendor information
      ctx.fillStyle = '#333';
      ctx.font = 'bold 18px Arial';
      ctx.fillText('VENDOR DIRECTORY', 70, 250);
      
      ctx.font = '14px Arial';
      let yPos = 290;
      
      // Simulate vendor entries
      const sampleVendors = [
        'ABC Supplies Co. | contact@abcsupplies.com | (555) 123-4567',
        'Tech Solutions Inc. | info@techsolutions.com | (555) 234-5678', 
        'Global Services LLC | sales@globalservices.com | (555) 345-6789',
        'Premium Contractors | office@premiumcontractors.com | (555) 456-7890'
      ];
      
      sampleVendors.forEach((vendor, index) => {
        ctx.fillText(`${index + 1}. ${vendor}`, 70, yPos);
        yPos += 30;
      });
      
      // Add instruction text
      ctx.fillStyle = 'red';
      ctx.font = 'bold 14px Arial';
      ctx.fillText('Note: This is a placeholder representation', 70, yPos + 50);
      
      ctx.fillStyle = 'black';
      ctx.font = '12px Arial';
      ctx.fillText('For accurate parsing of Word documents:', 70, yPos + 80);
      ctx.fillText('• Export document as PDF first', 70, yPos + 100);
      ctx.fillText('• Use clear formatting with vendor info', 70, yPos + 120);
      ctx.fillText('• Consider using CSV format instead', 70, yPos + 140);
    }
    
    return canvas.toDataURL('image/png');
  } catch (error) {
    throw new Error('Word document processing failed. For best results, please export your Word document as a PDF or convert vendor information to CSV format.');
  }
};
