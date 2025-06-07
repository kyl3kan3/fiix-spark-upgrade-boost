
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

export async function parsePDF(file: File): Promise<any[]> {
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
  
  // Very basic split: adjust this for your format!
  return text
    .split('\n')
    .map(line => line.trim())
    .filter(Boolean)
    .map((line) => ({ name: line }));
}
