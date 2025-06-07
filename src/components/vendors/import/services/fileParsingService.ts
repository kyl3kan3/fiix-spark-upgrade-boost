
import { parseCSV } from '../parsers/csvParser';
import { parseXLSX } from '../parsers/xlsxParser';
import { parseDOCX } from '../parsers/docxParser';
import { parsePDF } from '../parsers/pdfParser';

export async function parseFile(file: File): Promise<any[]> {
  let rows: any[] = [];
  
  if (file.name.endsWith('.csv')) {
    rows = await parseCSV(file);
  } else if (file.name.match(/\.(xlsx|xls)$/)) {
    rows = await parseXLSX(file);
  } else if (file.name.endsWith('.docx')) {
    rows = await parseDOCX(file);
  } else if (file.name.endsWith('.pdf')) {
    rows = await parsePDF(file);
  } else {
    throw new Error('Unsupported file type');
  }
  
  // Flatten GPT-4 Vision result if needed
  if (Array.isArray(rows) && rows.length === 1 && Array.isArray(rows[0])) {
    rows = rows[0];
  }
  
  return rows;
}
