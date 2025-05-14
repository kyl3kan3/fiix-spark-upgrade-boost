
import React from "react";
import { Button } from "@/components/ui/button";
import { ProfileFormData } from "./types";

interface ProfileFormProps {
  form: ProfileFormData;
  isSaving: boolean;
  onFormChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  onSubmit: (e: React.FormEvent) => Promise<boolean>;
  onCancel: () => void;
}

export const ProfileForm: React.FC<ProfileFormProps> = ({
  form,
  isSaving,
  onFormChange,
  onSubmit,
  onCancel,
}) => {
  return (
    <form onSubmit={onSubmit} className="space-y-4" aria-label="Edit profile form">
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-6 gap-y-2">
        <div>
          <label htmlFor="first_name" className="block text-xs font-semibold mb-1">First Name</label>
          <input
            id="first_name"
            type="text"
            name="first_name"
            value={form.first_name}
            onChange={onFormChange}
            className="w-full border rounded py-2 px-3"
            disabled={isSaving}
            aria-required="true"
            aria-label="First Name"
          />
        </div>
        <div>
          <label htmlFor="last_name" className="block text-xs font-semibold mb-1">Last Name</label>
          <input
            id="last_name"
            type="text"
            name="last_name"
            value={form.last_name}
            onChange={onFormChange}
            className="w-full border rounded py-2 px-3"
            disabled={isSaving}
            aria-required="true"
            aria-label="Last Name"
          />
        </div>
        <div>
          <label htmlFor="email" className="block text-xs font-semibold mb-1">Email</label>
          <input
            id="email"
            type="email"
            name="email"
            value={form.email}
            onChange={onFormChange}
            className="w-full border rounded py-2 px-3"
            disabled={isSaving}
            aria-required="true"
            aria-label="Email"
          />
        </div>
        <div>
          <label htmlFor="phone_number" className="block text-xs font-semibold mb-1">Phone Number</label>
          <input
            id="phone_number"
            type="tel"
            name="phone_number"
            value={form.phone_number}
            onChange={onFormChange}
            className="w-full border rounded py-2 px-3"
            disabled={isSaving}
            aria-label="Phone Number"
          />
        </div>
      </div>
      <div className="flex gap-2">
        <Button type="submit" disabled={isSaving} aria-label="Save changes">
          {isSaving ? "Saving..." : "Save Changes"}
        </Button>
        <Button 
          type="button" 
          variant="outline" 
          onClick={onCancel} 
          disabled={isSaving} 
          aria-label="Cancel editing"
        >
          Cancel
        </Button>
      </div>
    </form>
  );
};
