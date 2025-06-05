
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
    console.log('Image data length:', imageData?.length || 0);
    console.log('Image data type:', typeof imageData);
    console.log('Image data starts with:', imageData?.substring(0, 50));

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
            content: `You are an expert data extraction assistant. Your task is to extract vendor/company information from ANY document image.

CRITICAL INSTRUCTIONS:
1. Examine the ENTIRE image carefully for ANY business-related information
2. Look for names, email addresses, phone numbers, addresses, company names, etc.
3. If you find ANYTHING that could be business-related, extract it
4. Even if incomplete, create entries for partial information
5. If you see only text but no clear structure, still extract what you can
6. Better to include questionable entries than miss real vendor data

Extract these fields for each vendor/business entity found:
- name: ANY company name or person name with business context
- email: any email address found
- phone: any phone number found
- contact_person: person names if available
- contact_title: job titles if available
- address: any address information
- city, state, zip_code: location details
- website: any URLs found
- vendor_type: "service" (default), "supplier", "contractor", or "consultant"
- status: always "active"
- description: what they do or any context

RETURN FORMAT: Valid JSON array only. No markdown, no extra text.
If you find NOTHING at all, return [].
If you find ANYTHING business-related, create entries even with minimal data.

DEBUG: Also consider that this might be a screenshot, photo of a document, scanned paper, business card, contact list, directory, invoice, contract, or any other business document format.`
          },
          {
            role: 'user',
            content: [
              {
                type: 'text',
                text: `Please examine this image very carefully and extract ALL business information you can find. Look for:
- Company names or business names
- People's names with business context
- Email addresses
- Phone numbers  
- Addresses
- Websites
- Any other business contact information

Be thorough and extract everything that could be vendor-related, even if the data is incomplete. Create an entry for each distinct business entity you find.

What type of document or content do you see in this image? Describe it briefly and then extract the vendor data.`
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

    console.log('OpenAI API response status:', response.status);
    
    if (!response.ok) {
      const errorText = await response.text();
      console.error('OpenAI API error details:', errorText);
      throw new Error(`OpenAI API error: ${response.status} ${response.statusText} - ${errorText}`);
    }

    const data = await response.json();
    console.log('OpenAI Vision response received');
    console.log('Full OpenAI response:', JSON.stringify(data, null, 2));

    const extractedText = data.choices[0].message.content;
    console.log('Raw extracted text:', extractedText);

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
      
      console.log('Cleaned text for JSON parsing:', cleanedText);
      vendors = JSON.parse(cleanedText);
    } catch (parseError) {
      console.error('Failed to parse OpenAI response as JSON:', parseError);
      console.error('Raw response:', extractedText);
      console.error('Cleaned text:', cleanedText);
      
      // Try to extract JSON from the response if it's embedded in text
      const jsonMatch = extractedText.match(/\[[\s\S]*\]/);
      if (jsonMatch) {
        try {
          console.log('Attempting to parse extracted JSON:', jsonMatch[0]);
          vendors = JSON.parse(jsonMatch[0]);
        } catch (secondParseError) {
          console.error('Second JSON parse attempt failed:', secondParseError);
          throw new Error('Invalid JSON response from OpenAI Vision: ' + extractedText);
        }
      } else {
        throw new Error('No valid JSON found in OpenAI response: ' + extractedText);
      }
    }

    // Ensure it's an array
    if (!Array.isArray(vendors)) {
      console.error('OpenAI response is not an array:', vendors);
      throw new Error('OpenAI response is not an array');
    }

    console.log(`Successfully extracted ${vendors.length} vendors from image`);
    console.log('Extracted vendors:', JSON.stringify(vendors, null, 2));

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
