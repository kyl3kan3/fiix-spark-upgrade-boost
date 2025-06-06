
import "https://deno.land/x/xhr@0.1.0/mod.ts";
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

// Simple DOCX text extraction function
function extractTextFromDocx(arrayBuffer: ArrayBuffer): string {
  try {
    const uint8Array = new Uint8Array(arrayBuffer);
    const decoder = new TextDecoder('utf-8', { fatal: false });
    
    // Convert to string and look for XML content
    const content = decoder.decode(uint8Array);
    
    // Find document.xml content (the main document content in DOCX)
    const documentXmlMatch = content.match(/word\/document\.xml.*?<w:document[^>]*>(.*?)<\/w:document>/s);
    let textContent = '';
    
    if (documentXmlMatch) {
      const xmlContent = documentXmlMatch[1];
      // Extract text from XML tags, specifically <w:t> tags which contain text
      const textMatches = xmlContent.match(/<w:t[^>]*>([^<]*)<\/w:t>/g);
      if (textMatches) {
        textContent = textMatches
          .map(match => match.replace(/<w:t[^>]*>([^<]*)<\/w:t>/, '$1'))
          .join(' ');
      }
    }
    
    // If no structured content found, try to extract any readable text
    if (!textContent || textContent.length < 50) {
      const lines = content.split(/[\r\n]+/);
      const readableLines = [];
      
      for (const line of lines) {
        // Look for lines with readable ASCII text that might contain vendor info
        const cleanLine = line
          .replace(/[^\x20-\x7E\s]/g, ' ') // Keep only printable ASCII
          .replace(/\s+/g, ' ')
          .trim();
        
        // Only include lines that look like they contain meaningful text
        if (cleanLine.length > 10 && 
            (cleanLine.includes('@') || // emails
             cleanLine.match(/\d{3}[\s\-\.]?\d{3}[\s\-\.]?\d{4}/) || // phone numbers
             cleanLine.match(/\b[A-Z][A-Za-z\s&.,]{5,50}\b/) || // company-like names
             cleanLine.includes('Inc') || cleanLine.includes('LLC') ||
             cleanLine.includes('Corp') || cleanLine.includes('Company') ||
             cleanLine.match(/\d+\s+[A-Za-z\s]+(?:St|Street|Ave|Avenue|Rd|Road|Dr|Drive|Blvd|Boulevard)/i))) { // addresses
          readableLines.push(cleanLine);
        }
      }
      
      textContent = readableLines.join('\n');
    }
    
    return textContent;
  } catch (error) {
    console.error('[Parse Vendor] DOCX extraction error:', error);
    return '';
  }
}

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

    // Enhanced prompt for better vendor extraction
    const prompt = `You are an expert at extracting vendor/company information from business documents. 

Analyze the following text and find ALL companies, vendors, or businesses mentioned. Look for:
- Company names (even partial or unclear names)
- Contact information (emails, phone numbers, addresses)
- Person names associated with companies
- Any business entities or service providers

For EACH vendor/company you find, extract this information and return as a JSON array:

[
  {
    "name": "Company name (required - extract even partial names)",
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

IMPORTANT RULES:
1. Extract ALL companies/vendors you can identify, even with minimal information
2. Be aggressive in identifying company names - look for capitalized words, business indicators
3. If you find contact info without a clear company name, create a descriptive name based on context
4. Return ONLY a valid JSON array, no markdown or extra text
5. Include vendors even if they only have a name and one piece of contact info
6. Look for patterns like: Name + Phone, Name + Email, Name + Address

Text to analyze:
${extractedText}`;

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
          max_tokens: 4000,
        }),
      });

      if (!response.ok) {
        const errorText = await response.text();
        console.error(`[Parse Vendor] OpenAI API error: ${response.status} - ${errorText}`);
        
        // Provide specific error messages based on status code
        let errorMessage = 'Failed to process document with AI';
        let errorDetails = '';
        
        switch (response.status) {
          case 429:
            errorMessage = 'Rate limit exceeded';
            errorDetails = 'Too many requests to OpenAI API. Please wait a few minutes and try again. This usually resolves within 1-5 minutes.';
            break;
          case 401:
            errorMessage = 'Invalid API key';
            errorDetails = 'Your OpenAI API key is invalid or expired. Please check your API key in the project settings.';
            break;
          case 402:
            errorMessage = 'Insufficient credits';
            errorDetails = 'Your OpenAI account has insufficient credits. Please add credits to your OpenAI account.';
            break;
          case 403:
            errorMessage = 'Access forbidden';
            errorDetails = 'Your OpenAI API key does not have permission to access this service.';
            break;
          case 500:
          case 502:
          case 503:
            errorMessage = 'OpenAI service unavailable';
            errorDetails = 'OpenAI\'s servers are experiencing issues. Please try again in a few minutes.';
            break;
          default:
            errorDetails = `OpenAI API returned status ${response.status}. Please try again or check your API key.`;
        }
        
        return new Response(
          JSON.stringify({ 
            error: errorMessage,
            details: errorDetails,
            status: response.status
          }), 
          { 
            status: 500, 
            headers: { ...corsHeaders, 'Content-Type': 'application/json' }
          }
        );
      }

      const data = await response.json();
      const content = data.choices[0].message.content || '[]';
      
      console.log('[Parse Vendor] GPT-4 raw response:', content);
      
      // Parse JSON response
      let vendors = [];
      try {
        // Remove markdown code blocks if present
        let jsonStr = content.replace(/```json\s*/g, '').replace(/```\s*/g, '').trim();
        
        // Find JSON array in the response
        const arrayStart = jsonStr.indexOf('[');
        const arrayEnd = jsonStr.lastIndexOf(']') + 1;
        
        if (arrayStart >= 0 && arrayEnd > arrayStart) {
          jsonStr = jsonStr.slice(arrayStart, arrayEnd);
          vendors = JSON.parse(jsonStr);
          
          if (!Array.isArray(vendors)) {
            vendors = [vendors];
          }
        }
      } catch (parseError) {
        console.error('[Parse Vendor] JSON parse error:', parseError);
        console.error('[Parse Vendor] Attempted to parse:', content);
        
        // Fallback: try to create vendors from basic patterns in text
        const emailMatches = extractedText.match(/\b[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Z|a-z]{2,}\b/g) || [];
        const phoneMatches = extractedText.match(/(\(?\d{3}\)?[-.\s]?\d{3}[-.\s]?\d{4})/g) || [];
        
        if (emailMatches.length > 0 || phoneMatches.length > 0) {
          vendors = [{
            name: 'Extracted Vendor Information',
            email: emailMatches[0] || '',
            phone: phoneMatches[0] || '',
            contact_person: '',
            contact_title: '',
            vendor_type: 'service',
            status: 'active',
            address: '',
            city: '',
            state: '',
            zip_code: '',
            website: '',
            description: 'Extracted from document - please review and edit',
            rating: null
          }];
        }
      }

      // Clean and validate vendors
      const validVendors = vendors
        .filter(vendor => vendor && (vendor.name || vendor.email || vendor.phone))
        .map((vendor: any, index: number) => ({
          name: vendor.name || `Vendor ${index + 1}`,
          email: vendor.email || '',
          phone: vendor.phone || vendor.phone_number || '',
          contact_person: vendor.contact_person || vendor.contact || '',
          contact_title: vendor.contact_title || '',
          vendor_type: 'service',
          status: 'active',
          address: vendor.address || '',
          city: vendor.city || '',
          state: vendor.state || '',
          zip_code: vendor.zip_code || vendor.zipCode || '',
          website: vendor.website || '',
          description: vendor.description || vendor.services || vendor.business || '',
          rating: null
        }));

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
