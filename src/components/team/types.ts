
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
}

export type RoleColorMap = {
  [key: string]: string;
};
