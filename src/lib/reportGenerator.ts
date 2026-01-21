import { ReportType, TemplateType, REPORT_CONFIGS } from '@/types/report';
import { Employee } from '@/types/employee';
import { LeaveRequest, LeaveBalance } from '@/types/leave';
import { OvertimeEntry } from '@/types/overtime';
import { calculateGratuity } from '@/lib/gratuityCalculator';
import { calculateLeaveBalance } from '@/lib/leaveData';
import { calculateDaysRemaining, getExpiryStatus } from '@/lib/documentManager';
import { formatCurrency as formatPayrollCurrency } from '@/lib/payrollCalculator';

/**
 * Format currency
 */
export function formatCurrency(amount: number): string {
  return new Intl.NumberFormat('en-AE', {
    style: 'currency',
    currency: 'AED',
    minimumFractionDigits: 0,
  }).format(amount);
}

/**
 * Format date
 */
export function formatDate(dateStr: string): string {
  return new Date(dateStr).toLocaleDateString('en-AE', {
    day: 'numeric',
    month: 'short',
    year: 'numeric',
  });
}

/**
 * Get today's date formatted
 */
export function getTodayFormatted(): string {
  return new Date().toLocaleDateString('en-AE', {
    day: 'numeric',
    month: 'long',
    year: 'numeric',
  });
}

/**
 * Generate Employee Roster Report
 */
export function generateEmployeeRosterReport(
  employees: Employee[],
  department?: string
): string[][] {
  const filtered = department
    ? employees.filter((e) => e.employmentInfo.department === department)
    : employees;

  const headers = [
    'Employee ID',
    'Name',
    'Department',
    'Job Title',
    'Nationality',
    'Join Date',
    'Status',
    'Basic Salary',
  ];

  const rows = filtered.map((emp) => [
    emp.employeeId,
    `${emp.personalInfo.firstName} ${emp.personalInfo.lastName}`,
    emp.employmentInfo.department,
    emp.employmentInfo.jobTitle,
    emp.personalInfo.nationality,
    formatDate(emp.employmentInfo.employmentStartDate),
    emp.employmentInfo.employmentStatus,
    formatCurrency(emp.compensation.basicSalary),
  ]);

  return [headers, ...rows];
}

/**
 * Generate Headcount by Department Report
 */
export function generateHeadcountByDepartment(employees: Employee[]): string[][] {
  const deptCount: Record<string, number> = {};

  employees.forEach((emp) => {
    const dept = emp.employmentInfo.department;
    deptCount[dept] = (deptCount[dept] || 0) + 1;
  });

  const headers = ['Department', 'Headcount', 'Percentage'];
  const total = employees.length;

  const rows = Object.entries(deptCount)
    .sort((a, b) => b[1] - a[1])
    .map(([dept, count]) => [
      dept,
      count.toString(),
      `${((count / total) * 100).toFixed(1)}%`,
    ]);

  rows.push(['Total', total.toString(), '100%']);

  return [headers, ...rows];
}

/**
 * Generate Headcount by Nationality Report
 */
export function generateHeadcountByNationality(employees: Employee[]): string[][] {
  const natCount: Record<string, number> = {};

  employees.forEach((emp) => {
    const nat = emp.personalInfo.nationality;
    natCount[nat] = (natCount[nat] || 0) + 1;
  });

  const headers = ['Nationality', 'Headcount', 'Percentage'];
  const total = employees.length;

  const rows = Object.entries(natCount)
    .sort((a, b) => b[1] - a[1])
    .map(([nat, count]) => [
      nat,
      count.toString(),
      `${((count / total) * 100).toFixed(1)}%`,
    ]);

  rows.push(['Total', total.toString(), '100%']);

  return [headers, ...rows];
}

/**
 * Generate Gratuity Liability Report
 */
export function generateGratuityLiabilityReport(
  employees: Employee[],
  department?: string
): string[][] {
  const filtered = department
    ? employees.filter((e) => e.employmentInfo.department === department)
    : employees;

  const headers = [
    'Employee',
    'Department',
    'Join Date',
    'Years of Service',
    'Basic Salary',
    'Gratuity Liability',
  ];

  let totalLiability = 0;

  const rows = filtered.map((emp) => {
    const gratuity = calculateGratuity({
      basicSalary: emp.compensation.basicSalary,
      employmentStartDate: emp.employmentInfo.employmentStartDate,
      employmentEndDate: new Date().toISOString().split('T')[0],
      contractType: emp.employmentInfo.contractType,
      terminationType: 'termination',
      unpaidLeaveDays: 0,
    });

    totalLiability += gratuity.cappedGratuity;

    return [
      `${emp.personalInfo.firstName} ${emp.personalInfo.lastName}`,
      emp.employmentInfo.department,
      formatDate(emp.employmentInfo.employmentStartDate),
      gratuity.yearsOfService.toFixed(1),
      formatCurrency(emp.compensation.basicSalary),
      formatCurrency(gratuity.cappedGratuity),
    ];
  });

  rows.push(['', '', '', '', 'Total Liability', formatCurrency(totalLiability)]);

  return [headers, ...rows];
}

/**
 * Generate Overtime Summary Report
 */
export function generateOvertimeSummaryReport(
  overtimeEntries: OvertimeEntry[],
  employees: Employee[],
  startDate?: string,
  endDate?: string
): string[][] {
  let filtered = overtimeEntries;

  if (startDate && endDate) {
    filtered = overtimeEntries.filter((entry) => {
      const date = new Date(entry.date);
      return date >= new Date(startDate) && date <= new Date(endDate);
    });
  }

  const headers = [
    'Employee',
    'Department',
    'Regular Hours',
    'Night Hours',
    'Friday Hours',
    'Holiday Hours',
    'Total Hours',
    'Total Amount',
  ];

  const employeeOT: Record<
    string,
    { regular: number; night: number; friday: number; holiday: number; amount: number }
  > = {};

  filtered.forEach((entry) => {
    if (!employeeOT[entry.employeeId]) {
      employeeOT[entry.employeeId] = {
        regular: 0,
        night: 0,
        friday: 0,
        holiday: 0,
        amount: 0,
      };
    }

    const ot = employeeOT[entry.employeeId];
    ot.amount += entry.amount;

    switch (entry.overtimeType) {
      case 'regular':
        ot.regular += entry.hours;
        break;
      case 'night':
        ot.night += entry.hours;
        break;
      case 'friday':
        ot.friday += entry.hours;
        break;
      case 'holiday':
        ot.holiday += entry.hours;
        break;
    }
  });

  const rows = Object.entries(employeeOT).map(([empId, ot]) => {
    const emp = employees.find((e) => e.id === empId);
    const totalHours = ot.regular + ot.night + ot.friday + ot.holiday;

    return [
      emp ? `${emp.personalInfo.firstName} ${emp.personalInfo.lastName}` : empId,
      emp?.employmentInfo.department || '',
      ot.regular.toFixed(1),
      ot.night.toFixed(1),
      ot.friday.toFixed(1),
      ot.holiday.toFixed(1),
      totalHours.toFixed(1),
      formatCurrency(ot.amount),
    ];
  });

  return [headers, ...rows];
}

/**
 * Generate Salary Comparison Report
 */
export function generateSalaryComparisonReport(
  employees: Employee[],
  department?: string
): string[][] {
  const filtered = department
    ? employees.filter((e) => e.employmentInfo.department === department)
    : employees;

  const headers = [
    'Employee',
    'Department',
    'Job Title',
    'Basic Salary',
    'Housing',
    'Transport',
    'Other',
    'Total Package',
  ];

  const rows = filtered
    .sort((a, b) => b.compensation.totalPackage - a.compensation.totalPackage)
    .map((emp) => [
      `${emp.personalInfo.firstName} ${emp.personalInfo.lastName}`,
      emp.employmentInfo.department,
      emp.employmentInfo.jobTitle,
      formatCurrency(emp.compensation.basicSalary),
      formatCurrency(emp.compensation.housingAllowance),
      formatCurrency(emp.compensation.transportAllowance),
      formatCurrency(emp.compensation.otherAllowances),
      formatCurrency(emp.compensation.totalPackage),
    ]);

  return [headers, ...rows];
}

/**
 * Convert report data to CSV
 */
export function reportToCSV(data: string[][]): string {
  return data.map((row) => row.map((cell) => `"${cell}"`).join(',')).join('\n');
}

/**
 * Generate report HTML for preview/print
 */
export function generateReportHTML(
  title: string,
  data: string[][],
  filters?: { startDate?: string; endDate?: string; department?: string }
): string {
  const headers = data[0];
  const rows = data.slice(1);

  return `
<!DOCTYPE html>
<html>
<head>
  <meta charset="UTF-8">
  <title>${title}</title>
  <style>
    * { margin: 0; padding: 0; box-sizing: border-box; }
    body { font-family: 'Segoe UI', Arial, sans-serif; font-size: 11px; color: #333; padding: 30px; }
    .header { margin-bottom: 20px; padding-bottom: 15px; border-bottom: 2px solid #0d9488; }
    .header h1 { color: #0d9488; font-size: 18px; margin-bottom: 5px; }
    .header p { color: #666; font-size: 10px; }
    .filters { margin-bottom: 15px; padding: 10px; background: #f8fafc; border-radius: 4px; font-size: 10px; color: #64748b; }
    table { width: 100%; border-collapse: collapse; margin-top: 10px; }
    th { background: #0d9488; color: white; text-align: left; padding: 8px 10px; font-size: 10px; text-transform: uppercase; }
    td { padding: 8px 10px; border-bottom: 1px solid #e5e7eb; }
    tr:nth-child(even) { background: #f8fafc; }
    tr:last-child { font-weight: 600; background: #f0fdfa; }
    .footer { margin-top: 20px; padding-top: 15px; border-top: 1px solid #e5e7eb; font-size: 9px; color: #999; text-align: center; }
  </style>
</head>
<body>
  <div class="header">
    <h1>${title}</h1>
    <p>Generated on ${getTodayFormatted()} | HCM UAE</p>
  </div>
  ${
    filters
      ? `<div class="filters">
    Filters: ${filters.startDate ? `From ${formatDate(filters.startDate)}` : ''}
    ${filters.endDate ? `To ${formatDate(filters.endDate)}` : ''}
    ${filters.department ? `Department: ${filters.department}` : ''}
  </div>`
      : ''
  }
  <table>
    <thead>
      <tr>${headers.map((h) => `<th>${h}</th>`).join('')}</tr>
    </thead>
    <tbody>
      ${rows.map((row) => `<tr>${row.map((cell) => `<td>${cell}</td>`).join('')}</tr>`).join('')}
    </tbody>
  </table>
  <div class="footer">
    This report is confidential and intended for internal use only.
  </div>
</body>
</html>
  `;
}

/**
 * Get report data by type
 */
export function getReportData(
  reportType: ReportType,
  employees: Employee[],
  leaveRequests: LeaveRequest[],
  overtimeEntries: OvertimeEntry[],
  filters: {
    startDate?: string;
    endDate?: string;
    department?: string;
    employeeId?: string;
  }
): string[][] {
  switch (reportType) {
    case 'employee_roster':
      return generateEmployeeRosterReport(employees, filters.department);
    case 'headcount_department':
      return generateHeadcountByDepartment(employees);
    case 'headcount_nationality':
      return generateHeadcountByNationality(employees);
    case 'gratuity_liability':
      return generateGratuityLiabilityReport(employees, filters.department);
    case 'overtime_summary':
      return generateOvertimeSummaryReport(
        overtimeEntries,
        employees,
        filters.startDate,
        filters.endDate
      );
    case 'salary_comparison':
      return generateSalaryComparisonReport(employees, filters.department);
    default:
      return [['No data available for this report type']];
  }
}
