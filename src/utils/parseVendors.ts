
import mammoth from 'mammoth'
import { isOpenAIAvailable, getOpenAIUnavailableError } from './parsers/openaiClient'
import { processPDFWithFallbacks, renderPdfPagesToImages } from './parsers/pdfProcessor'
import { groupVendorBlocksFromText } from './parsers/textProcessor'
import { processVendorBlocks, VendorData } from './parsers/vendorAIProcessor'

export { renderPdfPagesToImages }

export async function parseVendorsFromFile(file: File): Promise<VendorData[]> {
  const isPDF = file.name.endsWith('.pdf')
  const isDOCX = file.name.endsWith('.docx')

  let fullText = ''

  if (isDOCX) {
    const buffer = await file.arrayBuffer()
    const result = await mammoth.extractRawText({ arrayBuffer: buffer })
    fullText = result.value
  }

  if (isPDF) {
    fullText = await processPDFWithFallbacks(file)
  }

  // Check if OpenAI is available for AI processing
  if (!isOpenAIAvailable()) {
    throw getOpenAIUnavailableError()
  }

  // Group the text into vendor blocks (2+ blank lines = separator)
  const vendorBlocks = groupVendorBlocksFromText(fullText)
  console.log('Found vendor blocks:', vendorBlocks.length)

  // Process each block with AI to extract structured data
  const vendors = await processVendorBlocks(vendorBlocks)
  
  return vendors
}
