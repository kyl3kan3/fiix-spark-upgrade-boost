import React from "react";

interface ContentContainerProps {
  children: React.ReactNode;
}

const ContentContainer: React.FC<ContentContainerProps> = ({ children }) => {
  return (
    <main className="flex-1 px-4 sm:px-6 lg:px-8 pt-6 pb-12 w-full max-w-[1600px] mx-auto animate-entry">
      {children}
    </main>
  );
};

export default ContentContainer;
