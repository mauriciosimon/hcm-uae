import { Employee } from '@/types/employee';

// Mock data for demonstration
export const mockEmployees: Employee[] = [
  {
    id: '1',
    employeeId: 'EMP-001',
    personalInfo: {
      firstName: 'Ahmed',
      lastName: 'Al-Rashid',
      arabicName: 'أحمد الراشد',
      dateOfBirth: '1990-05-15',
      gender: 'male',
      nationality: 'UAE',
      maritalStatus: 'married',
      email: 'ahmed.rashid@company.ae',
      phone: '+971501234567',
      address: 'Dubai Marina, Dubai, UAE',
      emergencyContact: {
        name: 'Fatima Al-Rashid',
        relationship: 'Spouse',
        phone: '+971509876543',
      },
    },
    employmentInfo: {
      jobTitle: 'Senior Software Engineer',
      department: 'Information Technology',
      employmentStartDate: '2020-03-01',
      contractType: 'limited',
      contractEndDate: '2025-02-28',
      probationEndDate: '2020-09-01',
      workLocation: 'Dubai Office',
      reportingTo: 'Tech Lead',
      employmentStatus: 'active',
    },
    compensation: {
      basicSalary: 15000,
      housingAllowance: 5000,
      transportAllowance: 2000,
      otherAllowances: 1000,
      totalPackage: 23000,
      currency: 'AED',
    },
    bankDetails: {
      bankName: 'Emirates NBD',
      accountNumber: '1234567890',
      iban: 'AE070331234567890123456',
    },
    documents: {
      passportNumber: 'A12345678',
      passportExpiry: '2028-05-15',
      emiratesId: '784-1990-1234567-1',
      emiratesIdExpiry: '2026-03-01',
      visaNumber: 'V123456789',
      visaExpiry: '2025-03-01',
      laborCardNumber: 'LC123456',
      laborCardExpiry: '2025-03-01',
    },
    createdAt: '2020-03-01T00:00:00Z',
    updatedAt: '2024-01-15T10:30:00Z',
  },
  {
    id: '2',
    employeeId: 'EMP-002',
    personalInfo: {
      firstName: 'Maria',
      lastName: 'Santos',
      dateOfBirth: '1988-11-22',
      gender: 'female',
      nationality: 'Philippines',
      maritalStatus: 'single',
      email: 'maria.santos@company.ae',
      phone: '+971551234567',
      address: 'Al Barsha, Dubai, UAE',
      emergencyContact: {
        name: 'Juan Santos',
        relationship: 'Father',
        phone: '+639171234567',
      },
    },
    employmentInfo: {
      jobTitle: 'HR Manager',
      department: 'Human Resources',
      employmentStartDate: '2019-06-15',
      contractType: 'limited',
      contractEndDate: '2024-06-14',
      probationEndDate: '2019-12-15',
      workLocation: 'Dubai Office',
      reportingTo: 'CEO',
      employmentStatus: 'active',
    },
    compensation: {
      basicSalary: 18000,
      housingAllowance: 6000,
      transportAllowance: 2500,
      otherAllowances: 1500,
      totalPackage: 28000,
      currency: 'AED',
    },
    bankDetails: {
      bankName: 'First Abu Dhabi Bank (FAB)',
      accountNumber: '0987654321',
      iban: 'AE070350987654321098765',
    },
    documents: {
      passportNumber: 'B87654321',
      passportExpiry: '2027-11-22',
      emiratesId: '784-1988-7654321-2',
      emiratesIdExpiry: '2025-06-15',
      visaNumber: 'V987654321',
      visaExpiry: '2024-06-15',
      laborCardNumber: 'LC654321',
      laborCardExpiry: '2024-06-15',
    },
    createdAt: '2019-06-15T00:00:00Z',
    updatedAt: '2024-01-10T14:20:00Z',
  },
  {
    id: '3',
    employeeId: 'EMP-003',
    personalInfo: {
      firstName: 'Rajesh',
      lastName: 'Kumar',
      dateOfBirth: '1985-03-08',
      gender: 'male',
      nationality: 'India',
      maritalStatus: 'married',
      email: 'rajesh.kumar@company.ae',
      phone: '+971561234567',
      address: 'International City, Dubai, UAE',
      emergencyContact: {
        name: 'Priya Kumar',
        relationship: 'Spouse',
        phone: '+971569876543',
      },
    },
    employmentInfo: {
      jobTitle: 'Finance Director',
      department: 'Finance',
      employmentStartDate: '2018-01-10',
      contractType: 'limited',
      contractEndDate: '2023-01-09',
      probationEndDate: '2018-07-10',
      workLocation: 'Abu Dhabi Office',
      reportingTo: 'CEO',
      employmentStatus: 'active',
    },
    compensation: {
      basicSalary: 25000,
      housingAllowance: 8000,
      transportAllowance: 3000,
      otherAllowances: 4000,
      totalPackage: 40000,
      currency: 'AED',
    },
    bankDetails: {
      bankName: 'Mashreq Bank',
      accountNumber: '5678901234',
      iban: 'AE070465678901234567890',
    },
    documents: {
      passportNumber: 'C45678901',
      passportExpiry: '2029-03-08',
      emiratesId: '784-1985-4567890-3',
      emiratesIdExpiry: '2024-01-10',
      visaNumber: 'V456789012',
      visaExpiry: '2024-01-10',
      laborCardNumber: 'LC890123',
      laborCardExpiry: '2024-01-10',
    },
    createdAt: '2018-01-10T00:00:00Z',
    updatedAt: '2024-01-05T09:15:00Z',
  },
];

// Helper to get document expiry status
export function getExpiryStatus(expiryDate: string): 'valid' | 'expiring_soon' | 'expired' {
  const today = new Date();
  const expiry = new Date(expiryDate);
  const daysUntilExpiry = Math.ceil((expiry.getTime() - today.getTime()) / (1000 * 60 * 60 * 24));
  
  if (daysUntilExpiry < 0) return 'expired';
  if (daysUntilExpiry <= 90) return 'expiring_soon';
  return 'valid';
}

// Helper to calculate years of service
export function calculateYearsOfService(startDate: string): number {
  const start = new Date(startDate);
  const today = new Date();
  const years = (today.getTime() - start.getTime()) / (1000 * 60 * 60 * 24 * 365.25);
  return Math.floor(years * 10) / 10; // Round to 1 decimal
}

// Helper to format currency
export function formatCurrency(amount: number, currency: string = 'AED'): string {
  return new Intl.NumberFormat('en-AE', {
    style: 'currency',
    currency: currency,
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(amount);
}
