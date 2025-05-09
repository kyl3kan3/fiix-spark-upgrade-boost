
import React from "react";
import Navbar from "../components/Navbar";
import Footer from "../components/Footer";
import FeatureDemo from "../components/FeatureDemo";

const FeatureDemoPage = () => {
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
