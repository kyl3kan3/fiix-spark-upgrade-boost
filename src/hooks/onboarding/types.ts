
export interface FormState {
  company: string;
  fullName: string;
  role: string;
  email: string;
  notifications: boolean;
}

export interface InviteDetails {
  id: string;
  organization_id: string;
  role: string;
  [key: string]: any;
}

export interface UseOnboardingReturn {
  state: FormState;
  submitting: boolean;
  isInvited: boolean;
  inviteDetails: InviteDetails | null;
  handleChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  handleCheckbox: (v: boolean) => void;
  handleSubmit: (e: React.FormEvent) => void;
}
