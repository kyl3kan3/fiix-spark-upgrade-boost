
import React, { useState } from "react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { toast } from "sonner";
import { useNavigate } from "react-router-dom";

interface FormState {
  company: string;
  fullName: string;
  role: string;
  teammates: string;
  email: string;
  notifications: boolean;
}

const getInitialEmail = () => {
  // Try to get from localStorage or just empty
  return localStorage.getItem("pending_auth_email") || "";
};

const OnboardingForm: React.FC = () => {
  const [state, setState] = useState<FormState>({
    company: "",
    fullName: "",
    role: "",
    teammates: "",
    email: getInitialEmail(),
    notifications: true,
  });
  const [submitting, setSubmitting] = useState(false);
  const navigate = useNavigate();

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setState({ ...state, [e.target.name]: e.target.value });
  };

  const handleCheckbox = (v: boolean) => {
    setState({ ...state, notifications: v });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);

    // Here you would save the onboarding info to Supabase etc, for now just toast
    toast.success("Onboarding complete! Redirecting to dashboard...");
    setTimeout(() => {
      navigate("/dashboard");
    }, 1000);
  };

  return (
    <form className="space-y-6" onSubmit={handleSubmit}>
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
      <div>
        <label className="block">
          Invite Teammates <span className="text-gray-400 ml-1">(separate emails by comma)</span>
        </label>
        <Input
          name="teammates"
          placeholder="team@example.com, user2@example.com"
          value={state.teammates}
          onChange={handleChange}
        />
      </div>
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
        <label htmlFor="onboarding-notifications">Enable notifications about important updates</label>
      </div>
      <div>
        <Button className="w-full bg-maintenease-600 hover:bg-maintenease-700" type="submit" disabled={submitting}>
          {submitting ? "Submitting..." : "Finish Onboarding"}
        </Button>
      </div>
    </form>
  );
};

export default OnboardingForm;
