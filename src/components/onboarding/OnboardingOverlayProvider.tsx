'use client';

import React, { useEffect, useState } from 'react';
import { OnboardingWizard } from './OnboardingWizard';
import { OnboardingNotifications } from './OnboardingNotifications';

interface OnboardingOverlayProviderProps {
  children: React.ReactNode;
}

export function OnboardingOverlayProvider({ children }: OnboardingOverlayProviderProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [showNotifications, setShowNotifications] = useState(false);

  useEffect(() => {
    // Check localStorage on mount
    if (typeof window !== 'undefined') {
      const completed = localStorage.getItem('aklow_onboarding_complete');
      if (!completed) {
        setIsOpen(true);
      } else {
        // Only show notifications if onboarding is complete
        setShowNotifications(true);
      }
    }

    // Listen for restart event
    const handleRestart = () => {
      setIsOpen(true);
      setShowNotifications(false);
    };

    window.addEventListener('aklow-restart-onboarding', handleRestart);

    return () => {
      window.removeEventListener('aklow-restart-onboarding', handleRestart);
    };
  }, []);

  const handleClose = () => {
    if (typeof window !== 'undefined') {
      localStorage.setItem('aklow_onboarding_complete', 'true');
    }
    setIsOpen(false);
    setShowNotifications(true);
  };

  return (
    <>
      {children}
      {isOpen && <OnboardingWizard onClose={handleClose} />}
      {showNotifications && !isOpen && <OnboardingNotifications />}
    </>
  );
}

