import React, { useState } from "react";
import DashboardLayout from "@/components/dashboard/DashboardLayout";
import { Helmet } from "react-helmet-async";
import { PaywallGate } from "@/components/billing/PaywallGate";
import MaterialIcon from "@/components/ui/material-icon";

const PROVIDERS = [
  { id: "saml", label: "SAML 2.0", sub: "Standard Protocol", icon: "vpn_lock" },
  { id: "okta", label: "Okta", sub: "Direct Integration", icon: "cloud_done" },
  { id: "azure", label: "Azure AD", sub: "Microsoft Entra", icon: "enterprise" },
];

const SsoPage: React.FC = () => {
  const [selectedProvider, setSelectedProvider] = useState<string>("saml");

  return (
    <DashboardLayout>
      <Helmet>
        <title>Security &amp; SSO Configuration | MaintenEase</title>
        <meta
          name="description"
          content="Manage enterprise authentication protocols, identity providers, and organization-wide security policies for your facility operations."
        />
        <link rel="canonical" href="https://maintenease.com/sso" />
      </Helmet>

      <div className="p-4 md:p-container_padding flex-1 overflow-y-auto bg-surface-blue">
        {/* Header Section */}
        <div className="mb-10">
          <div className="flex items-center gap-2 text-primary font-label-md text-label-md mb-2">
            <MaterialIcon name="security" className="text-[18px]" />
            <span>ADMINISTRATION</span>
          </div>
          <h2 className="font-headline-lg text-headline-lg text-on-surface mb-2">
            SSO &amp; Security Configuration
          </h2>
          <p className="text-body-lg font-body-lg text-on-surface-variant max-w-3xl">
            Manage enterprise authentication protocols, identity providers, and
            organization-wide security policies for your facility operations.
          </p>
        </div>

        <PaywallGate
          feature="sso"
          title="SSO is a Business feature"
          description="Upgrade to Business to enable SAML SSO with Okta, Azure AD, Google Workspace, or any SAML 2.0 provider."
        >
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-gutter">
            {/* Left Column: Configuration Forms */}
            <div className="lg:col-span-8 space-y-gutter">
              {/* Identity Provider Selection */}
              <section className="bg-surface-container-lowest p-card_padding rounded-xl shadow-[0px_10px_30px_rgba(0,0,0,0.04)] border border-transparent hover:border-primary/10 transition-all">
                <div className="flex justify-between items-center mb-6">
                  <h3 className="font-headline-md text-headline-md text-on-surface">
                    Identity Provider
                  </h3>
                  <span className="bg-success/10 text-success px-3 py-1 rounded-full font-label-sm text-label-sm flex items-center gap-1">
                    <MaterialIcon name="check_circle" className="text-[16px]" filled />
                    ACTIVE
                  </span>
                </div>

                {/* Provider Cards */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
                  {PROVIDERS.map((p) => {
                    const isActive = selectedProvider === p.id;
                    return (
                      <button
                        key={p.id}
                        onClick={() => setSelectedProvider(p.id)}
                        className={`border-2 p-6 rounded-xl text-center transition-all group ${
                          isActive
                            ? "border-primary bg-primary/5"
                            : "border-outline-variant/30 hover:border-primary/50"
                        }`}
                      >
                        <MaterialIcon
                          name={p.icon}
                          className={`text-4xl mb-3 block ${isActive ? "text-primary" : "text-outline group-hover:text-primary transition-colors"}`}
                        />
                        <p className={`font-label-md text-label-md ${isActive ? "text-primary" : "text-on-surface"}`}>
                          {p.label}
                        </p>
                        <p className="font-label-sm text-label-sm text-on-surface-variant/60">
                          {p.sub}
                        </p>
                      </button>
                    );
                  })}
                </div>

                {/* Config Inputs */}
                <div className="space-y-6">
                  <div className="grid grid-cols-1 gap-4">
                    <label className="block">
                      <span className="font-label-md text-label-md text-on-surface mb-2 block">
                        Identity Provider Single Sign-On URL
                      </span>
                      <input
                        type="url"
                        className="w-full bg-surface-container-low border-none rounded-lg p-4 text-on-surface focus:ring-2 focus:ring-primary transition-all font-body-md"
                        placeholder="https://your-idp.com/endpoint"
                        defaultValue="https://sso.maintenease.com/saml2/idp/metadata"
                      />
                    </label>
                  </div>
                  <div className="grid grid-cols-1 gap-4">
                    <label className="block">
                      <span className="font-label-md text-label-md text-on-surface mb-2 block">
                        Provider Entity ID (Issuer)
                      </span>
                      <input
                        type="text"
                        className="w-full bg-surface-container-low border-none rounded-lg p-4 text-on-surface focus:ring-2 focus:ring-primary transition-all font-body-md"
                        placeholder="Issuer ID"
                        defaultValue="urn:maintenease:enterprise:sso"
                      />
                    </label>
                  </div>
                  <div>
                    <span className="font-label-md text-label-md text-on-surface mb-2 block">
                      X.509 Certificate
                    </span>
                    <div className="border-2 border-dashed border-outline-variant/50 rounded-xl p-8 text-center bg-surface-container-low/50 hover:bg-surface-container-low transition-all cursor-pointer group">
                      <MaterialIcon
                        name="upload_file"
                        className="text-4xl text-outline-variant mb-3 block group-hover:text-primary transition-colors"
                      />
                      <p className="font-label-md text-label-md text-on-surface-variant mb-1">
                        Click to upload or drag and drop
                      </p>
                      <p className="font-label-sm text-label-sm text-outline">
                        PEM or CRT format (Max. 2MB)
                      </p>
                      <div className="mt-4 flex items-center justify-center gap-2 text-success">
                        <MaterialIcon name="verified" className="text-[18px]" />
                        <span className="font-label-sm text-label-sm">
                          certificate_prod_v2.pem uploaded
                        </span>
                      </div>
                    </div>
                  </div>
                </div>
              </section>

              {/* Security Policies */}
              <section className="bg-surface-container-lowest p-card_padding rounded-xl shadow-[0px_10px_30px_rgba(0,0,0,0.04)] border border-transparent">
                <h3 className="font-headline-md text-headline-md text-on-surface mb-6">
                  Security Policies
                </h3>
                <div className="space-y-6">
                  {/* Enforce SSO — toggle ON */}
                  <div className="flex items-start justify-between p-4 bg-surface-container-low/30 rounded-lg">
                    <div className="max-w-xl">
                      <p className="font-label-md text-label-md text-on-surface">
                        Enforce SSO for all users
                      </p>
                      <p className="font-body-md text-body-md text-on-surface-variant">
                        Disable password-based login for all users except emergency
                        administrators. This ensures all access is managed via your IdP.
                      </p>
                    </div>
                    <label className="relative inline-flex items-center cursor-pointer">
                      <input defaultChecked className="sr-only peer" type="checkbox" />
                      <div className="w-14 h-7 bg-outline-variant/50 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full rtl:peer-checked:after:-translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-0.5 after:start-[4px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-6 after:w-6 after:transition-all peer-checked:bg-primary"></div>
                    </label>
                  </div>
                  {/* JIT Provisioning — toggle OFF */}
                  <div className="flex items-start justify-between p-4">
                    <div className="max-w-xl">
                      <p className="font-label-md text-label-md text-on-surface">
                        Just-In-Time (JIT) Provisioning
                      </p>
                      <p className="font-body-md text-body-md text-on-surface-variant">
                        Automatically create MaintenEase user accounts when they sign in
                        through SSO for the first time.
                      </p>
                    </div>
                    <label className="relative inline-flex items-center cursor-pointer">
                      <input className="sr-only peer" type="checkbox" />
                      <div className="w-14 h-7 bg-outline-variant/50 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full rtl:peer-checked:after:-translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-0.5 after:start-[4px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-6 after:w-6 after:transition-all peer-checked:bg-primary"></div>
                    </label>
                  </div>
                  {/* Domain Restricted Access — configure link */}
                  <div className="flex items-start justify-between p-4">
                    <div className="max-w-xl">
                      <p className="font-label-md text-label-md text-on-surface">
                        Domain Restricted Access
                      </p>
                      <p className="font-body-md text-body-md text-on-surface-variant">
                        Limit login capability to specific corporate email domains only.
                      </p>
                    </div>
                    <button className="text-primary font-label-md text-label-md hover:underline">
                      Configure Domains
                    </button>
                  </div>
                </div>
              </section>
            </div>

            {/* Right Column: Stats & Meta */}
            <div className="lg:col-span-4 space-y-gutter">
              {/* Configuration Health Card */}
              <div className="bg-primary text-on-primary p-card_padding rounded-xl shadow-lg relative overflow-hidden group">
                <div className="absolute -right-12 -top-12 w-48 h-48 bg-on-primary/10 rounded-full blur-3xl group-hover:bg-on-primary/20 transition-all"></div>
                <h4 className="font-headline-md text-headline-md mb-4 relative z-10">
                  Configuration Health
                </h4>
                <div className="flex items-center gap-4 mb-8 relative z-10">
                  <div className="w-16 h-16 rounded-full border-4 border-on-primary/30 flex items-center justify-center relative">
                    <svg className="absolute inset-0 w-full h-full -rotate-90">
                      <circle
                        className="text-on-primary"
                        cx="32"
                        cy="32"
                        fill="transparent"
                        r="28"
                        stroke="currentColor"
                        strokeDasharray="175.9"
                        strokeDashoffset="35.1"
                        strokeWidth="4"
                      />
                    </svg>
                    <span className="font-bold text-lg">80%</span>
                  </div>
                  <div>
                    <p className="font-label-md text-label-md">Security Score</p>
                    <p className="text-on-primary/70 font-label-sm text-label-sm">
                      High Security Tier
                    </p>
                  </div>
                </div>
                <div className="space-y-4 relative z-10">
                  <button className="w-full bg-white text-primary py-4 px-6 rounded-lg font-label-md text-label-md font-bold uppercase hover:bg-surface-container-high transition-colors tracking-wide">
                    Save Changes
                  </button>
                  <button className="w-full border border-on-primary/30 py-4 px-6 rounded-lg font-label-md text-label-md font-bold uppercase hover:bg-on-primary/10 transition-colors">
                    Test SSO Connection
                  </button>
                </div>
              </div>

              {/* Live Security Logs Card */}
              <div className="bg-surface-container-lowest p-card_padding rounded-xl shadow-[0px_10px_30px_rgba(0,0,0,0.04)] border border-transparent">
                <div className="flex justify-between items-center mb-6">
                  <h4 className="font-label-md text-label-md text-on-surface uppercase tracking-widest">
                    Live Security Logs
                  </h4>
                  <span className="flex h-2 w-2 relative">
                    <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-success opacity-75"></span>
                    <span className="relative inline-flex rounded-full h-2 w-2 bg-success"></span>
                  </span>
                </div>
                <div className="space-y-4">
                  {/* Log: success */}
                  <div className="flex gap-3 items-start border-b border-outline-variant/10 pb-4">
                    <div className="bg-success/10 text-success p-2 rounded-lg">
                      <MaterialIcon name="login" className="text-[20px]" />
                    </div>
                    <div>
                      <p className="font-label-md text-label-md text-on-surface">
                        Successful SSO Login
                      </p>
                      <p className="font-label-sm text-label-sm text-on-surface-variant">
                        User: m.chen@corp.com
                      </p>
                      <p className="text-[10px] text-outline mt-1 uppercase font-bold">
                        2 mins ago
                      </p>
                    </div>
                  </div>
                  {/* Log: warning */}
                  <div className="flex gap-3 items-start border-b border-outline-variant/10 pb-4">
                    <div className="bg-warning/10 text-warning p-2 rounded-lg">
                      <MaterialIcon name="sync" className="text-[20px]" />
                    </div>
                    <div>
                      <p className="font-label-md text-label-md text-on-surface">
                        Metadata Refreshed
                      </p>
                      <p className="font-label-sm text-label-sm text-on-surface-variant">
                        System: Auto-sync
                      </p>
                      <p className="text-[10px] text-outline mt-1 uppercase font-bold">
                        45 mins ago
                      </p>
                    </div>
                  </div>
                  {/* Log: error */}
                  <div className="flex gap-3 items-start">
                    <div className="bg-error/10 text-error p-2 rounded-lg">
                      <MaterialIcon name="key_off" className="text-[20px]" />
                    </div>
                    <div>
                      <p className="font-label-md text-label-md text-on-surface">
                        Invalid Certificate
                      </p>
                      <p className="font-label-sm text-label-sm text-on-surface-variant">
                        IP: 192.168.1.45
                      </p>
                      <p className="text-[10px] text-outline mt-1 uppercase font-bold">
                        2 hours ago
                      </p>
                    </div>
                  </div>
                </div>
                <button className="w-full mt-6 text-primary font-label-md text-label-md hover:underline">
                  View All Security Logs
                </button>
              </div>

              {/* Documentation Card */}
              <div className="bg-surface-container-low rounded-xl p-card_padding border border-outline-variant/30">
                <img
                  className="w-full h-32 object-cover rounded-lg mb-4"
                  src="https://lh3.googleusercontent.com/aida-public/AB6AXuBJvDxleBXsrQ-Gz3iB6O9JAce85LtOjahnpoy6d7nrgAfZ1GsET4PuOMLGPdDFw19GAW401tgkgRwkUmktVrT1bXp7N3J4A1KR4OiX6EatxU7mDNEl3TCG2Z473RsYhQYsI1mat1ysH8TdBR7VOSdYRRdXRzF4SnkLLdsMudnvfoYnM3JTZyss-Ji_Aknt-PS5jK9OaxzAgx8ABo80QzrCpMQMQcmQU5SrsuutFEVLi8jQi7hVIGSS0C87fPvqR3M9wYBmofBPTVg"
                  alt="High-tech server room with soft blue lighting, enterprise security infrastructure"
                />
                <h5 className="font-label-md text-label-md text-on-surface mb-2">
                  Need Help?
                </h5>
                <p className="text-body-md font-body-md text-on-surface-variant mb-4">
                  Read our comprehensive guide on setting up SAML with major Identity
                  Providers.
                </p>
                <a
                  href="#"
                  className="flex items-center gap-2 text-primary font-label-md text-label-md font-bold group"
                >
                  Documentation Portal
                  <MaterialIcon
                    name="arrow_forward"
                    className="text-[18px] group-hover:translate-x-1 transition-transform"
                  />
                </a>
              </div>
            </div>
          </div>
        </PaywallGate>
      </div>
    </DashboardLayout>
  );
};

export default SsoPage;
