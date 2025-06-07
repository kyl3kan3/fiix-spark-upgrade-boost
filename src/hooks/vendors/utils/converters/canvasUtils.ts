
/**
 * Shared canvas utilities for document conversion
 */
export const createCanvas = (width: number = 800, height: number = 1100): { canvas: HTMLCanvasElement; ctx: CanvasRenderingContext2D } => {
  const canvas = document.createElement('canvas');
  const ctx = canvas.getContext('2d');
  
  if (!ctx) {
    throw new Error('Cannot create canvas context');
  }
  
  canvas.width = width;
  canvas.height = height;
  
  // Fill with white background
  ctx.fillStyle = 'white';
  ctx.fillRect(0, 0, canvas.width, canvas.height);
  
  return { canvas, ctx };
};

export const canvasToFile = (canvas: HTMLCanvasElement, originalFileName: string, extension: string): Promise<File> => {
  return new Promise((resolve) => {
    canvas.toBlob((blob) => {
      const imageFile = new File([blob!], originalFileName.replace(new RegExp(`\\.(${extension})$`, 'i'), '.png'), {
        type: 'image/png'
      });
      resolve(imageFile);
    }, 'image/png');
  });
};

export const renderTextOnCanvas = async (ctx: CanvasRenderingContext2D, text: string, width: number, height: number) => {
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

export const renderCsvOnCanvas = async (ctx: CanvasRenderingContext2D, csvText: string, width: number, height: number) => {
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
