import React, { useState } from "react";
import { Button } from "@/components/ui/button";
import { 
  Card, 
  CardContent, 
  CardDescription, 
  CardFooter,
  CardHeader, 
  CardTitle 
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { 
  Select, 
  SelectContent, 
  SelectItem, 
  SelectTrigger, 
  SelectValue 
} from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import { IterationCw, Link, FileJson, DollarSign, Mail } from "lucide-react";

interface IntegrationOption {
  id: string;
  name: string;
  icon: React.ReactNode;
  description: string;
  connected: boolean;
  apiKeyLabel?: string;
  apiKeyPlaceholder?: string;
  hasApiKey: boolean;
  endpoint?: string;
}

interface IntegrationsSetupProps {
  data: any;
  onUpdate: (data: any) => void;
}

const IntegrationsSetup: React.FC<IntegrationsSetupProps> = ({ data, onUpdate }) => {
  const [integrations, setIntegrations] = useState<IntegrationOption[]>(
    data?.integrations || [
      {
        id: "stripe",
        name: "Stripe",
        icon: <DollarSign className="h-6 w-6 text-[#635BFF]" />,
        description: "Process payments and manage billing",
        connected: false,
        apiKeyLabel: "Stripe API Key",
        apiKeyPlaceholder: "sk_test_...",
        hasApiKey: true
      },
      {
        id: "email",
        name: "Email Service",
        icon: <Mail className="h-6 w-6 text-blue-500" />,
        description: "Send email notifications and reports",
        connected: false,
        apiKeyLabel: "SMTP Settings",
        apiKeyPlaceholder: "smtp://username:password@smtp.example.com",
        hasApiKey: true
      },
      {
        id: "erp",
        name: "ERP System",
        icon: <FileJson className="h-6 w-6 text-orange-500" />,
        description: "Connect to your ERP for inventory and purchasing",
        connected: false,
        apiKeyLabel: "API Endpoint",
        apiKeyPlaceholder: "https://api.erp-system.com/v1",
        hasApiKey: true,
        endpoint: "https://api.erp-system.com"
      },
      {
        id: "webhook",
        name: "Webhooks",
        icon: <Link className="h-6 w-6 text-purple-500" />,
        description: "Send data to external systems when events happen",
        connected: false,
        hasApiKey: false
      }
    ]
  );
  
  const [activeIntegration, setActiveIntegration] = useState<string | null>(null);
  const [apiKey, setApiKey] = useState<string>("");
  const [webhookUrl, setWebhookUrl] = useState<string>("");
  const [webhookSecret, setWebhookSecret] = useState<string>("");
  const [webhookEvents, setWebhookEvents] = useState<string[]>([]);

  const handleToggleIntegration = (id: string, enabled: boolean) => {
    if (enabled) {
      setActiveIntegration(id);
    } else {
      // Disconnect integration
      const updated = integrations.map(integration =>
        integration.id === id ? { ...integration, connected: false } : integration
      );
      setIntegrations(updated);
      onUpdate({ integrations: updated });
    }
  };

  const handleConnect = (id: string) => {
    // In a real app, this would validate credentials and establish the connection
    const updated = integrations.map(integration =>
      integration.id === id ? { ...integration, connected: true } : integration
    );
    
    setIntegrations(updated);
    setActiveIntegration(null);
    setApiKey("");
    onUpdate({ 
      integrations: updated,
      webhooks: id === "webhook" ? {
        url: webhookUrl,
        secret: webhookSecret,
        events: webhookEvents
      } : data?.webhooks
    });
  };

  const handleWebhookEventToggle = (event: string) => {
    if (webhookEvents.includes(event)) {
      setWebhookEvents(webhookEvents.filter(e => e !== event));
    } else {
      setWebhookEvents([...webhookEvents, event]);
    }
  };

  const selectedIntegration = integrations.find(i => i.id === activeIntegration);

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-3">
        <IterationCw className="h-6 w-6 text-maintenease-600" />
        <h2 className="text-xl font-semibold">Integrations</h2>
      </div>
      
      <p className="text-muted-foreground">
        Connect MaintenEase with your other business systems.
      </p>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {integrations.map((integration) => (
          <Card key={integration.id} className={integration.connected ? "border-maintenease-600/30" : ""}>
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <div className="flex items-center gap-3">
                {integration.icon}
                <CardTitle>{integration.name}</CardTitle>
              </div>
              <Switch 
                checked={integration.connected} 
                onCheckedChange={(checked) => handleToggleIntegration(integration.id, checked)} 
              />
            </CardHeader>
            <CardContent>
              <CardDescription>{integration.description}</CardDescription>
              
              <div className="mt-3">
                {integration.connected ? (
                  <Badge 
                    variant="outline" 
                    className="bg-green-50 text-green-700 border-green-200"
                  >
                    Connected
                  </Badge>
                ) : (
                  <Badge 
                    variant="outline" 
                    className="bg-gray-100 text-gray-500 border-gray-200"
                  >
                    Not Connected
                  </Badge>
                )}
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {activeIntegration && selectedIntegration && (
        <Card>
          <CardHeader>
            <div className="flex items-center gap-3">
              {selectedIntegration.icon}
              <CardTitle>Connect {selectedIntegration.name}</CardTitle>
            </div>
            <CardDescription>
              Configure your {selectedIntegration.name} integration
            </CardDescription>
          </CardHeader>
          <CardContent>
            {selectedIntegration.id === "webhook" ? (
              <div className="space-y-6">
                <div className="space-y-2">
                  <Label htmlFor="webhook-url">Webhook URL</Label>
                  <Input 
                    id="webhook-url"
                    placeholder="https://your-app.com/webhook" 
                    value={webhookUrl}
                    onChange={(e) => setWebhookUrl(e.target.value)}
                  />
                  <p className="text-sm text-muted-foreground">
                    Events will be sent to this URL
                  </p>
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="webhook-secret">Secret Key (Optional)</Label>
                  <Input 
                    id="webhook-secret"
                    type="password"
                    placeholder="Secret key for webhook verification" 
                    value={webhookSecret}
                    onChange={(e) => setWebhookSecret(e.target.value)}
                  />
                  <p className="text-sm text-muted-foreground">
                    Used to verify webhook payloads
                  </p>
                </div>
                
                <div className="space-y-2">
                  <Label>Webhook Events</Label>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3 mt-3">
                    {[
                      { id: "work_order.created", name: "Work Order Created" },
                      { id: "work_order.updated", name: "Work Order Updated" },
                      { id: "work_order.completed", name: "Work Order Completed" },
                      { id: "asset.created", name: "Asset Created" },
                      { id: "asset.updated", name: "Asset Updated" },
                      { id: "maintenance.scheduled", name: "Maintenance Scheduled" },
                    ].map((event) => (
                      <div key={event.id} className="flex items-center space-x-2">
                        <Checkbox 
                          id={event.id}
                          checked={webhookEvents.includes(event.id)}
                          onCheckedChange={() => handleWebhookEventToggle(event.id)}
                        />
                        <label
                          htmlFor={event.id}
                          className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
                        >
                          {event.name}
                        </label>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            ) : selectedIntegration.hasApiKey ? (
              <div className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="api-key">{selectedIntegration.apiKeyLabel}</Label>
                  <Input 
                    id="api-key"
                    type="password"
                    placeholder={selectedIntegration.apiKeyPlaceholder} 
                    value={apiKey}
                    onChange={(e) => setApiKey(e.target.value)}
                  />
                </div>
                
                {selectedIntegration.endpoint && (
                  <div className="space-y-2">
                    <Label htmlFor="api-endpoint">API Endpoint</Label>
                    <Input 
                      id="api-endpoint"
                      defaultValue={selectedIntegration.endpoint}
                    />
                    <p className="text-xs text-muted-foreground">
                      Leave as default unless you have a custom endpoint
                    </p>
                  </div>
                )}
              </div>
            ) : (
              <p>Configure integration settings</p>
            )}
          </CardContent>
          <CardFooter className="flex justify-between border-t pt-6">
            <Button variant="outline" onClick={() => setActiveIntegration(null)}>
              Cancel
            </Button>
            <Button 
              onClick={() => handleConnect(selectedIntegration.id)}
              disabled={selectedIntegration.id === "webhook" ? !webhookUrl : (selectedIntegration.hasApiKey && !apiKey)}
            >
              Connect
            </Button>
          </CardFooter>
        </Card>
      )}
    </div>
  );
};

// Add Badge component since it's used but not imported
const Badge = ({ children, className, variant = "default" }: { 
  children: React.ReactNode, 
  className?: string, 
  variant?: "default" | "outline" | "secondary" 
}) => {
  const baseStyle = "inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-semibold";
  const variantStyles = {
    default: "bg-primary text-primary-foreground",
    secondary: "bg-secondary text-secondary-foreground",
    outline: "bg-background text-foreground border"
  };
  
  return (
    <span className={`${baseStyle} ${variantStyles[variant]} ${className || ""}`}>
      {children}
    </span>
  );
};

// Add Checkbox component since it's used but not imported
const Checkbox = ({ id, checked, onCheckedChange }: {
  id: string,
  checked?: boolean,
  onCheckedChange?: (checked: boolean) => void
}) => {
  return (
    <div className="flex items-center space-x-2">
      <input
        type="checkbox"
        id={id}
        checked={checked}
        onChange={(e) => onCheckedChange && onCheckedChange(e.target.checked)}
        className="h-4 w-4 rounded border-gray-300 text-maintenease-600 focus:ring-maintenease-500"
      />
    </div>
  );
};

export default IntegrationsSetup;
