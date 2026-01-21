// Employee Management Types - UAE Compliant

export interface Employee {
  id: string;
  employeeId: string;
  
  // Personal Information
  personalInfo: {
    firstName: string;
    lastName: string;
    arabicName?: string;
    dateOfBirth: string;
    gender: 'male' | 'female';
    nationality: string;
    maritalStatus: 'single' | 'married' | 'divorced' | 'widowed';
    email: string;
    phone: string;
    address: string;
    emergencyContact: {
      name: string;
      relationship: string;
      phone: string;
    };
  };
  
  // Employment Information
  employmentInfo: {
    jobTitle: string;
    department: string;
    employmentStartDate: string;
    contractType: 'limited' | 'unlimited'; // Note: All should be 'limited' as per 2023 reform
    contractEndDate?: string;
    probationEndDate?: string;
    workLocation: string;
    reportingTo?: string;
    employmentStatus: 'active' | 'on_leave' | 'terminated' | 'resigned';
  };
  
  // Compensation
  compensation: {
    basicSalary: number;
    housingAllowance: number;
    transportAllowance: number;
    otherAllowances: number;
    totalPackage: number;
    currency: 'AED';
  };
  
  // Bank Details (for WPS)
  bankDetails: {
    bankName: string;
    accountNumber: string;
    iban: string;
    routingCode?: string;
  };
  
  // Documents
  documents: {
    passportNumber: string;
    passportExpiry: string;
    emiratesId: string;
    emiratesIdExpiry: string;
    visaNumber?: string;
    visaExpiry?: string;
    laborCardNumber?: string;
    laborCardExpiry?: string;
  };
  
  // Metadata
  createdAt: string;
  updatedAt: string;
}

export interface EmployeeFormData {
  personalInfo: Partial<Employee['personalInfo']>;
  employmentInfo: Partial<Employee['employmentInfo']>;
  compensation: Partial<Employee['compensation']>;
  bankDetails: Partial<Employee['bankDetails']>;
  documents: Partial<Employee['documents']>;
}

// Department options
export const DEPARTMENTS = [
  'Administration',
  'Finance',
  'Human Resources',
  'Information Technology',
  'Marketing',
  'Operations',
  'Sales',
  'Customer Service',
  'Legal',
  'Other'
] as const;

// Nationality options (common in UAE)
export const NATIONALITIES = [
  'UAE',
  'India',
  'Pakistan',
  'Philippines',
  'Bangladesh',
  'Egypt',
  'Jordan',
  'Lebanon',
  'Syria',
  'United Kingdom',
  'United States',
  'Other'
] as const;

// UAE Banks (for WPS)
export const UAE_BANKS = [
  'Emirates NBD',
  'First Abu Dhabi Bank (FAB)',
  'Abu Dhabi Commercial Bank (ADCB)',
  'Dubai Islamic Bank',
  'Mashreq Bank',
  'Commercial Bank of Dubai',
  'RAKBANK',
  'Sharjah Islamic Bank',
  'National Bank of Fujairah',
  'Al Hilal Bank',
  'Other'
] as const;

// Contract types
export type ContractType = 'limited' | 'unlimited';

// Employment status
export type EmploymentStatus = 'active' | 'on_leave' | 'terminated' | 'resigned';

// Gender
export type Gender = 'male' | 'female';

// Marital status
export type MaritalStatus = 'single' | 'married' | 'divorced' | 'widowed';
