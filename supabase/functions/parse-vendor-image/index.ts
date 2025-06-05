
import "https://deno.land/x/xhr@0.1.0/mod.ts";
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const openAIApiKey = Deno.env.get('OPENAI_API_KEY');

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
    const { imageData } = await req.json();

    console.log('Processing vendor document image with OpenAI Vision...');

    const response = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${openAIApiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: 'gpt-4o',
        messages: [
          {
            role: 'system',
            content: `You are an expert data extraction assistant. Extract vendor information from document images and return it as a JSON array. 

For each vendor found, extract these fields:
- name (company/vendor name)
- email (email address)
- phone (phone number)
- contact_person (contact person name if available)
- contact_title (contact person title if available)
- address (street address)
- city (city)
- state (state/province)
- zip_code (postal/zip code)
- website (website URL)
- vendor_type (categorize as: service, supplier, contractor, or consultant)
- status (set as "active")
- description (brief description if available)

Return ONLY a valid JSON array with no additional text. If no vendors are found, return an empty array [].

Example format:
[
  {
    "name": "ABC Company",
    "email": "contact@abc.com",
    "phone": "555-123-4567",
    "contact_person": "John Smith",
    "contact_title": "Manager",
    "address": "123 Main St",
    "city": "Springfield",
    "state": "IL",
    "zip_code": "62701",
    "website": "www.abc.com",
    "vendor_type": "service",
    "status": "active",
    "description": "Professional services company"
  }
]`
          },
          {
            role: 'user',
            content: [
              {
                type: 'text',
                text: 'Please extract all vendor information from this document image. Look for company names, contact details, addresses, and any other relevant vendor data. Return the data as a JSON array.'
              },
              {
                type: 'image_url',
                image_url: {
                  url: imageData
                }
              }
            ]
          }
        ],
        max_tokens: 4000,
        temperature: 0.1
      }),
    });

    if (!response.ok) {
      throw new Error(`OpenAI API error: ${response.status} ${response.statusText}`);
    }

    const data = await response.json();
    console.log('OpenAI Vision response received');

    const extractedText = data.choices[0].message.content;
    console.log('Extracted vendor data:', extractedText);

    // Parse the JSON response
    let vendors;
    try {
      vendors = JSON.parse(extractedText);
    } catch (parseError) {
      console.error('Failed to parse OpenAI response as JSON:', parseError);
      throw new Error('Invalid JSON response from OpenAI Vision');
    }

    // Ensure it's an array
    if (!Array.isArray(vendors)) {
      throw new Error('OpenAI response is not an array');
    }

    console.log(`Successfully extracted ${vendors.length} vendors from image`);

    return new Response(JSON.stringify({ vendors }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  } catch (error) {
    console.error('Error in parse-vendor-image function:', error);
    return new Response(JSON.stringify({ 
      error: error.message,
      vendors: []
    }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});
