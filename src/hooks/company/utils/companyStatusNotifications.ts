
import { toast } from "sonner";

/**
 * Show notification for when company setup is completed
 */
export const showCompanySetupCompletedNotification = () => {
  toast.success("Company setup completed successfully!", {
    description: "You're all set to use the application.",
    duration: 5000
  });
};

/**
 * Navigate to the dashboard
 */
export const navigateToDashboard = () => {
  // Use a timeout to allow the toast to be visible before navigation
  setTimeout(() => {
    window.location.href = "/dashboard";
  }, 1000);
};

/**
 * Show notification based on company association result
 */
export const showCompanyAssociationNotification = (found: boolean) => {
  if (found) {
    toast.success("Company association found!", {
      description: "You are now connected to your company.",
      duration: 4000
    });
  } else {
    toast.error("No company association found", {
      description: "Please complete the setup process.",
      duration: 4000
    });
  }
};
