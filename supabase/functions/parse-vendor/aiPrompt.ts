
export const VENDOR_EXTRACTION_PROMPT = `You are an expert at extracting vendor/company information from business documents using AI vision capabilities. 

Analyze the following text content and find ALL companies, vendors, or businesses mentioned. Look for:
- Company names (even partial or unclear names)
- Contact information (emails, phone numbers, addresses)
- Person names associated with companies
- Any business entities or service providers

For EACH vendor/company you find, extract this information and return as a JSON array:

[
  {
    "name": "Company name (required - extract even partial names)",
    "email": "email address or empty string",
    "phone": "phone number or empty string", 
    "contact_person": "contact person name or empty string",
    "contact_title": "contact title or empty string",
    "vendor_type": "service",
    "status": "active",
    "address": "full address or empty string",
    "city": "city or empty string",
    "state": "state or empty string", 
    "zip_code": "zip code or empty string",
    "website": "website or empty string",
    "description": "services/products or empty string",
    "rating": null
  }
]

IMPORTANT RULES:
1. Extract ALL companies/vendors you can identify, even with minimal information
2. Be aggressive in identifying company names - look for capitalized words, business indicators
3. If you find contact info without a clear company name, create a descriptive name based on context
4. Return ONLY a valid JSON array, no markdown or extra text
5. Include vendors even if they only have a name and one piece of contact info
6. Look for patterns like: Name + Phone, Name + Email, Name + Address`;
