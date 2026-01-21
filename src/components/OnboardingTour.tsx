'use client';

import { useState, useEffect, useCallback } from 'react';
import { useRouter, usePathname } from 'next/navigation';
import Joyride, { Step, CallBackProps, STATUS, EVENTS, ACTIONS } from 'react-joyride';
import { useTour } from '@/contexts/TourContext';

// Complete unified tour steps that flow through all modules
const UNIFIED_TOUR_STEPS: (Step & { path?: string })[] = [
  // Welcome
  {
    target: 'body',
    content: (
      <div className="text-center">
        <div className="text-4xl mb-3">Welcome to HCM UAE!</div>
        <p className="text-gray-600">
          Your complete Human Capital Management solution built for UAE labor law compliance.
        </p>
        <p className="text-sm text-gray-500 mt-2">
          Let's take a quick tour through all the features. This will only take a few minutes.
        </p>
      </div>
    ),
    placement: 'center',
    disableBeacon: true,
    path: '/',
  },
  {
    target: '[data-tour="sidebar"]',
    content: (
      <div>
        <h3 className="font-semibold text-lg mb-2">Navigation Sidebar</h3>
        <p className="text-gray-600">
          Access all modules from here: Dashboard, Employees, Leave, Gratuity, Overtime, Documents, Payroll, Reports, and Settings.
        </p>
      </div>
    ),
    placement: 'right',
    path: '/',
  },

  // Dashboard Module
  {
    target: '[data-tour="dashboard-metrics"]',
    content: (
      <div>
        <h3 className="font-semibold text-lg mb-2">Key Metrics at a Glance</h3>
        <p className="text-gray-600">
          Monitor your workforce with 6 essential metrics: Active Employees, Pending Leaves, Expiring Documents, Monthly Payroll, Gratuity Liability, and Overtime costs.
        </p>
      </div>
    ),
    placement: 'bottom',
    path: '/',
  },
  {
    target: '[data-tour="dashboard-alerts"]',
    content: (
      <div>
        <h3 className="font-semibold text-lg mb-2">Alerts & Notifications</h3>
        <p className="text-gray-600">
          Stay on top of important items: expiring documents (color-coded by urgency), pending leave requests, and compliance deadlines.
        </p>
      </div>
    ),
    placement: 'top',
    path: '/',
  },
  {
    target: '[data-tour="dashboard-charts"]',
    content: (
      <div>
        <h3 className="font-semibold text-lg mb-2">Visual Analytics</h3>
        <p className="text-gray-600">
          Understand your workforce through charts: Headcount by Department, Payroll Trends (6 months), and Leave Utilization patterns.
        </p>
      </div>
    ),
    placement: 'top',
    path: '/',
  },
  {
    target: '[data-tour="dashboard-quicklinks"]',
    content: (
      <div>
        <h3 className="font-semibold text-lg mb-2">Quick Links</h3>
        <p className="text-gray-600">
          Jump directly to any module from here. Click on an icon to navigate to that section.
        </p>
      </div>
    ),
    placement: 'top',
    path: '/',
  },
  {
    target: '[data-tour="dashboard-snapshot"]',
    content: (
      <div>
        <h3 className="font-semibold text-lg mb-2">Today's Snapshot</h3>
        <p className="text-gray-600">
          See who's on leave today, upcoming birthdays, and probation periods ending soon - all in one place.
        </p>
        <p className="text-sm text-teal-600 mt-2">Now let's explore Employee Management →</p>
      </div>
    ),
    placement: 'left',
    path: '/',
  },

  // Employees Module
  {
    target: '[data-tour="stats-cards"]',
    content: (
      <div>
        <h3 className="font-semibold text-lg mb-2">Employee Stats Dashboard</h3>
        <p className="text-gray-600">
          Get an overview of your workforce at a glance - total employees, active count, expiring documents, and monthly payroll.
        </p>
      </div>
    ),
    placement: 'bottom',
    disableBeacon: true,
    path: '/employees',
  },
  {
    target: '[data-tour="add-employee"]',
    content: (
      <div>
        <h3 className="font-semibold text-lg mb-2">Add New Employee</h3>
        <p className="text-gray-600">
          Click here to add a new employee. Fill in personal info, employment details, compensation, and upload documents.
        </p>
      </div>
    ),
    placement: 'bottom',
    path: '/employees',
  },
  {
    target: '[data-tour="employee-search"]',
    content: (
      <div>
        <h3 className="font-semibold text-lg mb-2">Search & Filter</h3>
        <p className="text-gray-600">
          Quickly find employees by name, ID, or job title. Use the department filter to focus on specific teams.
        </p>
      </div>
    ),
    placement: 'bottom',
    path: '/employees',
  },
  {
    target: '[data-tour="employee-card"]',
    content: (
      <div>
        <h3 className="font-semibold text-lg mb-2">Employee Cards</h3>
        <p className="text-gray-600">
          Click on any employee card to view full details. Use the action menu to edit, view, or calculate gratuity.
        </p>
        <p className="text-sm text-teal-600 mt-2">Now let's check out Leave Management →</p>
      </div>
    ),
    placement: 'top',
    path: '/employees',
  },

  // Leave Module
  {
    target: '[data-tour="leave-balance"]',
    content: (
      <div>
        <h3 className="font-semibold text-lg mb-2">Leave Management</h3>
        <p className="text-gray-600">
          View leave entitlements based on UAE labor law: Annual (30 days), Sick (90 days), Maternity (60 days), and Paternity (5 days).
        </p>
      </div>
    ),
    placement: 'right',
    disableBeacon: true,
    path: '/leave',
  },
  {
    target: '[data-tour="request-leave"]',
    content: (
      <div>
        <h3 className="font-semibold text-lg mb-2">Request Leave</h3>
        <p className="text-gray-600">
          Submit leave requests here. Select the leave type, dates, and add a reason for your request.
        </p>
      </div>
    ),
    placement: 'bottom',
    path: '/leave',
  },
  {
    target: '[data-tour="leave-tabs"]',
    content: (
      <div>
        <h3 className="font-semibold text-lg mb-2">My Leaves & Team Requests</h3>
        <p className="text-gray-600">
          Switch between your own leave requests and team requests that need approval (for managers).
        </p>
        <p className="text-sm text-teal-600 mt-2">Next up: Gratuity Calculator →</p>
      </div>
    ),
    placement: 'bottom',
    path: '/leave',
  },

  // Gratuity Module
  {
    target: '[data-tour="gratuity-form"]',
    content: (
      <div>
        <h3 className="font-semibold text-lg mb-2">Gratuity Calculator</h3>
        <p className="text-gray-600">
          Calculate end-of-service gratuity based on UAE Federal Decree-Law No. 33/2021. Select an employee or enter details manually.
        </p>
      </div>
    ),
    placement: 'right',
    disableBeacon: true,
    path: '/gratuity',
  },
  {
    target: '[data-tour="quick-calculate"]',
    content: (
      <div>
        <h3 className="font-semibold text-lg mb-2">Quick Calculate</h3>
        <p className="text-gray-600">
          Click on any employee to instantly calculate their gratuity. The breakdown shows Years 1-5 (21 days/year) and Years 5+ (30 days/year).
        </p>
        <p className="text-sm text-teal-600 mt-2">Let's check Overtime Tracking →</p>
      </div>
    ),
    placement: 'top',
    path: '/gratuity',
  },

  // Overtime Module
  {
    target: '[data-tour="add-overtime"]',
    content: (
      <div>
        <h3 className="font-semibold text-lg mb-2">Overtime Tracking</h3>
        <p className="text-gray-600">
          Record overtime hours for employees. The system auto-calculates rates based on UAE law (1.25x normal, 1.5x night/holiday).
        </p>
      </div>
    ),
    placement: 'bottom',
    disableBeacon: true,
    path: '/overtime',
  },
  {
    target: '[data-tour="ramadan-toggle"]',
    content: (
      <div>
        <h3 className="font-semibold text-lg mb-2">Ramadan Mode</h3>
        <p className="text-gray-600">
          Enable Ramadan mode to automatically apply reduced working hours (6 hours/day) per UAE labor law.
        </p>
      </div>
    ),
    placement: 'bottom',
    path: '/overtime',
  },
  {
    target: '[data-tour="overtime-table"]',
    content: (
      <div>
        <h3 className="font-semibold text-lg mb-2">Overtime Entries</h3>
        <p className="text-gray-600">
          Review all overtime entries. Filter by status and approve entries as needed.
        </p>
        <p className="text-sm text-teal-600 mt-2">Now let's see Document Management →</p>
      </div>
    ),
    placement: 'top',
    path: '/overtime',
  },

  // Documents Module
  {
    target: '[data-tour="document-filters"]',
    content: (
      <div>
        <h3 className="font-semibold text-lg mb-2">Document Management</h3>
        <p className="text-gray-600">
          Track all employee documents: Passports, Emirates IDs, Visas, Labor Cards. Filter by type or expiry status.
        </p>
      </div>
    ),
    placement: 'bottom',
    disableBeacon: true,
    path: '/documents',
  },
  {
    target: '[data-tour="expiry-alerts"]',
    content: (
      <div>
        <h3 className="font-semibold text-lg mb-2">Expiry Status Colors</h3>
        <p className="text-gray-600 text-sm">
          <span className="inline-block w-3 h-3 rounded-full bg-emerald-500 mr-1"></span> Valid (90+ days)<br/>
          <span className="inline-block w-3 h-3 rounded-full bg-yellow-500 mr-1"></span> Warning (60-90 days)<br/>
          <span className="inline-block w-3 h-3 rounded-full bg-orange-500 mr-1"></span> Urgent (30-60 days)<br/>
          <span className="inline-block w-3 h-3 rounded-full bg-red-500 mr-1"></span> Critical (&lt;30 days)
        </p>
      </div>
    ),
    placement: 'bottom',
    path: '/documents',
  },
  {
    target: '[data-tour="document-card"]',
    content: (
      <div>
        <h3 className="font-semibold text-lg mb-2">Document Cards</h3>
        <p className="text-gray-600">
          View document details and use "Mark Renewed" when documents are renewed to update expiry dates.
        </p>
        <p className="text-sm text-teal-600 mt-2">Time for Payroll Management →</p>
      </div>
    ),
    placement: 'top',
    path: '/documents',
  },

  // Payroll Module
  {
    target: '[data-tour="payroll-workflow"]',
    content: (
      <div>
        <h3 className="font-semibold text-lg mb-2">Payroll Management</h3>
        <p className="text-gray-600">
          Follow the 4-step workflow: <strong>Calculate</strong> → <strong>Approve</strong> → <strong>Generate WPS</strong> → <strong>Mark Paid</strong>
        </p>
      </div>
    ),
    placement: 'bottom',
    disableBeacon: true,
    path: '/payroll',
  },
  {
    target: '[data-tour="run-payroll"]',
    content: (
      <div>
        <h3 className="font-semibold text-lg mb-2">Run Payroll</h3>
        <p className="text-gray-600">
          Start a new payroll run. The system calculates salaries, deductions, overtime, and generates payslips automatically.
        </p>
      </div>
    ),
    placement: 'bottom',
    path: '/payroll',
  },
  {
    target: '[data-tour="wps-download"]',
    content: (
      <div>
        <h3 className="font-semibold text-lg mb-2">WPS File</h3>
        <p className="text-gray-600">
          Download the Wage Protection System (WPS) file in UAE Central Bank format for bank submission.
        </p>
        <p className="text-sm text-teal-600 mt-2">Let's explore Reports →</p>
      </div>
    ),
    placement: 'bottom',
    path: '/payroll',
  },

  // Reports Module
  {
    target: '[data-tour="report-categories"]',
    content: (
      <div>
        <h3 className="font-semibold text-lg mb-2">Reports & Analytics</h3>
        <p className="text-gray-600">
          Browse reports by category: HR, Finance, Compliance, and Operations. Each category has pre-built reports ready to generate.
        </p>
      </div>
    ),
    placement: 'right',
    disableBeacon: true,
    path: '/reports',
  },
  {
    target: '[data-tour="templates"]',
    content: (
      <div>
        <h3 className="font-semibold text-lg mb-2">Document Templates</h3>
        <p className="text-gray-600">
          Generate official documents: Salary Certificates, NOC Letters, Experience Letters - all auto-filled with employee data.
        </p>
        <p className="text-sm text-teal-600 mt-2">Finally, let's look at Settings →</p>
      </div>
    ),
    placement: 'bottom',
    path: '/reports',
  },

  // Settings Module
  {
    target: '[data-tour="company-profile"]',
    content: (
      <div>
        <h3 className="font-semibold text-lg mb-2">Settings</h3>
        <p className="text-gray-600">
          Configure your company details: Trade License, Establishment Card, and WPS Employer Code for compliance.
        </p>
      </div>
    ),
    placement: 'right',
    disableBeacon: true,
    path: '/settings',
  },
  {
    target: '[data-tour="system-settings"]',
    content: (
      <div>
        <h3 className="font-semibold text-lg mb-2">System Settings</h3>
        <p className="text-gray-600">
          Set working days (UAE default: Sun-Thu), weekend days, fiscal year, and enable Ramadan mode.
        </p>
      </div>
    ),
    placement: 'right',
    path: '/settings',
  },
  {
    target: '[data-tour="notifications"]',
    content: (
      <div>
        <h3 className="font-semibold text-lg mb-2">Notifications</h3>
        <p className="text-gray-600">
          Configure document expiry alerts (90, 60, 30, 7 days before), leave notifications, and payroll alerts.
        </p>
      </div>
    ),
    placement: 'right',
    path: '/settings',
  },

  // Finish
  {
    target: 'body',
    content: (
      <div className="text-center">
        <div className="text-4xl mb-3">You're All Set!</div>
        <p className="text-gray-600">
          You've completed the tour of HCM UAE. You now know how to manage employees, track leave, calculate gratuity, and more.
        </p>
        <p className="text-sm text-gray-500 mt-2">
          Click the <strong>Tour</strong> button in the header anytime to restart this tour.
        </p>
      </div>
    ),
    placement: 'center',
    path: '/settings',
  },
];

export default function OnboardingTour() {
  const router = useRouter();
  const pathname = usePathname();
  const { isTourActive, setIsTourActive, completeTour } = useTour();
  const [run, setRun] = useState(false);
  const [stepIndex, setStepIndex] = useState(0);
  const [isNavigating, setIsNavigating] = useState(false);

  // Start tour when activated
  useEffect(() => {
    if (isTourActive && !run && !isNavigating) {
      // Find the first step that matches current path or navigate to first step's path
      const firstStep = UNIFIED_TOUR_STEPS[0];
      if (firstStep.path && pathname !== firstStep.path) {
        setIsNavigating(true);
        router.push(firstStep.path);
      } else {
        setRun(true);
      }
    }
  }, [isTourActive, run, isNavigating, pathname, router]);

  // Handle navigation completion
  useEffect(() => {
    if (isNavigating && isTourActive) {
      const currentStep = UNIFIED_TOUR_STEPS[stepIndex];
      if (currentStep?.path === pathname) {
        // Small delay to let the page render
        const timer = setTimeout(() => {
          setIsNavigating(false);
          setRun(true);
        }, 500);
        return () => clearTimeout(timer);
      }
    }
  }, [pathname, isNavigating, stepIndex, isTourActive]);

  const handleJoyrideCallback = useCallback((data: CallBackProps) => {
    const { status, action, index, type } = data;
    const finishedStatuses: string[] = [STATUS.FINISHED, STATUS.SKIPPED];

    if (finishedStatuses.includes(status)) {
      // Tour completed or skipped
      setRun(false);
      setStepIndex(0);
      setIsTourActive(false);
      completeTour('welcome');
      // Navigate back to dashboard
      router.push('/');
      return;
    }

    if (type === EVENTS.STEP_AFTER || type === EVENTS.TARGET_NOT_FOUND) {
      const nextIndex = index + (action === ACTIONS.PREV ? -1 : 1);

      if (nextIndex >= 0 && nextIndex < UNIFIED_TOUR_STEPS.length) {
        const nextStep = UNIFIED_TOUR_STEPS[nextIndex];
        const currentStep = UNIFIED_TOUR_STEPS[index];

        // Check if we need to navigate to a different page
        if (nextStep.path && nextStep.path !== currentStep?.path) {
          setRun(false);
          setIsNavigating(true);
          setStepIndex(nextIndex);
          router.push(nextStep.path);
        } else {
          setStepIndex(nextIndex);
        }
      }
    }
  }, [router, setIsTourActive, completeTour]);

  // Don't render if tour is not active
  if (!isTourActive) return null;

  // Get steps for current path (filter out path property for Joyride)
  const steps: Step[] = UNIFIED_TOUR_STEPS.map(({ path, ...step }) => step);

  return (
    <Joyride
      steps={steps}
      run={run}
      stepIndex={stepIndex}
      continuous
      showSkipButton
      showProgress
      callback={handleJoyrideCallback}
      scrollToFirstStep
      disableCloseOnEsc={false}
      disableOverlayClose
      spotlightClicks={false}
      styles={{
        options: {
          primaryColor: '#0d9488',
          zIndex: 10000,
          arrowColor: '#fff',
          backgroundColor: '#fff',
          overlayColor: 'rgba(0, 0, 0, 0.6)',
          textColor: '#1f2937',
        },
        spotlight: {
          borderRadius: 8,
        },
        tooltip: {
          borderRadius: 12,
          padding: 20,
          maxWidth: 380,
        },
        tooltipContainer: {
          textAlign: 'left',
        },
        tooltipTitle: {
          fontSize: 18,
          fontWeight: 600,
        },
        tooltipContent: {
          padding: '10px 0',
        },
        buttonNext: {
          backgroundColor: '#0d9488',
          borderRadius: 8,
          padding: '10px 20px',
          fontSize: 14,
          fontWeight: 500,
        },
        buttonBack: {
          color: '#6b7280',
          marginRight: 10,
        },
        buttonSkip: {
          color: '#9ca3af',
        },
        buttonClose: {
          display: 'none',
        },
      }}
      locale={{
        back: 'Back',
        close: 'Close',
        last: 'Finish Tour',
        next: 'Next',
        skip: 'Skip Tour',
      }}
      floaterProps={{
        disableAnimation: false,
      }}
    />
  );
}
