
import React, { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import Navbar from "../components/Navbar";
import Footer from "../components/Footer";
import FeatureDemo from "../components/FeatureDemo";

const FeatureDemoPage = () => {
  const navigate = useNavigate();

  useEffect(() => {
    // Check if user is already logged in
    const checkSession = async () => {
      const { data } = await supabase.auth.getSession();
      if (data.session) {
        // Redirect logged in users to dashboard
        navigate("/dashboard");
      }
    };
    
    checkSession();
  }, [navigate]);

  return (
    <div className="min-h-screen flex flex-col">
      <Navbar />
      <main className="flex-grow">
        <FeatureDemo />
      </main>
      <Footer />
    </div>
  );
};

export default FeatureDemoPage;
