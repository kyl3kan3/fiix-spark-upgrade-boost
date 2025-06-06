
export function groupVendorBlocksFromText(text: string): string[] {
  const lines = text.split('\n')
  const blocks: string[] = []
  let currentBlock: string[] = []
  let blankLineCount = 0

  for (const line of lines) {
    const trimmedLine = line.trim()
    
    if (!trimmedLine) {
      blankLineCount++
      // If we hit 2+ blank lines and have content, finalize the block
      if (blankLineCount >= 2 && currentBlock.length > 0) {
        blocks.push(currentBlock.join('\n'))
        currentBlock = []
      }
    } else {
      blankLineCount = 0
      currentBlock.push(trimmedLine)
    }
  }

  // Don't forget the last block
  if (currentBlock.length > 0) {
    blocks.push(currentBlock.join('\n'))
  }

  return blocks.filter(block => block.trim().length > 10) // Filter out tiny blocks
}
