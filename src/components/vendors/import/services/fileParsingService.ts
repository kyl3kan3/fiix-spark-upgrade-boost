
import { parseCSV } from '../parsers/csvParser';
import { parseXLSX } from '../parsers/xlsxParser';
import { parseDOCX } from '../parsers/docxParser';
import { parsePDF } from '../parsers/pdfParser';
import { logger } from "@/lib/logger";

export async function parseFile(file: File, expectedCount?: number, instructions?: string): Promise<any[]> {
  logger.log('🔄 === FILE PARSING SERVICE START ===');
  logger.log('📁 File details:', {
    name: file.name,
    size: file.size,
    type: file.type,
    lastModified: new Date(file.lastModified).toISOString()
  });
  logger.log('📋 Expected count:', expectedCount);
  logger.log('📝 Instructions:', instructions || 'None');
  
  let rows: any[] = [];
  
  try {
    if (file.name.endsWith('.csv')) {
      logger.log('📊 Processing as CSV file');
      rows = await parseCSV(file);
    } else if (file.name.match(/\.(xlsx|xls)$/)) {
      logger.log('📊 Processing as Excel file');
      rows = await parseXLSX(file);
    } else if (file.name.endsWith('.docx')) {
      logger.log('📄 Processing as Word document');
      rows = await parseDOCX(file, expectedCount);
    } else if (file.name.endsWith('.pdf')) {
      logger.log('📄 Processing as PDF document');
      rows = await parsePDF(file, expectedCount, instructions);
    } else {
      throw new Error('Unsupported file type');
    }
    
    logger.log('✅ Initial parsing completed:', rows.length, 'items found');
    
    // Flatten GPT-4 Vision result if needed
    if (Array.isArray(rows) && rows.length === 1 && Array.isArray(rows[0])) {
      logger.log('🔄 Flattening nested array result');
      rows = rows[0];
    }
    
    logger.log('🏁 Final result:', rows.length, 'vendors ready');
    logger.log('🔄 === FILE PARSING SERVICE END ===');
    
    return rows;
  } catch (error) {
    console.error('❌ FILE PARSING ERROR:', error);
    logger.log('🔄 === FILE PARSING SERVICE END (ERROR) ===');
    throw error;
  }
}
