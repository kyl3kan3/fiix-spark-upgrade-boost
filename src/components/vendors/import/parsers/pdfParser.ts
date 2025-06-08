import { getDocument, GlobalWorkerOptions } from 'pdfjs-dist';
import Tesseract from 'tesseract.js';
import { callGptVision } from '../services/gptVisionService';

// Set up PDF.js worker with a fixed URL to avoid top-level await
GlobalWorkerOptions.workerSrc = '//unpkg.com/pdfjs-dist@4.4.168/build/pdf.worker.min.js';

// Helper function to extract structured information from text
function extractVendorInfo(text: string): any {
  const vendor: any = { name: '' };
  
  // Email extraction
  const emailMatch = text.match(/\b[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Z|a-z]{2,}\b/);
  if (emailMatch) {
    vendor.email = emailMatch[0];
    text = text.replace(emailMatch[0], '').trim();
  }
  
  // Phone number extraction (various formats)
  const phoneMatch = text.match(/(?:\+?1[-.\s]?)?\(?([0-9]{3})\)?[-.\s]?([0-9]{3})[-.\s]?([0-9]{4})|(\d{10})/);
  if (phoneMatch) {
    vendor.phone = phoneMatch[0];
    text = text.replace(phoneMatch[0], '').trim();
  }
  
  // Website extraction
  const websiteMatch = text.match(/(?:https?:\/\/)?(?:www\.)?[a-zA-Z0-9-]+\.[a-zA-Z]{2,}(?:\/[^\s]*)?/);
  if (websiteMatch && !websiteMatch[0].includes('@')) {
    vendor.website = websiteMatch[0].startsWith('http') ? websiteMatch[0] : `https://${websiteMatch[0]}`;
    text = text.replace(websiteMatch[0], '').trim();
  }
  
  // Address extraction (basic pattern - street address with numbers)
  const addressMatch = text.match(/\d+\s+[A-Za-z0-9\s,.-]+(?:Street|St|Avenue|Ave|Road|Rd|Boulevard|Blvd|Drive|Dr|Lane|Ln|Way|Court|Ct|Place|Pl)/i);
  if (addressMatch) {
    vendor.address = addressMatch[0];
    text = text.replace(addressMatch[0], '').trim();
  }
  
  // State extraction (2-letter state codes)
  const stateMatch = text.match(/\b[A-Z]{2}\b(?:\s+\d{5}(?:-\d{4})?)?/);
  if (stateMatch) {
    const parts = stateMatch[0].split(/\s+/);
    vendor.state = parts[0];
    if (parts[1] && /^\d{5}(-\d{4})?$/.test(parts[1])) {
      vendor.zip_code = parts[1];
    }
    text = text.replace(stateMatch[0], '').trim();
  }
  
  // ZIP code extraction (if not already found with state)
  if (!vendor.zip_code) {
    const zipMatch = text.match(/\b\d{5}(?:-\d{4})?\b/);
    if (zipMatch) {
      vendor.zip_code = zipMatch[0];
      text = text.replace(zipMatch[0], '').trim();
    }
  }
  
  // City extraction (capitalize each word, common city pattern)
  const cityMatch = text.match(/\b[A-Z][a-z]+(?:\s+[A-Z][a-z]+)*\b/);
  if (cityMatch && !vendor.state) {
    vendor.city = cityMatch[0];
    text = text.replace(cityMatch[0], '').trim();
  }
  
  // Contact person extraction (look for "Contact:" or name patterns)
  const contactMatch = text.match(/(?:Contact|Attn|Attention):\s*([A-Z][a-z]+\s+[A-Z][a-z]+)/i) || 
                      text.match(/\b[A-Z][a-z]+\s+[A-Z][a-z]+\b/);
  if (contactMatch) {
    vendor.contact_person = contactMatch[1] || contactMatch[0];
    text = text.replace(contactMatch[0], '').trim();
  }
  
  // Clean up remaining text for company name
  vendor.name = text.replace(/[,;:\n\r]+/g, ' ').replace(/\s+/g, ' ').trim() || 'Unnamed Vendor';
  
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
  
  for (let i = 1; i <= pdf.numPages; i++) {
    const page = await pdf.getPage(i);
    const content = await page.getTextContent();
    text += content.items.map((item: any) => item.str).join(' ') + '\n';
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
  
  // Split into lines and paragraphs
  const lines = text
    .split('\n')
    .map(line => line.trim())
    .filter(Boolean);
    
  const paragraphs = text.split(/\n\s*\n/).filter(p => p.trim().length > 0);
  
  // Use expected count to guide parsing
  if (expectedCount) {
    // If expecting 1 vendor, extract info from entire document
    if (expectedCount === 1) {
      return [extractVendorInfo(lines.join(' '))];
    }
    
    // For multiple expected vendors, try to split intelligently
    if (expectedCount > 1) {
      let candidates = [];
      
      // Try paragraphs first if count is reasonable
      if (Math.abs(paragraphs.length - expectedCount) <= Math.max(1, expectedCount * 0.3)) {
        candidates = paragraphs;
      }
      // Try lines if they match better
      else if (Math.abs(lines.length - expectedCount) <= Math.max(1, expectedCount * 0.3)) {
        candidates = lines;
      }
      // If we have way more content than expected, try to group
      else if (lines.length > expectedCount * 2) {
        const groupSize = Math.ceil(lines.length / expectedCount);
        for (let i = 0; i < lines.length; i += groupSize) {
          const group = lines.slice(i, i + groupSize).join(' ');
          if (group.trim()) {
            candidates.push(group.trim());
          }
        }
      }
      // Try splitting by common separators
      else {
        for (const paragraph of paragraphs) {
          const splits = paragraph.split(/[;,]\s+|(\d+\.)\s+|(-)\s+/).filter(s => s && s.trim().length > 3);
          if (splits.length > 1) {
            candidates.push(...splits.map(s => s.trim()));
          } else {
            candidates.push(paragraph.trim());
          }
        }
      }
      
      // Force split to match expected count if we're close
      if (candidates.length !== expectedCount && candidates.length > 0) {
        if (candidates.length < expectedCount) {
          // Try to split largest items
          const sorted = candidates.sort((a, b) => b.length - a.length);
          while (candidates.length < expectedCount && sorted[0] && sorted[0].length > 50) {
            const largest = sorted.shift();
            const parts = largest.split(/[,;]\s+|\s+and\s+|\s+&\s+/i);
            if (parts.length > 1) {
              candidates = candidates.filter(c => c !== largest);
              candidates.push(...parts);
              sorted.splice(0, 0, ...parts.sort((a, b) => b.length - a.length));
            } else {
              break;
            }
          }
        } else if (candidates.length > expectedCount) {
          // Keep the longest/most substantial entries
          candidates = candidates
            .sort((a, b) => b.length - a.length)
            .slice(0, expectedCount);
        }
      }
      
      if (candidates.length > 0) {
        return candidates.map(candidate => extractVendorInfo(candidate));
      }
    }
  }
  
  // Fallback to original logic with info extraction
  return lines.map((line) => extractVendorInfo(line));
}
