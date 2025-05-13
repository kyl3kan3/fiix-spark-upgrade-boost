
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

export interface TeamMemberFormValues {
  name: string;
  email: string;
  role: string;
  companyName?: string;
}
