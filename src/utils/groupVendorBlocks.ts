
export function groupVendorBlocks(docText: string): string[] {
  const lines = docText.split(/\r?\n/)
  const blocks: string[] = []
  let current: string[] = []
  let blankCount = 0

  for (const line of lines) {
    if (!line.trim()) {
      blankCount++
      if (blankCount >= 2 && current.length) {
        blocks.push(current.join('\n').trim())
        current = []
      }
    } else {
      blankCount = 0
      current.push(line)
    }
  }
  if (current.length) blocks.push(current.join('\n').trim())
  return blocks
}
