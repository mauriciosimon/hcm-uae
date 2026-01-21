'use client';

import { useState, useEffect } from 'react';
import {
  GratuityInput,
  ContractType,
  TerminationType,
  CONTRACT_TYPE_LABELS,
  TERMINATION_TYPE_LABELS,
} from '@/types/gratuity';
import { Employee } from '@/types/employee';
import { Calculator, Calendar, DollarSign, User, Briefcase, AlertCircle } from 'lucide-react';

interface GratuityCalculatorFormProps {
  employees: Employee[];
  onCalculate: (input: GratuityInput, employee?: Employee) => void;
  initialEmployeeId?: string;
}

export default function GratuityCalculatorForm({
  employees,
  onCalculate,
  initialEmployeeId,
}: GratuityCalculatorFormProps) {
  const [mode, setMode] = useState<'employee' | 'manual'>('employee');
  const [selectedEmployeeId, setSelectedEmployeeId] = useState<string>(
    initialEmployeeId || employees[0]?.id || ''
  );
  const [formData, setFormData] = useState<GratuityInput>({
    basicSalary: 0,
    employmentStartDate: '',
    employmentEndDate: new Date().toISOString().split('T')[0],
    contractType: 'limited',
    terminationType: 'termination',
    unpaidLeaveDays: 0,
  });

  // Update form when employee is selected
  useEffect(() => {
    if (mode === 'employee' && selectedEmployeeId) {
      const employee = employees.find((e) => e.id === selectedEmployeeId);
      if (employee) {
        setFormData((prev) => ({
          ...prev,
          employeeId: employee.id,
          basicSalary: employee.compensation.basicSalary,
          employmentStartDate: employee.employmentInfo.employmentStartDate,
          contractType: employee.employmentInfo.contractType,
        }));
      }
    }
  }, [mode, selectedEmployeeId, employees]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const employee = mode === 'employee'
      ? employees.find((e) => e.id === selectedEmployeeId)
      : undefined;
    onCalculate(formData, employee);
  };

  const selectedEmployee = employees.find((e) => e.id === selectedEmployeeId);

  return (
    <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
      <div className="p-4 border-b border-gray-100 bg-gradient-to-r from-teal-50 to-white">
        <div className="flex items-center gap-2">
          <Calculator size={20} className="text-teal-600" />
          <h3 className="font-display font-semibold text-gray-900">Gratuity Calculator</h3>
        </div>
        <p className="text-sm text-gray-500 mt-1">UAE Federal Decree-Law No. 33/2021</p>
      </div>

      <form onSubmit={handleSubmit} className="p-4 space-y-4">
        {/* Mode Toggle */}
        <div className="flex items-center bg-gray-100 rounded-lg p-1">
          <button
            type="button"
            onClick={() => setMode('employee')}
            className={`flex-1 px-3 py-2 rounded-md text-sm font-medium transition-colors ${
              mode === 'employee' ? 'bg-white shadow text-teal-600' : 'text-gray-500'
            }`}
          >
            Select Employee
          </button>
          <button
            type="button"
            onClick={() => setMode('manual')}
            className={`flex-1 px-3 py-2 rounded-md text-sm font-medium transition-colors ${
              mode === 'manual' ? 'bg-white shadow text-teal-600' : 'text-gray-500'
            }`}
          >
            Manual Entry
          </button>
        </div>

        {mode === 'employee' ? (
          /* Employee Selector */
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Select Employee
            </label>
            <div className="relative">
              <User size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
              <select
                value={selectedEmployeeId}
                onChange={(e) => setSelectedEmployeeId(e.target.value)}
                className="w-full pl-10 pr-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-transparent"
              >
                {employees.map((emp) => (
                  <option key={emp.id} value={emp.id}>
                    {emp.personalInfo.firstName} {emp.personalInfo.lastName} - {emp.employmentInfo.jobTitle}
                  </option>
                ))}
              </select>
            </div>

            {/* Show selected employee info */}
            {selectedEmployee && (
              <div className="mt-3 p-3 bg-gray-50 rounded-lg">
                <div className="grid grid-cols-2 gap-2 text-sm">
                  <div>
                    <span className="text-gray-500">Basic Salary:</span>
                    <span className="ml-2 font-medium">
                      AED {selectedEmployee.compensation.basicSalary.toLocaleString()}
                    </span>
                  </div>
                  <div>
                    <span className="text-gray-500">Start Date:</span>
                    <span className="ml-2 font-medium">
                      {new Date(selectedEmployee.employmentInfo.employmentStartDate).toLocaleDateString()}
                    </span>
                  </div>
                  <div>
                    <span className="text-gray-500">Contract:</span>
                    <span className="ml-2 font-medium capitalize">
                      {selectedEmployee.employmentInfo.contractType}
                    </span>
                  </div>
                  <div>
                    <span className="text-gray-500">Department:</span>
                    <span className="ml-2 font-medium">
                      {selectedEmployee.employmentInfo.department}
                    </span>
                  </div>
                </div>
              </div>
            )}
          </div>
        ) : (
          /* Manual Entry Fields */
          <>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Basic Monthly Salary (AED)
              </label>
              <div className="relative">
                <DollarSign size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                <input
                  type="number"
                  value={formData.basicSalary || ''}
                  onChange={(e) =>
                    setFormData({ ...formData, basicSalary: parseFloat(e.target.value) || 0 })
                  }
                  placeholder="e.g., 15000"
                  className="w-full pl-10 pr-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-transparent"
                  required
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Employment Start Date
              </label>
              <div className="relative">
                <Calendar size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                <input
                  type="date"
                  value={formData.employmentStartDate}
                  onChange={(e) =>
                    setFormData({ ...formData, employmentStartDate: e.target.value })
                  }
                  className="w-full pl-10 pr-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-transparent"
                  required
                />
              </div>
            </div>
          </>
        )}

        {/* Common Fields */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Employment End Date
          </label>
          <div className="relative">
            <Calendar size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
            <input
              type="date"
              value={formData.employmentEndDate}
              onChange={(e) => setFormData({ ...formData, employmentEndDate: e.target.value })}
              className="w-full pl-10 pr-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-transparent"
              required
            />
          </div>
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Contract Type
            </label>
            <div className="relative">
              <Briefcase size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
              <select
                value={formData.contractType}
                onChange={(e) =>
                  setFormData({ ...formData, contractType: e.target.value as ContractType })
                }
                className="w-full pl-10 pr-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-transparent"
              >
                {Object.entries(CONTRACT_TYPE_LABELS).map(([value, label]) => (
                  <option key={value} value={value}>
                    {label}
                  </option>
                ))}
              </select>
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Termination Type
            </label>
            <select
              value={formData.terminationType}
              onChange={(e) =>
                setFormData({ ...formData, terminationType: e.target.value as TerminationType })
              }
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-transparent"
            >
              {Object.entries(TERMINATION_TYPE_LABELS).map(([value, label]) => (
                <option key={value} value={value}>
                  {label}
                </option>
              ))}
            </select>
          </div>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Unpaid Leave Days (to exclude)
          </label>
          <input
            type="number"
            value={formData.unpaidLeaveDays || ''}
            onChange={(e) =>
              setFormData({ ...formData, unpaidLeaveDays: parseInt(e.target.value) || 0 })
            }
            placeholder="0"
            min="0"
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-transparent"
          />
          <p className="text-xs text-gray-500 mt-1">
            Days absent without pay are excluded from gratuity calculation
          </p>
        </div>

        {/* Resignation Warning for Unlimited Contracts */}
        {formData.contractType === 'unlimited' && formData.terminationType === 'resignation' && (
          <div className="p-3 bg-amber-50 border border-amber-200 rounded-lg">
            <div className="flex items-start gap-2">
              <AlertCircle size={16} className="text-amber-600 mt-0.5" />
              <div className="text-sm text-amber-800">
                <p className="font-medium">Unlimited Contract Resignation Rules:</p>
                <ul className="mt-1 space-y-0.5 text-xs">
                  <li>• Less than 1 year: No gratuity</li>
                  <li>• 1-3 years: 1/3 of calculated amount</li>
                  <li>• 3-5 years: 2/3 of calculated amount</li>
                  <li>• 5+ years: Full amount</li>
                </ul>
              </div>
            </div>
          </div>
        )}

        <button
          type="submit"
          className="w-full btn btn-primary flex items-center justify-center gap-2"
        >
          <Calculator size={18} />
          Calculate Gratuity
        </button>
      </form>
    </div>
  );
}
