
import { useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "@/components/ui/sonner";

export const useAuth = () => {
  const [isSubmitting, setIsSubmitting] = useState(false);

  const signIn = async (email: string, password: string) => {
    setIsSubmitting(true);
    try {
      console.log("Attempting to sign in with:", { email });
      const { error } = await supabase.auth.signInWithPassword({
        email,
        password
      });
      
      if (error) throw error;
      
      toast.success("Logged in successfully!");
      return { success: true, error: null };
    } catch (error: any) {
      console.error("Authentication error:", error);
      
      // Better error messaging
      let errorMessage = "Authentication failed";
      
      if (error.message.includes("invalid_credentials") || error.message.includes("Invalid login")) {
        errorMessage = "Invalid email or password";
      } else if (error.message.includes("Email not confirmed")) {
        errorMessage = "Please confirm your email address before signing in";
      }
      
      toast.error(errorMessage);
      return { success: false, error: errorMessage };
    } finally {
      setIsSubmitting(false);
    }
  };

  const signUp = async (email: string, password: string, name: string) => {
    setIsSubmitting(true);
    try {
      const { data, error } = await supabase.auth.signUp({
        email,
        password,
        options: {
          data: {
            first_name: name.split(' ')[0],
            last_name: name.split(' ').slice(1).join(' ')
          }
        }
      });
      
      if (error) throw error;
      
      // Check if email confirmation is required
      if (data?.user?.identities?.length === 0) {
        toast.info("This email is already registered. Please sign in instead.");
        return { success: false, error: "This email is already registered" };
      } else {
        toast.success("Account created successfully! Please check your email for verification.");
        return { success: true, error: null };
      }
    } catch (error: any) {
      console.error("Authentication error:", error);
      const errorMessage = "Failed to create account: " + error.message;
      toast.error(errorMessage);
      return { success: false, error: errorMessage };
    } finally {
      setIsSubmitting(false);
    }
  };

  return {
    isSubmitting,
    signIn,
    signUp
  };
};
