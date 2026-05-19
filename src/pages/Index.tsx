
import { Helmet } from "react-helmet";
import Navbar from "@/components/Navbar";
import Hero from "@/components/Hero";
import Features from "@/components/Features";
import Testimonials from "@/components/Testimonials";
import CTA from "@/components/CTA";
import Footer from "@/components/Footer";

const Index = () => {
  return (
    <div className="min-h-screen flex flex-col bg-background text-foreground">
      <Helmet>
        <title>MaintenEase — Maintenance Management Software</title>
        <meta name="description" content="MaintenEase helps maintenance teams organize assets, schedule work orders, run inspections, and optimize operations from one modern platform." />
        <link rel="canonical" href="https://maintenease.com/" />
        <meta property="og:title" content="MaintenEase — Maintenance Management Software" />
        <meta property="og:description" content="Organize assets, schedule work orders, and run inspections from one modern maintenance platform." />
        <meta property="og:url" content="https://maintenease.com/" />
        <meta property="og:type" content="website" />
      </Helmet>
      <Navbar />
      <main className="flex-1">
        <Hero />
        <Features />
        <Testimonials />
        <CTA />
      </main>
      <Footer />
    </div>
  );
};

export default Index;
