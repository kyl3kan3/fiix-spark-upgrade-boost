import mammoth from 'mammoth'
import Tesseract from 'tesseract.js'
import { getDocument, GlobalWorkerOptions } from 'pdfjs-dist'
import OpenAI from 'openai'
import { groupVendorBlocks } from './groupVendorBlocks'

// Set the worker source to use the CDN version
GlobalWorkerOptions.workerSrc = 'https://cdnjs.cloudflare.com/ajax/libs/pdf.js/3.11.174/pdf.worker.min.js'

// Initialize OpenAI client only if API key is available
let openai: OpenAI | null = null
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
  } else {
    console.warn('No OpenAI API key found in environment variables')
  }
} catch (error) {
  console.warn('OpenAI client initialization failed:', error)
}

function groupVendorBlocksFromText(text: string): string[] {
  const lines = text.split('\n')
  const blocks: string[] = []
  let currentBlock: string[] = []
  let blankLineCount = 0

  for (const line of lines) {
    const trimmedLine = line.trim()
    
    if (!trimmedLine) {
      blankLineCount++
      // If we hit 2+ blank lines and have content, finalize the block
      if (blankLineCount >= 2 && currentBlock.length > 0) {
        blocks.push(currentBlock.join('\n'))
        currentBlock = []
      }
    } else {
      blankLineCount = 0
      currentBlock.push(trimmedLine)
    }
  }

  // Don't forget the last block
  if (currentBlock.length > 0) {
    blocks.push(currentBlock.join('\n'))
  }

  return blocks.filter(block => block.trim().length > 10) // Filter out tiny blocks
}

export async function renderPdfPagesToImages(file: File): Promise<string[]> {
  const buffer = await file.arrayBuffer()
  const loadingTask = getDocument({ data: buffer })
  const pdf = await loadingTask.promise
  const pageCount = pdf.numPages

  const imageUrls: string[] = []

  for (let i = 1; i <= pageCount; i++) {
    const page = await pdf.getPage(i)

    const viewport = page.getViewport({ scale: 2 })
    const canvas = document.createElement('canvas')
    const context = canvas.getContext('2d')!
    canvas.width = viewport.width
    canvas.height = viewport.height

    await page.render({ canvasContext: context, viewport }).promise

    const dataUrl = canvas.toDataURL('image/png')
    imageUrls.push(dataUrl)
  }

  return imageUrls
}

async function extractTextFromPDF(file: File): Promise<string> {
  const buffer = await file.arrayBuffer()
  const loadingTask = getDocument({ data: buffer })
  const pdf = await loadingTask.promise
  const pageCount = pdf.numPages

  let fullText = ''

  for (let i = 1; i <= pageCount; i++) {
    const page = await pdf.getPage(i)
    const textContent = await page.getTextContent()
    const pageText = textContent.items
      .map((item: any) => item.str)
      .join(' ')
    fullText += pageText + '\n'
  }

  return fullText
}

export async function parseVendorsFromFile(file: File) {
  const isPDF = file.name.endsWith('.pdf')
  const isDOCX = file.name.endsWith('.docx')

  let fullText = ''

  if (isDOCX) {
    const buffer = await file.arrayBuffer()
    const result = await mammoth.extractRawText({ arrayBuffer: buffer })
    fullText = result.value
  }

  if (isPDF) {
    try {
      // Try text extraction first using pdfjs-dist
      fullText = await extractTextFromPDF(file)
      
      if (!fullText || fullText.trim().length < 100) {
        // Check if OpenAI is available for Vision fallback
        if (!openai) {
          throw new Error('OpenAI API key not configured. Cannot process scanned PDFs.')
        }
        
        // Fallback to Vision for scanned PDFs
        const imgPages = await renderPdfPagesToImages(file)
        
        const visionTexts = []
        for (const dataUrl of imgPages) {
          const response = await openai.chat.completions.create({
            model: 'gpt-4-vision-preview',
            messages: [
              {
                role: 'user',
                content: [
                  { type: 'text', text: 'Extract all text from this image, preserving line breaks and spacing. Return only the text content.' },
                  { type: 'image_url', image_url: { url: dataUrl } }
                ]
              }
            ],
            temperature: 0.1,
          })
          visionTexts.push(response.choices[0].message.content || '')
        }
        fullText = visionTexts.join('\n\n')
      }
    } catch (error) {
      console.error('PDF processing error:', error)
      // Final fallback to Tesseract OCR
      const ocr = await Tesseract.recognize(file, 'eng')
      fullText = ocr.data.text
    }
  }

  // Check if OpenAI is available for AI processing
  if (!openai) {
    throw new Error(`OpenAI API key is required for vendor parsing. The API key seems to be configured but not accessible. 

This might be a configuration issue. Please try:
1. Refresh the page
2. Check that the OPENAI_API_KEY is properly set in your Supabase project secrets
3. Ensure the secret is named exactly "OPENAI_API_KEY"

If the issue persists, you can only upload files that contain plain text that doesn't require AI processing.`)
  }

  // Group the text into vendor blocks (2+ blank lines = separator)
  const vendorBlocks = groupVendorBlocksFromText(fullText)
  console.log('Found vendor blocks:', vendorBlocks.length)

  // Process each block with AI to extract structured data
  const vendors = []
  
  for (const block of vendorBlocks) {
    try {
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
        
        vendors.push(vendor)
      }
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
