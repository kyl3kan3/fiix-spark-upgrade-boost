
import { supabase } from '@/integrations/supabase/client';

export async function callGptVision(base64Image: string): Promise<any[]> {
  try {
    const { data, error } = await supabase.functions.invoke('gpt-vision', {
      body: { base64Image },
    });

    if (error) throw error;

    const result = data.result;
    // Try to extract valid JSON
    try {
      const jsonStart = result.indexOf('[');
      if (jsonStart >= 0) {
        const parsed = JSON.parse(result.slice(jsonStart));
        return Array.isArray(parsed) ? parsed : [{ name: result }];
      }
      // fallback: just return plain text
      return [{ name: result }];
    } catch {
      return [{ name: result }];
    }
  } catch (error) {
    console.error('GPT Vision error:', error);
    return [{ name: 'Error processing with GPT Vision' }];
  }
}
