import React, { useState } from "react";
import { Button } from "@/components/ui/button";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { Loader2, Sparkles } from "lucide-react";

export const DemoSetupButton: React.FC = () => {
  const [isCreating, setIsCreating] = useState(false);

  const handleCreateDemo = async () => {
    try {
      setIsCreating(true);
      
      const { data, error } = await supabase.functions.invoke('create-demo-user', {
        body: {}
      });

      if (error) throw error;

      toast.success("Demo account created!", {
        description: "Email: demo@demo.com | Password: demo123",
        duration: 8000,
      });
    } catch (error: any) {
      console.error('Error creating demo:', error);
      toast.error("Failed to create demo account", {
        description: error.message || "Please try again later",
      });
    } finally {
      setIsCreating(false);
    }
  };

  return (
    <div className="mt-6 text-center">
      <Button
        type="button"
        variant="outline"
        onClick={handleCreateDemo}
        disabled={isCreating}
        className="w-full"
      >
        {isCreating ? (
          <>
            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
            Creating Demo Account...
          </>
        ) : (
          <>
            <Sparkles className="mr-2 h-4 w-4" />
            Setup Demo Account
          </>
        )}
      </Button>
      <p className="mt-2 text-xs text-muted-foreground">
        Create a demo account with sample data to explore the app
      </p>
    </div>
  );
};
