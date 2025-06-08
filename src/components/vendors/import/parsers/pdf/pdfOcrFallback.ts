
import Tesseract from 'tesseract.js';
import { callGptVision } from '../../services/gptVisionService';
import { renderPdfToImage } from './pdfTextExtractor';

export async function handleOcrFallback(file: File, text: string): Promise<{ text: string; isGptResult: boolean }> {
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
        return { text: JSON.stringify(gptResult), isGptResult: true };
      }
      
      textFromOcr = typeof gptResult === 'string' ? gptResult : JSON.stringify(gptResult);
    }
    
    return { text: textFromOcr, isGptResult: false };
  }
  
  return { text, isGptResult: false };
}
