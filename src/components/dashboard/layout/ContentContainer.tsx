
import React from "react";

interface ContentContainerProps {
  children: React.ReactNode;
}

const ContentContainer: React.FC<ContentContainerProps> = ({ children }) => {
  return (
    <div className="container mx-auto px-4 sm:px-6 lg:px-8 pt-6 pb-12 flex-1 max-w-[1440px]">
      {children}
    </div>
  );
};

export default ContentContainer;
