
import React from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Form } from "@/components/ui/form";
import { Building2, Phone, MapPin, FileText } from "lucide-react";
import { VendorFormData } from "@/services/vendorService";
import { vendorFormSchema, VendorFormValues } from "./form/vendorFormSchema";
import BasicInformationSection from "./form/BasicInformationSection";
import ContactInformationSection from "./form/ContactInformationSection";
import AddressInformationSection from "./form/AddressInformationSection";
import DescriptionSection from "./form/DescriptionSection";
import FormActions from "./form/FormActions";

interface VendorFormProps {
  initialData?: Partial<VendorFormData>;
  onSubmit: (data: VendorFormData) => void;
  isLoading?: boolean;
}

const VendorForm: React.FC<VendorFormProps> = ({
  initialData,
  onSubmit,
  isLoading = false,
}) => {
  const form = useForm<VendorFormValues>({
    resolver: zodResolver(vendorFormSchema),
    defaultValues: {
      name: initialData?.name || "",
      email: initialData?.email || "",
      phone: initialData?.phone || "",
      contact_person: initialData?.contact_person || "",
      contact_title: initialData?.contact_title || "",
      vendor_type: (initialData?.vendor_type as "service" | "supplier" | "contractor" | "consultant") || "service",
      status: (initialData?.status as "active" | "inactive" | "suspended") || "active",
      address: initialData?.address || "",
      city: initialData?.city || "",
      state: initialData?.state || "",
      zip_code: initialData?.zip_code || "",
      website: initialData?.website || "",
      description: initialData?.description || "",
      rating: initialData?.rating || null,
    },
  });

  const handleSubmit = (values: VendorFormValues) => {
    const formData: VendorFormData = {
      name: values.name,
      vendor_type: values.vendor_type,
      status: values.status,
      email: values.email || "",
      phone: values.phone || "",
      contact_person: values.contact_person || "",
      contact_title: values.contact_title || "",
      address: values.address || "",
      city: values.city || "",
      state: values.state || "",
      zip_code: values.zip_code || "",
      website: values.website || "",
      description: values.description || "",
      rating: values.rating || null,
    };
    onSubmit(formData);
  };

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-6">
        {/* Basic + Contact — two-column layout inside a single card */}
        <div className="bg-card border border-border rounded-lg shadow-sm p-6 space-y-6">
          <div className="flex items-center gap-3 mb-2">
            <div className="h-8 w-8 rounded-full bg-primary/10 flex items-center justify-center shrink-0">
              <Building2 className="h-4 w-4 text-primary" />
            </div>
            <h2 className="font-headline text-lg font-semibold text-foreground">Basic Information</h2>
          </div>
          <BasicInformationSection control={form.control} />
        </div>

        <div className="bg-card border border-border rounded-lg shadow-sm p-6 space-y-6">
          <div className="flex items-center gap-3 mb-2">
            <div className="h-8 w-8 rounded-full bg-primary/10 flex items-center justify-center shrink-0">
              <Phone className="h-4 w-4 text-primary" />
            </div>
            <h2 className="font-headline text-lg font-semibold text-foreground">Contact Information</h2>
          </div>
          <ContactInformationSection control={form.control} />
        </div>

        <div className="bg-card border border-border rounded-lg shadow-sm p-6 space-y-6">
          <div className="flex items-center gap-3 mb-2">
            <div className="h-8 w-8 rounded-full bg-primary/10 flex items-center justify-center shrink-0">
              <MapPin className="h-4 w-4 text-primary" />
            </div>
            <h2 className="font-headline text-lg font-semibold text-foreground">Address Information</h2>
          </div>
          <AddressInformationSection control={form.control} />
        </div>

        <div className="bg-card border border-border rounded-lg shadow-sm p-6 space-y-6">
          <div className="flex items-center gap-3 mb-2">
            <div className="h-8 w-8 rounded-full bg-primary/10 flex items-center justify-center shrink-0">
              <FileText className="h-4 w-4 text-primary" />
            </div>
            <h2 className="font-headline text-lg font-semibold text-foreground">Notes & Description</h2>
          </div>
          <DescriptionSection control={form.control} />
        </div>

        <FormActions isLoading={isLoading} />
      </form>
    </Form>
  );
};

export default VendorForm;
