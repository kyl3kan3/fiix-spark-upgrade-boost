
import React, { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { toast } from "sonner";
import { Loader2 } from "lucide-react";
import { setUserAsAdmin } from "@/utils/adminUtils";

interface SetAdminUserProps {
  email?: string;
}

const SetAdminUser: React.FC<SetAdminUserProps> = ({ email = "kyl3kan3@gmail.com" }) => {
  const [isLoading, setIsLoading] = useState(false);
  
  const handleSetAdmin = async () => {
    setIsLoading(true);
    
    try {
      const result = await setUserAsAdmin(email);
      
      if (result.success) {
        toast.success(`Successfully set ${email} as administrator`);
      } else {
        toast.error(`Failed to set ${email} as administrator: ${result.error?.message || 'Unknown error'}`);
      }
    } catch (error) {
      console.error("Error in set admin process:", error);
      toast.error(`An unexpected error occurred`);
    } finally {
      setIsLoading(false);
    }
  };
  
  return (
    <Card className="mb-6">
      <CardHeader>
        <CardTitle>Administrator Access</CardTitle>
        <CardDescription>
          Set user as an administrator to grant full system permissions
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="flex flex-col space-y-4">
          <p>
            Make <strong>{email}</strong> an administrator
          </p>
          <Button 
            onClick={handleSetAdmin} 
            disabled={isLoading}
            className="max-w-xs"
          >
            {isLoading ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Setting as admin...
              </>
            ) : (
              'Grant Administrator Access'
            )}
          </Button>
        </div>
      </CardContent>
    </Card>
  );
};

export default SetAdminUser;
