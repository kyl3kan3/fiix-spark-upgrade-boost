
import OpenAI from 'openai'

// Initialize OpenAI client only if API key is available
let openai: OpenAI | null = null

const initializeOpenAI = () => {
  if (openai) return openai

  try {
    // Try to get API key from environment variables (Supabase secrets are exposed as VITE_ variables)
    const apiKey = import.meta.env.VITE_OPENAI_API_KEY || 
                   import.meta.env.OPENAI_API_KEY ||
                   // Fallback: try accessing from global if available
                   (window as any).__SUPABASE_SECRETS__?.OPENAI_API_KEY
    
    if (apiKey) {
      openai = new OpenAI({
        apiKey,
        dangerouslyAllowBrowser: true
      })
      console.log('OpenAI client initialized successfully')
      return openai
    } else {
      console.warn('No OpenAI API key found in environment variables')
      return null
    }
  } catch (error) {
    console.warn('OpenAI client initialization failed:', error)
    return null
  }
}

export function getOpenAI(): OpenAI | null {
  return initializeOpenAI()
}

export function isOpenAIAvailable(): boolean {
  return getOpenAI() !== null
}

export function getOpenAIUnavailableError(): Error {
  return new Error(`OpenAI API key is required for vendor parsing. The API key seems to be configured but not accessible. 

This might be a configuration issue. Please try:
1. Refresh the page
2. Check that the OPENAI_API_KEY is properly set in your Supabase project secrets
3. Ensure the secret is named exactly "OPENAI_API_KEY"

If the issue persists, you can only upload files that contain plain text that doesn't require AI processing.`)
}

// Export the lazy-initialized client
export { openai }
