
import "https://deno.land/x/xhr@0.1.0/mod.ts";
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { corsHeaders, handleCORSPreflight } from './corsUtils.ts';
import { extractTextFromDocx } from './docxExtractor.ts';
import { processVendorDataWithAI } from './openaiClient.ts';
import { processVendorResponse } from './vendorProcessor.ts';

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return handleCORSPreflight();
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
        JSON.stringify({ 
          error: 'OpenAI API key not configured',
          details: 'Please configure your OpenAI API key in the Supabase project settings.'
        }), 
        { 
          status: 500, 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' }
        }
      );
    }

    console.log('[Parse Vendor] Using improved DOCX text extraction...');
    
    // Read file and extract text properly
    const arrayBuffer = await file.arrayBuffer();
    const extractedText = extractTextFromDocx(arrayBuffer);
    
    console.log(`[Parse Vendor] Extracted text length: ${extractedText.length}`);
    console.log(`[Parse Vendor] Sample extracted text: ${extractedText.substring(0, 500)}`);
    
    if (extractedText.length < 20) {
      return new Response(
        JSON.stringify({ 
          error: 'Could not extract readable text from DOCX document',
          details: 'The document appears to be empty or contains no extractable text. Please ensure the document contains vendor information in text format.',
          debug: {
            fileSize: file.size,
            fileName: file.name,
            extractedLength: extractedText.length
          }
        }), 
        { 
          status: 400, 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' }
        }
      );
    }

    // Process with OpenAI
    const response = await processVendorDataWithAI(extractedText, openaiApiKey);
    
    // If there was an error response from OpenAI processing, return it
    if (!response.ok) {
      return response;
    }

    const data = await response.json();
    const content = data.choices[0].message.content || '[]';
    
    // Process the vendor response
    const validVendors = processVendorResponse(content, extractedText);

    console.log(`[Parse Vendor] Successfully extracted ${validVendors.length} vendors`);

    if (validVendors.length === 0) {
      return new Response(
        JSON.stringify({ 
          error: 'No vendor data found in the document',
          details: `Processed document but could not identify vendor information. Please ensure the document contains company names, contact details, or business information.`,
          debug: {
            textSample: extractedText.substring(0, 500),
            textLength: extractedText.length,
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
        message: `Successfully extracted ${validVendors.length} vendor entries from document`
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
