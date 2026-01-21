'use client';

import { X, Download, Printer, Mail } from 'lucide-react';
import { PayrollEntry, PAYROLL_STATUS_CONFIG } from '@/types/payroll';
import { Employee } from '@/types/employee';
import {
  formatCurrency,
  getMonthName,
  generatePayslipHTML,
} from '@/lib/payrollCalculator';

interface PayslipModalProps {
  entry: PayrollEntry;
  employee: Employee;
  onClose: () => void;
}

export default function PayslipModal({
  entry,
  employee,
  onClose,
}: PayslipModalProps) {
  const monthYear = `${getMonthName(entry.month)} ${entry.year}`;
  const statusConfig = PAYROLL_STATUS_CONFIG[entry.status];

  const handlePrint = () => {
    const html = generatePayslipHTML(entry, employee);
    const printWindow = window.open('', '_blank');
    if (printWindow) {
      printWindow.document.write(html);
      printWindow.document.close();
      printWindow.focus();
      setTimeout(() => printWindow.print(), 250);
    }
  };

  const handleDownload = () => {
    const html = generatePayslipHTML(entry, employee);
    const blob = new Blob([html], { type: 'text/html' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `payslip_${employee.employeeId}_${entry.year}_${entry.month + 1}.html`;
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-2xl shadow-xl w-full max-w-2xl animate-scale-in max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b border-gray-100 sticky top-0 bg-white z-10">
          <div>
            <h2 className="font-display font-semibold text-lg text-gray-900">
              Payslip
            </h2>
            <p className="text-sm text-gray-500">{monthYear}</p>
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={handleDownload}
              className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
              title="Download"
            >
              <Download size={18} className="text-gray-600" />
            </button>
            <button
              onClick={handlePrint}
              className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
              title="Print"
            >
              <Printer size={18} className="text-gray-600" />
            </button>
            <button
              onClick={onClose}
              className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
            >
              <X size={20} className="text-gray-400" />
            </button>
          </div>
        </div>

        <div className="p-6">
          {/* Employee Info */}
          <div className="flex items-start justify-between mb-6">
            <div className="flex items-center gap-4">
              <div className="w-14 h-14 bg-gradient-to-br from-teal-500 to-teal-600 rounded-xl flex items-center justify-center">
                <span className="text-white text-lg font-semibold">
                  {employee.personalInfo.firstName[0]}
                  {employee.personalInfo.lastName[0]}
                </span>
              </div>
              <div>
                <h3 className="font-semibold text-gray-900">
                  {employee.personalInfo.firstName} {employee.personalInfo.lastName}
                </h3>
                <p className="text-sm text-gray-500">{employee.employeeId}</p>
                <p className="text-sm text-gray-500">
                  {employee.employmentInfo.department} • {employee.employmentInfo.jobTitle}
                </p>
              </div>
            </div>
            <span
              className={`px-3 py-1 rounded-full text-sm font-medium ${statusConfig.bgColor} ${statusConfig.textColor}`}
            >
              {statusConfig.label}
            </span>
          </div>

          {/* Earnings & Deductions */}
          <div className="grid grid-cols-2 gap-6 mb-6">
            {/* Earnings */}
            <div className="bg-emerald-50 rounded-xl p-4">
              <h4 className="font-medium text-emerald-900 mb-3">Earnings</h4>
              <div className="space-y-2">
                <div className="flex justify-between text-sm">
                  <span className="text-gray-600">Basic Salary</span>
                  <span className="font-medium text-gray-900">
                    {formatCurrency(entry.basicSalary)}
                  </span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-gray-600">Housing Allowance</span>
                  <span className="font-medium text-gray-900">
                    {formatCurrency(entry.housingAllowance)}
                  </span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-gray-600">Transport Allowance</span>
                  <span className="font-medium text-gray-900">
                    {formatCurrency(entry.transportAllowance)}
                  </span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-gray-600">Other Allowances</span>
                  <span className="font-medium text-gray-900">
                    {formatCurrency(entry.otherAllowances)}
                  </span>
                </div>
                {entry.overtimeAmount > 0 && (
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-600">
                      Overtime ({entry.overtimeHours.toFixed(1)}h)
                    </span>
                    <span className="font-medium text-teal-600">
                      +{formatCurrency(entry.overtimeAmount)}
                    </span>
                  </div>
                )}
                <div className="flex justify-between text-sm pt-2 border-t border-emerald-200">
                  <span className="font-medium text-emerald-900">Total Earnings</span>
                  <span className="font-bold text-emerald-700">
                    {formatCurrency(entry.totalEarnings)}
                  </span>
                </div>
              </div>
            </div>

            {/* Deductions */}
            <div className="bg-red-50 rounded-xl p-4">
              <h4 className="font-medium text-red-900 mb-3">Deductions</h4>
              <div className="space-y-2">
                <div className="flex justify-between text-sm">
                  <span className="text-gray-600">
                    Unpaid Leave ({entry.unpaidLeaveDays} days)
                  </span>
                  <span className="font-medium text-gray-900">
                    {entry.unpaidLeaveDeduction > 0
                      ? formatCurrency(entry.unpaidLeaveDeduction)
                      : '-'}
                  </span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-gray-600">Salary Advance</span>
                  <span className="font-medium text-gray-900">
                    {entry.advanceDeduction > 0
                      ? formatCurrency(entry.advanceDeduction)
                      : '-'}
                  </span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-gray-600">Loan Installment</span>
                  <span className="font-medium text-gray-900">
                    {entry.loanDeduction > 0
                      ? formatCurrency(entry.loanDeduction)
                      : '-'}
                  </span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-gray-600">Other Deductions</span>
                  <span className="font-medium text-gray-900">
                    {entry.otherDeductions > 0
                      ? formatCurrency(entry.otherDeductions)
                      : '-'}
                  </span>
                </div>
                <div className="flex justify-between text-sm pt-2 border-t border-red-200">
                  <span className="font-medium text-red-900">Total Deductions</span>
                  <span className="font-bold text-red-700">
                    {formatCurrency(entry.totalDeductions)}
                  </span>
                </div>
              </div>
            </div>
          </div>

          {/* Net Salary */}
          <div className="bg-gradient-to-r from-teal-600 to-teal-700 rounded-xl p-6 text-white">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-teal-100 text-sm">Net Salary Payable</p>
                <p className="text-3xl font-bold">{formatCurrency(entry.netSalary)}</p>
              </div>
              <div className="text-right text-sm text-teal-100">
                <p>Payment via WPS</p>
                <p>{employee.bankDetails.bankName}</p>
                <p className="font-mono text-xs">{entry.iban}</p>
              </div>
            </div>
          </div>

          {/* Bank Details */}
          <div className="mt-4 p-4 bg-gray-50 rounded-xl">
            <h4 className="text-sm font-medium text-gray-700 mb-2">Bank Details</h4>
            <div className="grid grid-cols-3 gap-4 text-sm">
              <div>
                <p className="text-gray-500">Bank</p>
                <p className="font-medium text-gray-900">{employee.bankDetails.bankName}</p>
              </div>
              <div>
                <p className="text-gray-500">Account Number</p>
                <p className="font-medium text-gray-900">{employee.bankDetails.accountNumber}</p>
              </div>
              <div>
                <p className="text-gray-500">IBAN</p>
                <p className="font-medium text-gray-900 font-mono text-xs">
                  {employee.bankDetails.iban}
                </p>
              </div>
            </div>
          </div>

          {/* Reference */}
          <div className="mt-4 text-center text-xs text-gray-400">
            Payslip Ref: {entry.id} • Generated on{' '}
            {new Date().toLocaleDateString('en-AE')}
          </div>
        </div>
      </div>
    </div>
  );
}
