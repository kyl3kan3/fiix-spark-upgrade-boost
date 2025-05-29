
export interface TeamProfileData {
  role: string | null;
  company_name?: string;
  company_id: string;
  first_name?: string;
  last_name?: string;
  [key: string]: any;
}

export interface TeamProfileResult {
  profileData: TeamProfileData | null;
  isLoading: boolean;
  error: string | null;
  userId: string | null;
  role: string | null;
  isAdmin: boolean;
  companyName: string | undefined;
  refreshProfile: () => Promise<any | null>;
}
