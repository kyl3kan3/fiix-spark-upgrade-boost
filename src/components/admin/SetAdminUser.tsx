import React, { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { toast } from "sonner";
import { Loader2 } from "lucide-react";
import { setUserAsAdmin } from "@/utils/adminUtils";
import { supabase } from "@/integrations/supabase/client";

interface SetAdminUserProps {
  email?: string;
}

const SetAdminUser: React.FC<SetAdminUserProps> = ({ email }) => {
  const [currentUserEmail, setCurrentUserEmail] = useState<string | null>(email ?? null);
  const [isLoading, setIsLoading] = useState(false);
  const [currentRole, setCurrentRole] = useState<string | null>(null);
  const [isChecking, setIsChecking] = useState(true);

  // If email prop is not provided, load the current user's email
  useEffect(() => {
    if (!email) {
      const fetchMe = async () => {
        const { data: { user } } = await supabase.auth.getUser();
        setCurrentUserEmail(user?.email ?? null);
      };
      fetchMe();
    } else {
      setCurrentUserEmail(email);
    }
  }, [email]);

  // Check the current role when email is determined
  useEffect(() => {
    if (!currentUserEmail) {
      setCurrentRole(null);
      setIsChecking(false);
      return;
    }
    const checkCurrentRole = async () => {
      try {
        setIsChecking(true);
        const { data, error } = await supabase
          .from('profiles')
          .select('role')
          .eq('email', currentUserEmail)
          .single();

        if (error) throw error;

        setCurrentRole(data?.role || null);
        console.log(`Current role for ${currentUserEmail}: ${data?.role}`);
      } catch (error) {
        console.error("Error checking role:", error);
        setCurrentRole(null);
      } finally {
        setIsChecking(false);
      }
    };

    checkCurrentRole();
  }, [currentUserEmail]);

  const handleSetAdmin = async () => {
    if (!currentUserEmail) return;
    setIsLoading(true);

    try {
      const result = await setUserAsAdmin(currentUserEmail);

      if (result.success) {
        toast.success(`Successfully set ${currentUserEmail} as administrator`);
        setCurrentRole("administrator");
      } else {
        toast.error(`Failed to set ${currentUserEmail} as administrator: ${result.error?.message || 'Unknown error'}`);
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
          <div className="flex items-center space-x-2">
            <p>
              <strong>{currentUserEmail ?? "Unknown user"}</strong>
            </p>
            {isChecking ? (
              <span className="text-sm text-gray-500">(Checking current role...)</span>
            ) : currentRole ? (
              <span className={`text-sm font-medium px-2 py-1 rounded-full ${
                currentRole === 'administrator' ? 'bg-green-100 text-green-800' : 'bg-blue-100 text-blue-800'
              }`}>
                Current role: {currentRole}
              </span>
            ) : (
              <span className="text-sm text-gray-500">(Role unknown)</span>
            )}
          </div>

          {currentRole === 'administrator' ? (
            <p className="text-green-600">This user already has administrator access.</p>
          ) : (
            <Button 
              onClick={handleSetAdmin} 
              disabled={isLoading || isChecking || !currentUserEmail}
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
          )}
        </div>
      </CardContent>
    </Card>
  );
};

export default SetAdminUser;
