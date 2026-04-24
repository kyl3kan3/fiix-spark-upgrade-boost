
import React from "react";

const GradientBackground: React.FC = () => {
  return (
    <div className="fixed inset-0 -z-10 bg-background transition-colors duration-300">
      <div className="absolute inset-0 bg-gradient-mesh opacity-100" />
    </div>
  );
};

export default GradientBackground;
