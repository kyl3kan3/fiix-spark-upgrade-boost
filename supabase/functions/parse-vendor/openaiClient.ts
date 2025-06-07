
import { corsHeaders } from './corsUtils.ts';
import { estimateTokenCount, chunkText } from './textChunker.ts';
import { handleOpenAIError } from './errorHandler.ts';
import { VENDOR_EXTRACTION_PROMPT } from './aiPrompt.ts';

export async function processVendorDataWithAI(extractedText: string, openaiApiKey: string): Promise<Response> {
  console.log(`[Parse Vendor] Processing text with ${extractedText.length} characters using AI Vision`);
  
  // Estimate token count
  const estimatedTokens = estimateTokenCount(extractedText);
  console.log(`[Parse Vendor] Estimated tokens: ${estimatedTokens}`);
  
  // Use smaller chunks for vision model to avoid rate limits
  const maxTokensPerRequest = 15000; // Much smaller limit for vision model
  const chunks = chunkText(extractedText, maxTokensPerRequest);
  
  console.log(`[Parse Vendor] Split into ${chunks.length} chunks for AI Vision processing`);

  try {
    const allVendors: any[] = [];
    
    // Process each chunk using vision model with smaller chunks
    for (let i = 0; i < chunks.length; i++) {
      console.log(`[Parse Vendor] Processing chunk ${i + 1}/${chunks.length} with AI Vision (${chunks[i].length} chars)`);
      
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
                  text: `${VENDOR_EXTRACTION_PROMPT}\n\nDocument text content to analyze (chunk ${i + 1} of ${chunks.length}):\n\n${chunks[i]}`
                }
              ]
            }
          ],
          temperature: 0.1,
          max_tokens: 2000, // Reduced max tokens
        }),
      });

      if (!response.ok) {
        return handleOpenAIError(response);
      }
      
      const data = await response.json();
      const content = data.choices[0].message.content || '[]';
      
      // Parse the JSON response for this chunk
      try {
        let jsonStr = content.replace(/```json\s*/g, '').replace(/```\s*/g, '').trim();
        const arrayStart = jsonStr.indexOf('[');
        const arrayEnd = jsonStr.lastIndexOf(']') + 1;
        
        if (arrayStart >= 0 && arrayEnd > arrayStart) {
          jsonStr = jsonStr.slice(arrayStart, arrayEnd);
          const chunkVendors = JSON.parse(jsonStr);
          
          if (Array.isArray(chunkVendors)) {
            console.log(`[Parse Vendor] Found ${chunkVendors.length} vendors in chunk ${i + 1}`);
            allVendors.push(...chunkVendors);
          }
        }
      } catch (parseError) {
        console.error(`[Parse Vendor] Error parsing chunk ${i + 1}:`, parseError);
        console.error(`[Parse Vendor] Raw content: ${content.substring(0, 200)}...`);
      }
      
      // Add delay between requests to avoid rate limiting
      if (i < chunks.length - 1) {
        console.log(`[Parse Vendor] Waiting 2 seconds before next chunk...`);
        await new Promise(resolve => setTimeout(resolve, 2000));
      }
    }
    
    console.log(`[Parse Vendor] Extracted ${allVendors.length} vendors from ${chunks.length} chunks using AI Vision`);
    
    // Return the combined results
    return new Response(
      JSON.stringify({
        choices: [{
          message: {
            content: JSON.stringify(allVendors)
          }
        }]
      }),
      { 
        status: 200,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      }
    );

  } catch (error) {
    console.error('[Parse Vendor] AI Vision processing error:', error);
    return new Response(
      JSON.stringify({ 
        error: 'Failed to process document with AI Vision',
        details: error.message 
      }), 
      { 
        status: 500, 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      }
    );
  }
}
