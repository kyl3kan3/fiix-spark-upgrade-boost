
import { getDocument, GlobalWorkerOptions } from 'pdfjs-dist'
import Tesseract from 'tesseract.js'
import { openai } from './openaiClient'

// Set the worker source to use the CDN version
GlobalWorkerOptions.workerSrc = 'https://cdnjs.cloudflare.com/ajax/libs/pdf.js/3.11.174/pdf.worker.min.js'

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

export async function extractTextFromPDF(file: File): Promise<string> {
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

export async function processPDFWithFallbacks(file: File): Promise<string> {
  try {
    // Try text extraction first using pdfjs-dist
    let fullText = await extractTextFromPDF(file)
    
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
    
    return fullText
  } catch (error) {
    console.error('PDF processing error:', error)
    // Final fallback to Tesseract OCR
    const ocr = await Tesseract.recognize(file, 'eng')
    return ocr.data.text
  }
}
