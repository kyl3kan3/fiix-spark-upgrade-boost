
/**
 * Converts various file types to images for better AI Vision processing
 */
export const convertFileToImage = async (file: File): Promise<File> => {
  const fileName = file.name.toLowerCase();
  const fileType = file.type.toLowerCase();

  // If it's already an image, return as-is
  if (fileType.startsWith('image/')) {
    return file;
  }

  // Convert DOCX/DOC files
  if (fileName.endsWith('.docx') || fileName.endsWith('.doc') || fileType.includes('word')) {
    return await convertDocxToImage(file);
  }

  // Convert PDF files
  if (fileName.endsWith('.pdf') || fileType === 'application/pdf') {
    return await convertPdfToImage(file);
  }

  // Convert CSV files
  if (fileName.endsWith('.csv') || fileType === 'text/csv') {
    return await convertCsvToImage(file);
  }

  // Convert Excel files
  if (fileName.endsWith('.xlsx') || fileName.endsWith('.xls') || fileType.includes('sheet')) {
    return await convertExcelToImage(file);
  }

  // Convert plain text files
  if (fileType.startsWith('text/') || fileName.endsWith('.txt')) {
    return await convertTextToImage(file);
  }

  // Default: try to treat as text and convert
  return await convertTextToImage(file);
};

/**
 * Converts DOCX files to images for better AI Vision processing
 */
export const convertDocxToImage = async (file: File): Promise<File> => {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    
    reader.onload = async (e) => {
      try {
        const arrayBuffer = e.target?.result as ArrayBuffer;
        
        // Create a canvas to render the document content
        const canvas = document.createElement('canvas');
        const ctx = canvas.getContext('2d');
        
        // Set canvas size for document-like dimensions
        canvas.width = 800;
        canvas.height = 1100; // A4-like ratio
        
        if (!ctx) {
          throw new Error('Cannot create canvas context');
        }
        
        // Fill with white background
        ctx.fillStyle = 'white';
        ctx.fillRect(0, 0, canvas.width, canvas.height);
        
        // Extract text content from DOCX
        const text = await extractTextFromDocx(arrayBuffer);
        
        // Render text on canvas
        await renderTextOnCanvas(ctx, text, canvas.width, canvas.height);
        
        // Convert canvas to blob
        canvas.toBlob((blob) => {
          if (blob) {
            const imageFile = new File([blob], file.name.replace(/\.(docx|doc)$/i, '.png'), {
              type: 'image/png'
            });
            resolve(imageFile);
          } else {
            reject(new Error('Failed to create image from document'));
          }
        }, 'image/png');
        
      } catch (error) {
        reject(error);
      }
    };
    
    reader.onerror = () => reject(new Error('Failed to read document file'));
    reader.readAsArrayBuffer(file);
  });
};

/**
 * Converts PDF files to images
 */
const convertPdfToImage = async (file: File): Promise<File> => {
  // For now, create a placeholder image with PDF info
  // In a full implementation, you'd use PDF.js to render the actual pages
  const canvas = document.createElement('canvas');
  const ctx = canvas.getContext('2d')!;
  
  canvas.width = 800;
  canvas.height = 1100;
  
  ctx.fillStyle = 'white';
  ctx.fillRect(0, 0, canvas.width, canvas.height);
  
  ctx.fillStyle = 'black';
  ctx.font = 'bold 24px Arial';
  ctx.fillText('PDF Document', 50, 50);
  
  ctx.font = '16px Arial';
  ctx.fillText(`File: ${file.name}`, 50, 100);
  ctx.fillText(`Size: ${(file.size / 1024 / 1024).toFixed(2)} MB`, 50, 130);
  
  ctx.fillStyle = 'red';
  ctx.font = '14px Arial';
  ctx.fillText('Note: For better AI parsing, please convert', 50, 180);
  ctx.fillText('your PDF to images or Word document', 50, 200);
  
  return new Promise((resolve) => {
    canvas.toBlob((blob) => {
      const imageFile = new File([blob!], file.name.replace('.pdf', '.png'), {
        type: 'image/png'
      });
      resolve(imageFile);
    }, 'image/png');
  });
};

/**
 * Converts CSV files to images
 */
const convertCsvToImage = async (file: File): Promise<File> => {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    
    reader.onload = async (e) => {
      try {
        const text = e.target?.result as string;
        const canvas = document.createElement('canvas');
        const ctx = canvas.getContext('2d')!;
        
        canvas.width = 1200;
        canvas.height = 1600;
        
        ctx.fillStyle = 'white';
        ctx.fillRect(0, 0, canvas.width, canvas.height);
        
        // Render CSV data in a table-like format
        await renderCsvOnCanvas(ctx, text, canvas.width, canvas.height);
        
        canvas.toBlob((blob) => {
          const imageFile = new File([blob!], file.name.replace('.csv', '.png'), {
            type: 'image/png'
          });
          resolve(imageFile);
        }, 'image/png');
      } catch (error) {
        reject(error);
      }
    };
    
    reader.onerror = () => reject(new Error('Failed to read CSV file'));
    reader.readAsText(file);
  });
};

/**
 * Converts Excel files to images
 */
const convertExcelToImage = async (file: File): Promise<File> => {
  const canvas = document.createElement('canvas');
  const ctx = canvas.getContext('2d')!;
  
  canvas.width = 800;
  canvas.height = 1100;
  
  ctx.fillStyle = 'white';
  ctx.fillRect(0, 0, canvas.width, canvas.height);
  
  ctx.fillStyle = 'black';
  ctx.font = 'bold 24px Arial';
  ctx.fillText('Excel Document', 50, 50);
  
  ctx.font = '16px Arial';
  ctx.fillText(`File: ${file.name}`, 50, 100);
  ctx.fillText('Excel files need to be converted to CSV first', 50, 150);
  ctx.fillText('for proper vendor data extraction.', 50, 180);
  
  return new Promise((resolve) => {
    canvas.toBlob((blob) => {
      const imageFile = new File([blob!], file.name.replace(/\.(xlsx|xls)$/i, '.png'), {
        type: 'image/png'
      });
      resolve(imageFile);
    }, 'image/png');
  });
};

/**
 * Converts text files to images
 */
const convertTextToImage = async (file: File): Promise<File> => {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    
    reader.onload = async (e) => {
      try {
        const text = e.target?.result as string;
        const canvas = document.createElement('canvas');
        const ctx = canvas.getContext('2d')!;
        
        canvas.width = 800;
        canvas.height = 1100;
        
        ctx.fillStyle = 'white';
        ctx.fillRect(0, 0, canvas.width, canvas.height);
        
        await renderTextOnCanvas(ctx, text, canvas.width, canvas.height);
        
        canvas.toBlob((blob) => {
          const imageFile = new File([blob!], file.name.replace(/\.(txt|text)$/i, '.png'), {
            type: 'image/png'
          });
          resolve(imageFile);
        }, 'image/png');
      } catch (error) {
        reject(error);
      }
    };
    
    reader.onerror = () => reject(new Error('Failed to read text file'));
    reader.readAsText(file);
  });
};

/**
 * Renders text content on canvas with proper formatting
 */
const renderTextOnCanvas = async (ctx: CanvasRenderingContext2D, text: string, width: number, height: number) => {
  ctx.fillStyle = 'black';
  ctx.font = '12px Arial';
  
  const lines = text.split('\n');
  const lineHeight = 16;
  let y = 30;
  
  for (const line of lines) {
    if (y > height - 30) break;
    
    // Wrap long lines
    const words = line.split(' ');
    let currentLine = '';
    
    for (const word of words) {
      const testLine = currentLine + word + ' ';
      const metrics = ctx.measureText(testLine);
      
      if (metrics.width > width - 60 && currentLine !== '') {
        ctx.fillText(currentLine, 30, y);
        currentLine = word + ' ';
        y += lineHeight;
        
        if (y > height - 30) break;
      } else {
        currentLine = testLine;
      }
    }
    
    if (currentLine && y <= height - 30) {
      ctx.fillText(currentLine, 30, y);
      y += lineHeight;
    }
  }
};

/**
 * Renders CSV data on canvas in table format
 */
const renderCsvOnCanvas = async (ctx: CanvasRenderingContext2D, csvText: string, width: number, height: number) => {
  const lines = csvText.split('\n').slice(0, 50); // Limit to first 50 rows
  const cellHeight = 25;
  const cellPadding = 5;
  
  ctx.fillStyle = 'black';
  ctx.font = '11px Arial';
  ctx.strokeStyle = '#ddd';
  ctx.lineWidth = 1;
  
  let y = 30;
  
  for (let i = 0; i < lines.length && y < height - 30; i++) {
    const cells = lines[i].split(',').slice(0, 6); // Limit to 6 columns
    const cellWidth = (width - 60) / Math.max(cells.length, 1);
    let x = 30;
    
    // Draw header with background for first row
    if (i === 0) {
      ctx.fillStyle = '#f5f5f5';
      ctx.fillRect(30, y - cellHeight + 5, width - 60, cellHeight);
      ctx.fillStyle = 'black';
      ctx.font = 'bold 11px Arial';
    } else {
      ctx.font = '11px Arial';
    }
    
    for (const cell of cells) {
      // Draw cell border
      ctx.strokeRect(x, y - cellHeight + 5, cellWidth, cellHeight);
      
      // Draw cell text
      const cellText = cell.trim().substring(0, 20); // Limit text length
      ctx.fillText(cellText, x + cellPadding, y - cellPadding);
      
      x += cellWidth;
    }
    
    y += cellHeight;
  }
};

/**
 * Simple DOCX text extraction (basic implementation)
 */
const extractTextFromDocx = async (arrayBuffer: ArrayBuffer): Promise<string> => {
  try {
    const uint8Array = new Uint8Array(arrayBuffer);
    const decoder = new TextDecoder('utf-8', { fatal: false });
    
    // Convert to string and look for XML content
    const content = decoder.decode(uint8Array);
    
    // Find document.xml content (the main document content in DOCX)
    const documentXmlMatch = content.match(/word\/document\.xml.*?<w:document[^>]*>(.*?)<\/w:document>/s);
    let textContent = '';
    
    if (documentXmlMatch) {
      const xmlContent = documentXmlMatch[1];
      // Extract text from XML tags, specifically <w:t> tags which contain text
      const textMatches = xmlContent.match(/<w:t[^>]*>([^<]*)<\/w:t>/g);
      if (textMatches) {
        textContent = textMatches
          .map(match => match.replace(/<w:t[^>]*>([^<]*)<\/w:t>/, '$1'))
          .join(' ');
      }
    }
    
    // If no structured content found, try to extract any readable text
    if (!textContent || textContent.length < 50) {
      const lines = content.split(/[\r\n]+/);
      const readableLines = [];
      
      for (const line of lines) {
        // Look for lines with readable ASCII text that might contain vendor info
        const cleanLine = line
          .replace(/[^\x20-\x7E\s]/g, ' ') // Keep only printable ASCII
          .replace(/\s+/g, ' ')
          .trim();
        
        // Only include lines that look like they contain meaningful text
        if (cleanLine.length > 10 && 
            (cleanLine.includes('@') || // emails
             cleanLine.match(/\d{3}[\s\-\.]?\d{3}[\s\-\.]?\d{4}/) || // phone numbers
             cleanLine.match(/\b[A-Z][A-Za-z\s&.,]{5,50}\b/) || // company-like names
             cleanLine.includes('Inc') || cleanLine.includes('LLC') ||
             cleanLine.includes('Corp') || cleanLine.includes('Company') ||
             cleanLine.match(/\d+\s+[A-Za-z\s]+(?:St|Street|Ave|Avenue|Rd|Road|Dr|Drive|Blvd|Boulevard)/i))) { // addresses
          readableLines.push(cleanLine);
        }
      }
      
      textContent = readableLines.join('\n');
    }
    
    return textContent || 'No readable text found in document';
  } catch (error) {
    console.error('DOCX text extraction error:', error);
    return 'Error extracting text from document';
  }
};
