/** Bound bytes while streaming, before JSON parsing or regex/template processing. */
export async function boundedJson(req: Request, maxBytes = 65536): Promise<any> {
  const advertised = Number(req.headers.get('content-length'));
  if (advertised > maxBytes) throw new RangeError('Request too large');
  const reader = req.body?.getReader();
  if (!reader) throw new SyntaxError('Request body required');
  const chunks: Uint8Array[] = [];
  let total = 0;
  try {
    for (;;) {
      const { done, value } = await reader.read();
      if (done) break;
      total += value.byteLength;
      if (total > maxBytes) { await reader.cancel(); throw new RangeError('Request too large'); }
      chunks.push(value);
    }
  } finally { reader.releaseLock(); }
  const bytes = new Uint8Array(total);
  let offset = 0;
  for (const chunk of chunks) { bytes.set(chunk, offset); offset += chunk.length; }
  return JSON.parse(new TextDecoder('utf-8', { fatal: true }).decode(bytes));
}
