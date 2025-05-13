import React, { useEffect, useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Building2, Globe, Mail, Phone, MapPin } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useNavigate } from "react-router-dom";
import { toast } from "sonner";

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
  logo?: string | null;
}

const CompanyInformation = () => {
  const [companyInfo, setCompanyInfo] = useState<CompanyInfo | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [setupCompleted, setSetupCompleted] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    // Check if setup is completed
    const isSetupComplete = localStorage.getItem('maintenease_setup_complete') === 'true';
    setSetupCompleted(isSetupComplete);

    // Retrieve company information from local storage
    const setupData = localStorage.getItem('maintenease_setup');
    console.log("Raw setup data:", setupData);
    
    if (setupData) {
      try {
        const parsedData = JSON.parse(setupData);
        console.log("Parsed setup data:", parsedData);
        
        // Check both companyInfo (correct key) and companyinfo (lowercase key)
        let companyInfoData = null;
        if (parsedData && parsedData.companyInfo && Object.keys(parsedData.companyInfo).length > 0) {
          console.log("Company info found in companyInfo:", parsedData.companyInfo);
          companyInfoData = parsedData.companyInfo;
        } else if (parsedData && parsedData.companyinfo && Object.keys(parsedData.companyinfo).length > 0) {
          console.log("Company info found in companyinfo:", parsedData.companyinfo);
          companyInfoData = parsedData.companyinfo;
        }
        
        if (companyInfoData) {
          setCompanyInfo(companyInfoData);
        } else {
          console.warn("No company info found in parsed data:", parsedData);
          setCompanyInfo(null);
        }
      } catch (error) {
        console.error("Error parsing company information:", error);
        toast.error("There was an error loading company information");
        setCompanyInfo(null);
      }
    } else {
      console.warn("No setup data found in localStorage");
      setCompanyInfo(null);
    }
    
    setIsLoading(false);
  }, []);

  const handleEditClick = () => {
    navigate('/setup');
    toast.info("You can update your company information here");
  };

  if (isLoading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Company Information</CardTitle>
          <CardDescription>Loading company details...</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="h-6 bg-gray-100 rounded animate-pulse"></div>
          <div className="h-6 bg-gray-100 rounded animate-pulse"></div>
          <div className="h-6 bg-gray-100 rounded animate-pulse"></div>
        </CardContent>
      </Card>
    );
  }

  // Handle case when there's no company info or it's incomplete
  if (!companyInfo || !companyInfo.companyName) {
    const buttonText = setupCompleted ? "Update Company Information" : "Complete Setup";
    
    return (
      <Card>
        <CardHeader>
          <CardTitle>Company Information</CardTitle>
          <CardDescription>{setupCompleted ? "Company information incomplete" : "No company information available"}</CardDescription>
        </CardHeader>
        <CardContent>
          <p className="text-muted-foreground mb-4">
            {setupCompleted
              ? "Your company information is incomplete. Please update your company details."
              : "You haven't completed the company setup process yet. Complete the setup to add your company details."}
          </p>
          <Button onClick={handleEditClick}>
            {buttonText}
          </Button>
        </CardContent>
      </Card>
    );
  }

  // Format website for display and links
  const displayWebsite = companyInfo.website || '';
  const websiteUrl = displayWebsite.startsWith('http') 
    ? displayWebsite 
    : displayWebsite ? `https://${displayWebsite}` : '';

  // Format address components
  const hasAddress = !!(companyInfo.address || companyInfo.city || companyInfo.state || companyInfo.zipCode);
  
  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between">
        <div>
          <CardTitle>Company Information</CardTitle>
          <CardDescription>Details of your organization</CardDescription>
        </div>
        <Button variant="outline" size="sm" onClick={handleEditClick}>
          Edit
        </Button>
      </CardHeader>
      <CardContent>
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
      </CardContent>
    </Card>
  );
};

export default CompanyInformation;
