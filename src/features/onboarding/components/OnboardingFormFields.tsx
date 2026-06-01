
import React from "react";
import { Checkbox } from "@/components/ui/checkbox";
import MaterialIcon from "@/components/ui/material-icon";
import { FormState, InviteDetails } from "@/features/onboarding/hooks/types";

interface FormFieldsProps {
  state: FormState;
  isInvited: boolean;
  inviteDetails: InviteDetails | null;
  handleChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  handleCheckbox: (checked: boolean) => void;
  setAccountType?: (type: "personal" | "company") => void;
}

const OnboardingFormFields: React.FC<FormFieldsProps> = ({
  state,
  isInvited,
  inviteDetails,
  handleChange,
  handleCheckbox,
  setAccountType,
}) => {
  const fieldClass =
    "bg-surface-container-low border-none focus:ring-2 focus:ring-primary transition-all font-body-md outline-none";
  const labelClass =
    "block font-label-md text-label-md text-on-surface mb-2 transition-colors group-focus-within:text-primary";

  return (
    <>
      {!isInvited && setAccountType && (
        <div className="group">
          <label className={labelClass}>Account type</label>
          <div className="grid grid-cols-2 gap-2">
            <button
              type="button"
              onClick={() => setAccountType("personal")}
              className={`py-3 px-4 rounded-lg border font-label-md text-label-md flex items-center gap-2 transition-all ${
                state.accountType === "personal"
                  ? "border-2 border-primary bg-primary/5 text-primary"
                  : "border border-outline-variant hover:border-primary hover:bg-primary/5"
              }`}
            >
              <MaterialIcon name="person" />
              Personal
            </button>
            <button
              type="button"
              onClick={() => setAccountType("company")}
              className={`py-3 px-4 rounded-lg border font-label-md text-label-md flex items-center gap-2 transition-all ${
                state.accountType === "company"
                  ? "border-2 border-primary bg-primary/5 text-primary"
                  : "border border-outline-variant hover:border-primary hover:bg-primary/5"
              }`}
            >
              <MaterialIcon name="domain" />
              Company
            </button>
          </div>
          <p className="font-label-sm text-label-sm text-on-surface-variant mt-1.5">
            {state.accountType === "personal"
              ? "Use MaintenEase solo. You can create a company later."
              : "Set up a company workspace and invite your team."}
          </p>
        </div>
      )}

      <div className="group">
        <label className={labelClass}>Full Name <span className="text-error">*</span></label>
        <input
          name="fullName"
          placeholder="Enter your full name"
          value={state.fullName}
          required
          onChange={handleChange}
          className={`w-full h-12 px-4 rounded-lg ${fieldClass}`}
        />
      </div>

      <div className="group">
        <label className={labelClass}>Role / Title <span className="text-error">*</span></label>
        <input
          name="role"
          placeholder="e.g., Facilities Manager, Technician"
          value={state.role}
          required
          onChange={handleChange}
          className={`w-full h-12 px-4 rounded-lg ${fieldClass}`}
        />
      </div>

      {isInvited ? (
        <div className="p-4 bg-success/10 border border-success/30 rounded-lg">
          <p className="font-label-md text-label-md text-success">You have been invited to join a company!</p>
          <p className="font-body-md text-body-md text-on-surface-variant mt-1">Complete the onboarding to join.</p>
        </div>
      ) : state.accountType === "company" ? (
        <div className="group">
          <label className={labelClass}>Company / Organization Name <span className="text-error">*</span></label>
          <input
            name="company"
            placeholder="Enter your company name"
            value={state.company}
            required
            onChange={handleChange}
            className={`w-full h-12 px-4 rounded-lg ${fieldClass}`}
          />
        </div>
      ) : null}

      <div className="group">
        <label className={labelClass}>Contact Email <span className="text-error">*</span></label>
        <input
          name="email"
          type="email"
          required
          value={state.email}
          onChange={handleChange}
          className={`w-full h-12 px-4 rounded-lg ${fieldClass}`}
        />
      </div>

      <div className="group">
        <label className={labelClass}>
          Phone number{" "}
          <span className="normal-case font-normal text-on-surface-variant tracking-normal">(optional, for SMS alerts)</span>
        </label>
        <input
          name="phoneNumber"
          type="tel"
          placeholder="+15558675310"
          value={state.phoneNumber}
          onChange={handleChange}
          className={`w-full h-12 px-4 rounded-lg ${fieldClass}`}
        />
        <p className="font-label-sm text-label-sm text-on-surface-variant mt-1">Use E.164 format (start with +country code).</p>
      </div>

      <div className="flex items-center gap-3">
        <Checkbox
          checked={state.notifications}
          onCheckedChange={handleCheckbox}
          id="onboarding-notifications"
          className="border-primary data-[state=checked]:bg-primary"
        />
        <label htmlFor="onboarding-notifications" className="font-body-md text-body-md text-on-surface cursor-pointer">
          Enable notifications about important updates
        </label>
      </div>
    </>
  );
};

export default OnboardingFormFields;
