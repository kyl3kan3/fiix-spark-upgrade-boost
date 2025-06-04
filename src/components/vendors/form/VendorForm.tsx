
import React from "react";
import { Button } from "@/components/ui/button";
import { Form } from "@/components/ui/form";
import { useVendorForm } from "@/hooks/vendors/useVendorForm";
import VendorFormFields from "./VendorFormFields";

const VendorForm: React.FC = () => {
  const { form, isEditing, onSubmit, isPending, navigate } = useVendorForm();

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
        <VendorFormFields form={form} />

        <div className="flex gap-4">
          <Button
            type="button"
            variant="outline"
            onClick={() => navigate("/vendors")}
          >
            Cancel
          </Button>
          <Button type="submit" disabled={isPending}>
            {isPending
              ? "Saving..."
              : isEditing
              ? "Update Vendor"
              : "Create Vendor"}
          </Button>
        </div>
      </form>
    </Form>
  );
};

export default VendorForm;
