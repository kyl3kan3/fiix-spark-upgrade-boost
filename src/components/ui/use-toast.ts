
import { toast } from "sonner";

// Re-export toast from sonner for consistent usage throughout the app
export { toast };

// For backwards compatibility with components using the old shadcn/ui toast
export const useToast = () => {
  return {
    toast: (props: any) => {
      if (typeof props === 'string') {
        toast(props);
      } else {
        const { title, description, variant } = props;
        if (variant === 'destructive') {
          toast.error(title, { description });
        } else {
          toast(title, { description });
        }
      }
    }
  };
};
