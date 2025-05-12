
import React, { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Sheet, SheetContent, SheetDescription, SheetHeader, SheetTitle } from "@/components/ui/sheet";
import { toast } from "sonner";
import { Loader2, Save } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { Form, FormField, FormItem, FormLabel, FormControl } from "@/components/ui/form";
import { useForm } from "react-hook-form";

interface UserInfoEditorProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  user: {
    id: string;
    name: string;
    email: string;
    phone: string;
    firstName?: string;
    lastName?: string;
  };
  onUserUpdated: () => void;
}

const UserInfoEditor: React.FC<UserInfoEditorProps> = ({ 
  open, 
  onOpenChange, 
  user, 
  onUserUpdated 
}) => {
  const [isSaving, setIsSaving] = useState(false);
  
  // Split the name into first and last name if needed
  const nameParts = user.name.split(" ");
  const initialFirstName = user.firstName || nameParts[0] || "";
  const initialLastName = user.lastName || nameParts.slice(1).join(" ") || "";

  const form = useForm({
    defaultValues: {
      firstName: initialFirstName,
      lastName: initialLastName,
      email: user.email,
      phone: user.phone,
    }
  });

  const handleSubmit = async (data: any) => {
    setIsSaving(true);
    try {
      console.log("Updating user info:", user.id, data);
      
      // Update user info in profiles table
      const { error } = await supabase
        .from('profiles')
        .update({
          first_name: data.firstName,
          last_name: data.lastName,
          email: data.email,
        })
        .eq('id', user.id);
      
      if (error) {
        console.error("Error updating profile:", error);
        throw error;
      }
      
      toast.success("User information updated successfully");
      onUserUpdated();
      onOpenChange(false);
    } catch (error) {
      console.error("Error updating user information:", error);
      toast.error("Failed to update user information. Please try again.");
    } finally {
      setIsSaving(false);
    }
  };
  
  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent className="w-full sm:max-w-lg">
        <SheetHeader className="mb-6">
          <SheetTitle>Edit User Information</SheetTitle>
          <SheetDescription>
            Update contact details for {user.name}
          </SheetDescription>
        </SheetHeader>
        
        <Form {...form}>
          <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-4">
            <FormField
              control={form.control}
              name="firstName"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>First Name</FormLabel>
                  <FormControl>
                    <Input {...field} />
                  </FormControl>
                </FormItem>
              )}
            />
            
            <FormField
              control={form.control}
              name="lastName"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Last Name</FormLabel>
                  <FormControl>
                    <Input {...field} />
                  </FormControl>
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
                    <Input {...field} type="email" />
                  </FormControl>
                </FormItem>
              )}
            />
            
            <FormField
              control={form.control}
              name="phone"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Phone Number</FormLabel>
                  <FormControl>
                    <Input {...field} type="tel" />
                  </FormControl>
                </FormItem>
              )}
            />
            
            <div className="flex justify-end gap-3 pt-4">
              <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
                Cancel
              </Button>
              <Button type="submit" disabled={isSaving}>
                {isSaving ? (
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                ) : (
                  <Save className="h-4 w-4 mr-2" />
                )}
                Save Changes
              </Button>
            </div>
          </form>
        </Form>
      </SheetContent>
    </Sheet>
  );
};

export default UserInfoEditor;
