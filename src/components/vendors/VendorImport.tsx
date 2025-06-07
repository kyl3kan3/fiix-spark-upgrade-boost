
import React, { useState } from 'react';
import Papa from 'papaparse';
import * as XLSX from 'xlsx';
import mammoth from 'mammoth';
import { getDocument, GlobalWorkerOptions } from 'pdfjs-dist';
import Tesseract from 'tesseract.js';
import VendorTable from './VendorTable';
import { supabase } from '@/integrations/supabase/client';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Alert, AlertDescription } from '@/components/ui/alert';

// Set up PDF.js worker
GlobalWorkerOptions.workerSrc = `//unpkg.com/pdfjs-dist@${(await import('pdfjs-dist/package.json')).version}/build/pdf.worker.min.js`;

async function parseCSV(file: File): Promise<any[]> {
  return new Promise<any[]>((resolve) => {
    Papa.parse(file, {
      header: true,
      complete: (results) => resolve(results.data),
      error: () => resolve([]),
    });
  });
}

async function parseXLSX(file: File): Promise<any[]> {
  const data = await file.arrayBuffer();
  const workbook = XLSX.read(data, { type: 'array' });
  const firstSheet = workbook.SheetNames[0];
  return XLSX.utils.sheet_to_json(workbook.Sheets[firstSheet]);
}

async function parseDOCX(file: File): Promise<any[]> {
  const data = await file.arrayBuffer();
  const result = await mammoth.extractRawText({ arrayBuffer: data });
  return result.value
    .split('\n')
    .map(line => line.trim())
    .filter(Boolean)
    .map((line) => ({ name: line }));
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

async function parsePDF(file: File): Promise<any[]> {
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

async function callGptVision(base64Image: string): Promise<any[]> {
  try {
    const { data, error } = await supabase.functions.invoke('gpt-vision', {
      body: { base64Image },
    });

    if (error) throw error;

    const result = data.result;
    // Try to extract valid JSON
    try {
      const jsonStart = result.indexOf('[');
      if (jsonStart >= 0) {
        const parsed = JSON.parse(result.slice(jsonStart));
        return Array.isArray(parsed) ? parsed : [{ name: result }];
      }
      // fallback: just return plain text
      return [{ name: result }];
    } catch {
      return [{ name: result }];
    }
  } catch (error) {
    console.error('GPT Vision error:', error);
    return [{ name: 'Error processing with GPT Vision' }];
  }
}

const VendorImport: React.FC = () => {
  const [vendors, setVendors] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  async function handleFile(e: React.ChangeEvent<HTMLInputElement>) {
    setError('');
    setVendors([]);
    setLoading(true);
    const file = e.target.files?.[0];
    if (!file) return setLoading(false);

    let rows: any[] = [];
    try {
      if (file.name.endsWith('.csv')) {
        rows = await parseCSV(file);
      } else if (file.name.match(/\.(xlsx|xls)$/)) {
        rows = await parseXLSX(file);
      } else if (file.name.endsWith('.docx')) {
        rows = await parseDOCX(file);
      } else if (file.name.endsWith('.pdf')) {
        rows = await parsePDF(file);
      } else {
        setError('Unsupported file type');
        setLoading(false);
        return;
      }
      
      // Flatten GPT-4 Vision result if needed
      if (Array.isArray(rows) && rows.length === 1 && Array.isArray(rows[0])) {
        rows = rows[0];
      }
    } catch (e) {
      setError('Parsing failed: ' + String(e));
    }
    setVendors(rows);
    setLoading(false);
  }

  async function saveToSupabase() {
    try {
      for (const vendor of vendors) {
        const { error } = await supabase.from('vendors').insert([vendor]);
        if (error) throw error;
      }
      alert('Vendors saved!');
    } catch (error) {
      console.error('Error saving vendors:', error);
      setError('Failed to save vendors: ' + String(error));
    }
  }

  return (
    <div className="space-y-4">
      <div>
        <Input
          type="file"
          accept=".csv,.xlsx,.xls,.docx,.pdf"
          onChange={handleFile}
          className="mb-4"
        />
      </div>
      
      {loading && (
        <Alert>
          <AlertDescription>Parsing file...</AlertDescription>
        </Alert>
      )}
      
      {error && (
        <Alert variant="destructive">
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}
      
      {vendors.length > 0 && (
        <div className="space-y-4">
          <VendorTable vendors={vendors} />
          <Button
            onClick={saveToSupabase}
            className="bg-green-600 hover:bg-green-700 text-white"
          >
            Save to Supabase
          </Button>
        </div>
      )}
    </div>
  );
};

export default VendorImport;
