
import { parseCSV } from '../parsers/csvParser';
import { parseXLSX } from '../parsers/xlsxParser';
import { parseDOCX } from '../parsers/docxParser';
import { parsePDF } from '../parsers/pdfParser';

export async function parseFile(file: File, expectedCount?: number, instructions?: string): Promise<any[]> {
  console.log('🔄 === FILE PARSING SERVICE START ===');
  console.log('📁 File details:', {
    name: file.name,
    size: file.size,
    type: file.type,
    lastModified: new Date(file.lastModified).toISOString()
  });
  console.log('📋 Expected count:', expectedCount);
  console.log('📝 Instructions:', instructions || 'None');
  
  let rows: any[] = [];
  
  try {
    if (file.name.endsWith('.csv')) {
      console.log('📊 Processing as CSV file');
      rows = await parseCSV(file);
    } else if (file.name.match(/\.(xlsx|xls)$/)) {
      console.log('📊 Processing as Excel file');
      rows = await parseXLSX(file);
    } else if (file.name.endsWith('.docx')) {
      console.log('📄 Processing as Word document');
      rows = await parseDOCX(file, expectedCount);
    } else if (file.name.endsWith('.pdf')) {
      console.log('📄 Processing as PDF document');
      rows = await parsePDF(file, expectedCount, instructions);
    } else {
      throw new Error('Unsupported file type');
    }
    
    console.log('✅ Initial parsing completed:', rows.length, 'items found');
    
    // Flatten GPT-4 Vision result if needed
    if (Array.isArray(rows) && rows.length === 1 && Array.isArray(rows[0])) {
      console.log('🔄 Flattening nested array result');
      rows = rows[0];
    }
    
    console.log('🏁 Final result:', rows.length, 'vendors ready');
    console.log('🔄 === FILE PARSING SERVICE END ===');
    
    return rows;
  } catch (error) {
    console.error('❌ FILE PARSING ERROR:', error);
    console.log('🔄 === FILE PARSING SERVICE END (ERROR) ===');
    throw error;
  }
}
