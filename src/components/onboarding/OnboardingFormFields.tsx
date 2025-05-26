
import React from "react";
import { Input } from "@/components/ui/input";
import { Checkbox } from "@/components/ui/checkbox";
import { FormState, InviteDetails } from "@/hooks/onboarding/types";

interface FormFieldsProps {
  state: FormState;
  isInvited: boolean;
  inviteDetails: InviteDetails | null;
  handleChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  handleCheckbox: (checked: boolean) => void;
}

const OnboardingFormFields: React.FC<FormFieldsProps> = ({
  state,
  isInvited,
  inviteDetails,
  handleChange,
  handleCheckbox
}) => {
  return (
    <>
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">
          Full Name <span className="text-red-500">*</span>
        </label>
        <Input
          name="fullName"
          placeholder="Enter your full name"
          value={state.fullName}
          required
          onChange={handleChange}
          className="w-full"
        />
        {!state.fullName && (
          <p className="text-red-500 text-sm mt-1">Full name is required</p>
        )}
      </div>
      
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">
          Role/Title <span className="text-red-500">*</span>
        </label>
        <Input
          name="role"
          placeholder="e.g., Facilities Manager, Technician"
          value={state.role}
          required
          onChange={handleChange}
          className="w-full"
        />
      </div>

      {isInvited ? (
        <div className="p-4 bg-green-50 border border-green-200 rounded-md">
          <p className="text-green-700 font-medium">
            You've been invited to join a company!
          </p>
          <p className="text-sm text-green-600 mt-1">
            Complete the onboarding to join.
          </p>
        </div>
      ) : (
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Company/Organization Name <span className="text-red-500">*</span>
          </label>
          <Input
            name="company"
            placeholder="Enter your company name"
            value={state.company}
            required
            onChange={handleChange}
            className="w-full"
          />
        </div>
      )}
      
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">
          Contact Email <span className="text-red-500">*</span>
        </label>
        <Input
          name="email"
          type="email"
          required
          value={state.email}
          onChange={handleChange}
          readOnly={!!state.email}
          className="w-full"
        />
      </div>
      
      <div className="flex items-center gap-3">
        <Checkbox
          checked={state.notifications}
          onCheckedChange={handleCheckbox}
          id="onboarding-notifications"
        />
        <label htmlFor="onboarding-notifications" className="text-sm text-gray-700">
          Enable notifications about important updates
        </label>
      </div>
    </>
  );
};

export default OnboardingFormFields;
