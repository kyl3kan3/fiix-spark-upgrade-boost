import React from "react";

const GradientBackground: React.FC = () => {
  return (
    <div className="fixed inset-0 -z-10 bg-background transition-colors duration-300 overflow-hidden">
      <div className="absolute inset-0 bg-gradient-mesh opacity-100" />
      <div className="absolute top-0 left-1/4 w-[260px] h-[260px] sm:w-[500px] sm:h-[500px] bg-primary/5 rounded-full blur-3xl" />
      <div className="absolute bottom-0 right-1/4 w-[220px] h-[220px] sm:w-[400px] sm:h-[400px] bg-primary-glow/5 rounded-full blur-3xl" />
    </div>
  );
};

export default GradientBackground;
