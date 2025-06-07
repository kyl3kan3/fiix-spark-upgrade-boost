
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

  if (req.method !== 'POST') {
    return new Response(
      JSON.stringify({ error: 'Only POST method allowed' }), 
      { 
        status: 405, 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      }
    );
  }

  try {
    const { base64Image } = await req.json();
    
    if (!base64Image) {
      return new Response(
        JSON.stringify({ error: 'base64Image is required' }), 
        { 
          status: 400, 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' }
        }
      );
    }

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

    console.log('[GPT Vision] Processing image with GPT-4 Vision...');

    const response = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${openaiApiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: 'gpt-4o',
        messages: [
          {
            role: 'user',
            content: [
              {
                type: 'text',
                text: `Extract vendor/company information from this image and return as JSON array. Look for company names, contact details, addresses, phone numbers, emails, and any business information. Return ONLY a valid JSON array in this format:

[
  {
    "name": "Company name (required)",
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

Extract ALL vendors/companies you can identify, even with minimal information. Be aggressive in identifying business names and contact details.`
              },
              {
                type: 'image_url',
                image_url: {
                  url: `data:image/png;base64,${base64Image}`,
                },
              },
            ],
          },
        ],
        temperature: 0.1,
        max_tokens: 2000,
      }),
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error(`[GPT Vision] OpenAI API error: ${response.status} - ${errorText}`);
      
      let errorMessage = 'Failed to process image with GPT Vision';
      if (response.status === 429) {
        errorMessage = 'Rate limit exceeded. Please try again in a few minutes.';
      } else if (response.status === 401) {
        errorMessage = 'Invalid OpenAI API key';
      }
      
      return new Response(
        JSON.stringify({ error: errorMessage, details: errorText }), 
        { 
          status: 500, 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' }
        }
      );
    }

    const data = await response.json();
    const content = data.choices[0].message.content || '[]';
    
    console.log('[GPT Vision] Raw GPT response:', content.substring(0, 500));

    // Parse the JSON response
    let vendors = [];
    try {
      let jsonStr = content.replace(/```json\s*/g, '').replace(/```\s*/g, '').trim();
      const arrayStart = jsonStr.indexOf('[');
      const arrayEnd = jsonStr.lastIndexOf(']') + 1;
      
      if (arrayStart >= 0 && arrayEnd > arrayStart) {
        jsonStr = jsonStr.slice(arrayStart, arrayEnd);
        vendors = JSON.parse(jsonStr);
        
        if (!Array.isArray(vendors)) {
          vendors = [];
        }
      }
    } catch (parseError) {
      console.error('[GPT Vision] Error parsing JSON response:', parseError);
      console.error('[GPT Vision] Raw content:', content);
      vendors = [];
    }

    console.log(`[GPT Vision] Successfully extracted ${vendors.length} vendors from image`);

    return new Response(
      JSON.stringify({ 
        success: true,
        vendors: vendors,
        message: `Successfully extracted ${vendors.length} vendor entries using GPT-4 Vision`
      }), 
      { 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      }
    );

  } catch (error) {
    console.error('[GPT Vision] Unexpected error:', error);
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
