
import React, { useEffect, useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Building2, Globe, Mail, Phone, MapPin } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useNavigate } from "react-router-dom";

interface CompanyInfo {
  companyName?: string;
  industry?: string;
  address?: string;
  city?: string;
  state?: string;
  zipCode?: string;
  phone?: string;
  email?: string;
  website?: string;
  logo?: string;
}

const CompanyInformation = () => {
  const [companyInfo, setCompanyInfo] = useState<CompanyInfo | null>(null);
  const navigate = useNavigate();

  useEffect(() => {
    // Retrieve company information from local storage
    const setupData = localStorage.getItem('maintenease_setup');
    if (setupData) {
      try {
        const parsedData = JSON.parse(setupData);
        if (parsedData.companyInfo) {
          setCompanyInfo(parsedData.companyInfo);
        }
      } catch (error) {
        console.error("Error parsing company information:", error);
      }
    }
  }, []);

  if (!companyInfo) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Company Information</CardTitle>
          <CardDescription>No company information available</CardDescription>
        </CardHeader>
        <CardContent>
          <p className="text-muted-foreground mb-4">
            You haven't completed the company setup process yet. Complete the setup to add your company details.
          </p>
          <Button onClick={() => navigate('/setup')}>
            Complete Setup
          </Button>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between">
        <div>
          <CardTitle>Company Information</CardTitle>
          <CardDescription>Details of your organization</CardDescription>
        </div>
        <Button variant="outline" size="sm" onClick={() => navigate('/setup')}>
          Edit
        </Button>
      </CardHeader>
      <CardContent>
        <div className="flex items-start gap-4">
          {companyInfo.logo && (
            <div className="flex-shrink-0">
              <img 
                src={companyInfo.logo} 
                alt={`${companyInfo.companyName || 'Company'} logo`} 
                className="w-24 h-24 object-contain rounded-md border"
              />
            </div>
          )}
          
          <div className="flex-grow space-y-4">
            <div>
              <h3 className="text-xl font-medium text-gray-900">
                {companyInfo.companyName || "Unnamed Company"}
              </h3>
              {companyInfo.industry && (
                <p className="text-muted-foreground">{companyInfo.industry}</p>
              )}
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-y-3 gap-x-6">
              {(companyInfo.address || companyInfo.city || companyInfo.state || companyInfo.zipCode) && (
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
                  <span>{companyInfo.email}</span>
                </div>
              )}
              
              {companyInfo.website && (
                <div className="flex items-center gap-2">
                  <Globe className="h-5 w-5 text-gray-500" />
                  <a 
                    href={companyInfo.website.startsWith('http') ? companyInfo.website : `https://${companyInfo.website}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-blue-600 hover:underline"
                  >
                    {companyInfo.website}
                  </a>
                </div>
              )}
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default CompanyInformation;
