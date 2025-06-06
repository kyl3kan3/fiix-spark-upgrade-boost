
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

    let vendorBlocks: string[] = [];

    // Handle DOCX files
    if (file.name.endsWith('.docx')) {
      console.log('[Parse Vendor] Processing DOCX file...');
      
      // For DOCX, we'll use a simple text extraction approach
      // Since mammoth isn't available in Deno, we'll extract raw text differently
      const arrayBuffer = await file.arrayBuffer();
      
      // Simple DOCX text extraction (this is a basic approach)
      // In production, you might want to use a more robust solution
      const uint8Array = new Uint8Array(arrayBuffer);
      const textDecoder = new TextDecoder();
      let rawText = '';
      
      try {
        // Try to extract readable text from DOCX
        const text = textDecoder.decode(uint8Array);
        // Extract text between XML tags (basic approach)
        const textMatches = text.match(/>([^<]+)</g);
        if (textMatches) {
          rawText = textMatches
            .map(match => match.slice(1, -1))
            .filter(text => text.trim().length > 0 && !text.includes('<?xml'))
            .join('\n');
        }
      } catch (error) {
        console.error('[Parse Vendor] DOCX extraction error:', error);
        return new Response(
          JSON.stringify({ error: 'Failed to extract text from DOCX file' }), 
          { 
            status: 500, 
            headers: { ...corsHeaders, 'Content-Type': 'application/json' }
          }
        );
      }

      console.log(`[Parse Vendor] Extracted text length: ${rawText.length}`);
      vendorBlocks = groupVendorBlocks(rawText);
    }
    // Handle PDF files 
    else if (file.name.endsWith('.pdf')) {
      console.log('[Parse Vendor] PDF processing not yet implemented in this version');
      return new Response(
        JSON.stringify({ error: 'PDF processing will be available in the next update. Please convert to DOCX format.' }), 
        { 
          status: 400, 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' }
        }
      );
    }
    else {
      return new Response(
        JSON.stringify({ error: 'Unsupported file format. Only .docx files are supported.' }), 
        { 
          status: 400, 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' }
        }
      );
    }

    console.log(`[Parse Vendor] Found ${vendorBlocks.length} vendor blocks`);

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

    // Process each vendor block with OpenAI
    const results = [];
    for (let i = 0; i < vendorBlocks.length; i++) {
      const block = vendorBlocks[i];
      console.log(`[Parse Vendor] Processing block ${i + 1}/${vendorBlocks.length}`);
      
      const prompt = `
You will receive a vendor block with one company per block. Each block may contain:
- Company name (may need to infer from context or file name if not explicitly listed)
- Address (may be split across lines)
- Phone number(s)
- Email address(es)
- Contact person name
- List of parts/services (each as a line, or comma-separated)

Extract as JSON:

{
  "name": "",
  "address": "",
  "phone": "",
  "email": "",
  "contact_person": "",
  "description": ""
}

• For company name, use the most prominent business name in the block
• Address should combine street + city/state/ZIP into one field
• Phone should be the primary phone number
• Email should be the primary email address
• Contact person should be any person's name mentioned
• Description should include parts/services offered
• Return only the JSON, no extra text

Block:
${block}`;

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
          }),
        });

        if (!response.ok) {
          throw new Error(`OpenAI API error: ${response.status}`);
        }

        const data = await response.json();
        const text = data.choices[0].message.content || '{}';
        
        // Extract JSON from response
        const jsonStart = text.indexOf('{');
        const jsonEnd = text.lastIndexOf('}') + 1;
        
        if (jsonStart >= 0 && jsonEnd > jsonStart) {
          const jsonStr = text.slice(jsonStart, jsonEnd);
          const vendor = JSON.parse(jsonStr);
          
          // Map to our expected format
          const mappedVendor = {
            name: vendor.name || `Vendor ${i + 1}`,
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
            description: vendor.description || block.substring(0, 200),
            rating: null
          };
          
          results.push(mappedVendor);
        } else {
          throw new Error('Invalid JSON response from OpenAI');
        }
      } catch (error) {
        console.error(`[Parse Vendor] Error processing block ${i + 1}:`, error);
        // Add a fallback vendor entry for failed blocks
        results.push({
          name: `Parse Error - Block ${i + 1}`,
          email: '',
          phone: '',
          contact_person: '',
          contact_title: '',
          vendor_type: 'service',
          status: 'active',
          address: '',
          city: '',
          state: '',
          zip_code: '',
          website: '',
          description: `Failed to parse: ${block.substring(0, 100)}...`,
          rating: null
        });
      }
    }

    console.log(`[Parse Vendor] Successfully processed ${results.length} vendors`);

    return new Response(
      JSON.stringify({ 
        success: true,
        vendors: results,
        totalBlocks: vendorBlocks.length,
        message: `Successfully processed ${results.length} vendor entries`
      }), 
      { 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      }
    );

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

// Helper function to group vendor blocks by blank lines
function groupVendorBlocks(text: string): string[] {
  if (!text || text.trim().length === 0) {
    return [];
  }

  const lines = text.split(/\r?\n/);
  const blocks: string[] = [];
  let current: string[] = [];
  let blankCount = 0;

  for (const line of lines) {
    const trimmedLine = line.trim();
    
    if (!trimmedLine) {
      blankCount++;
      // If we hit 2+ blank lines and have content, finalize the block
      if (blankCount >= 2 && current.length > 0) {
        blocks.push(current.join('\n').trim());
        current = [];
      }
    } else {
      blankCount = 0;
      current.push(trimmedLine);
    }
  }

  // Don't forget the last block
  if (current.length > 0) {
    blocks.push(current.join('\n').trim());
  }

  // Filter out blocks that are too small to be vendor entries
  return blocks.filter(block => block.length > 20);
}
