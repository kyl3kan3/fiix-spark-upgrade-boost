
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

    console.log('[Parse Vendor] Using GPT-4 to parse document content directly...');
    
    // Read file as text (this won't work perfectly for DOCX but GPT-4 might extract some info)
    const arrayBuffer = await file.arrayBuffer();
    const uint8Array = new Uint8Array(arrayBuffer);
    
    // Try to extract any readable text from the binary data
    let readableText = '';
    const decoder = new TextDecoder('utf-8', { fatal: false });
    
    try {
      // Attempt to decode as UTF-8, ignoring errors
      const rawText = decoder.decode(uint8Array);
      
      // Extract sequences of printable characters
      const textMatches = rawText.match(/[a-zA-Z0-9\s\-\(\)\[\]\.@,'"]+/g);
      if (textMatches) {
        readableText = textMatches
          .filter(text => text.trim().length > 3)
          .join(' ')
          .replace(/\s+/g, ' ')
          .trim();
      }
    } catch (error) {
      console.error('[Parse Vendor] Text extraction error:', error);
    }

    console.log(`[Parse Vendor] Extracted readable text length: ${readableText.length}`);
    
    if (readableText.length < 50) {
      return new Response(
        JSON.stringify({ 
          error: 'Could not extract readable text from document. Please try converting to PDF or plain text format.',
          details: 'The document appears to be in a complex format that requires specialized parsing.'
        }), 
        { 
          status: 400, 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' }
        }
      );
    }

    // Use GPT-4 to extract vendor information from the readable text
    const prompt = `
Please analyze the following text extracted from a vendor directory document and extract ALL vendor/company information.

For each vendor you find, create a JSON object with this exact structure:

{
  "name": "Company Name",
  "email": "email@example.com or empty string if not found",
  "phone": "phone number or empty string if not found",
  "contact_person": "contact person name or empty string if not found",
  "address": "full address or empty string if not found",
  "description": "services/products description or empty string if not found"
}

IMPORTANT RULES:
1. Look for any company names, business names, or vendor names
2. Extract phone numbers in any format (xxx-xxx-xxxx, (xxx) xxx-xxxx, etc.)
3. Extract email addresses
4. Look for contact person names
5. Combine address components (street, city, state, zip) into one address field
6. Include any service/product descriptions you find
7. Return ONLY a valid JSON array of vendor objects, nothing else
8. If you find multiple vendors, include them all in the array
9. Each vendor must have at least a name to be included

Text to analyze:
${readableText.substring(0, 8000)}`;

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
          max_tokens: 3000,
        }),
      });

      if (!response.ok) {
        throw new Error(`OpenAI API error: ${response.status}`);
      }

      const data = await response.json();
      const content = data.choices[0].message.content || '[]';
      
      console.log('[Parse Vendor] GPT-4 raw response:', content);
      
      // Extract JSON from response - look for array brackets
      let jsonStr = content.trim();
      
      // If response doesn't start with [, try to find JSON array in the text
      if (!jsonStr.startsWith('[')) {
        const arrayStart = jsonStr.indexOf('[');
        const arrayEnd = jsonStr.lastIndexOf(']') + 1;
        
        if (arrayStart >= 0 && arrayEnd > arrayStart) {
          jsonStr = jsonStr.slice(arrayStart, arrayEnd);
        } else {
          // Try to find individual JSON objects and wrap them in an array
          const objectMatches = jsonStr.match(/\{[^}]+\}/g);
          if (objectMatches) {
            jsonStr = '[' + objectMatches.join(',') + ']';
          } else {
            jsonStr = '[]';
          }
        }
      }
      
      let vendors = [];
      try {
        vendors = JSON.parse(jsonStr);
        if (!Array.isArray(vendors)) {
          vendors = [vendors]; // Wrap single object in array
        }
      } catch (parseError) {
        console.error('[Parse Vendor] JSON parse error:', parseError);
        console.error('[Parse Vendor] Attempted to parse:', jsonStr);
        
        // Last resort: try to extract any vendor info manually
        const lines = readableText.split(/\n|\r\n/);
        const potentialVendor = {
          name: 'Extracted Data',
          email: '',
          phone: '',
          contact_person: '',
          address: '',
          description: `Raw extracted text sample: ${readableText.substring(0, 200)}...`
        };
        
        // Look for email patterns
        const emailMatch = readableText.match(/[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}/);
        if (emailMatch) potentialVendor.email = emailMatch[0];
        
        // Look for phone patterns
        const phoneMatch = readableText.match(/(\(?\d{3}\)?[-.\s]?\d{3}[-.\s]?\d{4})/);
        if (phoneMatch) potentialVendor.phone = phoneMatch[0];
        
        vendors = [potentialVendor];
      }

      // Convert to our expected format and ensure all required fields
      const mappedVendors = vendors
        .filter(vendor => vendor && (vendor.name || vendor.company))
        .map((vendor: any, index: number) => ({
          name: vendor.name || vendor.company || `Vendor ${index + 1}`,
          email: vendor.email || '',
          phone: vendor.phone || vendor.phone_number || '',
          contact_person: vendor.contact_person || vendor.contact || '',
          contact_title: vendor.contact_title || '',
          vendor_type: 'service',
          status: 'active',
          address: vendor.address || '',
          city: '',
          state: '',
          zip_code: '',
          website: vendor.website || '',
          description: vendor.description || vendor.services || '',
          rating: null
        }));

      console.log(`[Parse Vendor] Successfully extracted ${mappedVendors.length} vendors`);

      return new Response(
        JSON.stringify({ 
          success: true,
          vendors: mappedVendors,
          message: `Successfully extracted ${mappedVendors.length} vendor entries from document`,
          debug: {
            originalTextLength: readableText.length,
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
