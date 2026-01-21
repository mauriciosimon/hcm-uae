import {
  OvertimeEntry,
  OvertimeType,
  OvertimeSummary,
  PublicHoliday,
  UAE_OVERTIME_LAW,
  UAE_PUBLIC_HOLIDAYS_2025,
} from '@/types/overtime';
import { Employee } from '@/types/employee';

/**
 * Calculate hourly rate from basic salary
 * Formula: (Basic Salary × 12) / 365 / 8
 */
export function calculateHourlyRate(basicSalary: number): number {
  return (basicSalary * 12) / UAE_OVERTIME_LAW.daysInYear / UAE_OVERTIME_LAW.hoursPerDay;
}

/**
 * Check if a date falls on a UAE public holiday
 */
export function isPublicHoliday(
  dateStr: string,
  holidays: PublicHoliday[] = UAE_PUBLIC_HOLIDAYS_2025
): PublicHoliday | null {
  const date = new Date(dateStr);

  for (const holiday of holidays) {
    const startDate = new Date(holiday.date);
    const endDate = holiday.endDate ? new Date(holiday.endDate) : startDate;

    // Set times to midnight for comparison
    date.setHours(0, 0, 0, 0);
    startDate.setHours(0, 0, 0, 0);
    endDate.setHours(0, 0, 0, 0);

    if (date >= startDate && date <= endDate) {
      return holiday;
    }
  }

  return null;
}

/**
 * Check if a date is Friday (UAE rest day)
 */
export function isFriday(dateStr: string): boolean {
  const date = new Date(dateStr);
  return date.getDay() === UAE_OVERTIME_LAW.restDay;
}

/**
 * Check if time falls within night shift (10pm - 4am)
 */
export function isNightShift(startTime: string, endTime: string): boolean {
  const [startHour] = startTime.split(':').map(Number);
  const [endHour] = endTime.split(':').map(Number);

  const nightStart = UAE_OVERTIME_LAW.nightShift.start;
  const nightEnd = UAE_OVERTIME_LAW.nightShift.end;

  // Check if any part of the shift falls in night hours (10pm - 4am)
  // Night shift is 22:00 to 04:00
  if (startHour >= nightStart || startHour < nightEnd) {
    return true;
  }
  if (endHour > nightStart || endHour <= nightEnd) {
    return true;
  }

  return false;
}

/**
 * Calculate hours between two times
 */
export function calculateHours(startTime: string, endTime: string): number {
  const [startHour, startMin] = startTime.split(':').map(Number);
  const [endHour, endMin] = endTime.split(':').map(Number);

  let startMinutes = startHour * 60 + startMin;
  let endMinutes = endHour * 60 + endMin;

  // Handle overnight shifts
  if (endMinutes < startMinutes) {
    endMinutes += 24 * 60;
  }

  return (endMinutes - startMinutes) / 60;
}

/**
 * Auto-detect overtime type based on date and time
 */
export function detectOvertimeType(
  dateStr: string,
  startTime: string,
  endTime: string
): OvertimeType {
  // Priority: Holiday > Friday > Night > Regular

  const holiday = isPublicHoliday(dateStr);
  if (holiday) {
    return 'holiday';
  }

  if (isFriday(dateStr)) {
    return 'friday';
  }

  if (isNightShift(startTime, endTime)) {
    return 'night';
  }

  return 'regular';
}

/**
 * Get overtime rate multiplier
 */
export function getOvertimeRate(type: OvertimeType): number {
  return UAE_OVERTIME_LAW.rates[type];
}

/**
 * Calculate overtime amount
 */
export function calculateOvertimeAmount(
  basicSalary: number,
  hours: number,
  type: OvertimeType
): number {
  const hourlyRate = calculateHourlyRate(basicSalary);
  const multiplier = getOvertimeRate(type);
  return hourlyRate * hours * multiplier;
}

/**
 * Create a new overtime entry with calculations
 */
export function createOvertimeEntry(
  employeeId: string,
  basicSalary: number,
  date: string,
  startTime: string,
  endTime: string,
  manualType?: OvertimeType,
  notes?: string
): Omit<OvertimeEntry, 'id' | 'createdAt' | 'updatedAt'> {
  const hours = calculateHours(startTime, endTime);
  const detectedType = detectOvertimeType(date, startTime, endTime);
  const overtimeType = manualType || detectedType;
  const rate = getOvertimeRate(overtimeType);
  const amount = calculateOvertimeAmount(basicSalary, hours, overtimeType);

  return {
    employeeId,
    date,
    startTime,
    endTime,
    overtimeType,
    hours,
    rate,
    amount,
    isAutoDetected: !manualType || manualType === detectedType,
    notes,
  };
}

/**
 * Calculate monthly overtime summary for an employee
 */
export function calculateMonthlySummary(
  entries: OvertimeEntry[],
  employeeId: string,
  month: number,
  year: number
): OvertimeSummary {
  const monthEntries = entries.filter((entry) => {
    const entryDate = new Date(entry.date);
    return (
      entry.employeeId === employeeId &&
      entryDate.getMonth() === month &&
      entryDate.getFullYear() === year
    );
  });

  const summary: OvertimeSummary = {
    employeeId,
    month,
    year,
    regularHours: 0,
    nightHours: 0,
    fridayHours: 0,
    holidayHours: 0,
    totalHours: 0,
    regularAmount: 0,
    nightAmount: 0,
    fridayAmount: 0,
    holidayAmount: 0,
    totalAmount: 0,
  };

  for (const entry of monthEntries) {
    summary.totalHours += entry.hours;
    summary.totalAmount += entry.amount;

    switch (entry.overtimeType) {
      case 'regular':
        summary.regularHours += entry.hours;
        summary.regularAmount += entry.amount;
        break;
      case 'night':
        summary.nightHours += entry.hours;
        summary.nightAmount += entry.amount;
        break;
      case 'friday':
        summary.fridayHours += entry.hours;
        summary.fridayAmount += entry.amount;
        break;
      case 'holiday':
        summary.holidayHours += entry.hours;
        summary.holidayAmount += entry.amount;
        break;
    }
  }

  return summary;
}

/**
 * Check if overtime exceeds daily limit
 */
export function exceedsDailyLimit(hours: number, isRamadan: boolean): boolean {
  const maxHours = isRamadan
    ? UAE_OVERTIME_LAW.ramadanHoursPerDay
    : UAE_OVERTIME_LAW.maxOvertimePerDay;
  return hours > maxHours;
}

/**
 * Get working hours for display (standard vs Ramadan)
 */
export function getStandardWorkingHours(isRamadan: boolean): number {
  return isRamadan
    ? UAE_OVERTIME_LAW.ramadanHoursPerDay
    : UAE_OVERTIME_LAW.standardHoursPerDay;
}

/**
 * Format currency
 */
export function formatCurrency(amount: number): string {
  return new Intl.NumberFormat('en-AE', {
    style: 'currency',
    currency: 'AED',
    minimumFractionDigits: 2,
  }).format(amount);
}

/**
 * Format time for display
 */
export function formatTime(time: string): string {
  const [hours, minutes] = time.split(':').map(Number);
  const period = hours >= 12 ? 'PM' : 'AM';
  const displayHours = hours % 12 || 12;
  return `${displayHours}:${minutes.toString().padStart(2, '0')} ${period}`;
}

/**
 * Format date for display
 */
export function formatDate(dateStr: string): string {
  return new Date(dateStr).toLocaleDateString('en-AE', {
    weekday: 'short',
    day: 'numeric',
    month: 'short',
    year: 'numeric',
  });
}

/**
 * Get month name
 */
export function getMonthName(month: number): string {
  return new Date(2025, month).toLocaleDateString('en-AE', { month: 'long' });
}

/**
 * Get holiday name if date is a holiday
 */
export function getHolidayName(dateStr: string): string | null {
  const holiday = isPublicHoliday(dateStr);
  return holiday ? holiday.name : null;
}

// Mock overtime entries for demonstration
export const mockOvertimeEntries: OvertimeEntry[] = [
  {
    id: 'OT-001',
    employeeId: '1',
    date: '2025-01-15',
    startTime: '18:00',
    endTime: '20:00',
    overtimeType: 'regular',
    hours: 2,
    rate: 1.25,
    amount: 154.11,
    isAutoDetected: true,
    notes: 'Project deadline',
    createdAt: '2025-01-15T20:00:00Z',
    updatedAt: '2025-01-15T20:00:00Z',
  },
  {
    id: 'OT-002',
    employeeId: '1',
    date: '2025-01-17',
    startTime: '22:00',
    endTime: '01:00',
    overtimeType: 'night',
    hours: 3,
    rate: 1.50,
    amount: 277.40,
    isAutoDetected: true,
    notes: 'Server maintenance',
    createdAt: '2025-01-18T01:00:00Z',
    updatedAt: '2025-01-18T01:00:00Z',
  },
  {
    id: 'OT-003',
    employeeId: '2',
    date: '2025-01-17',
    startTime: '09:00',
    endTime: '14:00',
    overtimeType: 'friday',
    hours: 5,
    rate: 1.50,
    amount: 554.79,
    isAutoDetected: true,
    notes: 'HR audit preparation',
    createdAt: '2025-01-17T14:00:00Z',
    updatedAt: '2025-01-17T14:00:00Z',
  },
  {
    id: 'OT-004',
    employeeId: '1',
    date: '2025-01-01',
    startTime: '10:00',
    endTime: '14:00',
    overtimeType: 'holiday',
    hours: 4,
    rate: 2.50,
    amount: 616.44,
    isAutoDetected: true,
    notes: "New Year's Day - Emergency support",
    createdAt: '2025-01-01T14:00:00Z',
    updatedAt: '2025-01-01T14:00:00Z',
  },
  {
    id: 'OT-005',
    employeeId: '3',
    date: '2025-01-13',
    startTime: '17:00',
    endTime: '19:30',
    overtimeType: 'regular',
    hours: 2.5,
    rate: 1.25,
    amount: 256.85,
    isAutoDetected: true,
    notes: 'Quarter-end closing',
    createdAt: '2025-01-13T19:30:00Z',
    updatedAt: '2025-01-13T19:30:00Z',
  },
  // January 2026 overtime entries
  {
    id: 'OT-006',
    employeeId: '1',
    date: '2026-01-05',
    startTime: '18:00',
    endTime: '21:00',
    overtimeType: 'regular',
    hours: 3,
    rate: 1.25,
    amount: 231.16,
    isAutoDetected: true,
    notes: 'System deployment preparation',
    createdAt: '2026-01-05T21:00:00Z',
    updatedAt: '2026-01-05T21:00:00Z',
  },
  {
    id: 'OT-007',
    employeeId: '4',
    date: '2026-01-07',
    startTime: '17:00',
    endTime: '19:00',
    overtimeType: 'regular',
    hours: 2,
    rate: 1.25,
    amount: 180.82,
    isAutoDetected: true,
    notes: 'Employee onboarding paperwork',
    createdAt: '2026-01-07T19:00:00Z',
    updatedAt: '2026-01-07T19:00:00Z',
  },
  {
    id: 'OT-008',
    employeeId: '9',
    date: '2026-01-10',
    startTime: '22:00',
    endTime: '02:00',
    overtimeType: 'night',
    hours: 4,
    rate: 1.50,
    amount: 230.14,
    isAutoDetected: true,
    notes: 'Server migration - night shift',
    createdAt: '2026-01-11T02:00:00Z',
    updatedAt: '2026-01-11T02:00:00Z',
  },
  {
    id: 'OT-009',
    employeeId: '3',
    date: '2026-01-09',
    startTime: '09:00',
    endTime: '15:00',
    overtimeType: 'friday',
    hours: 6,
    rate: 1.50,
    amount: 739.73,
    isAutoDetected: true,
    notes: 'Month-end financial closing',
    createdAt: '2026-01-09T15:00:00Z',
    updatedAt: '2026-01-09T15:00:00Z',
  },
  {
    id: 'OT-010',
    employeeId: '5',
    date: '2026-01-12',
    startTime: '18:00',
    endTime: '20:30',
    overtimeType: 'regular',
    hours: 2.5,
    rate: 1.25,
    amount: 359.59,
    isAutoDetected: true,
    notes: 'Marketing campaign launch',
    createdAt: '2026-01-12T20:30:00Z',
    updatedAt: '2026-01-12T20:30:00Z',
  },
  {
    id: 'OT-011',
    employeeId: '8',
    date: '2026-01-14',
    startTime: '17:00',
    endTime: '21:00',
    overtimeType: 'regular',
    hours: 4,
    rate: 1.25,
    amount: 657.53,
    isAutoDetected: true,
    notes: 'Warehouse inventory audit',
    createdAt: '2026-01-14T21:00:00Z',
    updatedAt: '2026-01-14T21:00:00Z',
  },
  {
    id: 'OT-012',
    employeeId: '10',
    date: '2026-01-16',
    startTime: '09:00',
    endTime: '13:00',
    overtimeType: 'friday',
    hours: 4,
    rate: 1.50,
    amount: 460.27,
    isAutoDetected: true,
    notes: 'Budget analysis deadline',
    createdAt: '2026-01-16T13:00:00Z',
    updatedAt: '2026-01-16T13:00:00Z',
  },
  {
    id: 'OT-013',
    employeeId: '7',
    date: '2026-01-18',
    startTime: '18:00',
    endTime: '22:00',
    overtimeType: 'regular',
    hours: 4,
    rate: 1.25,
    amount: 263.01,
    isAutoDetected: true,
    notes: 'Client proposal preparation',
    createdAt: '2026-01-18T22:00:00Z',
    updatedAt: '2026-01-18T22:00:00Z',
  },
  {
    id: 'OT-014',
    employeeId: '1',
    date: '2026-01-19',
    startTime: '23:00',
    endTime: '03:00',
    overtimeType: 'night',
    hours: 4,
    rate: 1.50,
    amount: 369.86,
    isAutoDetected: true,
    notes: 'Critical system patch deployment',
    createdAt: '2026-01-20T03:00:00Z',
    updatedAt: '2026-01-20T03:00:00Z',
  },
  {
    id: 'OT-015',
    employeeId: '6',
    date: '2026-01-20',
    startTime: '17:00',
    endTime: '19:00',
    overtimeType: 'regular',
    hours: 2,
    rate: 1.25,
    amount: 147.95,
    isAutoDetected: true,
    notes: 'Tax filing preparation',
    createdAt: '2026-01-20T19:00:00Z',
    updatedAt: '2026-01-20T19:00:00Z',
  },
];
