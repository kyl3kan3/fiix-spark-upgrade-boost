import React, { useEffect, useState } from "react";
import { useLocation } from "react-router-dom";
import { Joyride, STATUS, type EventData, type Step } from "react-joyride";
import { useOnboardingProgress } from "@/hooks/onboarding/useOnboardingProgress";

const STEPS: Step[] = [
  {
    target: '[data-tour="dashboard-home"]',
    content:
      "Welcome! This is your home dashboard — your daily snapshot of what's happening across your facilities.",
    placement: "center",
  },
  {
    target: '[data-tour="report-problem"]',
    content: "Use this button anytime to report a new problem and create a work order.",
    placement: "bottom",
  },
  {
    target: '[data-tour="nav-assets"]',
    content: "Track all your equipment and assets here — from HVAC units to forklifts.",
    placement: "right",
  },
  {
    target: '[data-tour="nav-work-orders"]',
    content: "Manage every maintenance request from creation to completion.",
    placement: "right",
  },
  {
    target: '[data-tour="nav-locations"]',
    content: "Organize buildings, floors, and rooms so every asset has a home.",
    placement: "right",
  },
  {
    target: '[data-tour="nav-team"]',
    content: "Invite teammates and assign roles. Collaboration starts here.",
    placement: "right",
  },
  {
    target: '[data-tour="nav-help"]',
    content: "Need a refresher? Re-launch this tour anytime from the Help page.",
    placement: "right",
  },
];

const GuidedTour: React.FC = () => {
  const { progress, completeTour } = useOnboardingProgress();
  const { pathname } = useLocation();
  const [run, setRun] = useState(false);

  useEffect(() => {
    if (!progress) return;
    if (
      progress.wizard_complete &&
      !progress.tour_complete &&
      pathname === "/dashboard"
    ) {
      const t = setTimeout(() => setRun(true), 800);
      return () => clearTimeout(t);
    }
  }, [progress?.tour_complete, progress?.wizard_complete, pathname]);

  const handleEvent = (data: EventData) => {
    if (data.status === STATUS.FINISHED || data.status === STATUS.SKIPPED) {
      setRun(false);
      completeTour();
    }
  };

  if (pathname !== "/dashboard") return null;

  return (
    <Joyride
      steps={STEPS}
      run={run}
      continuous
      onEvent={handleEvent}
      options={{
        showProgress: true,
        skipBeacon: true,
        buttons: ["back", "skip", "primary"],
        primaryColor: "hsl(var(--primary))",
        backgroundColor: "hsl(var(--card))",
        textColor: "hsl(var(--foreground))",
        arrowColor: "hsl(var(--card))",
        overlayColor: "rgba(0,0,0,0.5)",
        zIndex: 10000,
      }}
      locale={{
        back: "Back",
        close: "Close",
        last: "Finish",
        next: "Next",
        skip: "Skip tour",
      }}
    />
  );
};

export default GuidedTour;