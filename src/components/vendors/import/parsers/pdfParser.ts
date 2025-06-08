
import { getDocument, GlobalWorkerOptions } from 'pdfjs-dist';
import Tesseract from 'tesseract.js';
import { callGptVision } from '../services/gptVisionService';

// Set up PDF.js worker with a fixed URL to avoid top-level await
GlobalWorkerOptions.workerSrc = '//unpkg.com/pdfjs-dist@4.4.168/build/pdf.worker.min.js';

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
    // If expecting 1 vendor
    if (expectedCount === 1) {
      return [{ name: lines.join(' ') }];
    }
    
    // For multiple expected vendors, try to split intelligently
    if (expectedCount > 1) {
      // Try paragraphs first if count is reasonable
      if (Math.abs(paragraphs.length - expectedCount) <= Math.max(1, expectedCount * 0.3)) {
        return paragraphs
          .map(paragraph => paragraph.replace(/\n/g, ' ').trim())
          .filter(paragraph => paragraph.length > 3)
          .map(paragraph => ({ name: paragraph }));
      }
      
      // Try lines if they match better
      if (Math.abs(lines.length - expectedCount) <= Math.max(1, expectedCount * 0.3)) {
        return lines.map(line => ({ name: line }));
      }
      
      // If we have way more lines than expected, try to group them
      if (lines.length > expectedCount * 2) {
        const groupSize = Math.ceil(lines.length / expectedCount);
        const groups = [];
        for (let i = 0; i < lines.length; i += groupSize) {
          const group = lines.slice(i, i + groupSize).join(' ');
          if (group.trim()) {
            groups.push({ name: group.trim() });
          }
        }
        return groups;
      }
      
      // If we have fewer items than expected, try different splitting
      if (paragraphs.length < expectedCount && lines.length >= expectedCount) {
        return lines.slice(0, expectedCount).map(line => ({ name: line }));
      }
      
      // Try splitting by common separators
      if (paragraphs.length < expectedCount) {
        const allSplits = [];
        for (const paragraph of paragraphs) {
          // Try splitting by common patterns
          const splits = paragraph.split(/[;,]\s+|(\d+\.)\s+|(-)\s+/).filter(s => s && s.trim().length > 3);
          if (splits.length > 1) {
            allSplits.push(...splits.map(s => s.trim()));
          } else {
            allSplits.push(paragraph.trim());
          }
        }
        
        if (Math.abs(allSplits.length - expectedCount) <= Math.max(1, expectedCount * 0.5)) {
          return allSplits.map(split => ({ name: split }));
        }
      }
    }
  }
  
  // Fallback to original logic
  return lines.map((line) => ({ name: line }));
}
