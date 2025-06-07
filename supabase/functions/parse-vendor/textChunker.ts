
// Function to estimate token count (rough approximation: 1 token ≈ 4 characters)
export function estimateTokenCount(text: string): number {
  return Math.ceil(text.length / 4);
}

// Function to chunk text into smaller pieces for vision model
export function chunkText(text: string, maxTokens: number = 15000): string[] {
  const maxChars = maxTokens * 4; // Rough conversion from tokens to characters
  const chunks: string[] = [];
  
  if (text.length <= maxChars) {
    return [text];
  }
  
  // Split by paragraphs first, then by sentences if needed
  const paragraphs = text.split(/\n\s*\n/);
  let currentChunk = '';
  
  for (const paragraph of paragraphs) {
    if ((currentChunk + paragraph).length <= maxChars) {
      currentChunk += (currentChunk ? '\n\n' : '') + paragraph;
    } else {
      if (currentChunk) {
        chunks.push(currentChunk);
        currentChunk = paragraph;
      } else {
        // Paragraph is too long, split by sentences
        const sentences = paragraph.split(/[.!?]+/);
        for (const sentence of sentences) {
          if ((currentChunk + sentence).length <= maxChars) {
            currentChunk += (currentChunk ? '. ' : '') + sentence;
          } else {
            if (currentChunk) {
              chunks.push(currentChunk);
              currentChunk = sentence;
            } else {
              // Even sentence is too long, force split
              chunks.push(sentence.substring(0, maxChars));
              currentChunk = sentence.substring(maxChars);
            }
          }
        }
      }
    }
  }
  
  if (currentChunk) {
    chunks.push(currentChunk);
  }
  
  return chunks;
}
