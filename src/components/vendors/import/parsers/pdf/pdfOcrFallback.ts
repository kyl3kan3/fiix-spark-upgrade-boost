
import Tesseract from 'tesseract.js';
import { callGptVision } from '../../services/gptVisionService';
import { renderPdfToImage } from './pdfTextExtractor';
import { analyzeAndCategorizeText } from '../../services/textAnalysisService';
import { hasVendorName } from '../../services/vendorImportData';

function hasUsableText(text: string): boolean {
 return text.replace(/\s/g, '').length >= 20 || hasVendorName({ name: analyzeAndCategorizeText(text).companyName });
}

export async function handleOcrFallback(file: File, text: string, instructions?: string, pageNumber = 1, renderPage?: (pageNumber: number) => Promise<string>): Promise<{ text: string; isGptResult: boolean }> {
 // If text extraction fails, fallback to OCR
 if (!hasUsableText(text)) {
 const imgData = await (renderPage ? renderPage(pageNumber) : renderPdfToImage(file, pageNumber));
 
 // Try Tesseract OCR first
 const ocr = await Tesseract.recognize(imgData, 'eng');
 let textFromOcr = ocr.data.text || '';
 
 // If Tesseract fails, try GPT-4 Vision
 if (!hasUsableText(textFromOcr)) {
 const base64Image = imgData.replace(/^data:image\/png;base64,/, '');
 const gptResult = await callGptVision(base64Image, instructions);
 
 if (Array.isArray(gptResult)) {
 return { text: JSON.stringify(gptResult), isGptResult: true };
 }
 
 textFromOcr = typeof gptResult === 'string' ? gptResult : JSON.stringify(gptResult);
 }
 
 return { text: textFromOcr, isGptResult: false };
 }
 
 return { text, isGptResult: false };
}
