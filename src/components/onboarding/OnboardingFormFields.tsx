
import React from "react";
import { Input } from "@/components/ui/input";
import { Checkbox } from "@/components/ui/checkbox";

interface FormFieldsProps {
  company: string;
  fullName: string;
  role: string;
  email: string;
  notifications: boolean;
  isInvited: boolean;
  handleChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  handleCheckbox: (checked: boolean) => void;
}

const OnboardingFormFields: React.FC<FormFieldsProps> = ({
  company,
  fullName,
  role,
  email,
  notifications,
  isInvited,
  handleChange,
  handleCheckbox
}) => {
  return (
    <>
      <div>
        <label className="block">Full Name</label>
        <Input
          name="fullName"
          placeholder="Jane Doe"
          value={fullName}
          required
          onChange={handleChange}
        />
      </div>
      
      <div>
        <label className="block">Role/Title</label>
        <Input
          name="role"
          placeholder="Facilities Manager"
          value={role}
          required
          onChange={handleChange}
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
          <label className="block">Company/Organization Name</label>
          <Input
            name="company"
            placeholder="Acme Corp"
            value={company}
            required
            onChange={handleChange}
          />
        </div>
      )}
      
      <div>
        <label className="block">Contact Email</label>
        <Input
          name="email"
          type="email"
          required
          value={email}
          onChange={handleChange}
          readOnly={!!email}
        />
      </div>
      
      <div className="flex items-center gap-3">
        <Checkbox
          checked={notifications}
          onCheckedChange={handleCheckbox}
          id="onboarding-notifications"
        />
        <label htmlFor="onboarding-notifications">
          Enable notifications about important updates
        </label>
      </div>
    </>
  );
};

export default OnboardingFormFields;
