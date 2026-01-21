// Report Types

export type ReportCategory = 'employee' | 'leave' | 'payroll' | 'compliance';

export type ReportType =
  // Employee Reports
  | 'employee_roster'
  | 'headcount_department'
  | 'headcount_nationality'
  | 'new_hires'
  | 'terminations'
  // Leave Reports
  | 'leave_balance'
  | 'leave_utilization'
  | 'absence_report'
  // Payroll Reports
  | 'payroll_summary'
  | 'payroll_department'
  | 'salary_comparison'
  | 'ytd_earnings'
  // Compliance Reports
  | 'document_expiry'
  | 'gratuity_liability'
  | 'overtime_summary';

export type TemplateType =
  | 'employment_contract'
  | 'offer_letter'
  | 'salary_certificate'
  | 'experience_certificate'
  | 'noc'
  | 'warning_letter_1'
  | 'warning_letter_2'
  | 'warning_letter_final'
  | 'termination_letter'
  | 'resignation_acceptance'
  | 'leave_application'
  | 'final_settlement';

export type ExportFormat = 'pdf' | 'csv' | 'print';

export interface ReportConfig {
  id: ReportType;
  name: string;
  description: string;
  category: ReportCategory;
  icon: string;
  hasDateRange: boolean;
  hasDepartmentFilter: boolean;
  hasEmployeeFilter: boolean;
}

export interface TemplateConfig {
  id: TemplateType;
  name: string;
  nameAr: string;
  description: string;
  requiresEmployee: boolean;
  icon: string;
}

export interface GeneratedReport {
  id: string;
  reportType: ReportType;
  reportName: string;
  generatedAt: string;
  filters: {
    startDate?: string;
    endDate?: string;
    department?: string;
    employeeId?: string;
  };
  format: ExportFormat;
}

// Report configurations
export const REPORT_CONFIGS: ReportConfig[] = [
  // Employee Reports
  {
    id: 'employee_roster',
    name: 'Employee Roster',
    description: 'Complete list of all employees with key details',
    category: 'employee',
    icon: '👥',
    hasDateRange: false,
    hasDepartmentFilter: true,
    hasEmployeeFilter: false,
  },
  {
    id: 'headcount_department',
    name: 'Headcount by Department',
    description: 'Employee count breakdown by department',
    category: 'employee',
    icon: '📊',
    hasDateRange: false,
    hasDepartmentFilter: false,
    hasEmployeeFilter: false,
  },
  {
    id: 'headcount_nationality',
    name: 'Headcount by Nationality',
    description: 'Employee distribution by nationality',
    category: 'employee',
    icon: '🌍',
    hasDateRange: false,
    hasDepartmentFilter: false,
    hasEmployeeFilter: false,
  },
  {
    id: 'new_hires',
    name: 'New Hires Report',
    description: 'Employees joined within date range',
    category: 'employee',
    icon: '🆕',
    hasDateRange: true,
    hasDepartmentFilter: true,
    hasEmployeeFilter: false,
  },
  {
    id: 'terminations',
    name: 'Terminations Report',
    description: 'Terminated and resigned employees',
    category: 'employee',
    icon: '📤',
    hasDateRange: true,
    hasDepartmentFilter: true,
    hasEmployeeFilter: false,
  },
  // Leave Reports
  {
    id: 'leave_balance',
    name: 'Leave Balance Summary',
    description: 'Current leave balances for all employees',
    category: 'leave',
    icon: '📅',
    hasDateRange: false,
    hasDepartmentFilter: true,
    hasEmployeeFilter: false,
  },
  {
    id: 'leave_utilization',
    name: 'Leave Utilization Report',
    description: 'Leave taken within date range',
    category: 'leave',
    icon: '📈',
    hasDateRange: true,
    hasDepartmentFilter: true,
    hasEmployeeFilter: true,
  },
  {
    id: 'absence_report',
    name: 'Absence Report',
    description: 'Employee absence summary',
    category: 'leave',
    icon: '🚫',
    hasDateRange: true,
    hasDepartmentFilter: true,
    hasEmployeeFilter: true,
  },
  // Payroll Reports
  {
    id: 'payroll_summary',
    name: 'Monthly Payroll Summary',
    description: 'Complete payroll summary for selected month',
    category: 'payroll',
    icon: '💰',
    hasDateRange: true,
    hasDepartmentFilter: false,
    hasEmployeeFilter: false,
  },
  {
    id: 'payroll_department',
    name: 'Payroll by Department',
    description: 'Payroll costs breakdown by department',
    category: 'payroll',
    icon: '🏢',
    hasDateRange: true,
    hasDepartmentFilter: false,
    hasEmployeeFilter: false,
  },
  {
    id: 'salary_comparison',
    name: 'Salary Comparison Report',
    description: 'Compare salaries across roles and departments',
    category: 'payroll',
    icon: '⚖️',
    hasDateRange: false,
    hasDepartmentFilter: true,
    hasEmployeeFilter: false,
  },
  {
    id: 'ytd_earnings',
    name: 'Year-to-Date Earnings',
    description: 'YTD earnings per employee',
    category: 'payroll',
    icon: '📆',
    hasDateRange: false,
    hasDepartmentFilter: true,
    hasEmployeeFilter: true,
  },
  // Compliance Reports
  {
    id: 'document_expiry',
    name: 'Document Expiry Report',
    description: 'Documents expiring within selected period',
    category: 'compliance',
    icon: '⚠️',
    hasDateRange: true,
    hasDepartmentFilter: false,
    hasEmployeeFilter: false,
  },
  {
    id: 'gratuity_liability',
    name: 'Gratuity Liability Report',
    description: 'Total company gratuity liability',
    category: 'compliance',
    icon: '🏆',
    hasDateRange: false,
    hasDepartmentFilter: true,
    hasEmployeeFilter: false,
  },
  {
    id: 'overtime_summary',
    name: 'Overtime Summary',
    description: 'Overtime hours and costs summary',
    category: 'compliance',
    icon: '⏰',
    hasDateRange: true,
    hasDepartmentFilter: true,
    hasEmployeeFilter: true,
  },
];

// Template configurations
export const TEMPLATE_CONFIGS: TemplateConfig[] = [
  {
    id: 'employment_contract',
    name: 'Employment Contract',
    nameAr: 'عقد العمل',
    description: 'UAE-compliant limited employment contract',
    requiresEmployee: true,
    icon: '📝',
  },
  {
    id: 'offer_letter',
    name: 'Offer Letter',
    nameAr: 'خطاب العرض',
    description: 'Job offer letter template',
    requiresEmployee: true,
    icon: '✉️',
  },
  {
    id: 'salary_certificate',
    name: 'Salary Certificate',
    nameAr: 'شهادة الراتب',
    description: 'Official salary certificate for banks/embassies',
    requiresEmployee: true,
    icon: '💵',
  },
  {
    id: 'experience_certificate',
    name: 'Experience Certificate',
    nameAr: 'شهادة الخبرة',
    description: 'Employment experience/service certificate',
    requiresEmployee: true,
    icon: '🎓',
  },
  {
    id: 'noc',
    name: 'No Objection Certificate',
    nameAr: 'شهادة عدم ممانعة',
    description: 'NOC for various purposes',
    requiresEmployee: true,
    icon: '✅',
  },
  {
    id: 'warning_letter_1',
    name: 'Warning Letter (1st)',
    nameAr: 'إنذار أول',
    description: 'First written warning',
    requiresEmployee: true,
    icon: '⚠️',
  },
  {
    id: 'warning_letter_2',
    name: 'Warning Letter (2nd)',
    nameAr: 'إنذار ثاني',
    description: 'Second written warning',
    requiresEmployee: true,
    icon: '⚠️',
  },
  {
    id: 'warning_letter_final',
    name: 'Final Warning Letter',
    nameAr: 'إنذار نهائي',
    description: 'Final warning before termination',
    requiresEmployee: true,
    icon: '🚨',
  },
  {
    id: 'termination_letter',
    name: 'Termination Letter',
    nameAr: 'خطاب إنهاء الخدمة',
    description: 'Employment termination notice',
    requiresEmployee: true,
    icon: '📤',
  },
  {
    id: 'resignation_acceptance',
    name: 'Resignation Acceptance',
    nameAr: 'قبول الاستقالة',
    description: 'Acceptance of employee resignation',
    requiresEmployee: true,
    icon: '👋',
  },
  {
    id: 'leave_application',
    name: 'Leave Application Form',
    nameAr: 'طلب إجازة',
    description: 'Standard leave request form',
    requiresEmployee: true,
    icon: '📋',
  },
  {
    id: 'final_settlement',
    name: 'Final Settlement Statement',
    nameAr: 'بيان التسوية النهائية',
    description: 'End of service settlement calculation',
    requiresEmployee: true,
    icon: '🧾',
  },
];

export const CATEGORY_LABELS: Record<ReportCategory, string> = {
  employee: 'Employee Reports',
  leave: 'Leave Reports',
  payroll: 'Payroll Reports',
  compliance: 'Compliance Reports',
};

export const CATEGORY_COLORS: Record<ReportCategory, string> = {
  employee: 'teal',
  leave: 'blue',
  payroll: 'emerald',
  compliance: 'amber',
};
