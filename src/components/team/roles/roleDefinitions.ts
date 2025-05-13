
export interface RoleDefinition {
  value: string;
  label: string;
}

export const roles: RoleDefinition[] = [
  { value: "administrator", label: "Administrator" },
  { value: "manager", label: "Manager" },
  { value: "technician", label: "Technician" },
  { value: "viewer", label: "Viewer" }
];

export const getRoleLabel = (roleValue: string): string => {
  const role = roles.find(r => r.value === roleValue);
  return role?.label || roleValue;
};
