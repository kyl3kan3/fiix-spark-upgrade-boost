
import * as XLSX from 'xlsx';

export async function parseXLSX(file: File): Promise<any[]> {
  const data = await file.arrayBuffer();
  const workbook = XLSX.read(data, { type: 'array' });
  const firstSheet = workbook.SheetNames[0];
  return XLSX.utils.sheet_to_json(workbook.Sheets[firstSheet]);
}
