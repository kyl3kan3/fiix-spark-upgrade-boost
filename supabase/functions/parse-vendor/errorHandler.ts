
import { corsHeaders } from './corsUtils.ts';

export async function handleOpenAIError(response: Response): Promise<Response> {
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
