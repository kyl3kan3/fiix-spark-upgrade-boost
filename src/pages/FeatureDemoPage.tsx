import React, { useEffect } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { Helmet } from "react-helmet";
import { supabase } from "@/integrations/supabase/client";
import Navbar from "../components/Navbar";
import Footer from "../components/Footer";
import FeatureDemo from "../components/FeatureDemo";

const FeatureDemoPage = () => {
  const navigate = useNavigate();
  const { title } = useParams<{ title: string }>();
  const pretty = (title ?? "Feature")
    .replace(/-/g, " ")
    .replace(/\b\w/g, (c) => c.toUpperCase());

  // Removed the redirect logic that was here previously

  return (
    <div className="min-h-screen flex flex-col bg-gray-50">
      <Helmet>
        <title>{`${pretty} — MaintenEase Feature`}</title>
        <meta name="description" content={`See how the ${pretty} feature in MaintenEase helps maintenance teams streamline operations, track assets, and complete work faster.`} />
        <link rel="canonical" href={`https://maintenease.com/feature/${title ?? ""}`} />
        <meta property="og:title" content={`${pretty} — MaintenEase Feature`} />
        <meta property="og:description" content={`How the ${pretty} feature in MaintenEase helps maintenance teams.`} />
        <meta property="og:url" content={`https://maintenease.com/feature/${title ?? ""}`} />
        <meta property="og:type" content="article" />
      </Helmet>
      <Navbar />
      <main className="flex-grow pt-8 pb-16">
        <FeatureDemo />
      </main>
      <Footer />
    </div>
  );
};

export default FeatureDemoPage;
