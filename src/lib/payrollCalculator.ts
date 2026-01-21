import {
  PayrollEntry,
  PayrollRun,
  LoanAdvance,
  Deduction,
  WPSSIFRecord,
  PayrollStatus,
  UAE_BANK_CODES,
  COMPANY_WPS_CONFIG,
} from '@/types/payroll';
import { Employee } from '@/types/employee';
import { OvertimeEntry } from '@/types/overtime';
import { LeaveRequest } from '@/types/leave';

/**
 * Calculate daily salary rate
 */
export function calculateDailySalary(basicSalary: number): number {
  return (basicSalary * 12) / 365;
}

/**
 * Get bank code from bank name
 */
export function getBankCode(bankName: string): string {
  return UAE_BANK_CODES[bankName] || 'UNKNOWN';
}

/**
 * Calculate overtime amount for a specific month
 */
export function calculateMonthlyOvertime(
  overtimeEntries: OvertimeEntry[],
  employeeId: string,
  month: number,
  year: number
): { hours: number; amount: number } {
  const monthEntries = overtimeEntries.filter((entry) => {
    const entryDate = new Date(entry.date);
    return (
      entry.employeeId === employeeId &&
      entryDate.getMonth() === month &&
      entryDate.getFullYear() === year &&
      entry.overtimeType !== undefined // Valid entry
    );
  });

  return {
    hours: monthEntries.reduce((sum, e) => sum + e.hours, 0),
    amount: monthEntries.reduce((sum, e) => sum + e.amount, 0),
  };
}

/**
 * Calculate unpaid leave deduction for a specific month
 */
export function calculateUnpaidLeaveDeduction(
  leaveRequests: LeaveRequest[],
  employeeId: string,
  basicSalary: number,
  month: number,
  year: number
): { days: number; amount: number } {
  const dailyRate = calculateDailySalary(basicSalary);

  const unpaidDays = leaveRequests
    .filter((req) => {
      const startDate = new Date(req.startDate);
      return (
        req.employeeId === employeeId &&
        req.leaveType === 'unpaid' &&
        req.status === 'approved' &&
        startDate.getMonth() === month &&
        startDate.getFullYear() === year
      );
    })
    .reduce((sum, req) => sum + req.totalDays, 0);

  return {
    days: unpaidDays,
    amount: unpaidDays * dailyRate,
  };
}

/**
 * Calculate loan/advance deduction for a specific month
 */
export function calculateLoanDeductions(
  loansAdvances: LoanAdvance[],
  employeeId: string,
  month: number,
  year: number
): { advanceAmount: number; loanAmount: number } {
  const activeItems = loansAdvances.filter((item) => {
    if (!item.isActive || item.employeeId !== employeeId) return false;

    // Check if this month is within the loan period
    const startDate = new Date(item.startYear, item.startMonth - 1);
    const currentDate = new Date(year, month);
    const endDate = item.endMonth && item.endYear
      ? new Date(item.endYear, item.endMonth - 1)
      : null;

    return currentDate >= startDate && (!endDate || currentDate <= endDate);
  });

  return {
    advanceAmount: activeItems
      .filter((item) => item.type === 'advance')
      .reduce((sum, item) => sum + item.monthlyInstallment, 0),
    loanAmount: activeItems
      .filter((item) => item.type === 'loan')
      .reduce((sum, item) => sum + item.monthlyInstallment, 0),
  };
}

/**
 * Calculate other deductions for a specific month
 */
export function calculateOtherDeductions(
  deductions: Deduction[],
  employeeId: string,
  month: number,
  year: number
): number {
  return deductions
    .filter(
      (d) =>
        d.employeeId === employeeId &&
        d.month === month &&
        d.year === year &&
        d.type === 'other'
    )
    .reduce((sum, d) => sum + d.amount, 0);
}

/**
 * Generate payroll entry for an employee
 */
export function generatePayrollEntry(
  employee: Employee,
  month: number,
  year: number,
  overtimeEntries: OvertimeEntry[],
  leaveRequests: LeaveRequest[],
  loansAdvances: LoanAdvance[],
  deductions: Deduction[]
): PayrollEntry {
  const overtime = calculateMonthlyOvertime(overtimeEntries, employee.id, month, year);
  const unpaidLeave = calculateUnpaidLeaveDeduction(
    leaveRequests,
    employee.id,
    employee.compensation.basicSalary,
    month,
    year
  );
  const loanDeductions = calculateLoanDeductions(loansAdvances, employee.id, month, year);
  const otherDeductions = calculateOtherDeductions(deductions, employee.id, month, year);

  const totalEarnings =
    employee.compensation.basicSalary +
    employee.compensation.housingAllowance +
    employee.compensation.transportAllowance +
    employee.compensation.otherAllowances +
    overtime.amount;

  const totalDeductions =
    unpaidLeave.amount +
    loanDeductions.advanceAmount +
    loanDeductions.loanAmount +
    otherDeductions;

  const netSalary = totalEarnings - totalDeductions;

  return {
    id: `PAY-${employee.id}-${year}-${month}`,
    employeeId: employee.id,
    month,
    year,

    // Earnings
    basicSalary: employee.compensation.basicSalary,
    housingAllowance: employee.compensation.housingAllowance,
    transportAllowance: employee.compensation.transportAllowance,
    otherAllowances: employee.compensation.otherAllowances,
    overtimeAmount: overtime.amount,
    overtimeHours: overtime.hours,
    totalEarnings,

    // Deductions
    unpaidLeaveDays: unpaidLeave.days,
    unpaidLeaveDeduction: unpaidLeave.amount,
    advanceDeduction: loanDeductions.advanceAmount,
    loanDeduction: loanDeductions.loanAmount,
    otherDeductions,
    totalDeductions,

    // Net
    netSalary,

    // Bank details
    bankCode: getBankCode(employee.bankDetails.bankName),
    accountNumber: employee.bankDetails.accountNumber,
    iban: employee.bankDetails.iban,

    // Status
    status: 'calculated',
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  };
}

/**
 * Generate complete payroll run for all active employees
 */
export function generatePayrollRun(
  employees: Employee[],
  month: number,
  year: number,
  overtimeEntries: OvertimeEntry[],
  leaveRequests: LeaveRequest[],
  loansAdvances: LoanAdvance[],
  deductions: Deduction[]
): PayrollRun {
  const activeEmployees = employees.filter(
    (e) => e.employmentInfo.employmentStatus === 'active'
  );

  const entries = activeEmployees.map((employee) =>
    generatePayrollEntry(
      employee,
      month,
      year,
      overtimeEntries,
      leaveRequests,
      loansAdvances,
      deductions
    )
  );

  const totalGross = entries.reduce((sum, e) => sum + e.totalEarnings, 0);
  const totalDeductions = entries.reduce((sum, e) => sum + e.totalDeductions, 0);
  const totalNet = entries.reduce((sum, e) => sum + e.netSalary, 0);

  return {
    id: `PAYRUN-${year}-${month}`,
    month,
    year,
    status: 'calculated',
    totalEmployees: entries.length,
    totalGross,
    totalDeductions,
    totalNet,
    entries,
    wpsFileGenerated: false,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  };
}

/**
 * Generate WPS SIF record for an employee
 */
export function generateWPSSIFRecord(
  entry: PayrollEntry,
  employee: Employee,
  month: number,
  year: number
): WPSSIFRecord {
  const startDate = new Date(year, month, 1);
  const endDate = new Date(year, month + 1, 0);
  const daysInMonth = endDate.getDate();
  const daysWorked = daysInMonth - entry.unpaidLeaveDays;

  return {
    recordType: 'EDR',
    employerCode: COMPANY_WPS_CONFIG.employerCode,
    bankCode: entry.bankCode,
    employeeId: employee.employeeId,
    accountNumber: entry.iban,
    startDate: formatWPSDate(startDate),
    endDate: formatWPSDate(endDate),
    daysWorked,
    netSalary: Math.round(entry.netSalary * 100) / 100,
    fixedAllowance:
      Math.round(
        (entry.housingAllowance + entry.transportAllowance) * 100
      ) / 100,
    variableAllowance:
      Math.round((entry.otherAllowances + entry.overtimeAmount) * 100) / 100,
    leaveAmount: 0,
  };
}

/**
 * Generate WPS SIF file content
 */
export function generateWPSSIFFile(
  payrollRun: PayrollRun,
  employees: Employee[]
): string {
  const header = [
    'Record_Type',
    'Employer_Code',
    'Bank_Code',
    'Employee_ID',
    'Account_Number',
    'Start_Date',
    'End_Date',
    'Days_Worked',
    'Net_Salary',
    'Fixed_Allowance',
    'Variable_Allowance',
    'Leave_Amount',
  ].join(',');

  const records = payrollRun.entries.map((entry) => {
    const employee = employees.find((e) => e.id === entry.employeeId);
    if (!employee) return '';

    const record = generateWPSSIFRecord(
      entry,
      employee,
      payrollRun.month,
      payrollRun.year
    );

    return [
      record.recordType,
      record.employerCode,
      record.bankCode,
      record.employeeId,
      record.accountNumber,
      record.startDate,
      record.endDate,
      record.daysWorked,
      record.netSalary.toFixed(2),
      record.fixedAllowance.toFixed(2),
      record.variableAllowance.toFixed(2),
      record.leaveAmount.toFixed(2),
    ].join(',');
  });

  return [header, ...records.filter(Boolean)].join('\n');
}

/**
 * Format date for WPS file (YYYYMMDD)
 */
function formatWPSDate(date: Date): string {
  return date.toISOString().split('T')[0].replace(/-/g, '');
}

/**
 * Format currency for display
 */
export function formatCurrency(amount: number): string {
  return new Intl.NumberFormat('en-AE', {
    style: 'currency',
    currency: 'AED',
    minimumFractionDigits: 2,
  }).format(amount);
}

/**
 * Get month name
 */
export function getMonthName(month: number): string {
  return new Date(2025, month).toLocaleDateString('en-AE', { month: 'long' });
}

/**
 * Generate payslip HTML for PDF export
 */
export function generatePayslipHTML(
  entry: PayrollEntry,
  employee: Employee,
  companyName: string = COMPANY_WPS_CONFIG.companyName
): string {
  const monthYear = `${getMonthName(entry.month)} ${entry.year}`;

  return `
<!DOCTYPE html>
<html>
<head>
  <meta charset="UTF-8">
  <title>Payslip - ${employee.personalInfo.firstName} ${employee.personalInfo.lastName} - ${monthYear}</title>
  <style>
    * { margin: 0; padding: 0; box-sizing: border-box; }
    body { font-family: 'Segoe UI', Arial, sans-serif; font-size: 12px; color: #333; padding: 40px; }
    .header { display: flex; justify-content: space-between; align-items: flex-start; margin-bottom: 30px; padding-bottom: 20px; border-bottom: 2px solid #0d9488; }
    .company { }
    .company h1 { color: #0d9488; font-size: 20px; margin-bottom: 5px; }
    .company p { color: #666; font-size: 11px; }
    .payslip-info { text-align: right; }
    .payslip-info h2 { font-size: 16px; color: #333; margin-bottom: 5px; }
    .payslip-info p { color: #666; }
    .employee-section { display: flex; gap: 40px; margin-bottom: 25px; }
    .employee-details, .bank-details { flex: 1; }
    .section-title { font-size: 10px; font-weight: 600; color: #0d9488; text-transform: uppercase; margin-bottom: 10px; padding-bottom: 5px; border-bottom: 1px solid #e5e7eb; }
    .detail-row { display: flex; justify-content: space-between; padding: 4px 0; }
    .detail-row .label { color: #666; }
    .detail-row .value { font-weight: 500; }
    .salary-section { margin-bottom: 25px; }
    .salary-table { width: 100%; border-collapse: collapse; }
    .salary-table th { background: #f0fdfa; color: #0d9488; text-align: left; padding: 10px; font-size: 11px; text-transform: uppercase; }
    .salary-table td { padding: 10px; border-bottom: 1px solid #e5e7eb; }
    .salary-table .amount { text-align: right; font-weight: 500; }
    .salary-table .total-row { background: #f8fafc; font-weight: 600; }
    .salary-table .net-row { background: #0d9488; color: white; font-size: 14px; }
    .net-row td { padding: 12px 10px; }
    .deduction { color: #dc2626; }
    .footer { margin-top: 40px; padding-top: 20px; border-top: 1px solid #e5e7eb; display: flex; justify-content: space-between; }
    .footer-section { }
    .footer-section h4 { font-size: 10px; color: #666; margin-bottom: 5px; }
    .disclaimer { margin-top: 30px; padding: 15px; background: #f8fafc; border-radius: 4px; font-size: 10px; color: #64748b; }
  </style>
</head>
<body>
  <div class="header">
    <div class="company">
      <h1>${companyName}</h1>
      <p>UAE Private Sector Employer</p>
      <p>WPS Employer Code: ${COMPANY_WPS_CONFIG.employerCode}</p>
    </div>
    <div class="payslip-info">
      <h2>PAYSLIP</h2>
      <p>${monthYear}</p>
      <p>Ref: ${entry.id}</p>
    </div>
  </div>

  <div class="employee-section">
    <div class="employee-details">
      <div class="section-title">Employee Details</div>
      <div class="detail-row"><span class="label">Name</span><span class="value">${employee.personalInfo.firstName} ${employee.personalInfo.lastName}</span></div>
      <div class="detail-row"><span class="label">Employee ID</span><span class="value">${employee.employeeId}</span></div>
      <div class="detail-row"><span class="label">Department</span><span class="value">${employee.employmentInfo.department}</span></div>
      <div class="detail-row"><span class="label">Position</span><span class="value">${employee.employmentInfo.jobTitle}</span></div>
      <div class="detail-row"><span class="label">Join Date</span><span class="value">${new Date(employee.employmentInfo.employmentStartDate).toLocaleDateString('en-AE')}</span></div>
    </div>
    <div class="bank-details">
      <div class="section-title">Bank Details</div>
      <div class="detail-row"><span class="label">Bank</span><span class="value">${employee.bankDetails.bankName}</span></div>
      <div class="detail-row"><span class="label">Account</span><span class="value">${employee.bankDetails.accountNumber}</span></div>
      <div class="detail-row"><span class="label">IBAN</span><span class="value">${employee.bankDetails.iban}</span></div>
    </div>
  </div>

  <div class="salary-section">
    <table class="salary-table">
      <thead>
        <tr>
          <th>Earnings</th>
          <th style="text-align: right;">Amount (AED)</th>
          <th>Deductions</th>
          <th style="text-align: right;">Amount (AED)</th>
        </tr>
      </thead>
      <tbody>
        <tr>
          <td>Basic Salary</td>
          <td class="amount">${formatCurrency(entry.basicSalary)}</td>
          <td>Unpaid Leave (${entry.unpaidLeaveDays} days)</td>
          <td class="amount deduction">${entry.unpaidLeaveDeduction > 0 ? '-' + formatCurrency(entry.unpaidLeaveDeduction) : '-'}</td>
        </tr>
        <tr>
          <td>Housing Allowance</td>
          <td class="amount">${formatCurrency(entry.housingAllowance)}</td>
          <td>Salary Advance</td>
          <td class="amount deduction">${entry.advanceDeduction > 0 ? '-' + formatCurrency(entry.advanceDeduction) : '-'}</td>
        </tr>
        <tr>
          <td>Transport Allowance</td>
          <td class="amount">${formatCurrency(entry.transportAllowance)}</td>
          <td>Loan Installment</td>
          <td class="amount deduction">${entry.loanDeduction > 0 ? '-' + formatCurrency(entry.loanDeduction) : '-'}</td>
        </tr>
        <tr>
          <td>Other Allowances</td>
          <td class="amount">${formatCurrency(entry.otherAllowances)}</td>
          <td>Other Deductions</td>
          <td class="amount deduction">${entry.otherDeductions > 0 ? '-' + formatCurrency(entry.otherDeductions) : '-'}</td>
        </tr>
        <tr>
          <td>Overtime (${entry.overtimeHours.toFixed(1)}h)</td>
          <td class="amount">${formatCurrency(entry.overtimeAmount)}</td>
          <td></td>
          <td></td>
        </tr>
        <tr class="total-row">
          <td>Total Earnings</td>
          <td class="amount">${formatCurrency(entry.totalEarnings)}</td>
          <td>Total Deductions</td>
          <td class="amount deduction">${formatCurrency(entry.totalDeductions)}</td>
        </tr>
      </tbody>
      <tfoot>
        <tr class="net-row">
          <td colspan="3">NET SALARY PAYABLE</td>
          <td class="amount">${formatCurrency(entry.netSalary)}</td>
        </tr>
      </tfoot>
    </table>
  </div>

  <div class="footer">
    <div class="footer-section">
      <h4>Generated On</h4>
      <p>${new Date().toLocaleDateString('en-AE', { day: 'numeric', month: 'long', year: 'numeric' })}</p>
    </div>
    <div class="footer-section">
      <h4>Payment Method</h4>
      <p>WPS Bank Transfer</p>
    </div>
    <div class="footer-section">
      <h4>Status</h4>
      <p>${entry.status.toUpperCase()}</p>
    </div>
  </div>

  <div class="disclaimer">
    This is a computer-generated payslip and is valid without signature. Salary is paid through the UAE Wage Protection System (WPS)
    in compliance with UAE Federal Decree-Law. For any queries, please contact the HR department.
  </div>
</body>
</html>
  `;
}

// Mock loans/advances data
export const mockLoansAdvances: LoanAdvance[] = [
  {
    id: 'LOAN-001',
    employeeId: '1',
    type: 'loan',
    totalAmount: 10000,
    remainingAmount: 8000,
    monthlyInstallment: 1000,
    startMonth: 1,
    startYear: 2025,
    endMonth: 10,
    endYear: 2025,
    description: 'Personal loan',
    isActive: true,
    createdAt: '2025-01-01T00:00:00Z',
  },
  {
    id: 'ADV-001',
    employeeId: '2',
    type: 'advance',
    totalAmount: 5000,
    remainingAmount: 2500,
    monthlyInstallment: 2500,
    startMonth: 1,
    startYear: 2025,
    endMonth: 2,
    endYear: 2025,
    description: 'Salary advance',
    isActive: true,
    createdAt: '2025-01-01T00:00:00Z',
  },
];

// Mock deductions
export const mockDeductions: Deduction[] = [];
