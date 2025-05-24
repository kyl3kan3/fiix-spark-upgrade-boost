
import { useState, useEffect } from "react";

export const useCompanyLogo = (initialLogo?: string | null) => {
  const [logoPreview, setLogoPreview] = useState<string | null>(null);

  // Initialize with existing logo if available
  useEffect(() => {
    if (initialLogo) {
      setLogoPreview(initialLogo);
    }
  }, [initialLogo]);

  const handleLogoChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        const result = reader.result as string;
        setLogoPreview(result);
      };
      reader.readAsDataURL(file);
    }
  };

  return {
    logoPreview,
    handleLogoChange,
    setLogoPreview
  };
};
