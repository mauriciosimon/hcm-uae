// Leave Management Types - UAE Labor Law Compliant

export type LeaveType = 'annual' | 'sick' | 'maternity' | 'paternity' | 'unpaid';

export type LeaveStatus = 'pending' | 'approved' | 'rejected' | 'cancelled';

export interface LeaveRequest {
  id: string;
  employeeId: string;
  employeeName?: string;
  leaveType: LeaveType;
  startDate: string;
  endDate: string;
  totalDays: number;
  reason: string;
  status: LeaveStatus;
  approvedBy?: string;
  approvedAt?: string;
  rejectionReason?: string;
  createdAt: string;
  updatedAt: string;
}

export interface LeaveBalance {
  employeeId: string;
  annual: {
    entitled: number;
    used: number;
    pending: number;
    available: number;
  };
  sick: {
    fullPay: { entitled: number; used: number; available: number };
    halfPay: { entitled: number; used: number; available: number };
    unpaid: { entitled: number; used: number; available: number };
  };
  maternity: {
    fullPay: { entitled: number; used: number; available: number };
    halfPay: { entitled: number; used: number; available: number };
  };
  paternity: {
    entitled: number;
    used: number;
    available: number;
  };
}

// UAE Labor Law Leave Entitlements
export const UAE_LEAVE_POLICY = {
  annual: {
    // After 1 year of service: 30 days per year
    // After 6 months but less than 1 year: 2 days per month
    fullEntitlement: 30, // days per year after 1 year
    probationRate: 2, // days per month after 6 months
    minServiceMonths: 6, // minimum months to earn leave
  },
  sick: {
    // First 15 days: full pay
    // Next 30 days: half pay
    // Next 45 days: unpaid
    fullPayDays: 15,
    halfPayDays: 30,
    unpaidDays: 45,
    totalDays: 90, // maximum sick leave per year
  },
  maternity: {
    // 45 days full pay + 15 days half pay
    fullPayDays: 45,
    halfPayDays: 15,
    totalDays: 60,
  },
  paternity: {
    // 5 days paid leave
    paidDays: 5,
  },
} as const;

export const LEAVE_TYPE_LABELS: Record<LeaveType, string> = {
  annual: 'Annual Leave',
  sick: 'Sick Leave',
  maternity: 'Maternity Leave',
  paternity: 'Paternity Leave',
  unpaid: 'Unpaid Leave',
};

export const LEAVE_STATUS_LABELS: Record<LeaveStatus, string> = {
  pending: 'Pending Approval',
  approved: 'Approved',
  rejected: 'Rejected',
  cancelled: 'Cancelled',
};
