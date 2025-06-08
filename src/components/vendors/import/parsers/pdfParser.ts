import { getDocument, GlobalWorkerOptions } from 'pdfjs-dist';
import Tesseract from 'tesseract.js';
import { callGptVision } from '../services/gptVisionService';
import { analyzeAndCategorizeText, EntityClassification } from '../services/textAnalysisService';

// Set up PDF.js worker with a fixed URL to avoid top-level await
GlobalWorkerOptions.workerSrc = '//unpkg.com/pdfjs-dist@4.4.168/build/pdf.worker.min.js';

// Convert EntityClassification to vendor format
function entityToVendor(entity: EntityClassification): any {
  const vendor: any = {
    name: entity.companyName || 'Unnamed Vendor',
    email: entity.email,
    phone: entity.phone,
    website: entity.website,
    address: entity.address,
    city: entity.city,
    state: entity.state,
    zip_code: entity.zipCode,
    contact_person: entity.contactPerson,
    vendor_type: 'service',
    status: 'active',
    raw_text: entity.rawText
  };
  
  // Combine products, services, and notes into a description
  const descriptionParts = [];
  if (entity.products && entity.products.length > 0) {
    descriptionParts.push(`Products: ${entity.products.join(', ')}`);
  }
  if (entity.services && entity.services.length > 0) {
    descriptionParts.push(`Services: ${entity.services.join(', ')}`);
  }
  if (entity.notes) {
    descriptionParts.push(`Notes: ${entity.notes}`);
  }
  
  if (descriptionParts.length > 0) {
    vendor.description = descriptionParts.join(' | ');
  }
  
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
    const entity = analyzeAndCategorizeText(text);
    return [entityToVendor(entity)];
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
  
  // Filter out very short sections and analyze each one
  const vendors = sections
    .filter(section => section.trim().length > 5)
    .map(section => {
      const entity = analyzeAndCategorizeText(section);
      return entityToVendor(entity);
    });
  
  return vendors.length > 0 ? vendors : [entityToVendor(analyzeAndCategorizeText(text))];
}
