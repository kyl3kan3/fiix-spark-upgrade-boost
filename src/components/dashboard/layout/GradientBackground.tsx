import React from "react";

const GradientBackground: React.FC = () => {
  return (
    <div className="fixed inset-0 -z-10 bg-background transition-colors duration-300">
      <div className="absolute inset-0 bg-gradient-mesh opacity-100" />
      <div className="absolute top-0 left-1/4 w-[500px] h-[500px] bg-primary/5 rounded-full blur-3xl" />
      <div className="absolute bottom-0 right-1/4 w-[400px] h-[400px] bg-primary-glow/5 rounded-full blur-3xl" />
    </div>
  );
};

export default GradientBackground;
