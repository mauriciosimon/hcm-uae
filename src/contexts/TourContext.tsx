'use client';

import React, { createContext, useContext, useState, useEffect, useCallback, ReactNode } from 'react';

// Tour completion status for each module
export interface TourStatus {
  welcome: boolean;
  employees: boolean;
  leave: boolean;
  gratuity: boolean;
  overtime: boolean;
  documents: boolean;
  payroll: boolean;
  reports: boolean;
  settings: boolean;
}

interface TourContextType {
  tourStatus: TourStatus;
  isFirstVisit: boolean;
  currentTour: keyof TourStatus | null;
  startTour: (tour: keyof TourStatus) => void;
  completeTour: (tour: keyof TourStatus) => void;
  resetAllTours: () => void;
  resetTour: (tour: keyof TourStatus) => void;
  skipAllTours: () => void;
  isTourActive: boolean;
  setIsTourActive: (active: boolean) => void;
}

const defaultTourStatus: TourStatus = {
  welcome: false,
  employees: false,
  leave: false,
  gratuity: false,
  overtime: false,
  documents: false,
  payroll: false,
  reports: false,
  settings: false,
};

const TourContext = createContext<TourContextType | undefined>(undefined);

const TOUR_STORAGE_KEY = 'hcm-uae-tour-status';
const FIRST_VISIT_KEY = 'hcm-uae-first-visit';

export function TourProvider({ children }: { children: ReactNode }) {
  const [tourStatus, setTourStatus] = useState<TourStatus>(defaultTourStatus);
  const [isFirstVisit, setIsFirstVisit] = useState(true);
  const [currentTour, setCurrentTour] = useState<keyof TourStatus | null>(null);
  const [isTourActive, setIsTourActive] = useState(false);
  const [isInitialized, setIsInitialized] = useState(false);

  // Load tour status from localStorage on mount
  useEffect(() => {
    if (typeof window !== 'undefined') {
      const savedStatus = localStorage.getItem(TOUR_STORAGE_KEY);
      const savedFirstVisit = localStorage.getItem(FIRST_VISIT_KEY);

      if (savedStatus) {
        try {
          setTourStatus(JSON.parse(savedStatus));
        } catch (e) {
          console.error('Failed to parse tour status:', e);
        }
      }

      if (savedFirstVisit === 'false') {
        setIsFirstVisit(false);
      } else {
        // First time visiting - mark as visited
        localStorage.setItem(FIRST_VISIT_KEY, 'false');
        setIsFirstVisit(true);
      }

      setIsInitialized(true);
    }
  }, []);

  // Save tour status to localStorage when it changes
  useEffect(() => {
    if (isInitialized && typeof window !== 'undefined') {
      localStorage.setItem(TOUR_STORAGE_KEY, JSON.stringify(tourStatus));
    }
  }, [tourStatus, isInitialized]);

  const startTour = useCallback((tour: keyof TourStatus) => {
    setCurrentTour(tour);
    setIsTourActive(true);
  }, []);

  const completeTour = useCallback((tour: keyof TourStatus) => {
    setTourStatus((prev) => ({
      ...prev,
      [tour]: true,
    }));
    setCurrentTour(null);
    setIsTourActive(false);
  }, []);

  const resetAllTours = useCallback(() => {
    setTourStatus(defaultTourStatus);
    setIsFirstVisit(true);
    localStorage.setItem(FIRST_VISIT_KEY, 'true');
  }, []);

  const resetTour = useCallback((tour: keyof TourStatus) => {
    setTourStatus((prev) => ({
      ...prev,
      [tour]: false,
    }));
  }, []);

  const skipAllTours = useCallback(() => {
    setTourStatus({
      welcome: true,
      employees: true,
      leave: true,
      gratuity: true,
      overtime: true,
      documents: true,
      payroll: true,
      reports: true,
      settings: true,
    });
    setCurrentTour(null);
    setIsTourActive(false);
  }, []);

  return (
    <TourContext.Provider
      value={{
        tourStatus,
        isFirstVisit,
        currentTour,
        startTour,
        completeTour,
        resetAllTours,
        resetTour,
        skipAllTours,
        isTourActive,
        setIsTourActive,
      }}
    >
      {children}
    </TourContext.Provider>
  );
}

export function useTour() {
  const context = useContext(TourContext);
  if (context === undefined) {
    throw new Error('useTour must be used within a TourProvider');
  }
  return context;
}
