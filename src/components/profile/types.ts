
export interface ProfileData {
  id: string;
  email: string;
  first_name: string | null;
  last_name: string | null;
  role: string;
  company_id: string;
  company_name: string | null;
  created_at: string;
  avatar_url: string | null;
  phone_number: string | null;
}

export interface ProfileFormData {
  first_name: string;
  last_name: string;
  phone_number: string;
  email: string;
}
