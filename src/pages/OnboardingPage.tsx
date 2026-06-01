
import React from "react";
import { Helmet } from "react-helmet-async";
import MaterialIcon from "@/components/ui/material-icon";
import OnboardingForm from "@/features/onboarding/components/OnboardingForm";
import Footer from "@/components/Footer";

const OnboardingPage = () => (
  <div className="bg-background text-on-background font-body-md min-h-screen">
    <Helmet>
      <title>Welcome to MaintenEase | Onboarding</title>
    </Helmet>
    <header className="fixed top-0 left-0 right-0 z-50 bg-surface/70 backdrop-blur-md border-b border-outline-variant/30 h-16 flex items-center px-container_padding">
      <div className="max-w-7xl mx-auto w-full flex justify-between items-center">
        <div className="font-headline-md text-headline-md font-bold text-primary">MaintenEase</div>
        <div className="flex items-center gap-4">
          <span className="font-label-md text-label-md text-on-surface-variant">
            Invitation Accepted: <span className="text-primary font-bold">Enterprise Org</span>
          </span>
          <div className="w-8 h-8 rounded-full bg-surface-container-high flex items-center justify-center border border-outline-variant/50">
            <MaterialIcon name="person" className="text-sm" />
          </div>
        </div>
      </div>
    </header>

    <main className="pt-24 pb-12 px-container_padding max-w-7xl mx-auto">
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-gutter items-start">
        <div className="lg:col-span-8 flex flex-col gap-base_unit">
          <section className="mb-gutter">
            <h1 className="font-headline-lg text-headline-lg text-primary mb-2">Welcome to MaintenEase</h1>
            <p className="font-body-lg text-body-lg text-on-surface-variant max-w-2xl">
              Your workspace is ready. Let's take a quick moment to configure your environment for peak operational efficiency.
            </p>
          </section>
          <div className="relative rounded-xl overflow-hidden shadow-sm bg-surface-container-lowest border border-outline-variant/20 aspect-video group cursor-pointer">
            <img
              alt="MaintenEase Platform Overview"
              className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
              src="https://lh3.googleusercontent.com/aida-public/AB6AXuCRGkMqLtQQ5vP53kiVk75LKtJPcHiWlLnoUWtPNSodT4eA1abMVVx2noAiRuYMnMniNQBU8DDZabvw5AexY8OCMydx9Lgdzk4W-wnZnQtIzPk5_71OwaN8fcor1IKYCzUUCtEtvjpRoY72oMFa2N2qLMthtEEubU3KwhQjfHfs3wnsDxUglqtH1aNIEVuNv0RLS_0G4V_ze366Mcffu3fEr0tt-cVVIU6kq76V1zOozHzNhXlwaB0eQ0dtY2hv8Onpp2FAWzvDi40"
            />
            <div className="absolute inset-0 bg-primary/20 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity duration-300">
              <div className="w-20 h-20 rounded-full bg-white shadow-xl flex items-center justify-center transform scale-90 group-hover:scale-100 transition-transform duration-300">
                <MaterialIcon name="play_arrow" filled className="text-primary text-4xl" />
              </div>
            </div>
            <div className="absolute bottom-4 left-4 bg-white/90 backdrop-blur-sm px-4 py-2 rounded-lg border border-white/50">
              <span className="font-label-md text-label-md text-primary flex items-center gap-2">
                <MaterialIcon name="movie" className="text-sm" />
                Quick Start Guide (2 min)
              </span>
            </div>
          </div>

          {/* Onboarding Form */}
          <div className="mt-gutter bg-surface-container-lowest rounded-xl border border-outline-variant/20 shadow-sm p-card_padding">
            <OnboardingForm />
          </div>
        </div>

        <aside className="lg:col-span-4 flex flex-col gap-gutter">
          <div className="bg-surface-container-lowest p-card_padding rounded-xl border border-outline-variant/20 shadow-sm">
            <h2 className="font-headline-md text-headline-md text-on-surface mb-6">What's Next</h2>
            <div className="flex flex-col gap-8 relative">
              <div className="absolute left-3.5 top-0 bottom-0 w-[2px] bg-surface-container-high z-0"></div>
              <div className="flex gap-4 relative z-10 group">
                <div className="w-7 h-7 rounded-full bg-success flex items-center justify-center text-white shrink-0 shadow-sm">
                  <MaterialIcon name="check" className="text-sm font-bold" />
                </div>
                <div className="flex flex-col">
                  <span className="font-label-md text-label-md text-on-surface group-hover:text-primary transition-colors">Accept Invitation</span>
                  <span className="font-label-sm text-label-sm text-on-surface-variant">Completed today</span>
                </div>
              </div>
              <div className="flex gap-4 relative z-10 group">
                <div className="w-7 h-7 rounded-full bg-primary flex items-center justify-center text-white shrink-0 shadow-md ring-4 ring-primary-fixed/30">
                  <MaterialIcon name="person_add" className="text-sm font-bold" />
                </div>
                <div className="flex flex-col">
                  <span className="font-label-md text-label-md text-primary font-bold">Complete Profile</span>
                  <span className="font-label-sm text-label-sm text-on-surface-variant">Add photo &amp; expertise</span>
                </div>
              </div>
              <div className="flex gap-4 relative z-10 group opacity-60">
                <div className="w-7 h-7 rounded-full bg-surface-container-high border-2 border-outline-variant flex items-center justify-center text-on-surface-variant shrink-0">
                  <MaterialIcon name="precision_manufacturing" className="text-sm" />
                </div>
                <div className="flex flex-col">
                  <span className="font-label-md text-label-md text-on-surface">Review Assets</span>
                  <span className="font-label-sm text-label-sm text-on-surface-variant">Tour assigned facilities</span>
                </div>
              </div>
              <div className="flex gap-4 relative z-10 group opacity-60">
                <div className="w-7 h-7 rounded-full bg-surface-container-high border-2 border-outline-variant flex items-center justify-center text-on-surface-variant shrink-0">
                  <MaterialIcon name="build" className="text-sm" />
                </div>
                <div className="flex flex-col">
                  <span className="font-label-md text-label-md text-on-surface">Work Order Lab</span>
                  <span className="font-label-sm text-label-sm text-on-surface-variant">Learn the request flow</span>
                </div>
              </div>
            </div>
          </div>
          <div className="bg-primary-container text-on-primary-container p-card_padding rounded-xl relative overflow-hidden group">
            <div className="absolute -right-8 -bottom-8 w-32 h-32 bg-on-primary-container/10 rounded-full blur-2xl group-hover:scale-150 transition-transform duration-1000"></div>
            <div className="relative z-10">
              <div className="w-10 h-10 rounded-lg bg-on-primary-container/20 flex items-center justify-center mb-4">
                <MaterialIcon name="support_agent" className="text-on-primary-container" />
              </div>
              <h3 className="font-label-md text-label-md font-bold mb-2">Need a guided tour?</h3>
              <p className="font-label-sm text-label-sm opacity-80 mb-4">Our implementation specialists are ready to help you set up.</p>
              <button className="bg-on-primary-container text-primary-container px-4 py-2 rounded-lg font-label-sm text-label-sm font-bold w-full transition-transform active:scale-95">
                Book Setup Call
              </button>
            </div>
          </div>
        </aside>
      </div>
    </main>

    <footer className="bg-on-background py-12 px-container_padding mt-24">
      <div className="max-w-7xl mx-auto flex flex-col md:flex-row justify-between items-center gap-gutter">
        <div className="font-headline-md text-headline-md font-bold text-surface-bright">MaintenEase</div>
        <div className="flex flex-wrap justify-center gap-8">
          <a className="font-label-sm text-label-sm text-outline-variant hover:text-surface-bright transition-colors uppercase tracking-widest" href="#">Product</a>
          <a className="font-label-sm text-label-sm text-outline-variant hover:text-surface-bright transition-colors uppercase tracking-widest" href="#">Solutions</a>
          <a className="font-label-sm text-label-sm text-outline-variant hover:text-surface-bright transition-colors uppercase tracking-widest" href="#">Privacy</a>
          <a className="font-label-sm text-label-sm text-outline-variant hover:text-surface-bright transition-colors uppercase tracking-widest" href="#">Compliance</a>
          <a className="font-label-sm text-label-sm text-outline-variant hover:text-surface-bright transition-colors uppercase tracking-widest" href="#">Status</a>
        </div>
        <p className="font-body-md text-label-sm text-outline-variant text-center md:text-right">
          © 2024 MaintenEase CMMS. Precision Facility Management.
        </p>
      </div>
    </footer>
  </div>
);

export default OnboardingPage;
