
import React, { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Sheet, SheetContent, SheetDescription, SheetHeader, SheetTitle } from "@/components/ui/sheet";
import { toast } from "sonner";
import { Loader2, Save } from "lucide-react";
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
  onUserUpdated: (updates: {
    firstName?: string;
    lastName?: string;
    email?: string;
    phone?: string;
  }) => void;
}

const UserInfoEditor: React.FC<UserInfoEditorProps> = ({ 
  open, 
  onOpenChange, 
  user, 
  onUserUpdated 
}) => {
  const [isSaving, setIsSaving] = useState(false);
  
  // Use provided firstName/lastName if available, otherwise split the name
  const initialFirstName = user.firstName || user.name.split(" ")[0] || "";
  const initialLastName = user.lastName || user.name.split(" ").slice(1).join(" ") || "";

  const form = useForm({
    defaultValues: {
      firstName: initialFirstName,
      lastName: initialLastName,
      email: user.email,
      phone: user.phone,
    }
  });

  const handleSubmit = (data: any) => {
    setIsSaving(true);
    try {
      console.log("Submitting user info update:", data);
      
      // Call the onUserUpdated callback with all form data including phone
      onUserUpdated({
        firstName: data.firstName,
        lastName: data.lastName,
        email: data.email,
        phone: data.phone
      });
      
      toast.success("User information updated successfully");
      setIsSaving(false);
      onOpenChange(false); // Close dialog after successful update
    } catch (error) {
      console.error("Error in form submission:", error);
      toast.error("Failed to update user information. Please try again.");
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
