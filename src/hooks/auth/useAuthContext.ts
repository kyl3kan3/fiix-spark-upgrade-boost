
import { useContext } from "react";
import { AuthContext } from "@/providers/authContextShared";

export function useAuthContext() {
 const context = useContext(AuthContext);
 
 if (context === undefined) {
 throw new Error('useAuth must be used within an AuthProvider');
 }
 
 return context;
}
