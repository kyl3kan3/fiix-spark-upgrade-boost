
import { supabase } from "@/integrations/supabase/client";
import { VendorFormData } from "@/services/vendorService";

interface VisionResponse {
  success: boolean;
  vendors?: VendorFormData[];
  error?: string;
  message?: string;
  details?: string;
}

export const useVendorImageParser = () => {
  const parseImageWithVision = async (base64Image: string): Promise<VendorFormData[]> => {
    try {
      console.log('[Image Parser] Sending image to GPT Vision function...');
      
      const { data, error } = await supabase.functions.invoke('gpt-vision', {
        body: { base64Image },
      });
      
      if (error) {
        console.error('[Image Parser] Supabase function error:', error);
        throw new Error(error.message || 'Failed to process image');
      }
      
      console.log('[Image Parser] Raw response:', data);
      
      // Handle the response based on the actual structure returned by the edge function
      if (data && typeof data === 'object') {
        // If the response follows our expected format
        if (data.success === false) {
          const errorMessage = data.error || 'Unknown error occurred';
          
          // Handle specific error types with user-friendly messages
          if (errorMessage.includes('Rate limit')) {
            throw new Error("OpenAI rate limit exceeded. Please wait a few minutes and try again.");
          } else if (errorMessage.includes('API key')) {
            throw new Error("OpenAI API key configuration issue. Please contact support.");
          } else {
            throw new Error(errorMessage);
          }
        }
        
        if (data.success === true && data.vendors) {
          if (!Array.isArray(data.vendors) || data.vendors.length === 0) {
            throw new Error('No vendor data found in the image');
          }
          return data.vendors;
        }
        
        // If vendors are directly in the response
        if (data.vendors && Array.isArray(data.vendors)) {
          return data.vendors;
        }
      }
      
      // Fallback: try to parse as raw content
      let vendors = [];
      try {
        const content = data?.result || data?.content || JSON.stringify(data);
        console.log('[Image Parser] Parsing content:', content);
        
        // Clean up the response if it contains markdown formatting
        let jsonStr = content.replace(/```json\s*/g, '').replace(/```\s*/g, '').trim();
        
        // Find JSON array in the response
        const arrayStart = jsonStr.indexOf('[');
        const arrayEnd = jsonStr.lastIndexOf(']') + 1;
        
        if (arrayStart >= 0 && arrayEnd > arrayStart) {
          jsonStr = jsonStr.slice(arrayStart, arrayEnd);
          vendors = JSON.parse(jsonStr);
          
          if (!Array.isArray(vendors)) {
            vendors = [];
          }
        }
      } catch (parseError) {
        console.error('[Image Parser] Error parsing response:', parseError);
        throw new Error('Failed to parse vendor data from AI response');
      }
      
      if (vendors.length === 0) {
        throw new Error('No vendor data found in the image');
      }
      
      return vendors;
      
    } catch (error: any) {
      console.error("Error parsing image with GPT Vision:", error);
      
      // Handle specific error types with user-friendly messages
      if (error.message?.includes('Rate limit exceeded') || error.message?.includes('rate limit')) {
        throw new Error("OpenAI rate limit exceeded. Please wait a few minutes and try again.");
      }
      
      if (error.message?.includes('API key')) {
        throw new Error("OpenAI API configuration issue. Please check your API key.");
      }
      
      // Re-throw the error with the original message if it's already user-friendly
      throw new Error(error.message || "Failed to parse image with AI Vision");
    }
  };

  const convertFileToBase64 = (file: File): Promise<string> => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = () => {
        const base64String = reader.result as string;
        // Remove the data:image/...;base64, prefix
        const base64Data = base64String.split(',')[1];
        resolve(base64Data);
      };
      reader.onerror = reject;
      reader.readAsDataURL(file);
    });
  };

  return {
    parseImageWithVision,
    convertFileToBase64,
  };
};
