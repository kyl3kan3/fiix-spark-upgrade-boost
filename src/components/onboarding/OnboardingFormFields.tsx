
import React from "react";
import { Input } from "@/components/ui/input";
import { Checkbox } from "@/components/ui/checkbox";
import { FormState, InviteDetails } from "../hooks/onboarding/types";

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
        <label className="block">Full Name</label>
        <Input
          name="fullName"
          placeholder="Jane Doe"
          value={state.fullName}
          required
          onChange={handleChange}
        />
      </div>
      
      <div>
        <label className="block">Role/Title</label>
        <Input
          name="role"
          placeholder="Facilities Manager"
          value={state.role}
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
            value={state.company}
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
          value={state.email}
          onChange={handleChange}
          readOnly={!!state.email}
        />
      </div>
      
      <div className="flex items-center gap-3">
        <Checkbox
          checked={state.notifications}
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
