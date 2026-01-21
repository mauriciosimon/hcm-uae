'use client';

import { useState } from 'react';
import { X, Plus, CreditCard, Wallet, Trash2 } from 'lucide-react';
import { LoanAdvance } from '@/types/payroll';
import { Employee } from '@/types/employee';
import { formatCurrency, getMonthName } from '@/lib/payrollCalculator';

interface LoanAdvanceManagerProps {
  loansAdvances: LoanAdvance[];
  employees: Employee[];
  onAdd: (item: Omit<LoanAdvance, 'id' | 'createdAt'>) => void;
  onDelete: (id: string) => void;
  onClose: () => void;
}

export default function LoanAdvanceManager({
  loansAdvances,
  employees,
  onAdd,
  onDelete,
  onClose,
}: LoanAdvanceManagerProps) {
  const [showAddForm, setShowAddForm] = useState(false);
  const [formData, setFormData] = useState({
    employeeId: employees[0]?.id || '',
    type: 'advance' as 'loan' | 'advance',
    totalAmount: 0,
    monthlyInstallment: 0,
    description: '',
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    const startDate = new Date();
    const totalMonths = Math.ceil(formData.totalAmount / formData.monthlyInstallment);
    const endDate = new Date();
    endDate.setMonth(endDate.getMonth() + totalMonths - 1);

    onAdd({
      employeeId: formData.employeeId,
      type: formData.type,
      totalAmount: formData.totalAmount,
      remainingAmount: formData.totalAmount,
      monthlyInstallment: formData.monthlyInstallment,
      startMonth: startDate.getMonth() + 1,
      startYear: startDate.getFullYear(),
      endMonth: endDate.getMonth() + 1,
      endYear: endDate.getFullYear(),
      description: formData.description,
      isActive: true,
    });

    setShowAddForm(false);
    setFormData({
      employeeId: employees[0]?.id || '',
      type: 'advance',
      totalAmount: 0,
      monthlyInstallment: 0,
      description: '',
    });
  };

  const getEmployee = (id: string) => employees.find((e) => e.id === id);

  const activeItems = loansAdvances.filter((item) => item.isActive);
  const loans = activeItems.filter((item) => item.type === 'loan');
  const advances = activeItems.filter((item) => item.type === 'advance');

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-2xl shadow-xl w-full max-w-3xl animate-scale-in max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b border-gray-100 sticky top-0 bg-white z-10">
          <div>
            <h2 className="font-display font-semibold text-lg text-gray-900">
              Loans & Advances
            </h2>
            <p className="text-sm text-gray-500">
              Manage employee loans and salary advances
            </p>
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={() => setShowAddForm(true)}
              className="btn btn-primary flex items-center gap-2"
            >
              <Plus size={16} />
              Add New
            </button>
            <button
              onClick={onClose}
              className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
            >
              <X size={20} className="text-gray-400" />
            </button>
          </div>
        </div>

        <div className="p-4">
          {/* Summary Cards */}
          <div className="grid grid-cols-2 gap-4 mb-6">
            <div className="bg-purple-50 rounded-xl p-4">
              <div className="flex items-center gap-3 mb-2">
                <div className="w-10 h-10 bg-purple-100 rounded-lg flex items-center justify-center">
                  <CreditCard size={20} className="text-purple-600" />
                </div>
                <div>
                  <p className="text-sm text-purple-600">Active Loans</p>
                  <p className="text-xl font-bold text-purple-900">{loans.length}</p>
                </div>
              </div>
              <p className="text-sm text-purple-700">
                Total Outstanding:{' '}
                {formatCurrency(loans.reduce((sum, l) => sum + l.remainingAmount, 0))}
              </p>
            </div>
            <div className="bg-blue-50 rounded-xl p-4">
              <div className="flex items-center gap-3 mb-2">
                <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center">
                  <Wallet size={20} className="text-blue-600" />
                </div>
                <div>
                  <p className="text-sm text-blue-600">Active Advances</p>
                  <p className="text-xl font-bold text-blue-900">{advances.length}</p>
                </div>
              </div>
              <p className="text-sm text-blue-700">
                Total Outstanding:{' '}
                {formatCurrency(advances.reduce((sum, a) => sum + a.remainingAmount, 0))}
              </p>
            </div>
          </div>

          {/* Add Form */}
          {showAddForm && (
            <div className="mb-6 p-4 bg-gray-50 rounded-xl border border-gray-200">
              <h3 className="font-medium text-gray-900 mb-4">Add New Loan/Advance</h3>
              <form onSubmit={handleSubmit} className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Employee
                    </label>
                    <select
                      value={formData.employeeId}
                      onChange={(e) =>
                        setFormData({ ...formData, employeeId: e.target.value })
                      }
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-teal-500"
                    >
                      {employees.map((emp) => (
                        <option key={emp.id} value={emp.id}>
                          {emp.personalInfo.firstName} {emp.personalInfo.lastName}
                        </option>
                      ))}
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Type
                    </label>
                    <select
                      value={formData.type}
                      onChange={(e) =>
                        setFormData({
                          ...formData,
                          type: e.target.value as 'loan' | 'advance',
                        })
                      }
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-teal-500"
                    >
                      <option value="advance">Salary Advance</option>
                      <option value="loan">Loan</option>
                    </select>
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Total Amount (AED)
                    </label>
                    <input
                      type="number"
                      value={formData.totalAmount || ''}
                      onChange={(e) =>
                        setFormData({
                          ...formData,
                          totalAmount: parseFloat(e.target.value) || 0,
                        })
                      }
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-teal-500"
                      required
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Monthly Installment (AED)
                    </label>
                    <input
                      type="number"
                      value={formData.monthlyInstallment || ''}
                      onChange={(e) =>
                        setFormData({
                          ...formData,
                          monthlyInstallment: parseFloat(e.target.value) || 0,
                        })
                      }
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-teal-500"
                      required
                    />
                  </div>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Description
                  </label>
                  <input
                    type="text"
                    value={formData.description}
                    onChange={(e) =>
                      setFormData({ ...formData, description: e.target.value })
                    }
                    placeholder="e.g., Personal loan, Emergency advance"
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-teal-500"
                  />
                </div>
                {formData.totalAmount > 0 && formData.monthlyInstallment > 0 && (
                  <div className="p-3 bg-teal-50 rounded-lg text-sm text-teal-700">
                    Duration: ~
                    {Math.ceil(formData.totalAmount / formData.monthlyInstallment)} months
                  </div>
                )}
                <div className="flex gap-3">
                  <button
                    type="button"
                    onClick={() => setShowAddForm(false)}
                    className="flex-1 px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="flex-1 px-4 py-2 bg-teal-600 text-white rounded-lg hover:bg-teal-700"
                  >
                    Add
                  </button>
                </div>
              </form>
            </div>
          )}

          {/* List */}
          {activeItems.length === 0 ? (
            <div className="text-center py-8">
              <Wallet size={48} className="mx-auto text-gray-300 mb-4" />
              <p className="text-gray-500">No active loans or advances</p>
            </div>
          ) : (
            <div className="space-y-3">
              {activeItems.map((item) => {
                const employee = getEmployee(item.employeeId);
                const progress =
                  ((item.totalAmount - item.remainingAmount) / item.totalAmount) * 100;

                return (
                  <div
                    key={item.id}
                    className="bg-white border border-gray-200 rounded-xl p-4 hover:shadow-md transition-shadow"
                  >
                    <div className="flex items-start justify-between mb-3">
                      <div className="flex items-center gap-3">
                        <div
                          className={`w-10 h-10 rounded-lg flex items-center justify-center ${
                            item.type === 'loan'
                              ? 'bg-purple-100'
                              : 'bg-blue-100'
                          }`}
                        >
                          {item.type === 'loan' ? (
                            <CreditCard
                              size={20}
                              className="text-purple-600"
                            />
                          ) : (
                            <Wallet size={20} className="text-blue-600" />
                          )}
                        </div>
                        <div>
                          <p className="font-medium text-gray-900">
                            {employee?.personalInfo.firstName}{' '}
                            {employee?.personalInfo.lastName}
                          </p>
                          <p className="text-sm text-gray-500">
                            {item.type === 'loan' ? 'Loan' : 'Salary Advance'} •{' '}
                            {item.description}
                          </p>
                        </div>
                      </div>
                      <button
                        onClick={() => onDelete(item.id)}
                        className="p-2 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                      >
                        <Trash2 size={16} />
                      </button>
                    </div>

                    <div className="grid grid-cols-4 gap-4 text-sm mb-3">
                      <div>
                        <p className="text-gray-500">Total</p>
                        <p className="font-medium">{formatCurrency(item.totalAmount)}</p>
                      </div>
                      <div>
                        <p className="text-gray-500">Remaining</p>
                        <p className="font-medium text-red-600">
                          {formatCurrency(item.remainingAmount)}
                        </p>
                      </div>
                      <div>
                        <p className="text-gray-500">Monthly</p>
                        <p className="font-medium">
                          {formatCurrency(item.monthlyInstallment)}
                        </p>
                      </div>
                      <div>
                        <p className="text-gray-500">Period</p>
                        <p className="font-medium">
                          {getMonthName(item.startMonth - 1).slice(0, 3)} {item.startYear}
                          {item.endMonth &&
                            ` - ${getMonthName(item.endMonth - 1).slice(0, 3)} ${item.endYear}`}
                        </p>
                      </div>
                    </div>

                    {/* Progress Bar */}
                    <div className="h-2 bg-gray-100 rounded-full overflow-hidden">
                      <div
                        className={`h-full transition-all ${
                          item.type === 'loan' ? 'bg-purple-500' : 'bg-blue-500'
                        }`}
                        style={{ width: `${progress}%` }}
                      />
                    </div>
                    <p className="text-xs text-gray-500 mt-1">
                      {progress.toFixed(0)}% repaid
                    </p>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
