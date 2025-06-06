
import mammoth from 'mammoth'
import { openai, isOpenAIAvailable, getOpenAIUnavailableError } from './parsers/openaiClient'
import { groupVendorBlocks } from './groupVendorBlocks'

export async function parseVendorsFromFile(file: File) {
  let text = ''
  if (file.name.endsWith('.docx')) {
    const buffer = await file.arrayBuffer()
    const result = await mammoth.extractRawText({ arrayBuffer: buffer })
    text = result.value
  } else {
    throw new Error('Only .docx files supported in this function')
  }

  // Check if OpenAI is available before proceeding
  if (!isOpenAIAvailable()) {
    throw getOpenAIUnavailableError()
  }

  const blocks = groupVendorBlocks(text)

  // --- AI pass: parse each block to the right schema
  const parsedVendors = []
  for (const block of blocks) {
    const prompt = `
You will receive a vendor block with one company per block. Each block may contain:
- Company name (may need to infer from context or file name if not explicitly listed)
- Address (may be split across lines)
- Phone number(s)
- List of parts ordered (each as a line, or comma-separated)

Extract as JSON:

{
  "company": "",
  "address": "",
  "phone_number": "",
  "parts_ordered": []
}

• For company name, infer from block or use the most likely name from previous blocks if missing.
• Address should combine street + city/state/ZIP.
• Collect all part/product lines into parts_ordered (normalize to Title Case, remove duplicates).
• Return only the JSON, no extra text.

Block:
${block}
    `
    try {
      const response = await openai!.chat.completions.create({
        model: 'gpt-4',
        messages: [{ role: 'user', content: prompt }],
        temperature: 0.1,
      })
      const text = response.choices[0].message.content ?? '{}'
      // Safely extract JSON
      const jsonStart = text.indexOf('{')
      const vendor = JSON.parse(text.slice(jsonStart))
      parsedVendors.push(vendor)
    } catch (e) {
      console.error('AI parsing error:', e)
    }
  }
  return parsedVendors
}
