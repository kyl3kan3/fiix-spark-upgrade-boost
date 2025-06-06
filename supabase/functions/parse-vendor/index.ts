
import "https://deno.land/x/xhr@0.1.0/mod.ts";
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const formData = await req.formData();
    const file = formData.get('file') as File;
    
    if (!file) {
      return new Response(
        JSON.stringify({ error: 'No file uploaded' }), 
        { 
          status: 400, 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' }
        }
      );
    }

    console.log(`[Parse Vendor] Processing file: ${file.name}, size: ${file.size}, type: ${file.type}`);

    // Check if OpenAI API key is available
    const openaiApiKey = Deno.env.get('OPENAI_API_KEY');
    if (!openaiApiKey) {
      return new Response(
        JSON.stringify({ error: 'OpenAI API key not configured' }), 
        { 
          status: 500, 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' }
        }
      );
    }

    console.log('[Parse Vendor] Using enhanced GPT-4 processing...');
    
    // Read file as text with improved extraction for DOCX
    const arrayBuffer = await file.arrayBuffer();
    const uint8Array = new Uint8Array(arrayBuffer);
    
    // Enhanced text extraction for DOCX files
    let cleanText = '';
    const decoder = new TextDecoder('utf-8', { fatal: false });
    
    try {
      const rawText = decoder.decode(uint8Array);
      
      // More aggressive text extraction - look for vendor-like patterns
      const lines = rawText.split(/[\r\n]+/);
      const extractedLines: string[] = [];
      
      for (const line of lines) {
        // Extract readable ASCII text sequences
        const readableText = line.replace(/[^\x20-\x7E]/g, ' ')
                               .replace(/\s+/g, ' ')
                               .trim();
        
        if (readableText.length > 3 && 
            (readableText.includes('@') || // emails
             readableText.match(/\d{3}[\s\-\.]?\d{3}[\s\-\.]?\d{4}/) || // phone numbers
             readableText.match(/\b[A-Z][A-Za-z\s&]{2,50}\b/) || // company names
             readableText.includes('Inc') || readableText.includes('LLC') ||
             readableText.includes('Corp') || readableText.includes('Co') ||
             readableText.match(/\d+\s+[A-Za-z\s]+(?:St|Street|Ave|Avenue|Rd|Road|Dr|Drive|Blvd|Boulevard)/i))) { // addresses
          extractedLines.push(readableText);
        }
      }
      
      cleanText = extractedLines.join('\n').substring(0, 12000); // Increased limit
    } catch (error) {
      console.error('[Parse Vendor] Text extraction error:', error);
    }

    console.log(`[Parse Vendor] Extracted clean text length: ${cleanText.length}`);
    console.log(`[Parse Vendor] Sample text: ${cleanText.substring(0, 500)}`);
    
    if (cleanText.length < 50) {
      return new Response(
        JSON.stringify({ 
          error: 'Could not extract meaningful text from document',
          details: 'Please ensure the document contains vendor information in a readable format'
        }), 
        { 
          status: 400, 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' }
        }
      );
    }

    // Enhanced prompt for better vendor extraction
    const prompt = `You are an expert at extracting vendor/company information from business documents. 

Analyze the following text and find ALL companies, vendors, or businesses mentioned. Look for:
- Company names (even if incomplete or unclear)
- Contact information (emails, phone numbers, addresses)
- Person names associated with companies
- Any business entities or service providers

For EACH vendor/company you find, extract this information:

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

IMPORTANT RULES:
1. Extract ALL companies/vendors you can identify, even with minimal information
2. Be aggressive in identifying company names - look for capitalized words, business indicators
3. If you find contact info without a clear company name, use a descriptive name like "Service Provider" or extract from context
4. Return a JSON array of vendor objects
5. Include vendors even if they only have a name and one piece of contact info
6. Look for patterns like: Name + Phone, Name + Email, Name + Address
7. Return ONLY valid JSON array, no markdown or extra text

Text to analyze:
${cleanText}`;

    try {
      const response = await fetch('https://api.openai.com/v1/chat/completions', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${openaiApiKey}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          model: 'gpt-4o-mini',
          messages: [{ role: 'user', content: prompt }],
          temperature: 0.1,
          max_tokens: 4000,
        }),
      });

      if (!response.ok) {
        throw new Error(`OpenAI API error: ${response.status}`);
      }

      const data = await response.json();
      const content = data.choices[0].message.content || '[]';
      
      console.log('[Parse Vendor] GPT-4 raw response:', content.substring(0, 1000));
      
      // More robust JSON extraction
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
        } else {
          // Try to find individual objects
          const objectMatches = jsonStr.match(/\{[^}]+\}/g);
          if (objectMatches && objectMatches.length > 0) {
            vendors = objectMatches.map(match => {
              try {
                return JSON.parse(match);
              } catch {
                return null;
              }
            }).filter(v => v !== null);
          }
        }
      } catch (parseError) {
        console.error('[Parse Vendor] JSON parse error:', parseError);
        console.error('[Parse Vendor] Attempted to parse:', content);
        
        // Final fallback - create vendor from any extracted info
        const emailMatch = cleanText.match(/\b[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Z|a-z]{2,}\b/);
        const phoneMatch = cleanText.match(/(\(?\d{3}\)?[-.\s]?\d{3}[-.\s]?\d{4})/);
        
        if (emailMatch || phoneMatch) {
          vendors = [{
            name: 'Extracted Vendor',
            email: emailMatch ? emailMatch[0] : '',
            phone: phoneMatch ? phoneMatch[0] : '',
            contact_person: '',
            contact_title: '',
            vendor_type: 'service',
            status: 'active',
            address: '',
            city: '',
            state: '',
            zip_code: '',
            website: '',
            description: `Extracted from document - please review and edit`,
            rating: null
          }];
        }
      }

      // Filter and clean vendors
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

      console.log(`[Parse Vendor] Successfully extracted ${validVendors.length} vendors`);
      console.log(`[Parse Vendor] Vendors found:`, validVendors.map(v => v.name));

      if (validVendors.length === 0) {
        return new Response(
          JSON.stringify({ 
            error: 'No vendor data found in the document',
            details: `Processed ${cleanText.length} characters of text but could not identify vendor information. Please ensure the document contains company names, contact details, or business information.`,
            debug: {
              textSample: cleanText.substring(0, 300),
              gptResponse: content.substring(0, 500)
            }
          }), 
          { 
            status: 400, 
            headers: { ...corsHeaders, 'Content-Type': 'application/json' }
          }
        );
      }

      return new Response(
        JSON.stringify({ 
          success: true,
          vendors: validVendors,
          message: `Successfully extracted ${validVendors.length} vendor entries from document`,
          debug: {
            originalTextLength: cleanText.length,
            gptResponse: content.substring(0, 500)
          }
        }), 
        { 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' }
        }
      );

    } catch (error) {
      console.error('[Parse Vendor] OpenAI processing error:', error);
      return new Response(
        JSON.stringify({ 
          error: 'Failed to process document with AI',
          details: error.message 
        }), 
        { 
          status: 500, 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' }
        }
      );
    }

  } catch (error) {
    console.error('[Parse Vendor] Unexpected error:', error);
    return new Response(
      JSON.stringify({ 
        error: 'Internal server error',
        details: error.message 
      }), 
      { 
        status: 500, 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      }
    );
  }
});
