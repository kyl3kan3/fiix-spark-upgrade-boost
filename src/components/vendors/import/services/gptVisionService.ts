
import { supabase } from '@/integrations/supabase/client';

export async function callGptVision(base64Image: string): Promise<any[]> {
  try {
    const { data, error } = await supabase.functions.invoke('gpt-vision', {
      body: { base64Image },
    });

    if (error) throw error;

    const result = data.result;
    // Try to extract valid JSON with structured vendor data
    try {
      const jsonStart = result.indexOf('[');
      if (jsonStart >= 0) {
        const parsed = JSON.parse(result.slice(jsonStart));
        
        // If it's an array of vendors with proper structure, return it
        if (Array.isArray(parsed) && parsed.length > 0) {
          return parsed.map(vendor => ({
            name: vendor.name || vendor.company_name || 'Unnamed Vendor',
            email: vendor.email,
            phone: vendor.phone,
            website: vendor.website,
            address: vendor.address,
            city: vendor.city,
            state: vendor.state,
            zip_code: vendor.zip_code || vendor.zipCode,
            contact_person: vendor.contact_person || vendor.contact,
            description: vendor.notes || vendor.description,
            vendor_type: 'service',
            status: 'active',
            raw_text: typeof vendor === 'string' ? vendor : JSON.stringify(vendor)
          }));
        }
      }
      
      // fallback: treat as single vendor
      return [{
        name: result,
        vendor_type: 'service',
        status: 'active',
        raw_text: result
      }];
    } catch {
      // fallback: treat as single vendor
      return [{
        name: result,
        vendor_type: 'service',
        status: 'active',
        raw_text: result
      }];
    }
  } catch (error) {
    console.error('GPT Vision error:', error);
    return [{
      name: 'Error processing with GPT Vision',
      vendor_type: 'service',
      status: 'active',
      raw_text: 'Error processing with GPT Vision'
    }];
  }
}
