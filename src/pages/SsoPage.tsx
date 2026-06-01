import React from "react";
import { ShieldCheck, ExternalLink, CheckCircle2 } from "lucide-react";
import DashboardLayout from "@/components/dashboard/DashboardLayout";
import BackToDashboard from "@/components/dashboard/BackToDashboard";
import { PaywallGate } from "@/components/billing/PaywallGate";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import PageContainer from "@/components/shell/PageContainer";

const PROVIDERS = [
  { id: "saml", label: "SAML 2.0", sub: "Standard Protocol" },
  { id: "okta", label: "Okta", sub: "Direct Integration" },
  { id: "azure", label: "Azure AD", sub: "Microsoft Entra" },
];

const SsoPage: React.FC = () => {
  return (
    <DashboardLayout>
      <PageContainer className="space-y-8">
        <BackToDashboard />

        {/* Page Header */}
        <div>
          <div className="flex items-center gap-2 text-primary text-xs font-semibold uppercase tracking-wider mb-2">
            <ShieldCheck className="h-4 w-4" />
            <span>Administration</span>
          </div>
          <h1 className="font-headline text-3xl font-bold text-foreground">
            SSO &amp; Security Configuration
          </h1>
          <p className="text-base text-muted-foreground mt-1 max-w-2xl">
            Let your team sign in with your corporate identity provider. Manage enterprise
            authentication protocols and organization-wide security policies.
          </p>
        </div>

        <PaywallGate
          feature="sso"
          title="SSO is a Business feature"
          description="Upgrade to Business to enable SAML SSO with Okta, Azure AD, Google Workspace, or any SAML 2.0 provider."
        >
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
            {/* Left column: config forms */}
            <div className="lg:col-span-8 space-y-6">
              {/* Identity Provider */}
              <Card className="bg-card border border-border rounded-lg shadow-sm hover:shadow-md hover:border-primary/20 transition-all">
                <CardHeader className="border-b border-border pb-4">
                  <div className="flex items-center justify-between">
                    <CardTitle className="font-headline text-xl text-foreground">
                      Identity Provider
                    </CardTitle>
                    <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-success/10 text-success text-xs font-semibold">
                      <CheckCircle2 className="h-3.5 w-3.5" />
                      Active
                    </span>
                  </div>
                  <CardDescription className="text-muted-foreground mt-1">
                    Configure your identity provider to allow team members to sign in
                    without a separate password.
                  </CardDescription>
                </CardHeader>
                <CardContent className="pt-6 space-y-6">
                  {/* Provider picker */}
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                    {PROVIDERS.map((p, i) => (
                      <div
                        key={p.id}
                        className={`p-5 rounded-xl text-center border-2 cursor-pointer transition-all ${
                          i === 0
                            ? "border-primary bg-primary/5"
                            : "border-border hover:border-primary/50"
                        }`}
                      >
                        <ShieldCheck
                          className={`h-8 w-8 mx-auto mb-2 ${i === 0 ? "text-primary" : "text-muted-foreground"}`}
                        />
                        <p className={`text-sm font-semibold ${i === 0 ? "text-primary" : "text-foreground"}`}>
                          {p.label}
                        </p>
                        <p className="text-xs text-muted-foreground">{p.sub}</p>
                      </div>
                    ))}
                  </div>

                  {/* Supported providers info */}
                  <div className="rounded-lg bg-muted/50 border border-border p-4">
                    <p className="text-sm font-semibold text-foreground mb-2">Supported providers</p>
                    <ul className="grid grid-cols-1 sm:grid-cols-2 gap-1.5">
                      {[
                        "Okta",
                        "Microsoft Entra ID (Azure AD)",
                        "Google Workspace",
                        "OneLogin",
                        "Any SAML 2.0 identity provider",
                      ].map((item) => (
                        <li key={item} className="flex items-center gap-2 text-sm text-muted-foreground">
                          <CheckCircle2 className="h-3.5 w-3.5 text-success shrink-0" />
                          {item}
                        </li>
                      ))}
                    </ul>
                  </div>
                </CardContent>
              </Card>

              {/* Security Policies */}
              <Card className="bg-card border border-border rounded-lg shadow-sm hover:shadow-md hover:border-primary/20 transition-all">
                <CardHeader className="border-b border-border pb-4">
                  <CardTitle className="font-headline text-xl text-foreground">
                    Security Policies
                  </CardTitle>
                  <CardDescription className="text-muted-foreground mt-1">
                    Configure organization-wide authentication and access policies.
                  </CardDescription>
                </CardHeader>
                <CardContent className="pt-4 divide-y divide-border">
                  {[
                    {
                      title: "Enforce SSO for all users",
                      description:
                        "Disable password-based login for all users except emergency administrators.",
                    },
                    {
                      title: "Just-In-Time (JIT) Provisioning",
                      description:
                        "Automatically create MaintenEase accounts when users sign in through SSO for the first time.",
                    },
                    {
                      title: "Domain Restricted Access",
                      description:
                        "Limit login capability to specific corporate email domains only.",
                    },
                  ].map((policy) => (
                    <div
                      key={policy.title}
                      className="flex items-start justify-between gap-4 py-4"
                    >
                      <div className="max-w-xl">
                        <p className="text-sm font-semibold text-foreground">{policy.title}</p>
                        <p className="text-sm text-muted-foreground mt-0.5">{policy.description}</p>
                      </div>
                      <Button
                        variant="outline"
                        size="sm"
                        className="shrink-0 border-border text-primary hover:bg-primary/5 text-xs uppercase tracking-wide font-semibold"
                      >
                        Configure
                      </Button>
                    </div>
                  ))}
                </CardContent>
              </Card>
            </div>

            {/* Right column: actions + docs */}
            <div className="lg:col-span-4 space-y-6">
              {/* Actions card — navy CTA */}
              <div className="bg-primary text-primary-foreground rounded-xl shadow-lg p-6 relative overflow-hidden">
                <div className="absolute -right-8 -top-8 w-32 h-32 bg-white/10 rounded-full blur-2xl" />
                <div className="relative z-10">
                  <h4 className="font-headline text-xl font-semibold mb-4">Request SSO Setup</h4>
                  <p className="text-sm text-primary-foreground/80 mb-6">
                    Contact support with your identity provider's metadata URL and the email
                    domains you'd like to enable.
                  </p>
                  <Button
                    asChild
                    className="w-full bg-white text-primary hover:bg-white/90 uppercase tracking-wide text-xs font-semibold mb-3"
                  >
                    <a href="mailto:support@maintenease.com?subject=SAML%20SSO%20Setup">
                      Request SSO Setup
                      <ExternalLink className="h-4 w-4 ml-2" />
                    </a>
                  </Button>
                  <Button
                    variant="outline"
                    className="w-full border-white/30 text-primary-foreground hover:bg-white/10 uppercase tracking-wide text-xs font-semibold"
                  >
                    Test SSO Connection
                  </Button>
                </div>
              </div>

              {/* Docs / help card */}
              <Card className="bg-card border border-border rounded-lg shadow-sm">
                <CardHeader className="pb-3">
                  <CardTitle className="text-sm font-semibold text-muted-foreground uppercase tracking-widest">
                    Documentation
                  </CardTitle>
                </CardHeader>
                <CardContent className="pt-0 space-y-3">
                  <p className="text-sm text-muted-foreground">
                    Read our comprehensive guide on setting up SAML with major Identity Providers.
                  </p>
                  {[
                    "SAML 2.0 Setup Guide",
                    "Okta Integration",
                    "Azure AD Configuration",
                  ].map((doc) => (
                    <a
                      key={doc}
                      href="#"
                      className="flex items-center gap-2 text-primary text-sm font-semibold hover:underline group"
                    >
                      <CheckCircle2 className="h-4 w-4 text-muted-foreground group-hover:text-primary transition-colors" />
                      {doc}
                    </a>
                  ))}
                  <Button
                    asChild
                    variant="ghost"
                    className="w-full mt-2 text-primary hover:bg-primary/5 text-xs font-semibold uppercase tracking-wide"
                  >
                    <a href="#">
                      Documentation Portal
                      <ExternalLink className="h-3.5 w-3.5 ml-1.5" />
                    </a>
                  </Button>
                </CardContent>
              </Card>
            </div>
          </div>
        </PaywallGate>
      </PageContainer>
    </DashboardLayout>
  );
};

export default SsoPage;
