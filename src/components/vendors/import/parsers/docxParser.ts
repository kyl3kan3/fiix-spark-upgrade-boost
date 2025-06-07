
import mammoth from 'mammoth';

export async function parseDOCX(file: File): Promise<any[]> {
  const data = await file.arrayBuffer();
  const result = await mammoth.extractRawText({ arrayBuffer: data });
  return result.value
    .split('\n')
    .map(line => line.trim())
    .filter(Boolean)
    .map((line) => ({ name: line }));
}
