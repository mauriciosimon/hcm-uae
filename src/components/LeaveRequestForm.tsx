'use client';

import { useState } from 'react';
import { X, Calendar, FileText, AlertCircle } from 'lucide-react';
import { LeaveType, LeaveBalance, LEAVE_TYPE_LABELS } from '@/types/leave';
import { calculateBusinessDays } from '@/lib/leaveData';

interface LeaveRequestFormProps {
  onClose: () => void;
  onSubmit: (data: LeaveRequestFormData) => void;
  balance: LeaveBalance;
  gender: 'male' | 'female';
}

export interface LeaveRequestFormData {
  leaveType: LeaveType;
  startDate: string;
  endDate: string;
  reason: string;
}

export default function LeaveRequestForm({
  onClose,
  onSubmit,
  balance,
  gender,
}: LeaveRequestFormProps) {
  const [formData, setFormData] = useState<LeaveRequestFormData>({
    leaveType: 'annual',
    startDate: '',
    endDate: '',
    reason: '',
  });
  const [errors, setErrors] = useState<Partial<Record<keyof LeaveRequestFormData, string>>>({});

  const availableLeaveTypes: LeaveType[] = [
    'annual',
    'sick',
    ...(gender === 'female' ? ['maternity' as LeaveType] : []),
    ...(gender === 'male' ? ['paternity' as LeaveType] : []),
    'unpaid',
  ];

  const getAvailableDays = (type: LeaveType): number => {
    switch (type) {
      case 'annual':
        return balance.annual.available;
      case 'sick':
        return (
          balance.sick.fullPay.available +
          balance.sick.halfPay.available +
          balance.sick.unpaid.available
        );
      case 'maternity':
        return balance.maternity.fullPay.available + balance.maternity.halfPay.available;
      case 'paternity':
        return balance.paternity.available;
      case 'unpaid':
        return 999; // Unlimited unpaid leave
      default:
        return 0;
    }
  };

  const calculateDays = (): number => {
    if (!formData.startDate || !formData.endDate) return 0;
    return calculateBusinessDays(formData.startDate, formData.endDate);
  };

  const requestedDays = calculateDays();
  const availableDays = getAvailableDays(formData.leaveType);
  const exceedsBalance = formData.leaveType !== 'unpaid' && requestedDays > availableDays;

  const validate = (): boolean => {
    const newErrors: Partial<Record<keyof LeaveRequestFormData, string>> = {};

    if (!formData.startDate) {
      newErrors.startDate = 'Start date is required';
    }
    if (!formData.endDate) {
      newErrors.endDate = 'End date is required';
    }
    if (formData.startDate && formData.endDate && formData.startDate > formData.endDate) {
      newErrors.endDate = 'End date must be after start date';
    }
    if (!formData.reason.trim()) {
      newErrors.reason = 'Reason is required';
    }
    if (exceedsBalance) {
      newErrors.startDate = `Insufficient leave balance. Available: ${availableDays} days`;
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (validate()) {
      onSubmit(formData);
    }
  };

  const today = new Date().toISOString().split('T')[0];

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-2xl shadow-xl w-full max-w-lg animate-scale-in">
        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b border-gray-100">
          <div>
            <h2 className="font-display font-semibold text-lg text-gray-900">
              Request Leave
            </h2>
            <p className="text-sm text-gray-500">Submit a new leave request</p>
          </div>
          <button
            onClick={onClose}
            className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
          >
            <X size={20} className="text-gray-400" />
          </button>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="p-4 space-y-4">
          {/* Leave Type */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Leave Type
            </label>
            <select
              value={formData.leaveType}
              onChange={(e) =>
                setFormData({ ...formData, leaveType: e.target.value as LeaveType })
              }
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-transparent"
            >
              {availableLeaveTypes.map((type) => (
                <option key={type} value={type}>
                  {LEAVE_TYPE_LABELS[type]} ({getAvailableDays(type)} days available)
                </option>
              ))}
            </select>
          </div>

          {/* Date Range */}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Start Date
              </label>
              <div className="relative">
                <Calendar
                  size={16}
                  className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400"
                />
                <input
                  type="date"
                  value={formData.startDate}
                  onChange={(e) => setFormData({ ...formData, startDate: e.target.value })}
                  min={today}
                  className={`w-full pl-10 pr-3 py-2 border rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-transparent ${
                    errors.startDate ? 'border-red-300' : 'border-gray-300'
                  }`}
                />
              </div>
              {errors.startDate && (
                <p className="text-xs text-red-500 mt-1">{errors.startDate}</p>
              )}
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                End Date
              </label>
              <div className="relative">
                <Calendar
                  size={16}
                  className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400"
                />
                <input
                  type="date"
                  value={formData.endDate}
                  onChange={(e) => setFormData({ ...formData, endDate: e.target.value })}
                  min={formData.startDate || today}
                  className={`w-full pl-10 pr-3 py-2 border rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-transparent ${
                    errors.endDate ? 'border-red-300' : 'border-gray-300'
                  }`}
                />
              </div>
              {errors.endDate && (
                <p className="text-xs text-red-500 mt-1">{errors.endDate}</p>
              )}
            </div>
          </div>

          {/* Days Summary */}
          {requestedDays > 0 && (
            <div
              className={`p-3 rounded-lg ${
                exceedsBalance ? 'bg-red-50 border border-red-200' : 'bg-teal-50 border border-teal-200'
              }`}
            >
              <div className="flex items-center gap-2">
                {exceedsBalance ? (
                  <AlertCircle size={16} className="text-red-500" />
                ) : (
                  <Calendar size={16} className="text-teal-600" />
                )}
                <span
                  className={`text-sm font-medium ${
                    exceedsBalance ? 'text-red-700' : 'text-teal-700'
                  }`}
                >
                  {requestedDays} working day{requestedDays !== 1 ? 's' : ''} requested
                </span>
              </div>
              {exceedsBalance && (
                <p className="text-xs text-red-600 mt-1">
                  Exceeds available balance of {availableDays} days
                </p>
              )}
              <p className="text-xs text-gray-500 mt-1">
                Excludes UAE weekends (Friday & Saturday)
              </p>
            </div>
          )}

          {/* Reason */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Reason
            </label>
            <div className="relative">
              <FileText
                size={16}
                className="absolute left-3 top-3 text-gray-400"
              />
              <textarea
                value={formData.reason}
                onChange={(e) => setFormData({ ...formData, reason: e.target.value })}
                placeholder="Please provide a reason for your leave request..."
                rows={3}
                className={`w-full pl-10 pr-3 py-2 border rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-transparent resize-none ${
                  errors.reason ? 'border-red-300' : 'border-gray-300'
                }`}
              />
            </div>
            {errors.reason && (
              <p className="text-xs text-red-500 mt-1">{errors.reason}</p>
            )}
          </div>

          {/* Actions */}
          <div className="flex gap-3 pt-2">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors font-medium"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={exceedsBalance}
              className="flex-1 px-4 py-2 bg-teal-600 text-white rounded-lg hover:bg-teal-700 transition-colors font-medium disabled:opacity-50 disabled:cursor-not-allowed"
            >
              Submit Request
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
