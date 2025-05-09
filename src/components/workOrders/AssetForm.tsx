
import React from "react";
import { Button } from "@/components/ui/button";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { useToast } from "@/hooks/use-toast";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { supabase } from "@/integrations/supabase/client";
import { useNavigate } from "react-router-dom";
import { AssetFormData } from "@/types/workOrders";

// Form validation schema
const formSchema = z.object({
  name: z.string().min(2, { message: "Name must be at least 2 characters." }),
  description: z.string().optional(),
  location: z.string().optional(),
  model: z.string().optional(),
  serial_number: z.string().optional(),
  purchase_date: z.string().optional(),
  status: z.string().default("active")
});

type AssetFormProps = {
  initialData?: AssetFormData;
  assetId?: string;
  onSuccess?: () => void;
};

const AssetForm = ({ initialData, assetId, onSuccess }: AssetFormProps) => {
  const { toast } = useToast();
  const navigate = useNavigate();
  const isEditing = !!assetId;

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      name: initialData?.name || "",
      description: initialData?.description || "",
      location: initialData?.location || "",
      model: initialData?.model || "",
      serial_number: initialData?.serial_number || "",
      purchase_date: initialData?.purchase_date 
        ? new Date(initialData.purchase_date).toISOString().split("T")[0] 
        : "",
      status: initialData?.status || "active"
    },
  });

  const onSubmit = async (values: z.infer<typeof formSchema>) => {
    try {
      const assetData = {
        ...values,
        purchase_date: values.purchase_date ? values.purchase_date : null,
      };

      let response;
      
      if (isEditing) {
        response = await supabase
          .from("assets")
          .update(assetData)
          .eq("id", assetId)
          .select();
      } else {
        response = await supabase
          .from("assets")
          .insert([assetData])
          .select();
      }

      if (response.error) {
        throw response.error;
      }

      toast({
        title: isEditing ? "Asset Updated" : "Asset Created",
        description: isEditing 
          ? "The asset has been updated successfully." 
          : "A new asset has been created successfully."
      });
      
      if (onSuccess) {
        onSuccess();
      } else {
        navigate("/assets");
      }
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message || "Something went wrong",
        variant: "destructive"
      });
    }
  };

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
        <FormField
          control={form.control}
          name="name"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Asset Name</FormLabel>
              <FormControl>
                <Input placeholder="Enter asset name" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        
        <FormField
          control={form.control}
          name="description"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Description</FormLabel>
              <FormControl>
                <Textarea 
                  placeholder="Describe the asset" 
                  className="min-h-[100px]"
                  {...field} 
                  value={field.value || ""}
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <FormField
            control={form.control}
            name="location"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Location</FormLabel>
                <FormControl>
                  <Input placeholder="Asset location" {...field} value={field.value || ""} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          
          <FormField
            control={form.control}
            name="model"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Model</FormLabel>
                <FormControl>
                  <Input placeholder="Asset model" {...field} value={field.value || ""} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <FormField
            control={form.control}
            name="serial_number"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Serial Number</FormLabel>
                <FormControl>
                  <Input placeholder="Serial number" {...field} value={field.value || ""} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          
          <FormField
            control={form.control}
            name="purchase_date"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Purchase Date</FormLabel>
                <FormControl>
                  <Input type="date" {...field} value={field.value || ""} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>
        
        <div className="flex justify-end space-x-2">
          <Button 
            type="button" 
            variant="outline" 
            onClick={() => navigate("/assets")}
          >
            Cancel
          </Button>
          <Button type="submit">
            {isEditing ? "Update Asset" : "Create Asset"}
          </Button>
        </div>
      </form>
    </Form>
  );
};

export default AssetForm;
