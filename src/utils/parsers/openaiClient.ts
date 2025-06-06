
import OpenAI from 'openai'

// Initialize OpenAI client only if API key is available
let openai: OpenAI | null = null

const initializeOpenAI = () => {
  if (openai) return openai

  try {
    // Try multiple ways to get the API key from Supabase secrets
    const apiKey = import.meta.env.VITE_OPENAI_API_KEY || 
                   import.meta.env.OPENAI_API_KEY ||
                   // Check if Supabase secrets are available in the global scope
                   (globalThis as any).__SUPABASE_SECRETS__?.OPENAI_API_KEY ||
                   // Check window object for secrets
                   (typeof window !== 'undefined' && (window as any).__SUPABASE_SECRETS__?.OPENAI_API_KEY)
    
    console.log('Attempting to initialize OpenAI client...');
    console.log('API key available:', !!apiKey);
    
    if (apiKey) {
      openai = new OpenAI({
        apiKey,
        dangerouslyAllowBrowser: true
      })
      console.log('OpenAI client initialized successfully')
      return openai
    } else {
      console.warn('No OpenAI API key found in environment variables or Supabase secrets')
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
  const client = getOpenAI()
  const available = client !== null
  console.log('OpenAI client availability check:', available)
  return available
}

export function getOpenAIUnavailableError(): Error {
  return new Error(`OpenAI API key is required for vendor parsing. 

Please ensure you have:
1. Added the OPENAI_API_KEY in your Supabase project secrets
2. The secret is named exactly "OPENAI_API_KEY"
3. Refreshed the page after adding the secret

If the issue persists, the secret may need a moment to propagate. Try refreshing the page again.`)
}

// Export the lazy-initialized client
export { openai }
