'use client';

import { TourProvider } from '@/contexts/TourContext';
import { SidebarProvider } from '@/contexts/SidebarContext';
import WelcomeTourModal from '@/components/WelcomeTourModal';
import OnboardingTour from '@/components/OnboardingTour';
import { ReactNode } from 'react';

export default function Providers({ children }: { children: ReactNode }) {
  return (
    <SidebarProvider>
      <TourProvider>
        {children}
        <WelcomeTourModal />
        <OnboardingTour />
      </TourProvider>
    </SidebarProvider>
  );
}
