import { getDocument, GlobalWorkerOptions, type PDFDocumentProxy } from 'pdfjs-dist';
import workerUrl from 'pdfjs-dist/build/pdf.worker.min.mjs?url';

GlobalWorkerOptions.workerSrc = workerUrl;

async function renderPage(pdf: PDFDocumentProxy, pageNumber: number): Promise<string> {
 const page = await pdf.getPage(pageNumber);
 const viewport = page.getViewport({ scale: 2 });
 const canvas = document.createElement('canvas');
 const context = canvas.getContext('2d');
 if (!context) throw new Error('Canvas rendering is unavailable.');
 canvas.width = viewport.width;
 canvas.height = viewport.height;
 await page.render({ canvasContext: context, viewport }).promise;
 return canvas.toDataURL('image/png');
}

export async function extractTextFromPdf(file: File): Promise<{
 text: string; pageTexts: string[];
 renderPage?: (pageNumber: number) => Promise<string>;
 close?: () => Promise<void>;
}> {
 const pdf = await getDocument({ data: await file.arrayBuffer() }).promise;
 try {
   const pageTexts: string[] = [];
   for (let i = 1; i <= pdf.numPages; i++) {
     const page = await pdf.getPage(i);
     const content = await page.getTextContent();
     pageTexts.push(content.items.map(item => 'str' in item ? item.str + (item.hasEOL ? '\n' : ' ') : '').join(''));
   }
   return { text: pageTexts.join('\n\n'), pageTexts,
     renderPage: (pageNumber) => renderPage(pdf, pageNumber), close: () => pdf.destroy() };
 } catch (error) {
   await pdf.destroy();
   throw error;
 }
}

export async function renderPdfToImage(file: File, pageNumber = 1): Promise<string> {
 const pdf = await getDocument({ data: await file.arrayBuffer() }).promise;
 try { return await renderPage(pdf, pageNumber); }
 finally { await pdf.destroy(); }
}
