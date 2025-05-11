
export interface TeamMember {
  id: number;
  name: string;
  role: string;
  email: string;
  phone: string;
  avatar: string;
  joined: string;
  lastActive: string;
}

export interface RoleColorMap {
  [key: string]: string;
}
