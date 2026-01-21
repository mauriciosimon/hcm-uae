// Overtime Types - UAE Federal Decree-Law No. 33/2021, Articles 17-19

export type OvertimeType = 'regular' | 'night' | 'friday' | 'holiday';

export interface OvertimeEntry {
  id: string;
  employeeId: string;
  date: string;
  startTime: string; // HH:mm format
  endTime: string;   // HH:mm format
  overtimeType: OvertimeType;
  hours: number;
  rate: number;
  amount: number;
  isAutoDetected: boolean; // Whether type was auto-detected
  notes?: string;
  createdAt: string;
  updatedAt: string;
}

export interface OvertimeSummary {
  employeeId: string;
  month: number;
  year: number;
  regularHours: number;
  nightHours: number;
  fridayHours: number;
  holidayHours: number;
  totalHours: number;
  regularAmount: number;
  nightAmount: number;
  fridayAmount: number;
  holidayAmount: number;
  totalAmount: number;
}

export interface PublicHoliday {
  name: string;
  nameAr: string;
  date: string;
  endDate?: string; // For multi-day holidays
}

// UAE Overtime Law Constants
export const UAE_OVERTIME_LAW = {
  // Working hours
  standardHoursPerDay: 8,
  ramadanHoursPerDay: 6,
  maxHoursPerWeek: 48,
  maxOvertimePerDay: 2,
  maxOvertimePer3Weeks: 144,

  // Overtime rate multipliers
  rates: {
    regular: 1.25,     // Regular day: basic + 25%
    night: 1.50,       // Night shift (10pm-4am): basic + 50%
    friday: 1.50,      // Friday/Rest day: basic + 50%
    holiday: 2.50,     // Public holiday: basic + 150% (1.50× + regular pay)
  },

  // Night shift hours
  nightShift: {
    start: 22, // 10:00 PM
    end: 4,    // 4:00 AM
  },

  // UAE weekend
  restDay: 5, // Friday (0 = Sunday, 5 = Friday)

  // Calculation base
  daysInYear: 365,
  hoursPerDay: 8,
} as const;

// UAE Public Holidays 2025
export const UAE_PUBLIC_HOLIDAYS_2025: PublicHoliday[] = [
  {
    name: "New Year's Day",
    nameAr: 'رأس السنة الميلادية',
    date: '2025-01-01',
  },
  {
    name: 'Eid Al Fitr',
    nameAr: 'عيد الفطر',
    date: '2025-03-30',
    endDate: '2025-04-02',
  },
  {
    name: 'Eid Al Adha',
    nameAr: 'عيد الأضحى',
    date: '2025-06-06',
    endDate: '2025-06-09',
  },
  {
    name: 'Islamic New Year',
    nameAr: 'رأس السنة الهجرية',
    date: '2025-06-26',
  },
  {
    name: "Prophet's Birthday",
    nameAr: 'المولد النبوي',
    date: '2025-09-04',
  },
  {
    name: 'Commemoration Day',
    nameAr: 'يوم الشهيد',
    date: '2025-11-30',
  },
  {
    name: 'National Day',
    nameAr: 'اليوم الوطني',
    date: '2025-12-02',
    endDate: '2025-12-03',
  },
];

export const OVERTIME_TYPE_LABELS: Record<OvertimeType, string> = {
  regular: 'Regular Overtime (1.25×)',
  night: 'Night Shift (1.50×)',
  friday: 'Friday/Rest Day (1.50×)',
  holiday: 'Public Holiday (2.50×)',
};

export const OVERTIME_TYPE_COLORS: Record<OvertimeType, string> = {
  regular: 'bg-blue-500',
  night: 'bg-purple-500',
  friday: 'bg-amber-500',
  holiday: 'bg-rose-500',
};
