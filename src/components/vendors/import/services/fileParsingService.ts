
import { parseCSV } from '../parsers/csvParser';
import { parseXLSX } from '../parsers/xlsxParser';
import { parseDOCX } from '../parsers/docxParser';
import { parsePDF } from '../parsers/pdfParser';

export async function parseFile(file: File, expectedCount?: number): Promise<any[]> {
  console.log('🔍 parseFile called with:', {
    fileName: file.name,
    fileSize: file.size,
    fileType: file.type,
    expectedCount
  });
  
  let rows: any[] = [];
  
  try {
    if (file.name.endsWith('.csv')) {
      console.log('📊 Parsing CSV file');
      rows = await parseCSV(file);
    } else if (file.name.match(/\.(xlsx|xls)$/)) {
      console.log('📊 Parsing Excel file');
      rows = await parseXLSX(file);
    } else if (file.name.endsWith('.docx')) {
      console.log('📄 Parsing DOCX file');
      rows = await parseDOCX(file, expectedCount);
    } else if (file.name.endsWith('.pdf')) {
      console.log('📄 Parsing PDF file');
      rows = await parsePDF(file, expectedCount);
    } else {
      const errorMsg = `Unsupported file type: ${file.name}`;
      console.error('❌', errorMsg);
      throw new Error(errorMsg);
    }
    
    console.log('📋 Raw parsing result:', {
      type: typeof rows,
      isArray: Array.isArray(rows),
      length: Array.isArray(rows) ? rows.length : 'N/A',
      content: rows
    });
    
    // Flatten GPT-4 Vision result if needed
    if (Array.isArray(rows) && rows.length === 1 && Array.isArray(rows[0])) {
      console.log('🔄 Flattening nested array result');
      rows = rows[0];
    }
    
    console.log('✅ Final parsing result:', {
      vendorCount: rows.length,
      vendors: rows
    });
    
    return rows;
  } catch (error) {
    console.error('❌ Error in parseFile:', error);
    throw error;
  }
}
