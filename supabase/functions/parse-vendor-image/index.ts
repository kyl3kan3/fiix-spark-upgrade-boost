
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
            content: `You are an expert data extraction assistant specialized in extracting vendor/company information from ANY type of document. Your job is to identify and extract ALL company, vendor, business, or service provider information from the document.

EXTRACTION RULES:
1. Look for ANY text that could represent a company, business, vendor, or service provider
2. Extract contact information (emails, phones, addresses) even if not directly associated with a company name
3. Be VERY liberal in what you consider vendor information - include consultants, freelancers, contractors, suppliers, etc.
4. If you see a person's name with contact info, treat it as a potential vendor (contact_person field)
5. Extract partial information even if incomplete - don't skip entries with missing fields
6. Look for patterns like business cards, letterheads, contact lists, invoices, contracts, or any business-related content

For each vendor/company found, extract these fields (use empty string "" for missing data):
- name: company name OR person's name if no company (REQUIRED - don't skip if you find ANY business-related entity)
- email: email address
- phone: phone number  
- contact_person: contact person name
- contact_title: contact person title/role
- address: street address
- city: city
- state: state/province  
- zip_code: postal/zip code
- website: website URL
- vendor_type: categorize as "service", "supplier", "contractor", or "consultant" (default: "service")
- status: always set as "active"
- description: brief description of services/business

IMPORTANT: 
- If you find ANY business-related information, create an entry for it
- Don't be strict about complete information - partial data is valuable
- Even a single email address or phone number can be a vendor entry
- Return EMPTY ARRAY [] ONLY if the document contains absolutely no business/contact information

Return ONLY valid JSON array format with no additional text or markdown.

Examples of what to extract:
- Company listings, business directories
- Contact information in any format
- Business cards or letterheads
- Invoice headers with vendor info
- Email signatures with business details
- Any person/company providing services`
          },
          {
            role: 'user',
            content: [
              {
                type: 'text',
                text: 'Please carefully examine this document and extract ALL vendor, company, business, or service provider information. Look for any business entities, contact information, or service providers. Be very thorough and extract even partial information. If you see business-related content but are unsure, include it rather than exclude it.'
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

    // Parse the JSON response, handling markdown code blocks
    let vendors;
    try {
      // Clean the response by removing markdown code blocks if present
      let cleanedText = extractedText.trim();
      
      // Remove ```json and ``` if present
      if (cleanedText.startsWith('```json')) {
        cleanedText = cleanedText.replace(/^```json\s*/, '').replace(/\s*```$/, '');
      } else if (cleanedText.startsWith('```')) {
        cleanedText = cleanedText.replace(/^```\s*/, '').replace(/\s*```$/, '');
      }
      
      vendors = JSON.parse(cleanedText);
    } catch (parseError) {
      console.error('Failed to parse OpenAI response as JSON:', parseError);
      console.error('Raw response:', extractedText);
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
