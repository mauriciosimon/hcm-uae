'use client';

import { useState, useMemo } from 'react';
import Sidebar from '@/components/Sidebar';
import Header from '@/components/Header';
import StatsCard from '@/components/StatsCard';
import PayrollTable from '@/components/PayrollTable';
import PayslipModal from '@/components/PayslipModal';
import LoanAdvanceManager from '@/components/LoanAdvanceManager';
import { mockEmployees } from '@/lib/data';
import { mockOvertimeEntries } from '@/lib/overtimeCalculator';
import { mockLeaveRequests } from '@/lib/leaveData';
import {
  generatePayrollRun,
  generateWPSSIFFile,
  formatCurrency,
  getMonthName,
  mockLoansAdvances,
  mockDeductions,
} from '@/lib/payrollCalculator';
import {
  PayrollRun,
  PayrollEntry,
  PayrollStatus,
  LoanAdvance,
  PAYROLL_STATUS_CONFIG,
  COMPANY_WPS_CONFIG,
} from '@/types/payroll';
import {
  DollarSign,
  Users,
  TrendingUp,
  Calendar,
  Play,
  CheckCircle,
  Download,
  FileSpreadsheet,
  CreditCard,
  History,
  Info,
  AlertCircle,
} from 'lucide-react';

export default function PayrollPage() {
  const [selectedMonth, setSelectedMonth] = useState(new Date().getMonth());
  const [selectedYear, setSelectedYear] = useState(new Date().getFullYear());
  const [payrollRun, setPayrollRun] = useState<PayrollRun | null>(null);
  const [selectedEntry, setSelectedEntry] = useState<PayrollEntry | null>(null);
  const [loansAdvances, setLoansAdvances] = useState<LoanAdvance[]>(mockLoansAdvances);
  const [showLoanManager, setShowLoanManager] = useState(false);
  const [payrollHistory, setPayrollHistory] = useState<PayrollRun[]>([]);

  // Calculate payroll
  const handleCalculatePayroll = () => {
    const run = generatePayrollRun(
      mockEmployees,
      selectedMonth,
      selectedYear,
      mockOvertimeEntries,
      mockLeaveRequests,
      loansAdvances,
      mockDeductions
    );
    setPayrollRun(run);
  };

  // Approve all entries
  const handleApproveAll = () => {
    if (!payrollRun) return;

    const approvedRun: PayrollRun = {
      ...payrollRun,
      status: 'approved',
      entries: payrollRun.entries.map((entry) => ({
        ...entry,
        status: 'approved',
        approvedBy: 'HR Manager',
        approvedAt: new Date().toISOString(),
      })),
      approvedBy: 'HR Manager',
      approvedAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    setPayrollRun(approvedRun);
  };

  // Mark as paid
  const handleMarkAsPaid = () => {
    if (!payrollRun) return;

    const paidRun: PayrollRun = {
      ...payrollRun,
      status: 'paid',
      entries: payrollRun.entries.map((entry) => ({
        ...entry,
        status: 'paid',
        paidAt: new Date().toISOString(),
      })),
      paidAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    setPayrollRun(paidRun);
    setPayrollHistory([paidRun, ...payrollHistory]);
  };

  // Generate WPS file
  const handleGenerateWPS = () => {
    if (!payrollRun) return;

    const wpsContent = generateWPSSIFFile(payrollRun, mockEmployees);
    const blob = new Blob([wpsContent], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `WPS_SIF_${selectedYear}_${selectedMonth + 1}.csv`;
    a.click();
    URL.revokeObjectURL(url);

    // Mark WPS as generated
    setPayrollRun({
      ...payrollRun,
      wpsFileGenerated: true,
      wpsGeneratedAt: new Date().toISOString(),
    });
  };

  // Add loan/advance
  const handleAddLoanAdvance = (item: Omit<LoanAdvance, 'id' | 'createdAt'>) => {
    const newItem: LoanAdvance = {
      ...item,
      id: `${item.type.toUpperCase()}-${Date.now()}`,
      createdAt: new Date().toISOString(),
    };
    setLoansAdvances([...loansAdvances, newItem]);
  };

  // Delete loan/advance
  const handleDeleteLoanAdvance = (id: string) => {
    setLoansAdvances(loansAdvances.filter((item) => item.id !== id));
  };

  // Get employee for payslip
  const getEmployee = (employeeId: string) =>
    mockEmployees.find((e) => e.id === employeeId);

  // Stats
  const stats = useMemo(() => {
    if (!payrollRun) {
      return {
        totalPayroll: 0,
        employeeCount: mockEmployees.filter(
          (e) => e.employmentInfo.employmentStatus === 'active'
        ).length,
        avgSalary: 0,
        totalDeductions: 0,
      };
    }

    return {
      totalPayroll: payrollRun.totalNet,
      employeeCount: payrollRun.totalEmployees,
      avgSalary: payrollRun.totalNet / payrollRun.totalEmployees,
      totalDeductions: payrollRun.totalDeductions,
    };
  }, [payrollRun]);

  // Generate month options
  const months = Array.from({ length: 12 }, (_, i) => ({
    value: i,
    label: getMonthName(i),
  }));

  const statusConfig = payrollRun
    ? PAYROLL_STATUS_CONFIG[payrollRun.status]
    : null;

  return (
    <div className="flex min-h-screen bg-stone-50">
      <Sidebar />

      <main className="flex-1 ml-0 md:ml-64 transition-all duration-300">
        <Header
          title="Payroll Management"
          subtitle="UAE WPS Compliant Salary Processing"
        />

        <div className="p-6">
          {/* Stats Row */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
            <StatsCard
              title="Total Payroll"
              value={formatCurrency(stats.totalPayroll)}
              icon={<DollarSign size={24} />}
              color="teal"
            />
            <StatsCard
              title="Active Employees"
              value={stats.employeeCount}
              icon={<Users size={24} />}
              color="blue"
            />
            <StatsCard
              title="Average Salary"
              value={formatCurrency(stats.avgSalary)}
              icon={<TrendingUp size={24} />}
              color="emerald"
            />
            <StatsCard
              title="Total Deductions"
              value={formatCurrency(stats.totalDeductions)}
              icon={<CreditCard size={24} />}
              color="amber"
            />
          </div>

          {/* Actions Bar */}
          <div data-tour="payroll-workflow" className="bg-white rounded-xl border border-gray-200 p-4 mb-6">
            <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
              <div className="flex items-center gap-3 flex-wrap">
                {/* Month/Year Selector */}
                <div className="flex items-center gap-2">
                  <Calendar size={16} className="text-gray-400" />
                  <select
                    value={selectedMonth}
                    onChange={(e) => setSelectedMonth(parseInt(e.target.value))}
                    className="px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-teal-500"
                  >
                    {months.map((month) => (
                      <option key={month.value} value={month.value}>
                        {month.label}
                      </option>
                    ))}
                  </select>
                  <select
                    value={selectedYear}
                    onChange={(e) => setSelectedYear(parseInt(e.target.value))}
                    className="px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-teal-500"
                  >
                    <option value={2024}>2024</option>
                    <option value={2025}>2025</option>
                  </select>
                </div>

                {/* Calculate Button */}
                <button
                  data-tour="run-payroll"
                  onClick={handleCalculatePayroll}
                  className="btn btn-primary flex items-center gap-2"
                >
                  <Play size={16} />
                  Calculate Payroll
                </button>

                {/* Loans & Advances */}
                <button
                  onClick={() => setShowLoanManager(true)}
                  className="btn btn-secondary flex items-center gap-2"
                >
                  <CreditCard size={16} />
                  Loans & Advances
                </button>
              </div>

              <div className="flex items-center gap-3">
                {/* Payroll Status */}
                {payrollRun && statusConfig && (
                  <span
                    className={`px-3 py-1.5 rounded-full text-sm font-medium ${statusConfig.bgColor} ${statusConfig.textColor}`}
                  >
                    {statusConfig.label}
                  </span>
                )}

                {/* Approve All */}
                {payrollRun && payrollRun.status === 'calculated' && (
                  <button
                    onClick={handleApproveAll}
                    className="flex items-center gap-2 px-4 py-2 bg-amber-600 text-white rounded-lg hover:bg-amber-700 transition-colors"
                  >
                    <CheckCircle size={16} />
                    Approve All
                  </button>
                )}

                {/* Generate WPS */}
                {payrollRun && payrollRun.status === 'approved' && (
                  <button
                    data-tour="wps-download"
                    onClick={handleGenerateWPS}
                    className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                  >
                    <FileSpreadsheet size={16} />
                    Generate WPS File
                  </button>
                )}

                {/* Mark as Paid */}
                {payrollRun &&
                  payrollRun.status === 'approved' &&
                  payrollRun.wpsFileGenerated && (
                    <button
                      onClick={handleMarkAsPaid}
                      className="flex items-center gap-2 px-4 py-2 bg-emerald-600 text-white rounded-lg hover:bg-emerald-700 transition-colors"
                    >
                      <CheckCircle size={16} />
                      Mark as Paid
                    </button>
                  )}
              </div>
            </div>

            {/* WPS Status */}
            {payrollRun && payrollRun.wpsFileGenerated && (
              <div className="mt-4 pt-4 border-t border-gray-100 flex items-center gap-2 text-sm text-emerald-600">
                <CheckCircle size={16} />
                WPS SIF file generated on{' '}
                {new Date(payrollRun.wpsGeneratedAt!).toLocaleString('en-AE')}
              </div>
            )}
          </div>

          {/* Payroll Table */}
          {payrollRun ? (
            <PayrollTable
              entries={payrollRun.entries}
              employees={mockEmployees}
              onViewPayslip={(entry) => setSelectedEntry(entry)}
              showApprove={payrollRun.status === 'calculated'}
            />
          ) : (
            <div className="bg-white rounded-xl border border-gray-200 p-12 text-center">
              <DollarSign size={48} className="mx-auto text-gray-300 mb-4" />
              <h3 className="font-display font-semibold text-gray-900 mb-2">
                No Payroll Calculated
              </h3>
              <p className="text-gray-500 mb-4">
                Select a month and click "Calculate Payroll" to generate salary data for all
                active employees.
              </p>
              <button onClick={handleCalculatePayroll} className="btn btn-primary">
                Calculate Payroll
              </button>
            </div>
          )}

          {/* Payroll History */}
          {payrollHistory.length > 0 && (
            <div className="mt-6">
              <h3 className="font-display font-semibold text-gray-900 mb-4 flex items-center gap-2">
                <History size={20} />
                Payroll History
              </h3>
              <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
                <table className="w-full">
                  <thead className="bg-gray-50 border-b border-gray-200">
                    <tr>
                      <th className="text-left px-4 py-3 text-xs font-semibold text-gray-500 uppercase">
                        Period
                      </th>
                      <th className="text-right px-4 py-3 text-xs font-semibold text-gray-500 uppercase">
                        Employees
                      </th>
                      <th className="text-right px-4 py-3 text-xs font-semibold text-gray-500 uppercase">
                        Total Net
                      </th>
                      <th className="text-center px-4 py-3 text-xs font-semibold text-gray-500 uppercase">
                        Status
                      </th>
                      <th className="text-right px-4 py-3 text-xs font-semibold text-gray-500 uppercase">
                        Paid On
                      </th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-100">
                    {payrollHistory.map((run) => (
                      <tr key={run.id} className="hover:bg-gray-50">
                        <td className="px-4 py-3 font-medium text-gray-900">
                          {getMonthName(run.month)} {run.year}
                        </td>
                        <td className="px-4 py-3 text-right text-gray-600">
                          {run.totalEmployees}
                        </td>
                        <td className="px-4 py-3 text-right font-medium text-gray-900">
                          {formatCurrency(run.totalNet)}
                        </td>
                        <td className="px-4 py-3 text-center">
                          <span className="px-2 py-1 rounded-full text-xs font-medium bg-emerald-100 text-emerald-700">
                            Paid
                          </span>
                        </td>
                        <td className="px-4 py-3 text-right text-sm text-gray-500">
                          {run.paidAt
                            ? new Date(run.paidAt).toLocaleDateString('en-AE')
                            : '-'}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {/* WPS Info */}
          <div className="mt-6 bg-gradient-to-r from-teal-50 to-blue-50 rounded-xl border border-teal-200 p-4">
            <div className="flex items-start gap-3">
              <Info size={20} className="text-teal-600 mt-0.5" />
              <div>
                <h4 className="font-display font-semibold text-teal-900 mb-2">
                  UAE Wage Protection System (WPS)
                </h4>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 text-sm">
                  <div>
                    <span className="font-medium text-gray-700">Employer Code:</span>
                    <p className="text-gray-600 font-mono">
                      {COMPANY_WPS_CONFIG.employerCode}
                    </p>
                  </div>
                  <div>
                    <span className="font-medium text-gray-700">MOL ID:</span>
                    <p className="text-gray-600 font-mono">{COMPANY_WPS_CONFIG.molId}</p>
                  </div>
                  <div>
                    <span className="font-medium text-gray-700">File Format:</span>
                    <p className="text-gray-600">SIF (Salary Information File)</p>
                  </div>
                  <div>
                    <span className="font-medium text-gray-700">Submission:</span>
                    <p className="text-gray-600">Monthly via authorized bank</p>
                  </div>
                </div>
                <p className="text-xs text-gray-500 mt-3">
                  WPS is mandatory for all UAE private sector employers. Salaries must be paid
                  through authorized banks/exchange houses. Non-compliance may result in
                  penalties and work permit restrictions.
                </p>
              </div>
            </div>
          </div>
        </div>
      </main>

      {/* Payslip Modal */}
      {selectedEntry && (
        <PayslipModal
          entry={selectedEntry}
          employee={getEmployee(selectedEntry.employeeId)!}
          onClose={() => setSelectedEntry(null)}
        />
      )}

      {/* Loan/Advance Manager */}
      {showLoanManager && (
        <LoanAdvanceManager
          loansAdvances={loansAdvances}
          employees={mockEmployees}
          onAdd={handleAddLoanAdvance}
          onDelete={handleDeleteLoanAdvance}
          onClose={() => setShowLoanManager(false)}
        />
      )}
    </div>
  );
}
