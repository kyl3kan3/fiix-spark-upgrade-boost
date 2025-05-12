
import CompanyInfoSetup from "./CompanyInfoSetup";
import UserRolesSetup from "./UserRolesSetup";
import AssetCategoriesSetup from "./AssetCategoriesSetup";
import MaintenanceScheduleSetup from "./MaintenanceScheduleSetup";
import NotificationSetup from "./NotificationSetup";
import IntegrationsSetup from "./IntegrationsSetup";
import DashboardCustomizationSetup from "./DashboardCustomizationSetup";
import SetupComplete from "./SetupComplete";

export const steps = [
  { id: "company-info", label: "Company Info", component: CompanyInfoSetup },
  { id: "user-roles", label: "User Roles", component: UserRolesSetup },
  { id: "asset-categories", label: "Asset Categories", component: AssetCategoriesSetup },
  { id: "maintenance-schedules", label: "Schedules", component: MaintenanceScheduleSetup },
  { id: "notifications", label: "Notifications", component: NotificationSetup },
  { id: "integrations", label: "Integrations", component: IntegrationsSetup },
  { id: "dashboard", label: "Dashboard", component: DashboardCustomizationSetup },
  { id: "complete", label: "Complete", component: SetupComplete }
];
