
import React, { useEffect } from "react";
import { useNavigate } from "react-router-dom";

const Settings = () => {
  const navigate = useNavigate();
  
  useEffect(() => {
    // Redirect to the profile page with settings tab selected without page reload
    navigate("/profile?tab=settings", { replace: true });
  }, [navigate]);
  
  return (
    <div className="p-8 flex justify-center items-center">
      <p>Redirecting to settings...</p>
    </div>
  );
};

export default Settings;
