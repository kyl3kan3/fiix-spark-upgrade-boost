
export function processVendorResponse(content: string, extractedText: string): any[] {
  console.log('[Parse Vendor] GPT-4 raw response:', content);
  
  // Parse JSON response
  let vendors = [];
  try {
    // Remove markdown code blocks if present
    let jsonStr = content.replace(/```json\s*/g, '').replace(/```\s*/g, '').trim();
    
    // Find JSON array in the response
    const arrayStart = jsonStr.indexOf('[');
    const arrayEnd = jsonStr.lastIndexOf(']') + 1;
    
    if (arrayStart >= 0 && arrayEnd > arrayStart) {
      jsonStr = jsonStr.slice(arrayStart, arrayEnd);
      vendors = JSON.parse(jsonStr);
      
      if (!Array.isArray(vendors)) {
        vendors = [vendors];
      }
    }
  } catch (parseError) {
    console.error('[Parse Vendor] JSON parse error:', parseError);
    console.error('[Parse Vendor] Attempted to parse:', content);
    
    // Fallback: try to create vendors from basic patterns in text
    const emailMatches = extractedText.match(/\b[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Z|a-z]{2,}\b/g) || [];
    const phoneMatches = extractedText.match(/(\(?\d{3}\)?[-.\s]?\d{3}[-.\s]?\d{4})/g) || [];
    
    if (emailMatches.length > 0 || phoneMatches.length > 0) {
      vendors = [{
        name: 'Extracted Vendor Information',
        email: emailMatches[0] || '',
        phone: phoneMatches[0] || '',
        contact_person: '',
        contact_title: '',
        vendor_type: 'service',
        status: 'active',
        address: '',
        city: '',
        state: '',
        zip_code: '',
        website: '',
        description: 'Extracted from document - please review and edit',
        rating: null
      }];
    }
  }

  // Clean and validate vendors
  const validVendors = vendors
    .filter(vendor => vendor && (vendor.name || vendor.email || vendor.phone))
    .map((vendor: any, index: number) => ({
      name: vendor.name || `Vendor ${index + 1}`,
      email: vendor.email || '',
      phone: vendor.phone || vendor.phone_number || '',
      contact_person: vendor.contact_person || vendor.contact || '',
      contact_title: vendor.contact_title || '',
      vendor_type: 'service',
      status: 'active',
      address: vendor.address || '',
      city: vendor.city || '',
      state: vendor.state || '',
      zip_code: vendor.zip_code || vendor.zipCode || '',
      website: vendor.website || '',
      description: vendor.description || vendor.services || vendor.business || '',
      rating: null
    }));

  return validVendors;
}
