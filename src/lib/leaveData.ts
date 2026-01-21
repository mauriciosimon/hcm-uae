import { LeaveRequest, LeaveBalance, UAE_LEAVE_POLICY } from '@/types/leave';
import { Employee } from '@/types/employee';

// Calculate leave entitlement based on service duration
export function calculateAnnualLeaveEntitlement(employmentStartDate: string): number {
  const start = new Date(employmentStartDate);
  const today = new Date();
  const monthsOfService = Math.floor(
    (today.getTime() - start.getTime()) / (1000 * 60 * 60 * 24 * 30.44)
  );

  if (monthsOfService < UAE_LEAVE_POLICY.annual.minServiceMonths) {
    return 0; // No leave entitlement during first 6 months
  }

  if (monthsOfService < 12) {
    // 2 days per month after 6 months
    return (monthsOfService - 6) * UAE_LEAVE_POLICY.annual.probationRate;
  }

  // Full entitlement: 30 days per year
  return UAE_LEAVE_POLICY.annual.fullEntitlement;
}

// Calculate leave balance for an employee
export function calculateLeaveBalance(
  employee: Employee,
  leaveRequests: LeaveRequest[]
): LeaveBalance {
  const employeeRequests = leaveRequests.filter(
    (r) => r.employeeId === employee.id && r.status !== 'cancelled' && r.status !== 'rejected'
  );

  const annualEntitled = calculateAnnualLeaveEntitlement(employee.employmentInfo.employmentStartDate);
  const annualUsed = employeeRequests
    .filter((r) => r.leaveType === 'annual' && r.status === 'approved')
    .reduce((sum, r) => sum + r.totalDays, 0);
  const annualPending = employeeRequests
    .filter((r) => r.leaveType === 'annual' && r.status === 'pending')
    .reduce((sum, r) => sum + r.totalDays, 0);

  const sickUsed = employeeRequests
    .filter((r) => r.leaveType === 'sick' && r.status === 'approved')
    .reduce((sum, r) => sum + r.totalDays, 0);

  // Calculate sick leave breakdown (full pay -> half pay -> unpaid)
  const sickFullPayUsed = Math.min(sickUsed, UAE_LEAVE_POLICY.sick.fullPayDays);
  const sickHalfPayUsed = Math.min(
    Math.max(0, sickUsed - UAE_LEAVE_POLICY.sick.fullPayDays),
    UAE_LEAVE_POLICY.sick.halfPayDays
  );
  const sickUnpaidUsed = Math.max(
    0,
    sickUsed - UAE_LEAVE_POLICY.sick.fullPayDays - UAE_LEAVE_POLICY.sick.halfPayDays
  );

  const isFemale = employee.personalInfo.gender === 'female';
  const maternityUsed = isFemale
    ? employeeRequests
        .filter((r) => r.leaveType === 'maternity' && r.status === 'approved')
        .reduce((sum, r) => sum + r.totalDays, 0)
    : 0;

  const isMale = employee.personalInfo.gender === 'male';
  const paternityUsed = isMale
    ? employeeRequests
        .filter((r) => r.leaveType === 'paternity' && r.status === 'approved')
        .reduce((sum, r) => sum + r.totalDays, 0)
    : 0;

  return {
    employeeId: employee.id,
    annual: {
      entitled: annualEntitled,
      used: annualUsed,
      pending: annualPending,
      available: Math.max(0, annualEntitled - annualUsed - annualPending),
    },
    sick: {
      fullPay: {
        entitled: UAE_LEAVE_POLICY.sick.fullPayDays,
        used: sickFullPayUsed,
        available: UAE_LEAVE_POLICY.sick.fullPayDays - sickFullPayUsed,
      },
      halfPay: {
        entitled: UAE_LEAVE_POLICY.sick.halfPayDays,
        used: sickHalfPayUsed,
        available: UAE_LEAVE_POLICY.sick.halfPayDays - sickHalfPayUsed,
      },
      unpaid: {
        entitled: UAE_LEAVE_POLICY.sick.unpaidDays,
        used: sickUnpaidUsed,
        available: UAE_LEAVE_POLICY.sick.unpaidDays - sickUnpaidUsed,
      },
    },
    maternity: {
      fullPay: {
        entitled: isFemale ? UAE_LEAVE_POLICY.maternity.fullPayDays : 0,
        used: Math.min(maternityUsed, UAE_LEAVE_POLICY.maternity.fullPayDays),
        available: isFemale
          ? Math.max(0, UAE_LEAVE_POLICY.maternity.fullPayDays - maternityUsed)
          : 0,
      },
      halfPay: {
        entitled: isFemale ? UAE_LEAVE_POLICY.maternity.halfPayDays : 0,
        used: Math.max(0, maternityUsed - UAE_LEAVE_POLICY.maternity.fullPayDays),
        available: isFemale
          ? Math.max(
              0,
              UAE_LEAVE_POLICY.maternity.halfPayDays -
                Math.max(0, maternityUsed - UAE_LEAVE_POLICY.maternity.fullPayDays)
            )
          : 0,
      },
    },
    paternity: {
      entitled: isMale ? UAE_LEAVE_POLICY.paternity.paidDays : 0,
      used: paternityUsed,
      available: isMale ? Math.max(0, UAE_LEAVE_POLICY.paternity.paidDays - paternityUsed) : 0,
    },
  };
}

// Calculate business days between two dates (excluding weekends)
export function calculateBusinessDays(startDate: string, endDate: string): number {
  const start = new Date(startDate);
  const end = new Date(endDate);
  let count = 0;
  const current = new Date(start);

  while (current <= end) {
    const dayOfWeek = current.getDay();
    // UAE weekend is Friday (5) and Saturday (6)
    if (dayOfWeek !== 5 && dayOfWeek !== 6) {
      count++;
    }
    current.setDate(current.getDate() + 1);
  }

  return count;
}

// Format date for display
export function formatDate(dateString: string): string {
  return new Date(dateString).toLocaleDateString('en-AE', {
    day: 'numeric',
    month: 'short',
    year: 'numeric',
  });
}

// Mock leave requests data
export const mockLeaveRequests: LeaveRequest[] = [
  {
    id: 'LR-001',
    employeeId: '1',
    leaveType: 'annual',
    startDate: '2024-02-15',
    endDate: '2024-02-22',
    totalDays: 6,
    reason: 'Family vacation',
    status: 'approved',
    approvedBy: 'HR Manager',
    approvedAt: '2024-02-01T10:00:00Z',
    createdAt: '2024-01-25T09:00:00Z',
    updatedAt: '2024-02-01T10:00:00Z',
  },
  {
    id: 'LR-002',
    employeeId: '1',
    leaveType: 'sick',
    startDate: '2024-01-10',
    endDate: '2024-01-12',
    totalDays: 3,
    reason: 'Medical appointment and recovery',
    status: 'approved',
    approvedBy: 'HR Manager',
    approvedAt: '2024-01-10T11:00:00Z',
    createdAt: '2024-01-10T08:00:00Z',
    updatedAt: '2024-01-10T11:00:00Z',
  },
  {
    id: 'LR-003',
    employeeId: '2',
    leaveType: 'annual',
    startDate: '2024-03-01',
    endDate: '2024-03-10',
    totalDays: 8,
    reason: 'Personal travel',
    status: 'pending',
    createdAt: '2024-02-10T14:00:00Z',
    updatedAt: '2024-02-10T14:00:00Z',
  },
  {
    id: 'LR-004',
    employeeId: '3',
    leaveType: 'paternity',
    startDate: '2024-01-20',
    endDate: '2024-01-24',
    totalDays: 5,
    reason: 'Birth of child',
    status: 'approved',
    approvedBy: 'CEO',
    approvedAt: '2024-01-15T09:00:00Z',
    createdAt: '2024-01-10T16:00:00Z',
    updatedAt: '2024-01-15T09:00:00Z',
  },
  {
    id: 'LR-005',
    employeeId: '1',
    leaveType: 'annual',
    startDate: '2024-04-01',
    endDate: '2024-04-05',
    totalDays: 5,
    reason: 'Extended weekend trip',
    status: 'pending',
    createdAt: '2024-02-15T10:00:00Z',
    updatedAt: '2024-02-15T10:00:00Z',
  },
  // New leave requests for additional employees
  {
    id: 'LR-006',
    employeeId: '4',
    leaveType: 'annual',
    startDate: '2026-01-27',
    endDate: '2026-01-30',
    totalDays: 4,
    reason: 'Family wedding in Abu Dhabi',
    status: 'approved',
    approvedBy: 'HR Manager',
    approvedAt: '2026-01-15T14:00:00Z',
    createdAt: '2026-01-10T09:00:00Z',
    updatedAt: '2026-01-15T14:00:00Z',
  },
  {
    id: 'LR-007',
    employeeId: '5',
    leaveType: 'sick',
    startDate: '2026-01-13',
    endDate: '2026-01-14',
    totalDays: 2,
    reason: 'Flu symptoms and doctor visit',
    status: 'approved',
    approvedBy: 'HR Manager',
    approvedAt: '2026-01-13T10:00:00Z',
    createdAt: '2026-01-13T08:00:00Z',
    updatedAt: '2026-01-13T10:00:00Z',
  },
  {
    id: 'LR-008',
    employeeId: '6',
    leaveType: 'maternity',
    startDate: '2026-02-01',
    endDate: '2026-03-17',
    totalDays: 45,
    reason: 'Maternity leave - expected delivery',
    status: 'pending',
    createdAt: '2026-01-05T11:00:00Z',
    updatedAt: '2026-01-05T11:00:00Z',
  },
  {
    id: 'LR-009',
    employeeId: '7',
    leaveType: 'annual',
    startDate: '2026-01-20',
    endDate: '2026-01-21',
    totalDays: 2,
    reason: 'Personal errands',
    status: 'rejected',
    rejectionReason: 'Critical sales period - please reschedule',
    createdAt: '2026-01-15T10:00:00Z',
    updatedAt: '2026-01-18T16:00:00Z',
  },
  {
    id: 'LR-010',
    employeeId: '9',
    leaveType: 'sick',
    startDate: '2026-01-06',
    endDate: '2026-01-08',
    totalDays: 3,
    reason: 'Food poisoning - doctor recommended rest',
    status: 'approved',
    approvedBy: 'IT Manager',
    approvedAt: '2026-01-06T09:30:00Z',
    createdAt: '2026-01-06T07:00:00Z',
    updatedAt: '2026-01-06T09:30:00Z',
  },
];
