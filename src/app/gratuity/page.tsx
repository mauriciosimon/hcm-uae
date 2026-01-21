'use client';

import { useState, Suspense } from 'react';
import { useSearchParams } from 'next/navigation';
import Sidebar from '@/components/Sidebar';
import Header from '@/components/Header';
import StatsCard from '@/components/StatsCard';
import GratuityCalculatorForm from '@/components/GratuityCalculatorForm';
import GratuityBreakdown from '@/components/GratuityBreakdown';
import { mockEmployees, formatCurrency, calculateYearsOfService } from '@/lib/data';
import { calculateGratuity } from '@/lib/gratuityCalculator';
import {
  GratuityInput,
  GratuityBreakdown as GratuityBreakdownType,
  UAE_GRATUITY_LAW,
} from '@/types/gratuity';
import { Employee } from '@/types/employee';
import {
  Award,
  Calculator,
  Users,
  TrendingUp,
  Calendar,
  DollarSign,
  Info,
  ExternalLink,
} from 'lucide-react';
import Link from 'next/link';

function GratuityPageContent() {
  const searchParams = useSearchParams();
  const initialEmployeeId = searchParams.get('employee') || undefined;

  const [calculationResult, setCalculationResult] = useState<{
    input: GratuityInput;
    breakdown: GratuityBreakdownType;
    employee?: Employee;
  } | null>(null);

  // Calculate stats
  const eligibleEmployees = mockEmployees.filter((emp) => {
    const years = calculateYearsOfService(emp.employmentInfo.employmentStartDate);
    return years >= 1;
  });

  const totalPotentialGratuity = eligibleEmployees.reduce((sum, emp) => {
    const result = calculateGratuity({
      basicSalary: emp.compensation.basicSalary,
      employmentStartDate: emp.employmentInfo.employmentStartDate,
      employmentEndDate: new Date().toISOString().split('T')[0],
      contractType: emp.employmentInfo.contractType,
      terminationType: 'termination',
      unpaidLeaveDays: 0,
    });
    return sum + result.cappedGratuity;
  }, 0);

  const avgServiceYears =
    mockEmployees.reduce(
      (sum, emp) => sum + calculateYearsOfService(emp.employmentInfo.employmentStartDate),
      0
    ) / mockEmployees.length;

  const handleCalculate = (input: GratuityInput, employee?: Employee) => {
    const breakdown = calculateGratuity(input);
    setCalculationResult({ input, breakdown, employee });
  };

  return (
    <div className="flex min-h-screen bg-stone-50">
      <Sidebar />

      <main className="flex-1 ml-0 md:ml-64 transition-all duration-300">
        <Header
          title="Gratuity Calculator"
          subtitle="End of Service Benefits - UAE Federal Decree-Law No. 33/2021"
        />

        <div className="p-6">
          {/* Stats Row */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
            <StatsCard
              title="Eligible Employees"
              value={eligibleEmployees.length}
              icon={<Users size={24} />}
              color="teal"
            />
            <StatsCard
              title="Total Employees"
              value={mockEmployees.length}
              icon={<Award size={24} />}
              color="blue"
            />
            <StatsCard
              title="Avg. Service Years"
              value={avgServiceYears.toFixed(1)}
              icon={<Calendar size={24} />}
              color="emerald"
            />
            <StatsCard
              title="Total Gratuity Liability"
              value={formatCurrency(totalPotentialGratuity)}
              icon={<DollarSign size={24} />}
              color="amber"
            />
          </div>

          {/* Main Content */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Calculator Form */}
            <div data-tour="gratuity-form">
              <GratuityCalculatorForm
                employees={mockEmployees}
                onCalculate={handleCalculate}
                initialEmployeeId={initialEmployeeId}
              />

              {/* Quick Links to Employees */}
              <div data-tour="quick-calculate" className="mt-4 bg-white rounded-xl border border-gray-200 p-4">
                <h4 className="font-medium text-gray-900 mb-3 flex items-center gap-2">
                  <Users size={16} className="text-gray-500" />
                  Quick Calculate for Employees
                </h4>
                <div className="space-y-2">
                  {mockEmployees.slice(0, 5).map((emp) => {
                    const years = calculateYearsOfService(emp.employmentInfo.employmentStartDate);
                    const isEligible = years >= 1;
                    return (
                      <button
                        key={emp.id}
                        onClick={() =>
                          handleCalculate(
                            {
                              employeeId: emp.id,
                              basicSalary: emp.compensation.basicSalary,
                              employmentStartDate: emp.employmentInfo.employmentStartDate,
                              employmentEndDate: new Date().toISOString().split('T')[0],
                              contractType: emp.employmentInfo.contractType,
                              terminationType: 'termination',
                              unpaidLeaveDays: 0,
                            },
                            emp
                          )
                        }
                        className="w-full flex items-center justify-between p-3 bg-gray-50 hover:bg-gray-100 rounded-lg transition-colors text-left"
                      >
                        <div className="flex items-center gap-3">
                          <div className="w-8 h-8 bg-gradient-to-br from-teal-500 to-teal-600 rounded-lg flex items-center justify-center">
                            <span className="text-white text-xs font-medium">
                              {emp.personalInfo.firstName[0]}
                              {emp.personalInfo.lastName[0]}
                            </span>
                          </div>
                          <div>
                            <p className="font-medium text-gray-900 text-sm">
                              {emp.personalInfo.firstName} {emp.personalInfo.lastName}
                            </p>
                            <p className="text-xs text-gray-500">
                              {years.toFixed(1)} years •{' '}
                              {formatCurrency(emp.compensation.basicSalary)}/month
                            </p>
                          </div>
                        </div>
                        <div className="flex items-center gap-2">
                          <span
                            className={`text-xs px-2 py-0.5 rounded-full ${
                              isEligible
                                ? 'bg-emerald-100 text-emerald-700'
                                : 'bg-gray-100 text-gray-500'
                            }`}
                          >
                            {isEligible ? 'Eligible' : 'Not Eligible'}
                          </span>
                          <Calculator size={14} className="text-gray-400" />
                        </div>
                      </button>
                    );
                  })}
                </div>
                <Link
                  href="/"
                  className="mt-3 flex items-center justify-center gap-2 text-sm text-teal-600 hover:text-teal-700 font-medium"
                >
                  View All Employees
                  <ExternalLink size={14} />
                </Link>
              </div>
            </div>

            {/* Results */}
            <div>
              {calculationResult ? (
                <GratuityBreakdown
                  input={calculationResult.input}
                  breakdown={calculationResult.breakdown}
                  employee={calculationResult.employee}
                />
              ) : (
                <div className="bg-white rounded-xl border border-gray-200 p-8 text-center">
                  <div className="w-16 h-16 bg-teal-100 rounded-2xl flex items-center justify-center mx-auto mb-4">
                    <Calculator size={32} className="text-teal-600" />
                  </div>
                  <h3 className="font-display font-semibold text-gray-900 mb-2">
                    Calculate End of Service Gratuity
                  </h3>
                  <p className="text-gray-500 text-sm mb-4">
                    Select an employee or enter details manually to calculate gratuity based on UAE
                    labor law.
                  </p>
                </div>
              )}
            </div>
          </div>

          {/* UAE Law Reference */}
          <div className="mt-6 bg-gradient-to-r from-teal-50 to-amber-50 rounded-xl border border-teal-200 p-4">
            <div className="flex items-start gap-3">
              <Info size={20} className="text-teal-600 mt-0.5" />
              <div>
                <h4 className="font-display font-semibold text-teal-900 mb-2">
                  UAE Gratuity Law - Article 51, Federal Decree-Law No. 33/2021
                </h4>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 text-sm">
                  <div>
                    <span className="font-medium text-gray-700">Eligibility:</span>
                    <p className="text-gray-600">Minimum 1 year continuous service</p>
                  </div>
                  <div>
                    <span className="font-medium text-gray-700">Years 1-5:</span>
                    <p className="text-gray-600">21 days basic salary per year</p>
                  </div>
                  <div>
                    <span className="font-medium text-gray-700">Years 5+:</span>
                    <p className="text-gray-600">30 days basic salary per year</p>
                  </div>
                  <div>
                    <span className="font-medium text-gray-700">Maximum Cap:</span>
                    <p className="text-gray-600">2 years total basic salary</p>
                  </div>
                </div>
                <div className="mt-3 pt-3 border-t border-teal-200">
                  <p className="text-xs text-gray-600">
                    <strong>Unlimited Contract Resignation:</strong> &lt;1 year: 0% | 1-3 years:
                    33.33% | 3-5 years: 66.67% | 5+ years: 100% of calculated gratuity.
                    <br />
                    <strong>Limited Contract:</strong> Full gratuity regardless of
                    resignation/termination. Payment due within 14 days of contract end.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}

export default function GratuityPage() {
  return (
    <Suspense fallback={
      <div className="flex min-h-screen bg-stone-50">
        <Sidebar />
        <main className="flex-1 ml-0 md:ml-64 transition-all duration-300">
          <Header title="Gratuity Calculator" subtitle="Loading..." />
          <div className="p-6">
            <div className="animate-pulse">
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
                {[...Array(4)].map((_, i) => (
                  <div key={i} className="h-24 bg-gray-200 rounded-xl"></div>
                ))}
              </div>
            </div>
          </div>
        </main>
      </div>
    }>
      <GratuityPageContent />
    </Suspense>
  );
}
