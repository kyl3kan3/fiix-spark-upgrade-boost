
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
      console.log('[Image Parser] 🚀 Sending image to GPT Vision function...');
      console.log(`[Image Parser] 📊 Base64 image data size: ${(base64Image.length / 1024).toFixed(1)} KB`);
      console.log('[Image Parser] 📝 Using gpt-vision endpoint for IMAGE ONLY processing...');
      
      // Call the GPT Vision edge function with ONLY image data
      const { data, error } = await supabase.functions.invoke('gpt-vision', {
        body: { 
          base64Image: base64Image  // Send ONLY the image, no text
        },
      });
      
      if (error) {
        console.error('[Image Parser] ❌ Supabase function error:', error);
        throw new Error(error.message || 'Failed to process image with GPT Vision');
      }
      
      console.log('[Image Parser] ✅ Received response from GPT Vision');
      
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
          console.log(`[Image Parser] ✅ Successfully extracted ${data.vendors.length} vendors from image`);
          return data.vendors;
        }
        
        // If vendors are directly in the response
        if (data.vendors && Array.isArray(data.vendors)) {
          console.log(`[Image Parser] ✅ Successfully extracted ${data.vendors.length} vendors from image`);
          return data.vendors;
        }
      }
      
      // Fallback: try to parse as raw content
      let vendors = [];
      try {
        const content = data?.result || data?.content || JSON.stringify(data);
        console.log('[Image Parser] 🔄 Parsing fallback content...');
        
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
        console.error('[Image Parser] ❌ Error parsing response:', parseError);
        throw new Error('Failed to parse vendor data from AI Vision response');
      }
      
      if (vendors.length === 0) {
        throw new Error('No vendor data found in the image. The document may not contain clear vendor information, or the image quality may be too low for AI analysis.');
      }
      
      console.log(`[Image Parser] ✅ Successfully extracted ${vendors.length} vendors using fallback parsing`);
      return vendors;
      
    } catch (error: any) {
      console.error("[Image Parser] ❌ Error parsing image with GPT Vision:", error);
      
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
        // Remove the data:image/...;base64, prefix to get just the base64 data
        const base64Data = base64String.split(',')[1];
        console.log(`[Image Parser] ✅ File converted to base64, size: ${(base64Data.length / 1024).toFixed(1)} KB`);
        resolve(base64Data);
      };
      reader.onerror = (error) => {
        console.error('[Image Parser] ❌ Error converting file to base64:', error);
        reject(error);
      };
      reader.readAsDataURL(file);
    });
  };

  return {
    parseImageWithVision,
    convertFileToBase64,
  };
};
