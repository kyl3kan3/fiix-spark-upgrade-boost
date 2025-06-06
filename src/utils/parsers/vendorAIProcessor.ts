
import { openai } from './openaiClient'

export interface VendorData {
  name: string
  address: string
  phone: string
  email: string
  contact_person: string
  description: string
  error_flag: boolean
}

export async function processVendorBlock(block: string): Promise<VendorData> {
  if (!openai) {
    throw new Error('OpenAI client not available')
  }

  const prompt = `You will receive a vendor block with one company per block. Each block may contain:
- Company name (may need to infer from context if not explicitly listed)
- Address (may be split across lines)
- Phone number(s)
- Email address(es)
- Contact person name
- List of parts/services (each as a line, or comma-separated)

Extract as JSON:

{
  "name": "",
  "address": "",
  "phone": "",
  "email": "",
  "contact_person": "",
  "description": ""
}

• For company name, use the most prominent business name in the block
• Address should combine street + city/state/ZIP into one field
• Phone should be the primary phone number
• Email should be the primary email address
• Contact person should be any person's name mentioned
• Description should include parts/services offered
• Return only the JSON, no extra text

Block:
${block}`

  const response = await openai.chat.completions.create({
    model: 'gpt-4',
    messages: [{ role: 'user', content: prompt }],
    temperature: 0.1
  })

  const content = response.choices[0].message.content || ''
  const jsonStart = content.indexOf('{')
  const jsonEnd = content.lastIndexOf('}') + 1
  
  if (jsonStart >= 0 && jsonEnd > jsonStart) {
    const jsonStr = content.slice(jsonStart, jsonEnd)
    const vendor = JSON.parse(jsonStr)
    
    // Add error flag if missing critical data
    vendor.error_flag = !vendor.name || vendor.name.length < 2
    
    return vendor
  }
  
  throw new Error('Failed to parse vendor data from AI response')
}

export async function processVendorBlocks(blocks: string[]): Promise<VendorData[]> {
  const vendors: VendorData[] = []
  
  for (const block of blocks) {
    try {
      const vendor = await processVendorBlock(block)
      vendors.push(vendor)
    } catch (err) {
      console.error('Failed to parse vendor block:', err)
      // Create a basic vendor entry for failed blocks
      vendors.push({
        name: 'Parse Error',
        address: '',
        phone: '',
        email: '',
        contact_person: '',
        description: block.substring(0, 100) + '...',
        error_flag: true
      })
    }
  }

  return vendors.filter(v => v.name && v.name !== 'Parse Error') // Remove failed entries
}
