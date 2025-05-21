
import { toast } from "sonner";

/**
 * Show a notification when company setup is completed
 */
export const showCompanySetupCompletedNotification = () => {
  toast.success("Company setup completed");
};

/**
 * Show a notification for company association status
 * @param found Whether company association was found
 */
export const showCompanyAssociationNotification = (found: boolean) => {
  if (found) {
    toast.success("Company association found. Refreshing...");
  } else {
    toast.error("No company association found. Please complete setup.");
  }
};

/**
 * Navigate to dashboard with a slight delay
 * to ensure all state is updated
 */
export const navigateToDashboard = () => {
  // Force refresh the page after a short delay to ensure all state is updated
  setTimeout(() => {
    window.location.href = "/dashboard";
  }, 1000);
};
