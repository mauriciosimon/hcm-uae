// Gratuity Types - UAE Federal Decree-Law No. 33/2021, Article 51

export type ContractType = 'limited' | 'unlimited';
export type TerminationType = 'resignation' | 'termination';

export interface GratuityInput {
  employeeId?: string;
  basicSalary: number;
  employmentStartDate: string;
  employmentEndDate: string;
  contractType: ContractType;
  terminationType: TerminationType;
  unpaidLeaveDays: number; // Days absent without pay to exclude
}

export interface GratuityBreakdown {
  // Service details
  totalServiceDays: number;
  effectiveServiceDays: number; // After excluding unpaid leave
  yearsOfService: number;
  monthsOfService: number;
  daysOfService: number;

  // Wage calculation
  basicSalary: number;
  annualSalary: number;
  dailyWage: number;

  // Gratuity calculation
  firstFiveYearsAmount: number;
  afterFiveYearsAmount: number;
  grossGratuity: number;

  // Adjustments for unlimited contract resignation
  resignationMultiplier: number;
  resignationDeduction: number;

  // Final amounts
  netGratuity: number;
  cappedGratuity: number; // After applying 2-year cap
  maxCap: number;
  isCapped: boolean;

  // Eligibility
  isEligible: boolean;
  ineligibilityReason?: string;
}

export interface GratuityStatement {
  employeeName: string;
  employeeId: string;
  generatedDate: string;
  input: GratuityInput;
  breakdown: GratuityBreakdown;
}

// UAE Gratuity Law Constants (Article 51)
export const UAE_GRATUITY_LAW = {
  // Minimum service for eligibility
  minServiceYears: 1,

  // Days of salary per year of service
  daysPerYearFirst5: 21, // Years 1-5: 21 days basic salary
  daysPerYearAfter5: 30, // Years 5+: 30 days basic salary

  // Maximum cap
  maxCapYears: 2, // Maximum 2 years total basic salary

  // Days in year for daily wage calculation
  daysInYear: 365,

  // Resignation multipliers for unlimited contracts
  resignationMultipliers: {
    lessThan1Year: 0,      // No gratuity
    between1And3Years: 1/3, // 1/3 of calculated amount
    between3And5Years: 2/3, // 2/3 of calculated amount
    moreThan5Years: 1,      // Full amount
  },

  // Payment deadline
  paymentDeadlineDays: 14, // Must be paid within 14 days

  // Threshold years
  thresholdYears: {
    tier1: 1,
    tier2: 3,
    tier3: 5,
  },
} as const;

export const CONTRACT_TYPE_LABELS: Record<ContractType, string> = {
  limited: 'Limited Contract',
  unlimited: 'Unlimited Contract',
};

export const TERMINATION_TYPE_LABELS: Record<TerminationType, string> = {
  resignation: 'Resignation',
  termination: 'Termination by Employer',
};
