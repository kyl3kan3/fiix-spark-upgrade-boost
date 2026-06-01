import React, { ReactNode } from "react";
import MaterialIcon from "@/components/ui/material-icon";

interface AuthLayoutProps {
  children: ReactNode;
}

export const AuthLayout: React.FC<AuthLayoutProps> = ({ children }) => {
  return (
    <main className="w-full h-screen flex flex-col md:flex-row">
      {/* Left Side: Brand Imagery & Quote (Hidden on Mobile) */}
      <div
        className="hidden md:flex flex-1 relative bg-facility"
        style={{
          backgroundImage: "url('https://lh3.googleusercontent.com/aida-public/AB6AXuC0z_7Y3nhI94EQ0a9HVTwNkPZ8p1vhsV5AzhkqZLCYC1ojhCMhexcSZ0OCrtI_XcUOzjx3sraMALfTmga2Sw6qAqPsj2-IF1Jq4Ijfkv7q6mOAuI87D8C47uAWvhUZYp0ca-zY8uYmCN3-yZmAh0tfVKz2pPd3-y1CMWsy0RP0HjfD_6feaZIwRTL-aWLRM2k5BsucLywKUz_bazj5gQuH2asLebH99XxbvoROT5jluzCyykmf-Exj7aMNDvZVcp-zO5P1tYzbdAI')",
          backgroundSize: "cover",
          backgroundPosition: "center",
        }}
      >
        {/* Overlay for legibility */}
        <div className="absolute inset-0 bg-primary/80 mix-blend-multiply"></div>
        <div className="absolute inset-0 bg-gradient-to-t from-primary via-primary/50 to-transparent"></div>
        <div className="relative z-10 p-container_padding flex flex-col justify-between h-full w-full max-w-2xl text-on-primary">
          {/* Brand Logo */}
          <div className="flex items-center gap-2">
            <MaterialIcon name="precision_manufacturing" className="text-4xl" />
            <span className="font-headline-md text-headline-md font-bold tracking-tight">MaintenEase</span>
          </div>
          {/* Quote / Value Proposition */}
          <div className="mb-12">
            <h1 className="font-display-lg text-display-lg mb-6">Precision Facility Management.</h1>
            <p className="font-body-lg text-body-lg text-inverse-on-surface/90 max-w-lg">
              "MaintenEase transformed our operations. We moved from reactive fixes to proactive maintenance, saving thousands in downtime and extending asset life significantly."
            </p>
            <div className="mt-8 flex items-center gap-4">
              <div className="w-12 h-12 rounded-full overflow-hidden border-2 border-surface-variant/20 bg-surface-variant flex items-center justify-center font-semibold text-primary">
                SJ
              </div>
              <div>
                <p className="font-label-md text-label-md text-on-primary">Sarah Jenkins</p>
                <p className="font-label-sm text-label-sm text-inverse-on-surface/70">Director of Operations, Nexus Industrial</p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Right Side: Authentication Form Canvas */}
      <div className="flex-1 flex flex-col justify-center items-center p-gutter md:p-container_padding bg-background relative overflow-y-auto">
        {/* Mobile Brand Header (Visible only on mobile) */}
        <div className="md:hidden absolute top-8 left-gutter flex items-center gap-2 text-primary">
          <MaterialIcon name="precision_manufacturing" className="text-3xl" />
          <span className="font-headline-md text-headline-md font-bold tracking-tight">MaintenEase</span>
        </div>

        <div className="w-full max-w-md mx-auto mt-16 md:mt-0">
          {children}
        </div>
      </div>
    </main>
  );
};
