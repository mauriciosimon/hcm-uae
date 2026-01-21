'use client';

import { useState, useEffect } from 'react';
import Joyride, { Step, CallBackProps, STATUS, EVENTS, ACTIONS } from 'react-joyride';
import { useTour, TourStatus } from '@/contexts/TourContext';

// Tour step definitions for each module
export const TOUR_STEPS: Record<keyof TourStatus, Step[]> = {
  welcome: [
    {
      target: 'body',
      content: (
        <div className="text-center">
          <div className="text-4xl mb-3">Welcome to HCM UAE!</div>
          <p className="text-gray-600">
            Your complete Human Capital Management solution built for UAE labor law compliance.
          </p>
          <p className="text-sm text-gray-500 mt-2">
            Let us show you around. This tour will help you get started.
          </p>
        </div>
      ),
      placement: 'center',
      disableBeacon: true,
    },
    {
      target: '[data-tour="sidebar"]',
      content: (
        <div>
          <h3 className="font-semibold text-lg mb-2">Navigation Sidebar</h3>
          <p className="text-gray-600">
            Access all modules from here: Employees, Leave, Gratuity, Overtime, Documents, Payroll, Reports, and Settings.
          </p>
        </div>
      ),
      placement: 'right',
    },
    {
      target: '[data-tour="stats-cards"]',
      content: (
        <div>
          <h3 className="font-semibold text-lg mb-2">Quick Stats Dashboard</h3>
          <p className="text-gray-600">
            Get an overview of your workforce at a glance - total employees, departments, and key metrics.
          </p>
        </div>
      ),
      placement: 'bottom',
    },
  ],

  employees: [
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
      disableBeacon: true,
    },
    {
      target: '[data-tour="employee-search"]',
      content: (
        <div>
          <h3 className="font-semibold text-lg mb-2">Search Employees</h3>
          <p className="text-gray-600">
            Quickly find employees by name, employee ID, or job title.
          </p>
        </div>
      ),
      placement: 'bottom',
    },
    {
      target: '[data-tour="department-filter"]',
      content: (
        <div>
          <h3 className="font-semibold text-lg mb-2">Filter by Department</h3>
          <p className="text-gray-600">
            Filter the employee list by department to focus on specific teams.
          </p>
        </div>
      ),
      placement: 'bottom',
    },
    {
      target: '[data-tour="view-toggle"]',
      content: (
        <div>
          <h3 className="font-semibold text-lg mb-2">Switch Views</h3>
          <p className="text-gray-600">
            Toggle between grid view (cards) and list view (table) based on your preference.
          </p>
        </div>
      ),
      placement: 'bottom',
    },
    {
      target: '[data-tour="employee-card"]',
      content: (
        <div>
          <h3 className="font-semibold text-lg mb-2">Employee Cards</h3>
          <p className="text-gray-600">
            Click on any employee card to view full details. Use the action menu (three dots) to edit, view, or calculate gratuity.
          </p>
        </div>
      ),
      placement: 'top',
    },
  ],

  leave: [
    {
      target: '[data-tour="leave-balance"]',
      content: (
        <div>
          <h3 className="font-semibold text-lg mb-2">Leave Balances</h3>
          <p className="text-gray-600">
            View your leave entitlements based on UAE labor law: Annual (30 days), Sick (90 days), Maternity (60 days), and Paternity (5 days).
          </p>
        </div>
      ),
      placement: 'bottom',
      disableBeacon: true,
    },
    {
      target: '[data-tour="request-leave"]',
      content: (
        <div>
          <h3 className="font-semibold text-lg mb-2">Request Leave</h3>
          <p className="text-gray-600">
            Click here to submit a new leave request. Select the leave type, dates, and add a reason.
          </p>
        </div>
      ),
      placement: 'bottom',
    },
    {
      target: '[data-tour="leave-tabs"]',
      content: (
        <div>
          <h3 className="font-semibold text-lg mb-2">My Leaves & Team Requests</h3>
          <p className="text-gray-600">
            Switch between viewing your own leave requests and team requests that need your approval (for managers).
          </p>
        </div>
      ),
      placement: 'bottom',
    },
    {
      target: '[data-tour="leave-list"]',
      content: (
        <div>
          <h3 className="font-semibold text-lg mb-2">Leave Requests</h3>
          <p className="text-gray-600">
            View all leave requests with their status. Managers can approve or reject pending requests here.
          </p>
        </div>
      ),
      placement: 'top',
    },
  ],

  gratuity: [
    {
      target: '[data-tour="gratuity-form"]',
      content: (
        <div>
          <h3 className="font-semibold text-lg mb-2">Gratuity Calculator</h3>
          <p className="text-gray-600">
            Select an employee or enter details manually to calculate end-of-service gratuity based on UAE Federal Decree-Law No. 33/2021.
          </p>
        </div>
      ),
      placement: 'right',
      disableBeacon: true,
    },
    {
      target: '[data-tour="gratuity-breakdown"]',
      content: (
        <div>
          <h3 className="font-semibold text-lg mb-2">Calculation Breakdown</h3>
          <p className="text-gray-600">
            See detailed breakdown: Years 1-5 (21 days/year), Years 5+ (30 days/year), with maximum cap of 2 years salary.
          </p>
        </div>
      ),
      placement: 'left',
    },
    {
      target: '[data-tour="quick-calculate"]',
      content: (
        <div>
          <h3 className="font-semibold text-lg mb-2">Quick Calculate</h3>
          <p className="text-gray-600">
            Click on any employee to instantly calculate their gratuity without filling the form.
          </p>
        </div>
      ),
      placement: 'top',
    },
  ],

  overtime: [
    {
      target: '[data-tour="add-overtime"]',
      content: (
        <div>
          <h3 className="font-semibold text-lg mb-2">Add Overtime Entry</h3>
          <p className="text-gray-600">
            Record overtime hours for employees. The system auto-calculates rates based on UAE law (1.25x normal, 1.5x night/holiday).
          </p>
        </div>
      ),
      placement: 'bottom',
      disableBeacon: true,
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
    },
    {
      target: '[data-tour="overtime-summary"]',
      content: (
        <div>
          <h3 className="font-semibold text-lg mb-2">Monthly Summary</h3>
          <p className="text-gray-600">
            View overtime statistics: total hours, pending approvals, and total amount for the current period.
          </p>
        </div>
      ),
      placement: 'bottom',
    },
    {
      target: '[data-tour="overtime-table"]',
      content: (
        <div>
          <h3 className="font-semibold text-lg mb-2">Overtime Entries</h3>
          <p className="text-gray-600">
            Review all overtime entries. Filter by status (pending, approved, rejected) and approve entries as needed.
          </p>
        </div>
      ),
      placement: 'top',
    },
  ],

  documents: [
    {
      target: '[data-tour="document-filters"]',
      content: (
        <div>
          <h3 className="font-semibold text-lg mb-2">Document Filters</h3>
          <p className="text-gray-600">
            Filter documents by type (Passport, Emirates ID, Visa, Labor Card) or by expiry status to focus on what needs attention.
          </p>
        </div>
      ),
      placement: 'bottom',
      disableBeacon: true,
    },
    {
      target: '[data-tour="expiry-alerts"]',
      content: (
        <div>
          <h3 className="font-semibold text-lg mb-2">Expiry Status Colors</h3>
          <p className="text-gray-600">
            <span className="inline-block w-3 h-3 rounded-full bg-emerald-500 mr-1"></span> Valid (90+ days)<br/>
            <span className="inline-block w-3 h-3 rounded-full bg-yellow-500 mr-1"></span> Warning (60-90 days)<br/>
            <span className="inline-block w-3 h-3 rounded-full bg-orange-500 mr-1"></span> Urgent (30-60 days)<br/>
            <span className="inline-block w-3 h-3 rounded-full bg-red-500 mr-1"></span> Critical (&lt;30 days)<br/>
            <span className="inline-block w-3 h-3 rounded-full bg-gray-500 mr-1"></span> Expired
          </p>
        </div>
      ),
      placement: 'bottom',
    },
    {
      target: '[data-tour="document-card"]',
      content: (
        <div>
          <h3 className="font-semibold text-lg mb-2">Document Cards</h3>
          <p className="text-gray-600">
            View document details and use the "Mark Renewed" button to update expiry dates when documents are renewed.
          </p>
        </div>
      ),
      placement: 'top',
    },
    {
      target: '[data-tour="calendar-view"]',
      content: (
        <div>
          <h3 className="font-semibold text-lg mb-2">Calendar View</h3>
          <p className="text-gray-600">
            Switch to calendar view to see document expiries on a timeline. Great for planning renewals.
          </p>
        </div>
      ),
      placement: 'left',
    },
  ],

  payroll: [
    {
      target: '[data-tour="payroll-workflow"]',
      content: (
        <div>
          <h3 className="font-semibold text-lg mb-2">Payroll Workflow</h3>
          <p className="text-gray-600">
            Follow the 4-step process: <strong>Calculate</strong> → <strong>Approve</strong> → <strong>Generate WPS</strong> → <strong>Mark Paid</strong>
          </p>
        </div>
      ),
      placement: 'bottom',
      disableBeacon: true,
    },
    {
      target: '[data-tour="run-payroll"]',
      content: (
        <div>
          <h3 className="font-semibold text-lg mb-2">Run Payroll</h3>
          <p className="text-gray-600">
            Click to start a new payroll run. The system calculates salaries, deductions, overtime, and generates payslips.
          </p>
        </div>
      ),
      placement: 'bottom',
    },
    {
      target: '[data-tour="wps-download"]',
      content: (
        <div>
          <h3 className="font-semibold text-lg mb-2">WPS File Download</h3>
          <p className="text-gray-600">
            Download the Wage Protection System (WPS) file in UAE Central Bank format for bank submission.
          </p>
        </div>
      ),
      placement: 'bottom',
    },
    {
      target: '[data-tour="payslip"]',
      content: (
        <div>
          <h3 className="font-semibold text-lg mb-2">View Payslip</h3>
          <p className="text-gray-600">
            Click to view detailed payslip for any employee. You can download as PDF for records.
          </p>
        </div>
      ),
      placement: 'left',
    },
    {
      target: '[data-tour="loan-manager"]',
      content: (
        <div>
          <h3 className="font-semibold text-lg mb-2">Loans & Advances</h3>
          <p className="text-gray-600">
            Manage employee loans and salary advances. Set up installment plans that auto-deduct from payroll.
          </p>
        </div>
      ),
      placement: 'top',
    },
  ],

  reports: [
    {
      target: '[data-tour="report-categories"]',
      content: (
        <div>
          <h3 className="font-semibold text-lg mb-2">Report Categories</h3>
          <p className="text-gray-600">
            Browse reports by category: HR, Finance, Compliance, and Operations. Each category has pre-built reports.
          </p>
        </div>
      ),
      placement: 'right',
      disableBeacon: true,
    },
    {
      target: '[data-tour="report-list"]',
      content: (
        <div>
          <h3 className="font-semibold text-lg mb-2">Available Reports</h3>
          <p className="text-gray-600">
            Click on any report to generate it. Reports include Employee Directory, Leave Summary, Payroll Analysis, and more.
          </p>
        </div>
      ),
      placement: 'bottom',
    },
    {
      target: '[data-tour="templates"]',
      content: (
        <div>
          <h3 className="font-semibold text-lg mb-2">Document Templates</h3>
          <p className="text-gray-600">
            Generate official documents: Salary Certificates, NOC Letters, Experience Letters - all auto-filled with employee data.
          </p>
        </div>
      ),
      placement: 'bottom',
    },
    {
      target: '[data-tour="export-options"]',
      content: (
        <div>
          <h3 className="font-semibold text-lg mb-2">Export Options</h3>
          <p className="text-gray-600">
            Export reports as PDF for formal documents or CSV for data analysis in Excel.
          </p>
        </div>
      ),
      placement: 'left',
    },
  ],

  settings: [
    {
      target: '[data-tour="company-profile"]',
      content: (
        <div>
          <h3 className="font-semibold text-lg mb-2">Company Profile</h3>
          <p className="text-gray-600">
            Configure your company details: Trade License, Establishment Card, WPS Employer Code for compliance.
          </p>
        </div>
      ),
      placement: 'bottom',
      disableBeacon: true,
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
      placement: 'bottom',
    },
    {
      target: '[data-tour="notifications"]',
      content: (
        <div>
          <h3 className="font-semibold text-lg mb-2">Notification Settings</h3>
          <p className="text-gray-600">
            Configure document expiry alerts (90, 60, 30, 7 days before), leave notifications, and payroll alerts.
          </p>
        </div>
      ),
      placement: 'bottom',
    },
    {
      target: '[data-tour="user-management"]',
      content: (
        <div>
          <h3 className="font-semibold text-lg mb-2">User Management</h3>
          <p className="text-gray-600">
            Add team members with different roles: Admin (full access), HR Manager, Manager (team only), or Employee (self only).
          </p>
        </div>
      ),
      placement: 'bottom',
    },
  ],
};

interface OnboardingTourProps {
  tourKey: keyof TourStatus;
  autoStart?: boolean;
}

export default function OnboardingTour({ tourKey, autoStart = false }: OnboardingTourProps) {
  const { tourStatus, currentTour, completeTour, isTourActive, setIsTourActive, isFirstVisit } = useTour();
  const [run, setRun] = useState(false);
  const [stepIndex, setStepIndex] = useState(0);

  const steps = TOUR_STEPS[tourKey] || [];
  const isCompleted = tourStatus[tourKey];

  // Auto-start tour on first visit or when explicitly started
  useEffect(() => {
    if (currentTour === tourKey && isTourActive) {
      setRun(true);
      setStepIndex(0);
    } else if (autoStart && !isCompleted && isFirstVisit && tourKey === 'welcome') {
      // Auto-start welcome tour on first visit
      setRun(true);
      setStepIndex(0);
    }
  }, [currentTour, tourKey, isTourActive, autoStart, isCompleted, isFirstVisit]);

  const handleJoyrideCallback = (data: CallBackProps) => {
    const { status, action, index, type } = data;
    const finishedStatuses: string[] = [STATUS.FINISHED, STATUS.SKIPPED];

    if (finishedStatuses.includes(status)) {
      setRun(false);
      setStepIndex(0);
      completeTour(tourKey);
    } else if (type === EVENTS.STEP_AFTER || type === EVENTS.TARGET_NOT_FOUND) {
      // Update step index
      const nextIndex = index + (action === ACTIONS.PREV ? -1 : 1);
      setStepIndex(nextIndex);
    }
  };

  if (steps.length === 0) return null;

  return (
    <Joyride
      steps={steps}
      run={run}
      stepIndex={stepIndex}
      continuous
      showSkipButton
      showProgress
      callback={handleJoyrideCallback}
      styles={{
        options: {
          primaryColor: '#0d9488', // teal-600
          zIndex: 10000,
          arrowColor: '#fff',
          backgroundColor: '#fff',
          overlayColor: 'rgba(0, 0, 0, 0.5)',
          textColor: '#1f2937',
        },
        spotlight: {
          borderRadius: 8,
        },
        tooltip: {
          borderRadius: 12,
          padding: 20,
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
          padding: '8px 16px',
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
        beacon: {
          display: 'none',
        },
        beaconInner: {
          backgroundColor: '#0d9488',
        },
        beaconOuter: {
          backgroundColor: 'rgba(13, 148, 136, 0.2)',
          borderColor: '#0d9488',
        },
      }}
      locale={{
        back: 'Back',
        close: 'Close',
        last: 'Finish',
        next: 'Next',
        skip: 'Skip Tour',
      }}
      floaterProps={{
        disableAnimation: true,
      }}
    />
  );
}
