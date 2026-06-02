
import React from "react";
import { SetupProvider } from "@/components/setup/SetupContext";
import SetupContainer from "@/components/setup/SetupContainer";
import SetupWelcomeAlert from "./SetupWelcomeAlert";
import SetupResetDialog from "./SetupResetDialog";

interface SetupPageContentProps {
  showWelcomeBack: boolean;
  isLoading: boolean;
  forceSetupMode: boolean;
  isResetting: boolean;
  onResetSetup: () => Promise<void>;
}

const SetupPageContent: React.FC<SetupPageContentProps> = ({
  showWelcomeBack,
  isLoading,
  forceSetupMode,
  isResetting,
  onResetSetup,
}) => {
  return (
    <div className="bg-background min-h-screen transition-colors">
      {showWelcomeBack && !isLoading && !forceSetupMode && (
        <div className="container mx-auto px-4 py-4 max-w-5xl">
          <div className="flex flex-col gap-4">
            <SetupWelcomeAlert />
            <SetupResetDialog isResetting={isResetting} onReset={onResetSetup} />
          </div>
        </div>
      )}

      <SetupProvider>
        <SetupContainer />
      </SetupProvider>
    </div>
  );
};

export default SetupPageContent;
