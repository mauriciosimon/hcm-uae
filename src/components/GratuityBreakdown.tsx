'use client';

import {
  GratuityInput,
  GratuityBreakdown as GratuityBreakdownType,
  UAE_GRATUITY_LAW,
} from '@/types/gratuity';
import { Employee } from '@/types/employee';
import {
  formatServiceDuration,
  getResignationTierDescription,
  calculatePaymentDeadline,
  generateGratuityStatementHTML,
} from '@/lib/gratuityCalculator';
import {
  Calendar,
  Clock,
  DollarSign,
  TrendingUp,
  AlertTriangle,
  CheckCircle,
  XCircle,
  Download,
  FileText,
  Info,
} from 'lucide-react';

interface GratuityBreakdownProps {
  input: GratuityInput;
  breakdown: GratuityBreakdownType;
  employee?: Employee;
}

function formatCurrency(amount: number): string {
  return new Intl.NumberFormat('en-AE', {
    style: 'currency',
    currency: 'AED',
    minimumFractionDigits: 2,
  }).format(amount);
}

function formatDate(dateString: string): string {
  return new Date(dateString).toLocaleDateString('en-AE', {
    day: 'numeric',
    month: 'short',
    year: 'numeric',
  });
}

export default function GratuityBreakdown({
  input,
  breakdown,
  employee,
}: GratuityBreakdownProps) {
  const paymentDeadline = calculatePaymentDeadline(input.employmentEndDate);

  const handleExportPDF = () => {
    const employeeName = employee
      ? `${employee.personalInfo.firstName} ${employee.personalInfo.lastName}`
      : 'Manual Entry';
    const employeeId = employee?.employeeId || 'N/A';

    const html = generateGratuityStatementHTML(employeeName, employeeId, input, breakdown);

    // Create a new window and print
    const printWindow = window.open('', '_blank');
    if (printWindow) {
      printWindow.document.write(html);
      printWindow.document.close();
      printWindow.focus();
      setTimeout(() => {
        printWindow.print();
      }, 250);
    }
  };

  return (
    <div className="space-y-4">
      {/* Eligibility Status */}
      <div
        className={`p-4 rounded-xl border ${
          breakdown.isEligible
            ? 'bg-emerald-50 border-emerald-200'
            : 'bg-red-50 border-red-200'
        }`}
      >
        <div className="flex items-center gap-3">
          {breakdown.isEligible ? (
            <CheckCircle size={24} className="text-emerald-600" />
          ) : (
            <XCircle size={24} className="text-red-600" />
          )}
          <div>
            <h4
              className={`font-semibold ${
                breakdown.isEligible ? 'text-emerald-900' : 'text-red-900'
              }`}
            >
              {breakdown.isEligible ? 'Eligible for Gratuity' : 'Not Eligible for Gratuity'}
            </h4>
            <p
              className={`text-sm ${
                breakdown.isEligible ? 'text-emerald-700' : 'text-red-700'
              }`}
            >
              {breakdown.isEligible
                ? `${formatServiceDuration(breakdown)} of continuous service`
                : breakdown.ineligibilityReason}
            </p>
          </div>
        </div>
      </div>

      {/* Final Amount Card */}
      {breakdown.isEligible && (
        <div className="bg-gradient-to-br from-teal-600 to-teal-700 rounded-xl p-6 text-white">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-teal-100 text-sm mb-1">Net Gratuity Payable</p>
              <p className="text-3xl font-bold">{formatCurrency(breakdown.cappedGratuity)}</p>
              {breakdown.isCapped && (
                <p className="text-teal-200 text-xs mt-1 flex items-center gap-1">
                  <AlertTriangle size={12} />
                  Capped at 2 years salary ({formatCurrency(breakdown.maxCap)})
                </p>
              )}
            </div>
            <button
              onClick={handleExportPDF}
              className="flex items-center gap-2 px-4 py-2 bg-white/20 hover:bg-white/30 rounded-lg transition-colors"
            >
              <Download size={18} />
              <span className="text-sm font-medium">Export PDF</span>
            </button>
          </div>
        </div>
      )}

      {/* Service Period */}
      <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
        <div className="p-3 border-b border-gray-100 bg-gray-50 flex items-center gap-2">
          <Clock size={16} className="text-gray-500" />
          <h4 className="font-medium text-gray-900 text-sm">Service Period</h4>
        </div>
        <div className="p-4 space-y-2 text-sm">
          <div className="flex justify-between">
            <span className="text-gray-600">Start Date</span>
            <span className="font-medium">{formatDate(input.employmentStartDate)}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-gray-600">End Date</span>
            <span className="font-medium">{formatDate(input.employmentEndDate)}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-gray-600">Total Service Days</span>
            <span className="font-medium">{breakdown.totalServiceDays.toLocaleString()}</span>
          </div>
          {input.unpaidLeaveDays > 0 && (
            <div className="flex justify-between text-amber-600">
              <span>Less: Unpaid Leave Days</span>
              <span className="font-medium">-{input.unpaidLeaveDays}</span>
            </div>
          )}
          <div className="flex justify-between pt-2 border-t border-gray-100">
            <span className="text-gray-900 font-medium">Effective Service</span>
            <span className="font-semibold text-teal-600">{formatServiceDuration(breakdown)}</span>
          </div>
        </div>
      </div>

      {/* Wage Calculation */}
      <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
        <div className="p-3 border-b border-gray-100 bg-gray-50 flex items-center gap-2">
          <DollarSign size={16} className="text-gray-500" />
          <h4 className="font-medium text-gray-900 text-sm">Daily Wage Calculation</h4>
        </div>
        <div className="p-4 space-y-2 text-sm">
          <div className="flex justify-between">
            <span className="text-gray-600">Basic Monthly Salary</span>
            <span className="font-medium">{formatCurrency(breakdown.basicSalary)}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-gray-600">Annual Salary (× 12)</span>
            <span className="font-medium">{formatCurrency(breakdown.annualSalary)}</span>
          </div>
          <div className="flex justify-between pt-2 border-t border-gray-100">
            <span className="text-gray-900 font-medium">Daily Wage (÷ 365)</span>
            <span className="font-semibold text-teal-600">{formatCurrency(breakdown.dailyWage)}</span>
          </div>
        </div>
      </div>

      {/* Gratuity Calculation */}
      {breakdown.isEligible && (
        <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
          <div className="p-3 border-b border-gray-100 bg-gray-50 flex items-center gap-2">
            <TrendingUp size={16} className="text-gray-500" />
            <h4 className="font-medium text-gray-900 text-sm">Gratuity Calculation</h4>
          </div>
          <div className="p-4 space-y-2 text-sm">
            <div className="flex justify-between">
              <span className="text-gray-600">
                Years 1-5: {UAE_GRATUITY_LAW.daysPerYearFirst5} days × {Math.min(breakdown.yearsOfService, 5).toFixed(2)} yrs
              </span>
              <span className="font-medium">{formatCurrency(breakdown.firstFiveYearsAmount)}</span>
            </div>
            {breakdown.yearsOfService > 5 && (
              <div className="flex justify-between">
                <span className="text-gray-600">
                  Years 5+: {UAE_GRATUITY_LAW.daysPerYearAfter5} days × {(breakdown.yearsOfService - 5).toFixed(2)} yrs
                </span>
                <span className="font-medium">{formatCurrency(breakdown.afterFiveYearsAmount)}</span>
              </div>
            )}
            <div className="flex justify-between pt-2 border-t border-gray-100">
              <span className="text-gray-900 font-medium">Gross Gratuity</span>
              <span className="font-semibold">{formatCurrency(breakdown.grossGratuity)}</span>
            </div>

            {/* Resignation Deduction */}
            {breakdown.resignationDeduction > 0 && (
              <>
                <div className="p-2 bg-amber-50 rounded-lg mt-2">
                  <p className="text-xs text-amber-700">
                    {getResignationTierDescription(breakdown.yearsOfService)}
                  </p>
                </div>
                <div className="flex justify-between text-red-600">
                  <span>Resignation Deduction ({((1 - breakdown.resignationMultiplier) * 100).toFixed(0)}%)</span>
                  <span className="font-medium">-{formatCurrency(breakdown.resignationDeduction)}</span>
                </div>
              </>
            )}

            {/* Capping */}
            {breakdown.isCapped && (
              <div className="flex justify-between text-amber-600">
                <span>Maximum Cap (2 years salary)</span>
                <span className="font-medium">{formatCurrency(breakdown.maxCap)}</span>
              </div>
            )}

            <div className="flex justify-between pt-2 border-t-2 border-teal-200 bg-teal-50 -mx-4 px-4 py-2 -mb-4">
              <span className="text-teal-900 font-semibold">Net Gratuity Payable</span>
              <span className="font-bold text-teal-600 text-lg">
                {formatCurrency(breakdown.cappedGratuity)}
              </span>
            </div>
          </div>
        </div>
      )}

      {/* Payment Deadline */}
      {breakdown.isEligible && (
        <div className="bg-amber-50 border border-amber-200 rounded-xl p-4">
          <div className="flex items-start gap-3">
            <Calendar size={20} className="text-amber-600 mt-0.5" />
            <div>
              <h4 className="font-medium text-amber-900">Payment Deadline</h4>
              <p className="text-sm text-amber-700 mt-1">
                As per UAE Labor Law, gratuity must be paid within {UAE_GRATUITY_LAW.paymentDeadlineDays} days
                of contract end.
              </p>
              <p className="text-sm font-semibold text-amber-900 mt-2">
                Due by: {formatDate(paymentDeadline)}
              </p>
            </div>
          </div>
        </div>
      )}

      {/* Legal Reference */}
      <div className="bg-gray-50 border border-gray-200 rounded-xl p-4">
        <div className="flex items-start gap-3">
          <FileText size={20} className="text-gray-500 mt-0.5" />
          <div className="text-xs text-gray-600">
            <h4 className="font-medium text-gray-900 mb-1">Legal Reference</h4>
            <p>
              Calculated as per UAE Federal Decree-Law No. 33/2021, Article 51 - End of Service
              Benefits. For years 1-5: 21 days of basic salary per year. For years beyond 5: 30
              days of basic salary per year. Maximum capped at 2 years of total basic salary.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
