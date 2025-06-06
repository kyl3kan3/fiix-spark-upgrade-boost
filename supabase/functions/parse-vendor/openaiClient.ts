
import { corsHeaders } from './corsUtils.ts';

export async function processVendorDataWithAI(extractedText: string, openaiApiKey: string): Promise<Response> {
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
        model: 'gpt-4o',
        messages: [{ role: 'user', content: prompt }],
        temperature: 0.1,
        max_tokens: 4000,
      }),
    });

    if (!response.ok) {
      return handleOpenAIError(response);
    }

    return response;
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
}

async function handleOpenAIError(response: Response): Promise<Response> {
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
