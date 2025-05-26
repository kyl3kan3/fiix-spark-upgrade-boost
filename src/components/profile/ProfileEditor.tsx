
import React from "react";
import { Button } from "@/components/ui/button";
import { ProfileFormData } from "./types";

interface ProfileEditorProps {
  formData: ProfileFormData;
  errors: Partial<Record<keyof ProfileFormData, string>>;
  isSaving: boolean;
  onInputChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  onSubmit: (e: React.FormEvent) => Promise<boolean>;
  onCancel: () => void;
}

export const ProfileEditor: React.FC<ProfileEditorProps> = ({
  formData,
  errors,
  isSaving,
  onInputChange,
  onSubmit,
  onCancel,
}) => {
  return (
    <form onSubmit={onSubmit} className="space-y-4" aria-label="Edit profile form">
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-6 gap-y-2">
        <div>
          <label htmlFor="first_name" className="block text-xs font-semibold mb-1">
            First Name
          </label>
          <input
            id="first_name"
            type="text"
            name="first_name"
            value={formData.first_name}
            onChange={onInputChange}
            className={`w-full border rounded py-2 px-3 ${
              errors.first_name ? 'border-red-500' : 'border-gray-300'
            }`}
            disabled={isSaving}
            aria-required="true"
            aria-label="First Name"
          />
          {errors.first_name && (
            <p className="text-red-500 text-xs mt-1">{errors.first_name}</p>
          )}
        </div>
        
        <div>
          <label htmlFor="last_name" className="block text-xs font-semibold mb-1">
            Last Name
          </label>
          <input
            id="last_name"
            type="text"
            name="last_name"
            value={formData.last_name}
            onChange={onInputChange}
            className={`w-full border rounded py-2 px-3 ${
              errors.last_name ? 'border-red-500' : 'border-gray-300'
            }`}
            disabled={isSaving}
            aria-required="true"
            aria-label="Last Name"
          />
          {errors.last_name && (
            <p className="text-red-500 text-xs mt-1">{errors.last_name}</p>
          )}
        </div>
        
        <div>
          <label htmlFor="email" className="block text-xs font-semibold mb-1">
            Email
          </label>
          <input
            id="email"
            type="email"
            name="email"
            value={formData.email}
            readOnly
            className="w-full border rounded py-2 px-3 bg-gray-100 border-gray-300 cursor-not-allowed"
            disabled
            aria-label="Email (read-only)"
          />
          <p className="text-gray-500 text-xs mt-1">Email cannot be changed</p>
        </div>
        
        <div>
          <label htmlFor="phone_number" className="block text-xs font-semibold mb-1">
            Phone Number
          </label>
          <input
            id="phone_number"
            type="tel"
            name="phone_number"
            value={formData.phone_number}
            onChange={onInputChange}
            className={`w-full border rounded py-2 px-3 ${
              errors.phone_number ? 'border-red-500' : 'border-gray-300'
            }`}
            disabled={isSaving}
            aria-label="Phone Number"
          />
          {errors.phone_number && (
            <p className="text-red-500 text-xs mt-1">{errors.phone_number}</p>
          )}
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
