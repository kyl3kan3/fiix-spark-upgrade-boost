
import React, { useState, useEffect } from "react";
import {
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Loader2, AlertCircle } from "lucide-react";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue
} from "@/components/ui/select";
import { supabase } from "@/integrations/supabase/client";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { toast } from "sonner";
import { TeamMemberFormValues } from "./types";

const formSchema = z.object({
  name: z.string().min(2, "Name must be at least 2 characters"),
  email: z.string().email("Please enter a valid email address"),
  role: z.string().min(1, "Please select a role"),
});

const AddTeamMemberDialog = () => {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isAdminUser, setIsAdminUser] = useState(false);
  const [companyName, setCompanyName] = useState<string | undefined>(undefined);
  const [error, setError] = useState<string | null>(null);
  
  const form = useForm<TeamMemberFormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      name: "",
      email: "",
      role: "technician",
    },
  });
  
  // Check if current user is an admin when component mounts
  useEffect(() => {
    const checkAdminStatus = async () => {
      try {
        // Get current user
        const { data: { user } } = await supabase.auth.getUser();
        
        if (!user) {
          setIsAdminUser(false);
          return;
        }
        
        // Get current user's role from profiles
        const { data, error } = await supabase
          .from('profiles')
          .select('role, first_name, last_name')
          .eq('id', user.id)
          .single();
          
        if (error) throw error;

        // Check if user is an administrator
        setIsAdminUser(data?.role === "administrator");
        
        // Fetch company info
        const { data: companyData } = await supabase
          .from('company_info')
          .select('company_name')
          .maybeSingle();
          
        if (companyData?.company_name) {
          setCompanyName(companyData.company_name);
        }
      } catch (err: any) {
        console.error("Error checking admin status:", err);
        setError("Could not verify your permissions");
      }
    };
    
    checkAdminStatus();
  }, []);

  const onSubmit = async (data: TeamMemberFormValues) => {
    if (!isAdminUser) {
      toast.error("Only administrators can add team members");
      return;
    }
    
    setIsSubmitting(true);
    setError(null);
    
    try {
      // Add company name to the form data
      const formDataWithCompany = {
        ...data,
        companyName: companyName
      };

      // In a real app, this would send an invite to the email address
      console.log("Inviting team member:", formDataWithCompany);
      
      // Here you would typically call an API to send the invite
      // For now we'll just simulate a successful invite
      toast.success(`Invitation sent to ${data.email}`);
      form.reset();
    } catch (err: any) {
      console.error("Error sending invitation:", err);
      setError(err.message || "Failed to send invitation");
      toast.error("Failed to send invitation");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <DialogContent className="sm:max-w-md">
      <DialogHeader>
        <DialogTitle>Add New Team Member</DialogTitle>
        <DialogDescription>
          Enter the details of the new team member to invite them to the platform.
        </DialogDescription>
      </DialogHeader>
      
      {!isAdminUser && (
        <Alert variant="destructive">
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>
            Only administrators can add new team members
          </AlertDescription>
        </Alert>
      )}
      
      {error && (
        <Alert variant="destructive">
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}
      
      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
          <FormField
            control={form.control}
            name="name"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Name</FormLabel>
                <FormControl>
                  <Input placeholder="Full name" {...field} disabled={!isAdminUser || isSubmitting} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          
          <FormField
            control={form.control}
            name="email"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Email</FormLabel>
                <FormControl>
                  <Input type="email" placeholder="email@example.com" {...field} disabled={!isAdminUser || isSubmitting} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          
          <FormField
            control={form.control}
            name="role"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Role</FormLabel>
                <Select 
                  onValueChange={field.onChange} 
                  defaultValue={field.value}
                  disabled={!isAdminUser || isSubmitting}
                >
                  <FormControl>
                    <SelectTrigger>
                      <SelectValue placeholder="Select a role" />
                    </SelectTrigger>
                  </FormControl>
                  <SelectContent>
                    <SelectItem value="administrator">Administrator</SelectItem>
                    <SelectItem value="manager">Manager</SelectItem>
                    <SelectItem value="technician">Technician</SelectItem>
                    <SelectItem value="viewer">Viewer</SelectItem>
                  </SelectContent>
                </Select>
                <FormMessage />
              </FormItem>
            )}
          />
          
          {companyName && (
            <div className="flex items-center justify-between text-sm text-muted-foreground">
              <span>Company</span>
              <span className="font-medium">{companyName}</span>
            </div>
          )}
          
          <DialogFooter className="mt-4">
            <Button 
              type="submit"
              disabled={!isAdminUser || isSubmitting}
            >
              {isSubmitting ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Sending...
                </>
              ) : (
                'Send Invitation'
              )}
            </Button>
          </DialogFooter>
        </form>
      </Form>
    </DialogContent>
  );
};

export default AddTeamMemberDialog;
