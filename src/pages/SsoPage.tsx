import React from "react";
import { ShieldCheck, ExternalLink } from "lucide-react";
import DashboardLayout from "@/components/dashboard/DashboardLayout";
import BackToDashboard from "@/components/dashboard/BackToDashboard";
import { PaywallGate } from "@/components/billing/PaywallGate";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";

const SsoPage: React.FC = () => {
  return (
    <DashboardLayout>
      <div className="space-y-4 sm:space-y-6">
        <BackToDashboard />
        <div>
          <h1 className="text-xl sm:text-2xl lg:text-3xl font-bold flex items-center gap-2">
            <ShieldCheck className="h-6 w-6 sm:h-8 sm:w-8" />
            Single Sign-On (SSO)
          </h1>
          <p className="text-sm sm:text-base text-muted-foreground mt-1">
            Let your team sign in with your corporate identity provider.
          </p>
        </div>

        <PaywallGate
          feature="sso"
          title="SSO is a Business feature"
          description="Upgrade to Business to enable SAML SSO with Okta, Azure AD, Google Workspace, or any SAML 2.0 provider."
        >
          <Card>
            <CardHeader>
              <CardTitle>SAML 2.0 SSO</CardTitle>
              <CardDescription>
                Configure your identity provider to allow team members to sign in
                without a separate password.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="rounded-lg bg-muted p-4 space-y-2 text-sm">
                <p className="font-medium">Supported providers</p>
                <ul className="list-disc pl-5 text-muted-foreground space-y-1">
                  <li>Okta</li>
                  <li>Microsoft Entra ID (Azure AD)</li>
                  <li>Google Workspace</li>
                  <li>OneLogin</li>
                  <li>Any SAML 2.0 identity provider</li>
                </ul>
              </div>
              <p className="text-sm text-muted-foreground">
                Contact support with your identity provider's metadata URL and the email
                domains you'd like to enable, and we'll configure SAML for your account.
              </p>
              <Button asChild>
                <a href="mailto:support@maintenease.com?subject=SAML%20SSO%20Setup">
                  Request SSO setup
                  <ExternalLink className="h-4 w-4 ml-2" />
                </a>
              </Button>
            </CardContent>
          </Card>
        </PaywallGate>
      </div>
    </DashboardLayout>
  );
};

export default SsoPage;