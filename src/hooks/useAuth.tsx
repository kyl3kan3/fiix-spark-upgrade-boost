
// Re-export from auth context for backward compatibility
import { useAuth as useAuthFromContext } from "@/contexts/AuthContext";

export const useAuth = useAuthFromContext;
