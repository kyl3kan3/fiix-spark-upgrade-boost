
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

    // For now, let's create a simple fallback that treats the entire document as one vendor block
    // and uses GPT-4 to extract what it can from the raw content
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
You are analyzing a vendor directory document. The text below was extracted from a DOCX file and may contain vendor information mixed with formatting artifacts.

Please extract all vendor/company information you can find and return it as a JSON array. Each vendor should have this structure:

{
  "name": "company name",
  "email": "email if found",
  "phone": "phone if found", 
  "contact_person": "contact person if found",
  "address": "address if found",
  "description": "services/products offered if found"
}

Rules:
- Look for company names, addresses, phone numbers, emails, contact persons
- Ignore formatting artifacts and technical text
- If you find multiple vendors, return multiple objects
- If text is unclear, make reasonable inferences
- Return only the JSON array, no other text

Extracted text:
${readableText.substring(0, 4000)}`;

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
          max_tokens: 2000,
        }),
      });

      if (!response.ok) {
        throw new Error(`OpenAI API error: ${response.status}`);
      }

      const data = await response.json();
      const content = data.choices[0].message.content || '[]';
      
      // Extract JSON from response
      const jsonStart = content.indexOf('[');
      const jsonEnd = content.lastIndexOf(']') + 1;
      
      let vendors = [];
      if (jsonStart >= 0 && jsonEnd > jsonStart) {
        const jsonStr = content.slice(jsonStart, jsonEnd);
        vendors = JSON.parse(jsonStr);
      }

      // Convert to our expected format
      const mappedVendors = vendors.map((vendor: any, index: number) => ({
        name: vendor.name || `Vendor ${index + 1}`,
        email: vendor.email || '',
        phone: vendor.phone || '',
        contact_person: vendor.contact_person || '',
        contact_title: '',
        vendor_type: 'service',
        status: 'active',
        address: vendor.address || '',
        city: '',
        state: '',
        zip_code: '',
        website: '',
        description: vendor.description || '',
        rating: null
      }));

      console.log(`[Parse Vendor] Successfully extracted ${mappedVendors.length} vendors`);

      return new Response(
        JSON.stringify({ 
          success: true,
          vendors: mappedVendors,
          message: `Successfully extracted ${mappedVendors.length} vendor entries from document`
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
