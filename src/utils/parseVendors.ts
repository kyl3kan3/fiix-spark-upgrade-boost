
import pdf from 'pdf-parse'
import mammoth from 'mammoth'
import Tesseract from 'tesseract.js'
import { getDocument, GlobalWorkerOptions } from 'pdfjs-dist'
import pdfjsWorker from 'pdfjs-dist/build/pdf.worker.entry'
import OpenAI from 'openai'

GlobalWorkerOptions.workerSrc = pdfjsWorker

const openai = new OpenAI({
  apiKey: import.meta.env.VITE_OPENAI_API_KEY,
  dangerouslyAllowBrowser: true
})

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

export async function parseVendorsFromFile(file: File) {
  const isPDF = file.name.endsWith('.pdf')
  const isDOCX = file.name.endsWith('.docx')

  let vendorTexts: string[] = []

  if (isDOCX) {
    const buffer = await file.arrayBuffer()
    const result = await mammoth.extractRawText({ arrayBuffer: buffer })
    vendorTexts = result.value.split('\n\n').map(b => b.trim()).filter(Boolean)
  }

  if (isPDF) {
    const buffer = await file.arrayBuffer()
    const blob = new Blob([buffer], { type: 'application/pdf' })
    
    try {
      // Try text extraction first
      const parsed = await pdf(await blob.arrayBuffer())
      if (parsed.text && parsed.text.trim().length > 100) {
        vendorTexts = parsed.text.split('\n\n').map(b => b.trim()).filter(Boolean)
      } else {
        // Fallback to Vision for scanned PDFs
        const imgPages = await renderPdfPagesToImages(file)
        
        for (const dataUrl of imgPages) {
          const response = await openai.chat.completions.create({
            model: 'gpt-4-vision-preview',
            messages: [
              {
                role: 'user',
                content: [
                  { type: 'text', text: 'Extract vendor name, address, phone, email, notes as JSON.' },
                  { type: 'image_url', image_url: { url: dataUrl } }
                ]
              }
            ],
            temperature: 0.2,
          })
          vendorTexts.push(response.choices[0].message.content || '')
        }
      }
    } catch {
      // Final fallback to Tesseract OCR
      const ocr = await Tesseract.recognize(blob, 'eng')
      vendorTexts = ocr.data.text.split('\n\n').map(b => b.trim()).filter(Boolean)
    }
  }

  // Process text into rough vendor structure
  const roughVendors = vendorTexts.map((text) => {
    const lines = text.split('\n').map(l => l.trim()).filter(Boolean)
    const vendor: any = {
      name: lines[0] || '',
      address: null,
      phone: [],
      email: [],
      notes: [],
      error_flag: false
    }
    
    for (const line of lines.slice(1)) {
      const clean = line.trim()
      if (/\d{3}[-.\s]?\d{3}[-.\s]?\d{4}/.test(clean)) {
        vendor.phone.push(clean)
      } else if (/@/.test(clean)) {
        vendor.email.push(clean)
      } else if (!vendor.address && /\d+/.test(clean)) {
        vendor.address = clean
      } else {
        vendor.notes.push(clean)
      }
    }
    
    // Set error flag if missing critical data
    if (!vendor.name || vendor.name.length < 2) {
      vendor.error_flag = true
    }
    
    return vendor
  }).filter(v => v.name) // Remove empty entries

  // AI Cleanup Step with GPT-4
  const prompt = `Clean and standardize this list of vendor entries. Ensure each object has: name, address, phone[], email[], notes[], error_flag (boolean). Return JSON array only:\n\n${JSON.stringify(roughVendors, null, 2)}`
  
  try {
    const response = await openai.chat.completions.create({
      model: 'gpt-4',
      messages: [{ role: 'user', content: prompt }],
      temperature: 0.2
    })
    const raw = response.choices[0].message.content || ''
    const jsonStart = raw.indexOf('[')
    const cleaned = JSON.parse(raw.slice(jsonStart))
    return cleaned
  } catch (err) {
    console.error('AI cleanup failed:', err)
    return roughVendors
  }
}
