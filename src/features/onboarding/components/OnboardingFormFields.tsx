
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
 return (
 <>
 {!isInvited && setAccountType && (
   <div>
     <label className="block text-sm font-medium text-foreground mb-2">
       Account type
     </label>
     <div className="grid grid-cols-2 gap-2">
       <Button
         type="button"
         variant={state.accountType === "personal" ? "default" : "outline"}
         onClick={() => setAccountType("personal")}
         className="justify-start"
       >
         <User className="mr-2 h-4 w-4" />
         Personal
       </Button>
       <Button
         type="button"
         variant={state.accountType === "company" ? "default" : "outline"}
         onClick={() => setAccountType("company")}
         className="justify-start"
       >
         <Building2 className="mr-2 h-4 w-4" />
         Company
       </Button>
     </div>
     <p className="text-xs text-muted-foreground mt-1">
       {state.accountType === "personal"
         ? "Use MaintenEase solo. You can create a company later."
         : "Set up a company workspace and invite your team."}
     </p>
   </div>
 )}

 <div>
 <label className="block text-sm font-medium text-foreground mb-1">
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
 <label className="block text-sm font-medium text-foreground mb-1">
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
  ) : state.accountType === "company" ? (
 <div>
 <label className="block text-sm font-medium text-foreground mb-1">
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
  ) : null}
 
 <div>
 <label className="block text-sm font-medium text-foreground mb-1">
 Contact Email <span className="text-red-500">*</span>
 </label>
 <Input
 name="email"
 type="email"
 required
 value={state.email}
 onChange={handleChange}
 className="w-full"
 />
 </div>

 <div>
 <label className="block text-sm font-medium text-foreground mb-1">
 Phone number <span className="text-muted-foreground">(optional, for SMS alerts)</span>
 </label>
 <Input
 name="phoneNumber"
 type="tel"
 placeholder="+15558675310"
 value={state.phoneNumber}
 onChange={handleChange}
 className="w-full"
 />
 <p className="text-xs text-muted-foreground mt-1">Use E.164 format (start with +country code).</p>
 </div>

 <div className="flex items-center gap-3">
 <Checkbox
 checked={state.notifications}
 onCheckedChange={handleCheckbox}
 id="onboarding-notifications"
 />
 <label htmlFor="onboarding-notifications" className="text-sm text-foreground">
 Enable notifications about important updates
 </label>
 </div>
 </>
 );
};

export default OnboardingFormFields;
