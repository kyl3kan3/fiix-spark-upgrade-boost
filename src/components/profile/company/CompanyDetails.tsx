
import React from "react";
import { CompanyInfo } from "./types";
import { Building2, Globe, Mail, Phone, MapPin } from "lucide-react";
import { logger } from "@/lib/logger";

interface CompanyDetailsProps {
 companyInfo: CompanyInfo;
 handleEditClick: () => void;
}

export const CompanyDetails: React.FC<CompanyDetailsProps> = ({ companyInfo, handleEditClick }) => {
 // Format website for display and links
 const displayWebsite = companyInfo.website || '';
 const websiteUrl = displayWebsite.startsWith('http') 
 ? displayWebsite 
 : displayWebsite ? `https://${displayWebsite}` : '';

 // Format address components
 const hasAddress = !!(companyInfo.address || companyInfo.city || companyInfo.state || companyInfo.zipCode);
 
  return (
    <div className="flex items-start gap-4">
      {companyInfo.logo && (
        <div className="flex-shrink-0">
          <img
            src={companyInfo.logo}
            alt={`${companyInfo.companyName} logo`}
            className="w-20 h-20 object-contain rounded-lg border border-border"
            onError={(e) => {
              e.currentTarget.src = "https://via.placeholder.com/100x100?text=Logo";
              logger.warn("Failed to load company logo");
            }}
          />
        </div>
      )}

      <div className="flex-grow space-y-4">
        <div>
          <h3 className="text-xl font-semibold text-foreground">{companyInfo.companyName}</h3>
          {companyInfo.industry && (
            <p className="text-sm text-muted-foreground mt-0.5">{companyInfo.industry}</p>
          )}
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
          {hasAddress && (
            <div className="flex items-start gap-2 p-3 rounded-lg bg-background border border-border">
              <MapPin className="h-4 w-4 text-muted-foreground mt-0.5 shrink-0" />
              <div className="text-sm">
                <p className="text-xs text-muted-foreground uppercase tracking-wide font-semibold mb-0.5">Address</p>
                {companyInfo.address && <p className="text-foreground">{companyInfo.address}</p>}
                <p className="text-foreground">
                  {[companyInfo.city, companyInfo.state, companyInfo.zipCode]
                    .filter(Boolean)
                    .join(", ")}
                </p>
              </div>
            </div>
          )}

          {companyInfo.phone && (
            <div className="flex items-center gap-2 p-3 rounded-lg bg-background border border-border">
              <Phone className="h-4 w-4 text-muted-foreground shrink-0" />
              <div className="text-sm">
                <p className="text-xs text-muted-foreground uppercase tracking-wide font-semibold mb-0.5">Phone</p>
                <p className="text-foreground">{companyInfo.phone}</p>
              </div>
            </div>
          )}

          {companyInfo.email && (
            <div className="flex items-center gap-2 p-3 rounded-lg bg-background border border-border">
              <Mail className="h-4 w-4 text-muted-foreground shrink-0" />
              <div className="text-sm">
                <p className="text-xs text-muted-foreground uppercase tracking-wide font-semibold mb-0.5">Email</p>
                <a href={`mailto:${companyInfo.email}`} className="text-primary hover:underline">
                  {companyInfo.email}
                </a>
              </div>
            </div>
          )}

          {displayWebsite && (
            <div className="flex items-center gap-2 p-3 rounded-lg bg-background border border-border">
              <Globe className="h-4 w-4 text-muted-foreground shrink-0" />
              <div className="text-sm">
                <p className="text-xs text-muted-foreground uppercase tracking-wide font-semibold mb-0.5">Website</p>
                <a
                  href={websiteUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-primary hover:underline"
                >
                  {displayWebsite}
                </a>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
