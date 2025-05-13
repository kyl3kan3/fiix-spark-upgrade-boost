export interface TeamMember {
  id: string | number;
  name: string;
  role: string;
  email: string;
  phone: string;
  avatar: string;
  joined: string;
  lastActive: string;
  firstName?: string;
  lastName?: string;
  companyName?: string; // Added company name field
}

export type RoleColorMap = {
  [key: string]: string;
};

// This type is now imported from teamMemberFormSchema.ts 
// but we keep it here for backward compatibility
export interface TeamMemberFormValues {
  name: string;
  email: string;
  role: string;
  companyName?: string;
}
