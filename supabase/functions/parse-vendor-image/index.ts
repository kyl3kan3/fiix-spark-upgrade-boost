
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
    console.log('=== VENDOR IMAGE PARSING START ===');
    
    if (!openAIApiKey) {
      console.error('OPENAI_API_KEY is not set');
      throw new Error('OpenAI API key is not configured');
    }

    const requestBody = await req.json();
    const { imageData } = requestBody;

    console.log('Request received successfully');
    console.log('Image data present:', !!imageData);
    console.log('Image data length:', imageData?.length || 0);

    if (!imageData) {
      throw new Error('No image data provided');
    }

    console.log('Calling OpenAI Vision API for vendor document analysis...');
    
    const openAIRequest = {
      model: 'gpt-4o',
      messages: [
        {
          role: 'system',
          content: `You are an expert data extraction assistant specializing in vendor directory analysis. Extract vendor/company information from documents that may contain:

- Lists of vendors/suppliers with contact details
- Business directories or contact lists  
- Documents with company logos and text
- Mixed content with both text and images
- Tables or structured vendor information

CRITICAL INSTRUCTIONS:
1. ONLY return valid JSON array - no text, explanations, or markdown
2. Look carefully for company names, even if they appear with logos
3. Extract contact information from any readable text
4. If text is unclear, make reasonable interpretations
5. Don't skip entries just because some information is missing

For EACH vendor/company found, create this exact JSON structure:
{
  "name": "company name (REQUIRED - extract from logos, headers, or text)",
  "email": "email@domain.com or empty string",
  "phone": "phone number or empty string", 
  "contact_person": "person name or empty string",
  "contact_title": "job title or empty string",
  "address": "street address or empty string",
  "city": "city or empty string",
  "state": "state or empty string",
  "zip_code": "zip code or empty string",
  "website": "website URL or empty string",
  "vendor_type": "service",
  "status": "active",
  "description": "brief description of services or empty string"
}

EXAMPLES of what to look for:
- Company names in headers, logos, or bold text
- Email addresses (anything@domain.com)
- Phone numbers in various formats
- Addresses with street, city, state
- Contact person names and titles
- Service descriptions

If you find NO vendor information at all, return: []
If you find ANY companies/vendors, return array of vendor objects.

RESPOND WITH ONLY THE JSON ARRAY - NO OTHER TEXT.`
        },
        {
          role: 'user',
          content: [
            {
              type: 'text',
              text: 'This is a vendor directory document that may contain company logos and contact information. Please extract ALL vendor/company information you can find, even if some details are missing. Look carefully at logos, headers, and any text content. Return ONLY the JSON array of vendors.'
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
    };

    console.log('Making request to OpenAI...');
    
    const response = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${openAIApiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(openAIRequest),
    });

    console.log('OpenAI response status:', response.status);
    
    if (!response.ok) {
      const errorText = await response.text();
      console.error('OpenAI API error:', response.status, errorText);
      throw new Error(`OpenAI API error: ${response.status} - ${errorText}`);
    }

    const data = await response.json();
    console.log('OpenAI response received');

    if (!data.choices || !data.choices[0] || !data.choices[0].message) {
      console.error('Invalid OpenAI response structure:', data);
      throw new Error('Invalid response structure from OpenAI');
    }

    const extractedText = data.choices[0].message.content;
    console.log('Raw OpenAI content:', extractedText);

    if (!extractedText) {
      console.error('No content in OpenAI response');
      throw new Error('Empty response from OpenAI');
    }

    // Parse the JSON response with enhanced error handling
    let vendors;
    try {
      // Clean the response by removing any markdown formatting
      let cleanedText = extractedText.trim();
      
      // Remove markdown code blocks if present
      if (cleanedText.startsWith('```json')) {
        cleanedText = cleanedText.replace(/^```json\s*/, '').replace(/\s*```$/, '');
      } else if (cleanedText.startsWith('```')) {
        cleanedText = cleanedText.replace(/^```\s*/, '').replace(/\s*```$/, '');
      }
      
      console.log('Cleaned text for parsing:', cleanedText);
      
      vendors = JSON.parse(cleanedText);
      console.log('Successfully parsed JSON');
      
    } catch (parseError) {
      console.error('JSON parse error:', parseError.message);
      console.error('Failed to parse content:', extractedText);
      
      // Try to extract JSON array from the response
      const jsonMatch = extractedText.match(/\[[\s\S]*?\]/);
      if (jsonMatch) {
        try {
          console.log('Attempting to parse extracted JSON array:', jsonMatch[0]);
          vendors = JSON.parse(jsonMatch[0]);
          console.log('Successfully parsed extracted JSON');
        } catch (secondParseError) {
          console.error('Second parse attempt failed:', secondParseError.message);
          throw new Error(`Invalid JSON response: ${extractedText.substring(0, 200)}`);
        }
      } else {
        console.error('No JSON array found in response');
        throw new Error(`No valid JSON found in response: ${extractedText.substring(0, 200)}`);
      }
    }

    // Validate the response
    if (!Array.isArray(vendors)) {
      console.error('Response is not an array:', typeof vendors, vendors);
      throw new Error('OpenAI response is not an array');
    }

    console.log(`Successfully processed ${vendors.length} vendors`);
    console.log('Vendor data:', JSON.stringify(vendors, null, 2));

    console.log('=== VENDOR IMAGE PARSING COMPLETE ===');

    return new Response(JSON.stringify({ vendors }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });

  } catch (error) {
    console.error('=== ERROR IN PARSE-VENDOR-IMAGE ===');
    console.error('Error type:', error.constructor.name);
    console.error('Error message:', error.message);
    console.error('Error stack:', error.stack);
    
    return new Response(JSON.stringify({ 
      error: error.message,
      vendors: [],
      debug: {
        errorType: error.constructor.name,
        timestamp: new Date().toISOString()
      }
    }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});
