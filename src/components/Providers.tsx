'use client';

import { TourProvider } from '@/contexts/TourContext';
import WelcomeTourModal from '@/components/WelcomeTourModal';
import { ReactNode } from 'react';

export default function Providers({ children }: { children: ReactNode }) {
  return (
    <TourProvider>
      {children}
      <WelcomeTourModal />
    </TourProvider>
  );
}
