
import { Routes, Route } from "react-router-dom";
import { AuthProvider } from "./contexts/AuthContext";
import { Toaster } from "sonner";
import Index from "./pages/Index";
import Auth from "./pages/Auth";
import AuthPage from "./pages/AuthPage";
import CompanySetup from "./pages/CompanySetup";
import TeamSetup from "./pages/TeamSetup";
import Dashboard from "./pages/Dashboard";
import AuthGuard from "./components/auth/AuthGuard";

// Import any other components you need

function App() {
  return (
    <AuthProvider>
      <Routes>
        <Route path="/" element={<Index />} />
        <Route path="/auth" element={<AuthPage />} />
        <Route path="/auth-old" element={<Auth />} />
        <Route path="/invite/*" element={<Auth />} />
        
        {/* Protected routes */}
        <Route path="/company-setup" element={
          <AuthGuard>
            <CompanySetup />
          </AuthGuard>
        } />
        <Route path="/team-setup" element={
          <AuthGuard>
            <TeamSetup />
          </AuthGuard>
        } />
        <Route path="/dashboard" element={
          <AuthGuard>
            <Dashboard />
          </AuthGuard>
        } />
        
        {/* Add other protected routes here */}
      </Routes>
      <Toaster position="top-right" richColors />
    </AuthProvider>
  );
}

export default App;
