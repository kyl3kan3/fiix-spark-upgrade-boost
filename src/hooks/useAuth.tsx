
// Re-export from new auth hooks structure for backward compatibility
import { useAuth as useNewAuth } from "./auth/AuthContext";

export const useAuth = useNewAuth;
