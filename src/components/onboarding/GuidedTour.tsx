import React, { useEffect, useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import Joyride, { CallBackProps, STATUS, Step } from "react-joyride";
import { useOnboardingProgress } from "@/hooks/onboarding/useOnboardingProgress";

const STEPS: Step[] = [
  {
    target: '[data-tour="dashboard-home"]',
    content:
      "Welcome! This is your home dashboard — your daily snapshot of what's happening across your facilities.",
    placement: "center",
    disableBeacon: true,
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
  const navigate = useNavigate();
  const [run, setRun] = useState(false);

  useEffect(() => {
    if (!progress) return;
    // Auto-run when wizard complete, tour not done, and on dashboard
    if (progress.wizard_complete && !progress.tour_complete && pathname === "/dashboard") {
      // Slight delay so DOM mounts
      const t = setTimeout(() => setRun(true), 800);
      return () => clearTimeout(t);
    }
    // Manual restart: tour_complete=false set by user via "Take the product tour"
    if (!progress.tour_complete && pathname === "/dashboard" && progress.wizard_complete) {
      setRun(true);
    }
  }, [progress?.tour_complete, progress?.wizard_complete, pathname]);

  const handleCallback = (data: CallBackProps) => {
    const { status } = data;
    if (status === STATUS.FINISHED || status === STATUS.SKIPPED) {
      setRun(false);
      completeTour();
    }
  };

  // Only render on dashboard to keep DOM light
  if (pathname !== "/dashboard") return null;

  return (
    <Joyride
      steps={STEPS}
      run={run}
      continuous
      showSkipButton
      showProgress
      disableScrolling={false}
      callback={handleCallback}
      styles={{
        options: {
          primaryColor: "hsl(var(--primary))",
          zIndex: 10000,
          arrowColor: "hsl(var(--card))",
          backgroundColor: "hsl(var(--card))",
          textColor: "hsl(var(--foreground))",
          overlayColor: "rgba(0,0,0,0.5)",
        },
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