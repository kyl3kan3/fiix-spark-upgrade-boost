
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
    console.log('Image data starts with:', imageData?.substring(0, 100));

    if (!imageData) {
      throw new Error('No image data provided');
    }

    console.log('Calling OpenAI Vision API...');
    
    const openAIRequest = {
      model: 'gpt-4o',
      messages: [
        {
          role: 'system',
          content: `You are an expert data extraction assistant. Extract vendor/company information from ANY document image.

CRITICAL: You MUST return ONLY a valid JSON array, nothing else. No text, no markdown, no explanations.

Look for:
- Company/business names
- Contact information (email, phone, addresses)
- Any business-related data

For each vendor found, create an object with these fields:
{
  "name": "company name",
  "email": "email if found",
  "phone": "phone if found", 
  "contact_person": "person name if found",
  "contact_title": "title if found",
  "address": "address if found",
  "city": "city if found",
  "state": "state if found",
  "zip_code": "zip if found",
  "website": "website if found",
  "vendor_type": "service",
  "status": "active",
  "description": "what they do"
}

If you find NOTHING, return: []
If you find vendor data, return an array of vendor objects.

RETURN ONLY JSON - NO OTHER TEXT.`
        },
        {
          role: 'user',
          content: [
            {
              type: 'text',
              text: 'Extract all vendor/business information from this image. Return ONLY valid JSON array.'
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
    console.log('OpenAI response ok:', response.ok);
    
    if (!response.ok) {
      const errorText = await response.text();
      console.error('OpenAI API error:', response.status, response.statusText);
      console.error('Error details:', errorText);
      throw new Error(`OpenAI API error: ${response.status} - ${errorText}`);
    }

    const data = await response.json();
    console.log('OpenAI response received');
    console.log('Response structure:', {
      choices: data.choices?.length || 0,
      hasMessage: !!data.choices?.[0]?.message,
      hasContent: !!data.choices?.[0]?.message?.content
    });

    if (!data.choices || !data.choices[0] || !data.choices[0].message) {
      console.error('Invalid OpenAI response structure:', data);
      throw new Error('Invalid response structure from OpenAI');
    }

    const extractedText = data.choices[0].message.content;
    console.log('Raw OpenAI content:', extractedText);
    console.log('Content length:', extractedText?.length || 0);

    if (!extractedText) {
      console.error('No content in OpenAI response');
      throw new Error('Empty response from OpenAI');
    }

    // Parse the JSON response
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
