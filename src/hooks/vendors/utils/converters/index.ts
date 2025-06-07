
// Simplified converter exports - CSV only for now
export const getFileType = (file: File): string => {
  const extension = file.name.toLowerCase().split('.').pop() || '';
  
  if (['csv'].includes(extension)) {
    return 'csv';
  }
  
  return 'unsupported';
};

// For now, only support CSV files
export const convertToImages = async (file: File): Promise<string[]> => {
  const fileType = getFileType(file);
  
  if (fileType === 'csv') {
    throw new Error('CSV files should be parsed directly, not converted to images');
  }
  
  throw new Error(`Unsupported file type: ${fileType}`);
};
