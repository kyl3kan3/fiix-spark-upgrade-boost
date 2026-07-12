
import React from "react";
import { Input } from "@/components/ui/input";
import { Checkbox } from "@/components/ui/checkbox";
import { Button } from "@/components/ui/button";
import { User, Building2 } from "lucide-react";
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
    "bg-muted border-transparent focus:border-primary focus:ring-primary focus:bg-background transition-ui";
  const labelClass =
    "block text-xs font-semibold text-muted-foreground uppercase tracking-wide mb-1.5";

  return (
    <>
      {!isInvited && setAccountType && (
        <div>
          <label className={labelClass}>Account type</label>
          <div className="grid grid-cols-2 gap-2">
            <Button
              type="button"
              variant={state.accountType === "personal" ? "default" : "outline"}
              onClick={() => setAccountType("personal")}
              className={state.accountType === "personal" ? "justify-start bg-primary text-primary-foreground" : "justify-start border-primary/20 text-primary hover:bg-primary/5"}
            >
              <User className="mr-2 h-4 w-4" />
              Personal
            </Button>
            <Button
              type="button"
              variant={state.accountType === "company" ? "default" : "outline"}
              onClick={() => setAccountType("company")}
              className={state.accountType === "company" ? "justify-start bg-primary text-primary-foreground" : "justify-start border-primary/20 text-primary hover:bg-primary/5"}
            >
              <Building2 className="mr-2 h-4 w-4" />
              Company
            </Button>
          </div>
          <p className="text-xs text-muted-foreground mt-1.5">
            {state.accountType === "personal"
              ? "Use MaintenEase solo. You can create a company later."
              : "Set up a company workspace and invite your team."}
          </p>
        </div>
      )}

      <div>
        <label className={labelClass}>Full Name <span className="text-destructive">*</span></label>
        <Input name="fullName" placeholder="Enter your full name" value={state.fullName} required onChange={handleChange} className={"w-full " + fieldClass} />
      </div>

      <div>
        <label className={labelClass}>Role / Title <span className="text-destructive">*</span></label>
        <Input name="role" placeholder="e.g., Facilities Manager, Technician" value={state.role} required onChange={handleChange} className={"w-full " + fieldClass} />
      </div>

      {isInvited ? (
        <div className="p-4 bg-success/10 border border-success/30 rounded-lg">
          <p className="text-success font-semibold text-sm">You have been invited to join a company!</p>
          <p className="text-sm text-muted-foreground mt-1">Complete the onboarding to join.</p>
        </div>
      ) : state.accountType === "company" ? (
        <div>
          <label className={labelClass}>Company / Organization Name <span className="text-destructive">*</span></label>
          <Input name="company" placeholder="Enter your company name" value={state.company} required onChange={handleChange} className={"w-full " + fieldClass} />
        </div>
      ) : null}

      <div>
        <label className={labelClass}>Contact Email <span className="text-destructive">*</span></label>
        <Input name="email" type="email" required value={state.email} onChange={handleChange} className={"w-full " + fieldClass} />
      </div>

      <div>
        <label className={labelClass}>Phone number <span className="normal-case font-normal text-muted-foreground tracking-normal">(optional, for SMS alerts)</span></label>
        <Input name="phoneNumber" type="tel" placeholder="+15558675310" value={state.phoneNumber} onChange={handleChange} className={"w-full " + fieldClass} />
        <p className="text-xs text-muted-foreground mt-1">Use E.164 format (start with +country code).</p>
      </div>

      <div className="flex items-center gap-3">
        <Checkbox checked={state.notifications} onCheckedChange={handleCheckbox} id="onboarding-notifications" className="border-primary data-[state=checked]:bg-primary" />
        <label htmlFor="onboarding-notifications" className="text-sm text-foreground cursor-pointer">Enable notifications about important updates</label>
      </div>
    </>
  );
};

export default OnboardingFormFields;
