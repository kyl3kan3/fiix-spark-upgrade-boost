
import { RolePermission, Role } from "./types";

export const defaultPermissions: RolePermission[] = [
  { 
    id: "work_orders_view", 
    name: "View Work Orders", 
    description: "View all work orders in the system", 
    categories: ["Work Orders"] 
  },
  { 
    id: "work_orders_create", 
    name: "Create Work Orders", 
    description: "Create new work orders", 
    categories: ["Work Orders"] 
  },
  { 
    id: "work_orders_edit", 
    name: "Edit Work Orders", 
    description: "Edit existing work orders", 
    categories: ["Work Orders"] 
  },
  { 
    id: "work_orders_delete", 
    name: "Delete Work Orders", 
    description: "Delete existing work orders", 
    categories: ["Work Orders"] 
  },
  { 
    id: "assets_view", 
    name: "View Assets", 
    description: "View asset information", 
    categories: ["Assets"] 
  },
  { 
    id: "assets_create", 
    name: "Create Assets", 
    description: "Add new assets to the system", 
    categories: ["Assets"] 
  },
  { 
    id: "assets_edit", 
    name: "Edit Assets", 
    description: "Modify asset information", 
    categories: ["Assets"] 
  },
  { 
    id: "assets_delete", 
    name: "Delete Assets", 
    description: "Remove assets from the system", 
    categories: ["Assets"] 
  },
  { 
    id: "users_view", 
    name: "View Users", 
    description: "View user accounts", 
    categories: ["Users"] 
  },
  { 
    id: "users_invite", 
    name: "Invite Users", 
    description: "Send invitations to join the system", 
    categories: ["Users"] 
  },
  { 
    id: "users_manage", 
    name: "Manage Users", 
    description: "Edit user information and roles", 
    categories: ["Users"] 
  },
  { 
    id: "reports_view", 
    name: "View Reports", 
    description: "Access system reports", 
    categories: ["Reports"] 
  },
  { 
    id: "reports_create", 
    name: "Create Reports", 
    description: "Generate custom reports", 
    categories: ["Reports"] 
  },
  { 
    id: "system_settings", 
    name: "System Settings", 
    description: "Modify system configuration", 
    categories: ["Administration"] 
  }
];

export const defaultRoles: Role[] = [
  {
    id: "administrator",
    name: "Administrator",
    description: "Full access to all system features",
    permissions: defaultPermissions.map(p => p.id),
    isDefault: true,
    isEditable: false
  },
  {
    id: "manager",
    name: "Manager",
    description: "Can manage work orders, assets, and view reports",
    permissions: [
      "work_orders_view", "work_orders_create", "work_orders_edit",
      "assets_view", "assets_create", "assets_edit",
      "users_view", "reports_view", "reports_create"
    ],
    isDefault: true,
    isEditable: true
  },
  {
    id: "technician",
    name: "Technician",
    description: "Field staff that complete work orders",
    permissions: [
      "work_orders_view", "work_orders_edit", 
      "assets_view"
    ],
    isDefault: true,
    isEditable: true
  },
  {
    id: "readonly",
    name: "Read-Only",
    description: "Can only view information, no editing capabilities",
    permissions: [
      "work_orders_view", 
      "assets_view", 
      "reports_view"
    ],
    isDefault: true,
    isEditable: true
  }
];
