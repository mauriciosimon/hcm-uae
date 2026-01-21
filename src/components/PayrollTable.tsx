'use client';

import { PayrollEntry, PAYROLL_STATUS_CONFIG } from '@/types/payroll';
import { Employee } from '@/types/employee';
import { formatCurrency } from '@/lib/payrollCalculator';
import { Eye, FileText, CheckCircle, Clock } from 'lucide-react';

interface PayrollTableProps {
  entries: PayrollEntry[];
  employees: Employee[];
  onViewPayslip: (entry: PayrollEntry) => void;
  onApproveEntry?: (entryId: string) => void;
  showApprove?: boolean;
}

export default function PayrollTable({
  entries,
  employees,
  onViewPayslip,
  onApproveEntry,
  showApprove = false,
}: PayrollTableProps) {
  const getEmployee = (employeeId: string) =>
    employees.find((e) => e.id === employeeId);

  if (entries.length === 0) {
    return (
      <div className="bg-white rounded-xl border border-gray-200 p-8 text-center">
        <FileText size={48} className="mx-auto text-gray-300 mb-4" />
        <h4 className="font-medium text-gray-900 mb-2">No payroll data</h4>
        <p className="text-sm text-gray-500">
          Run payroll calculation to generate entries.
        </p>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
      <div className="overflow-x-auto">
        <table className="w-full">
          <thead className="bg-gray-50 border-b border-gray-200">
            <tr>
              <th className="text-left px-4 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wide">
                Employee
              </th>
              <th className="text-right px-4 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wide">
                Basic
              </th>
              <th className="text-right px-4 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wide">
                Allowances
              </th>
              <th className="text-right px-4 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wide">
                Overtime
              </th>
              <th className="text-right px-4 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wide">
                Gross
              </th>
              <th className="text-right px-4 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wide">
                Deductions
              </th>
              <th className="text-right px-4 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wide">
                Net Salary
              </th>
              <th className="text-center px-4 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wide">
                Status
              </th>
              <th className="text-right px-4 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wide">
                Actions
              </th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100">
            {entries.map((entry) => {
              const employee = getEmployee(entry.employeeId);
              const statusConfig = PAYROLL_STATUS_CONFIG[entry.status];
              const totalAllowances =
                entry.housingAllowance +
                entry.transportAllowance +
                entry.otherAllowances;

              return (
                <tr key={entry.id} className="hover:bg-gray-50">
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 bg-gradient-to-br from-teal-500 to-teal-600 rounded-lg flex items-center justify-center">
                        <span className="text-white text-xs font-medium">
                          {employee?.personalInfo.firstName[0]}
                          {employee?.personalInfo.lastName[0]}
                        </span>
                      </div>
                      <div>
                        <p className="font-medium text-gray-900 text-sm">
                          {employee?.personalInfo.firstName}{' '}
                          {employee?.personalInfo.lastName}
                        </p>
                        <p className="text-xs text-gray-500">
                          {employee?.employeeId}
                        </p>
                      </div>
                    </div>
                  </td>
                  <td className="px-4 py-3 text-sm text-gray-900 text-right">
                    {formatCurrency(entry.basicSalary)}
                  </td>
                  <td className="px-4 py-3 text-sm text-gray-600 text-right">
                    {formatCurrency(totalAllowances)}
                  </td>
                  <td className="px-4 py-3 text-sm text-right">
                    {entry.overtimeAmount > 0 ? (
                      <span className="text-teal-600 font-medium">
                        +{formatCurrency(entry.overtimeAmount)}
                      </span>
                    ) : (
                      <span className="text-gray-400">-</span>
                    )}
                  </td>
                  <td className="px-4 py-3 text-sm text-gray-900 text-right font-medium">
                    {formatCurrency(entry.totalEarnings)}
                  </td>
                  <td className="px-4 py-3 text-sm text-right">
                    {entry.totalDeductions > 0 ? (
                      <span className="text-red-600">
                        -{formatCurrency(entry.totalDeductions)}
                      </span>
                    ) : (
                      <span className="text-gray-400">-</span>
                    )}
                  </td>
                  <td className="px-4 py-3 text-right">
                    <span className="font-bold text-gray-900">
                      {formatCurrency(entry.netSalary)}
                    </span>
                  </td>
                  <td className="px-4 py-3 text-center">
                    <span
                      className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${statusConfig.bgColor} ${statusConfig.textColor}`}
                    >
                      {statusConfig.label}
                    </span>
                  </td>
                  <td className="px-4 py-3">
                    <div className="flex items-center justify-end gap-1">
                      <button
                        onClick={() => onViewPayslip(entry)}
                        className="p-1.5 text-gray-400 hover:text-teal-600 hover:bg-teal-50 rounded transition-colors"
                        title="View Payslip"
                      >
                        <Eye size={16} />
                      </button>
                      {showApprove &&
                        entry.status === 'calculated' &&
                        onApproveEntry && (
                          <button
                            onClick={() => onApproveEntry(entry.id)}
                            className="p-1.5 text-gray-400 hover:text-emerald-600 hover:bg-emerald-50 rounded transition-colors"
                            title="Approve"
                          >
                            <CheckCircle size={16} />
                          </button>
                        )}
                    </div>
                  </td>
                </tr>
              );
            })}
          </tbody>
          {/* Totals Row */}
          <tfoot className="bg-teal-50 border-t-2 border-teal-200">
            <tr>
              <td className="px-4 py-3 font-semibold text-teal-900">
                Total ({entries.length} employees)
              </td>
              <td className="px-4 py-3 text-right font-semibold text-teal-900">
                {formatCurrency(entries.reduce((sum, e) => sum + e.basicSalary, 0))}
              </td>
              <td className="px-4 py-3 text-right font-semibold text-teal-900">
                {formatCurrency(
                  entries.reduce(
                    (sum, e) =>
                      sum +
                      e.housingAllowance +
                      e.transportAllowance +
                      e.otherAllowances,
                    0
                  )
                )}
              </td>
              <td className="px-4 py-3 text-right font-semibold text-teal-600">
                {formatCurrency(entries.reduce((sum, e) => sum + e.overtimeAmount, 0))}
              </td>
              <td className="px-4 py-3 text-right font-semibold text-teal-900">
                {formatCurrency(entries.reduce((sum, e) => sum + e.totalEarnings, 0))}
              </td>
              <td className="px-4 py-3 text-right font-semibold text-red-600">
                {formatCurrency(entries.reduce((sum, e) => sum + e.totalDeductions, 0))}
              </td>
              <td className="px-4 py-3 text-right font-bold text-teal-700 text-lg">
                {formatCurrency(entries.reduce((sum, e) => sum + e.netSalary, 0))}
              </td>
              <td colSpan={2} />
            </tr>
          </tfoot>
        </table>
      </div>
    </div>
  );
}
