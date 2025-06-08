import { getDocument, GlobalWorkerOptions } from 'pdfjs-dist';
import Tesseract from 'tesseract.js';
import { callGptVision } from '../services/gptVisionService';

// Set up PDF.js worker with a fixed URL to avoid top-level await
GlobalWorkerOptions.workerSrc = '//unpkg.com/pdfjs-dist@4.4.168/build/pdf.worker.min.js';

// Helper function to extract structured information from text while preserving order
function extractVendorInfo(text: string): any {
  const vendor: any = { name: '', raw_text: text };
  let workingText = text;
  
  // Extract information in order of appearance, preserving context
  const extractedInfo: string[] = [];
  
  // Email extraction
  const emailMatch = workingText.match(/\b[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Z|a-z]{2,}\b/);
  if (emailMatch) {
    vendor.email = emailMatch[0];
    extractedInfo.push(emailMatch[0]);
    workingText = workingText.replace(emailMatch[0], '').trim();
  }
  
  // Phone number extraction (various formats)
  const phoneMatch = workingText.match(/(?:\+?1[-.\s]?)?\(?([0-9]{3})\)?[-.\s]?([0-9]{3})[-.\s]?([0-9]{4})|(\d{10})/);
  if (phoneMatch) {
    vendor.phone = phoneMatch[0];
    extractedInfo.push(phoneMatch[0]);
    workingText = workingText.replace(phoneMatch[0], '').trim();
  }
  
  // Website extraction
  const websiteMatch = workingText.match(/(?:https?:\/\/)?(?:www\.)?[a-zA-Z0-9-]+\.[a-zA-Z]{2,}(?:\/[^\s]*)?/);
  if (websiteMatch && !websiteMatch[0].includes('@')) {
    vendor.website = websiteMatch[0].startsWith('http') ? websiteMatch[0] : `https://${websiteMatch[0]}`;
    extractedInfo.push(websiteMatch[0]);
    workingText = workingText.replace(websiteMatch[0], '').trim();
  }
  
  // Address extraction (more comprehensive pattern)
  const addressMatch = workingText.match(/\d+\s+[A-Za-z0-9\s,.-]+(?:Street|St|Avenue|Ave|Road|Rd|Boulevard|Blvd|Drive|Dr|Lane|Ln|Way|Court|Ct|Place|Pl|Circle|Cir|Parkway|Pkwy)\b/i);
  if (addressMatch) {
    vendor.address = addressMatch[0].trim();
    extractedInfo.push(addressMatch[0]);
    workingText = workingText.replace(addressMatch[0], '').trim();
  }
  
  // State and ZIP extraction (keep together)
  const stateZipMatch = workingText.match(/\b[A-Z]{2}\s+\d{5}(?:-\d{4})?\b/);
  if (stateZipMatch) {
    const parts = stateZipMatch[0].split(/\s+/);
    vendor.state = parts[0];
    vendor.zip_code = parts[1];
    extractedInfo.push(stateZipMatch[0]);
    workingText = workingText.replace(stateZipMatch[0], '').trim();
  } else {
    // Try separate state extraction
    const stateMatch = workingText.match(/\b[A-Z]{2}\b/);
    if (stateMatch) {
      vendor.state = stateMatch[0];
      extractedInfo.push(stateMatch[0]);
      workingText = workingText.replace(stateMatch[0], '').trim();
    }
    
    // Try separate ZIP extraction
    const zipMatch = workingText.match(/\b\d{5}(?:-\d{4})?\b/);
    if (zipMatch) {
      vendor.zip_code = zipMatch[0];
      extractedInfo.push(zipMatch[0]);
      workingText = workingText.replace(zipMatch[0], '').trim();
    }
  }
  
  // City extraction (look for capitalized words before state)
  const cityMatch = workingText.match(/\b[A-Z][a-z]+(?:\s+[A-Z][a-z]+)*\b/);
  if (cityMatch && cityMatch[0].length > 2) {
    vendor.city = cityMatch[0];
    extractedInfo.push(cityMatch[0]);
    workingText = workingText.replace(cityMatch[0], '').trim();
  }
  
  // Contact person extraction
  const contactMatch = workingText.match(/(?:Contact|Attn|Attention):\s*([A-Z][a-z]+\s+[A-Z][a-z]+)/i) || 
                      workingText.match(/\b[A-Z][a-z]+\s+[A-Z][a-z]+\b/);
  if (contactMatch) {
    vendor.contact_person = contactMatch[1] || contactMatch[0];
    extractedInfo.push(vendor.contact_person);
    workingText = workingText.replace(contactMatch[0], '').trim();
  }
  
  // Clean up remaining text for company name (remove common separators and line breaks)
  const cleanName = workingText
    .replace(/[,;:\n\r\t]+/g, ' ')
    .replace(/\s+/g, ' ')
    .replace(/^\W+|\W+$/g, '')
    .trim();
  
  vendor.name = cleanName || 'Unnamed Vendor';
  
  // Set defaults
  vendor.vendor_type = 'service';
  vendor.status = 'active';
  
  return vendor;
}

async function renderPdfToImage(file: File): Promise<string> {
  const buffer = await file.arrayBuffer();
  const loadingTask = getDocument({ data: buffer });
  const pdf = await loadingTask.promise;
  const page = await pdf.getPage(1);
  const viewport = page.getViewport({ scale: 2 });
  const canvas = document.createElement('canvas');
  const context = canvas.getContext('2d')!;
  canvas.width = viewport.width;
  canvas.height = viewport.height;
  await page.render({ canvasContext: context, viewport }).promise;
  return canvas.toDataURL('image/png');
}

export async function parsePDF(file: File, expectedCount?: number): Promise<any[]> {
  const buffer = await file.arrayBuffer();
  const loadingTask = getDocument({ data: buffer });
  const pdf = await loadingTask.promise;
  let text = '';
  
  // Extract text from all pages, maintaining page structure
  const pageTexts: string[] = [];
  for (let i = 1; i <= pdf.numPages; i++) {
    const page = await pdf.getPage(i);
    const content = await page.getTextContent();
    const pageText = content.items.map((item: any) => item.str).join(' ');
    pageTexts.push(pageText);
    text += pageText + '\n\n';
  }
  
  // If text extraction fails, fallback to OCR
  if (text.replace(/\s/g, '').length < 20) {
    const imgData = await renderPdfToImage(file);
    // Try Tesseract OCR first
    const ocr = await Tesseract.recognize(imgData, 'eng');
    let textFromOcr = ocr.data.text || '';
    
    // If Tesseract fails, try GPT-4 Vision
    if (textFromOcr.replace(/\s/g, '').length < 20) {
      const base64Image = imgData.replace(/^data:image\/png;base64,/, '');
      const gptResult = await callGptVision(base64Image);
      if (Array.isArray(gptResult)) {
        return gptResult;
      }
      textFromOcr = typeof gptResult === 'string' ? gptResult : JSON.stringify(gptResult);
    }
    text = textFromOcr;
  }
  
  // If expecting 1 vendor, treat entire document as single vendor
  if (expectedCount === 1) {
    return [extractVendorInfo(text)];
  }
  
  // Split by double line breaks first to respect document structure
  let sections = text.split(/\n\s*\n/).filter(s => s.trim().length > 10);
  
  // If no clear sections, try page breaks
  if (sections.length <= 1 && pageTexts.length > 1) {
    sections = pageTexts.filter(pageText => pageText.trim().length > 10);
  }
  
  // If still no clear sections, try single line breaks but keep substantial content together
  if (sections.length <= 1) {
    const lines = text.split('\n').map(line => line.trim()).filter(line => line.length > 0);
    
    // Group consecutive short lines together
    sections = [];
    let currentGroup = '';
    
    for (const line of lines) {
      if (line.length < 100 && currentGroup.length < 300) {
        currentGroup += (currentGroup ? ' ' : '') + line;
      } else {
        if (currentGroup) {
          sections.push(currentGroup);
        }
        currentGroup = line;
      }
    }
    
    if (currentGroup) {
      sections.push(currentGroup);
    }
  }
  
  // If we have an expected count, try to match it
  if (expectedCount && expectedCount > 1) {
    if (sections.length > expectedCount) {
      // Too many sections - combine smallest ones
      while (sections.length > expectedCount && sections.length > 1) {
        // Find two shortest adjacent sections to combine
        let minIndex = 0;
        let minLength = sections[0].length + sections[1].length;
        
        for (let i = 0; i < sections.length - 1; i++) {
          const combinedLength = sections[i].length + sections[i + 1].length;
          if (combinedLength < minLength) {
            minLength = combinedLength;
            minIndex = i;
          }
        }
        
        // Combine the two sections
        sections[minIndex] = sections[minIndex] + ' ' + sections[minIndex + 1];
        sections.splice(minIndex + 1, 1);
      }
    } else if (sections.length < expectedCount) {
      // Too few sections - try to split the largest ones
      while (sections.length < expectedCount) {
        // Find the longest section
        let maxIndex = 0;
        let maxLength = sections[0].length;
        
        for (let i = 1; i < sections.length; i++) {
          if (sections[i].length > maxLength) {
            maxLength = sections[i].length;
            maxIndex = i;
          }
        }
        
        // Try to split the longest section
        const longest = sections[maxIndex];
        const splitPoints = [
          longest.indexOf('. '),
          longest.indexOf('; '),
          longest.indexOf(' - '),
          longest.indexOf('\n')
        ].filter(pos => pos > 20 && pos < longest.length - 20);
        
        if (splitPoints.length > 0) {
          const splitPoint = splitPoints[0];
          const part1 = longest.substring(0, splitPoint + 1).trim();
          const part2 = longest.substring(splitPoint + 1).trim();
          
          sections[maxIndex] = part1;
          sections.splice(maxIndex + 1, 0, part2);
        } else {
          // Can't split further
          break;
        }
      }
    }
  }
  
  // Filter out very short sections and extract vendor info
  const vendors = sections
    .filter(section => section.trim().length > 5)
    .map(section => extractVendorInfo(section));
  
  return vendors.length > 0 ? vendors : [extractVendorInfo(text)];
}
