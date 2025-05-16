
import CompanyInfoSetup from "./CompanyInfoSetup";
import UserRolesSetup from "./UserRolesSetup";
import AssetCategoriesSetup from "./AssetCategoriesSetup";
import LocationsSetup from "./LocationsSetup";
import MaintenanceScheduleSetup from "./MaintenanceScheduleSetup";
import NotificationSetup from "./NotificationSetup";
import IntegrationsSetup from "./IntegrationsSetup";
import DashboardCustomizationSetup from "./DashboardCustomizationSetup";
import SetupComplete from "./SetupComplete";
import { SetupStepComponentProps } from "./SetupContainer";

// Create a type for the setup step components
type SetupStepComponent = React.ComponentType<SetupStepComponentProps>;

export const steps = [
  { id: "company-info", label: "Company Info", component: CompanyInfoSetup as SetupStepComponent },
  { id: "user-roles", label: "User Roles", component: UserRolesSetup as SetupStepComponent },
  { id: "asset-categories", label: "Asset Categories", component: AssetCategoriesSetup as SetupStepComponent },
  { id: "locations", label: "Locations", component: LocationsSetup as SetupStepComponent },
  { id: "maintenance-schedules", label: "Schedules", component: MaintenanceScheduleSetup as SetupStepComponent },
  { id: "notifications", label: "Notifications", component: NotificationSetup as SetupStepComponent },
  { id: "integrations", label: "Integrations", component: IntegrationsSetup as SetupStepComponent },
  { id: "dashboard", label: "Dashboard", component: DashboardCustomizationSetup as SetupStepComponent },
  { id: "complete", label: "Complete", component: SetupComplete as SetupStepComponent }
];
