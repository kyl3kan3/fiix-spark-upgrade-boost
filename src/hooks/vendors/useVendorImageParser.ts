
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
      
      const response = data as VisionResponse;
      console.log('[Image Parser] Vision response:', response);
      
      if (!response.success) {
        throw new Error(response.error || 'Unknown error occurred');
      }
      
      if (!response.vendors || response.vendors.length === 0) {
        throw new Error('No vendor data found in the image');
      }
      
      return response.vendors;
      
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
