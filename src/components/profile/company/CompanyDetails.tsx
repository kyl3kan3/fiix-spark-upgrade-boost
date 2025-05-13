
import React from "react";
import { CompanyInfo } from "./types";
import { Building2, Globe, Mail, Phone, MapPin } from "lucide-react";

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
            className="w-24 h-24 object-contain rounded-md border"
            onError={(e) => {
              e.currentTarget.src = 'https://via.placeholder.com/100x100?text=Logo';
              console.warn("Failed to load company logo");
            }}
          />
        </div>
      )}
      
      <div className="flex-grow space-y-4">
        <div>
          <h3 className="text-xl font-medium text-gray-900">
            {companyInfo.companyName}
          </h3>
          {companyInfo.industry && (
            <p className="text-muted-foreground">{companyInfo.industry}</p>
          )}
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-y-3 gap-x-6">
          {hasAddress && (
            <div className="flex items-start gap-2">
              <MapPin className="h-5 w-5 text-gray-500 mt-0.5" />
              <div>
                {companyInfo.address && <p>{companyInfo.address}</p>}
                <p>
                  {[
                    companyInfo.city,
                    companyInfo.state,
                    companyInfo.zipCode
                  ]
                    .filter(Boolean)
                    .join(", ")}
                </p>
              </div>
            </div>
          )}
          
          {companyInfo.phone && (
            <div className="flex items-center gap-2">
              <Phone className="h-5 w-5 text-gray-500" />
              <span>{companyInfo.phone}</span>
            </div>
          )}
          
          {companyInfo.email && (
            <div className="flex items-center gap-2">
              <Mail className="h-5 w-5 text-gray-500" />
              <a
                href={`mailto:${companyInfo.email}`}
                className="text-blue-600 hover:underline"
              >
                {companyInfo.email}
              </a>
            </div>
          )}
          
          {displayWebsite && (
            <div className="flex items-center gap-2">
              <Globe className="h-5 w-5 text-gray-500" />
              <a 
                href={websiteUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="text-blue-600 hover:underline"
              >
                {displayWebsite}
              </a>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
