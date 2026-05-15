import React, { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import Navbar from "../components/Navbar";
import Footer from "../components/Footer";
import FeatureDemo from "../components/FeatureDemo";

const FeatureDemoPage = () => {
  const navigate = useNavigate();

  // Removed the redirect logic that was here previously

  return (
    <div className="min-h-screen flex flex-col bg-gray-50">
      <Navbar />
      <main className="flex-grow pt-8 pb-16">
        <FeatureDemo />
      </main>
      <Footer />
    </div>
  );
};

export default FeatureDemoPage;
