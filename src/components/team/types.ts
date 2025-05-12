
export interface TeamMember {
  id: string | number;
  name: string;
  role: string;
  email: string;
  phone: string;
  avatar: string;
  joined: string;
  lastActive: string;
}

export type RoleColorMap = {
  administrator: string;
  manager: string;
  technician: string;
  viewer: string;
  [key: string]: string;
};
