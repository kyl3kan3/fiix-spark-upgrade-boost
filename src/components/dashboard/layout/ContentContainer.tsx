
import React from "react";

interface ContentContainerProps {
  children: React.ReactNode;
}

const ContentContainer: React.FC<ContentContainerProps> = ({ children }) => {
  return (
    <div className="container mx-auto px-2 pt-8 flex-1 max-w-[1440px] dark:bg-transparent">
      {children}
    </div>
  );
};

export default ContentContainer;
