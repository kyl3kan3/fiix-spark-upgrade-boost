
import { supabase } from "@/integrations/supabase/client";
import { VendorFormData } from "@/services/vendorService";

interface VisionResponse {
  success: boolean;
  vendors?: VendorFormData[];
  error?: string;
  message?: string;
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
      if (data && data.success !== undefined) {
        // If the response follows our expected format
        const response = data as VisionResponse;
        
        if (!response.success) {
          throw new Error(response.error || 'Unknown error occurred');
        }
        
        if (!response.vendors || response.vendors.length === 0) {
          throw new Error('No vendor data found in the image');
        }
        
        return response.vendors;
      } else if (data && data.vendors) {
        // Direct vendors array
        return data.vendors;
      } else {
        // Fallback: assume the response needs to be parsed as JSON string
        let vendors = [];
        try {
          const content = data.result || data.content || JSON.stringify(data);
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
      }
      
    } catch (error: any) {
      console.error("Error parsing image with GPT Vision:", error);
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
