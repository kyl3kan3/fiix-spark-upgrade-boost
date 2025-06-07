
import Papa from 'papaparse';

export async function parseCSV(file: File): Promise<any[]> {
  return new Promise<any[]>((resolve) => {
    Papa.parse(file, {
      header: true,
      complete: (results) => resolve(results.data),
      error: () => resolve([]),
    });
  });
}
