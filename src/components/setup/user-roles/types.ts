
export interface RolePermission {
  id: string;
  name: string;
  description: string;
  categories: string[];
}

export interface Role {
  id: string;
  name: string;
  description: string;
  permissions: string[];
  isDefault?: boolean;
  isEditable?: boolean;
}

export interface UserRolesSetupProps {
  data: any;
  onUpdate: (data: any) => void;
}
