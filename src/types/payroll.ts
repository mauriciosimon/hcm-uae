// Payroll Types - UAE WPS Compliant

export type PayrollStatus = 'draft' | 'calculated' | 'approved' | 'paid';

export type DeductionType = 'unpaid_leave' | 'advance' | 'loan' | 'late' | 'other';

export interface SalaryComponent {
  basicSalary: number;
  housingAllowance: number;
  transportAllowance: number;
  otherAllowances: number;
  overtime: number;
  grossSalary: number;
}

export interface Deduction {
  id: string;
  employeeId: string;
  type: DeductionType;
  description: string;
  amount: number;
  month: number;
  year: number;
  createdAt: string;
}

export interface LoanAdvance {
  id: string;
  employeeId: string;
  type: 'loan' | 'advance';
  totalAmount: number;
  remainingAmount: number;
  monthlyInstallment: number;
  startMonth: number;
  startYear: number;
  endMonth?: number;
  endYear?: number;
  description: string;
  isActive: boolean;
  createdAt: string;
}

export interface PayrollEntry {
  id: string;
  employeeId: string;
  month: number;
  year: number;

  // Earnings
  basicSalary: number;
  housingAllowance: number;
  transportAllowance: number;
  otherAllowances: number;
  overtimeAmount: number;
  overtimeHours: number;
  totalEarnings: number;

  // Deductions
  unpaidLeaveDays: number;
  unpaidLeaveDeduction: number;
  advanceDeduction: number;
  loanDeduction: number;
  otherDeductions: number;
  totalDeductions: number;

  // Net
  netSalary: number;

  // WPS fields
  bankCode: string;
  accountNumber: string;
  iban: string;

  // Status
  status: PayrollStatus;
  approvedBy?: string;
  approvedAt?: string;
  paidAt?: string;

  createdAt: string;
  updatedAt: string;
}

export interface PayrollRun {
  id: string;
  month: number;
  year: number;
  status: PayrollStatus;
  totalEmployees: number;
  totalGross: number;
  totalDeductions: number;
  totalNet: number;
  entries: PayrollEntry[];
  wpsFileGenerated: boolean;
  wpsGeneratedAt?: string;
  approvedBy?: string;
  approvedAt?: string;
  paidAt?: string;
  createdAt: string;
  updatedAt: string;
}

// WPS SIF File Record
export interface WPSSIFRecord {
  recordType: 'EDR'; // Employee Data Record
  employerCode: string;
  bankCode: string;
  employeeId: string;
  accountNumber: string;
  startDate: string;
  endDate: string;
  daysWorked: number;
  netSalary: number;
  fixedAllowance: number;
  variableAllowance: number;
  leaveAmount: number;
}

// UAE Bank Codes for WPS
export const UAE_BANK_CODES: Record<string, string> = {
  'Emirates NBD': 'ELONAEAD',
  'First Abu Dhabi Bank (FAB)': 'NBADAEAD',
  'Abu Dhabi Commercial Bank (ADCB)': 'ADCBAEAA',
  'Dubai Islamic Bank': 'DUIBAEAD',
  'Mashreq Bank': 'BOLOAEAD',
  'Commercial Bank of Dubai': 'CBDUAEAD',
  'RAKBANK': 'NABORUAE',
  'Sharjah Islamic Bank': 'NBSHAEAS',
  'National Bank of Fujairah': 'NBFUAEAF',
  'Al Hilal Bank': 'AABORUAE',
};

// Deduction type labels
export const DEDUCTION_TYPE_LABELS: Record<DeductionType, string> = {
  unpaid_leave: 'Unpaid Leave',
  advance: 'Salary Advance',
  loan: 'Loan Installment',
  late: 'Late Deduction',
  other: 'Other Deduction',
};

// Payroll status labels and colors
export const PAYROLL_STATUS_CONFIG: Record<
  PayrollStatus,
  { label: string; bgColor: string; textColor: string }
> = {
  draft: {
    label: 'Draft',
    bgColor: 'bg-gray-100',
    textColor: 'text-gray-700',
  },
  calculated: {
    label: 'Calculated',
    bgColor: 'bg-blue-100',
    textColor: 'text-blue-700',
  },
  approved: {
    label: 'Approved',
    bgColor: 'bg-amber-100',
    textColor: 'text-amber-700',
  },
  paid: {
    label: 'Paid',
    bgColor: 'bg-emerald-100',
    textColor: 'text-emerald-700',
  },
};

// Company WPS details (mock)
export const COMPANY_WPS_CONFIG = {
  employerCode: 'COMP001234',
  establishmentId: 'EST-2024-12345',
  companyName: 'HCM UAE Demo Company',
  molId: 'MOL123456789',
};
