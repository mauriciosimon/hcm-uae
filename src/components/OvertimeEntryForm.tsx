'use client';

import { useState, useEffect } from 'react';
import { X, Clock, Calendar, User, AlertCircle, Moon, Sun, Star } from 'lucide-react';
import { Employee } from '@/types/employee';
import {
  OvertimeType,
  OVERTIME_TYPE_LABELS,
  UAE_PUBLIC_HOLIDAYS_2025,
} from '@/types/overtime';
import {
  detectOvertimeType,
  calculateHours,
  calculateOvertimeAmount,
  getOvertimeRate,
  isPublicHoliday,
  isFriday,
  isNightShift,
  formatCurrency,
  getHolidayName,
} from '@/lib/overtimeCalculator';

interface OvertimeEntryFormProps {
  employees: Employee[];
  onClose: () => void;
  onSubmit: (data: OvertimeFormData) => void;
  isRamadan: boolean;
}

export interface OvertimeFormData {
  employeeId: string;
  date: string;
  startTime: string;
  endTime: string;
  overtimeType: OvertimeType;
  notes: string;
}

export default function OvertimeEntryForm({
  employees,
  onClose,
  onSubmit,
  isRamadan,
}: OvertimeEntryFormProps) {
  const [formData, setFormData] = useState<OvertimeFormData>({
    employeeId: employees[0]?.id || '',
    date: new Date().toISOString().split('T')[0],
    startTime: '18:00',
    endTime: '20:00',
    overtimeType: 'regular',
    notes: '',
  });

  const [autoDetectedType, setAutoDetectedType] = useState<OvertimeType>('regular');
  const [useAutoDetect, setUseAutoDetect] = useState(true);

  const selectedEmployee = employees.find((e) => e.id === formData.employeeId);

  // Auto-detect overtime type when date/time changes
  useEffect(() => {
    const detected = detectOvertimeType(formData.date, formData.startTime, formData.endTime);
    setAutoDetectedType(detected);
    if (useAutoDetect) {
      setFormData((prev) => ({ ...prev, overtimeType: detected }));
    }
  }, [formData.date, formData.startTime, formData.endTime, useAutoDetect]);

  const hours = calculateHours(formData.startTime, formData.endTime);
  const basicSalary = selectedEmployee?.compensation.basicSalary || 0;
  const amount = calculateOvertimeAmount(basicSalary, hours, formData.overtimeType);
  const rate = getOvertimeRate(formData.overtimeType);

  const holidayName = getHolidayName(formData.date);
  const isOnFriday = isFriday(formData.date);
  const isNight = isNightShift(formData.startTime, formData.endTime);

  const maxOvertimeHours = isRamadan ? 2 : 2; // Max 2 hours per day
  const exceedsLimit = hours > maxOvertimeHours;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSubmit(formData);
  };

  const getTypeIcon = (type: OvertimeType) => {
    switch (type) {
      case 'night':
        return <Moon size={14} />;
      case 'friday':
        return <Sun size={14} />;
      case 'holiday':
        return <Star size={14} />;
      default:
        return <Clock size={14} />;
    }
  };

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-2xl shadow-xl w-full max-w-lg animate-scale-in max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b border-gray-100 sticky top-0 bg-white">
          <div>
            <h2 className="font-display font-semibold text-lg text-gray-900">
              Log Overtime
            </h2>
            <p className="text-sm text-gray-500">
              {isRamadan ? 'Ramadan Hours (6h/day base)' : 'Standard Hours (8h/day base)'}
            </p>
          </div>
          <button
            onClick={onClose}
            className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
          >
            <X size={20} className="text-gray-400" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-4 space-y-4">
          {/* Employee Selection */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Employee
            </label>
            <div className="relative">
              <User size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
              <select
                value={formData.employeeId}
                onChange={(e) => setFormData({ ...formData, employeeId: e.target.value })}
                className="w-full pl-10 pr-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-transparent"
              >
                {employees.map((emp) => (
                  <option key={emp.id} value={emp.id}>
                    {emp.personalInfo.firstName} {emp.personalInfo.lastName} - AED{' '}
                    {emp.compensation.basicSalary.toLocaleString()}/month
                  </option>
                ))}
              </select>
            </div>
          </div>

          {/* Date */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Date
            </label>
            <div className="relative">
              <Calendar size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
              <input
                type="date"
                value={formData.date}
                onChange={(e) => setFormData({ ...formData, date: e.target.value })}
                className="w-full pl-10 pr-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-transparent"
              />
            </div>
            {/* Date indicators */}
            <div className="flex flex-wrap gap-2 mt-2">
              {holidayName && (
                <span className="inline-flex items-center gap-1 px-2 py-1 bg-rose-100 text-rose-700 rounded-full text-xs">
                  <Star size={12} />
                  {holidayName}
                </span>
              )}
              {isOnFriday && !holidayName && (
                <span className="inline-flex items-center gap-1 px-2 py-1 bg-amber-100 text-amber-700 rounded-full text-xs">
                  <Sun size={12} />
                  Friday (Rest Day)
                </span>
              )}
            </div>
          </div>

          {/* Time Range */}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Start Time
              </label>
              <div className="relative">
                <Clock size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                <input
                  type="time"
                  value={formData.startTime}
                  onChange={(e) => setFormData({ ...formData, startTime: e.target.value })}
                  className="w-full pl-10 pr-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-transparent"
                />
              </div>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                End Time
              </label>
              <div className="relative">
                <Clock size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                <input
                  type="time"
                  value={formData.endTime}
                  onChange={(e) => setFormData({ ...formData, endTime: e.target.value })}
                  className="w-full pl-10 pr-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-transparent"
                />
              </div>
            </div>
          </div>

          {/* Night shift indicator */}
          {isNight && (
            <div className="flex items-center gap-2 px-3 py-2 bg-purple-50 border border-purple-200 rounded-lg">
              <Moon size={16} className="text-purple-600" />
              <span className="text-sm text-purple-700">
                Night shift hours detected (10PM - 4AM)
              </span>
            </div>
          )}

          {/* Overtime Type */}
          <div>
            <div className="flex items-center justify-between mb-1">
              <label className="block text-sm font-medium text-gray-700">
                Overtime Type
              </label>
              <label className="flex items-center gap-2 text-xs text-gray-500">
                <input
                  type="checkbox"
                  checked={useAutoDetect}
                  onChange={(e) => setUseAutoDetect(e.target.checked)}
                  className="rounded border-gray-300 text-teal-600 focus:ring-teal-500"
                />
                Auto-detect
              </label>
            </div>
            <div className="grid grid-cols-2 gap-2">
              {(Object.keys(OVERTIME_TYPE_LABELS) as OvertimeType[]).map((type) => (
                <button
                  key={type}
                  type="button"
                  onClick={() => {
                    setUseAutoDetect(false);
                    setFormData({ ...formData, overtimeType: type });
                  }}
                  className={`flex items-center gap-2 px-3 py-2 rounded-lg border text-sm transition-colors ${
                    formData.overtimeType === type
                      ? 'border-teal-500 bg-teal-50 text-teal-700'
                      : 'border-gray-200 hover:border-gray-300'
                  }`}
                >
                  {getTypeIcon(type)}
                  <span className="truncate">{OVERTIME_TYPE_LABELS[type].split(' (')[0]}</span>
                  {autoDetectedType === type && useAutoDetect && (
                    <span className="ml-auto text-xs text-teal-500">●</span>
                  )}
                </button>
              ))}
            </div>
          </div>

          {/* Notes */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Notes (Optional)
            </label>
            <textarea
              value={formData.notes}
              onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
              placeholder="Reason for overtime..."
              rows={2}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-transparent resize-none"
            />
          </div>

          {/* Calculation Summary */}
          <div className="bg-gray-50 rounded-xl p-4 space-y-2">
            <div className="flex justify-between text-sm">
              <span className="text-gray-600">Hours</span>
              <span className="font-medium">{hours.toFixed(1)} hours</span>
            </div>
            <div className="flex justify-between text-sm">
              <span className="text-gray-600">Rate</span>
              <span className="font-medium">{rate}× (Basic + {((rate - 1) * 100).toFixed(0)}%)</span>
            </div>
            <div className="flex justify-between text-sm pt-2 border-t border-gray-200">
              <span className="text-gray-900 font-medium">Overtime Amount</span>
              <span className="font-bold text-teal-600">{formatCurrency(amount)}</span>
            </div>
          </div>

          {/* Warning if exceeds limit */}
          {exceedsLimit && (
            <div className="flex items-start gap-2 p-3 bg-amber-50 border border-amber-200 rounded-lg">
              <AlertCircle size={16} className="text-amber-600 mt-0.5" />
              <div className="text-sm text-amber-700">
                <p className="font-medium">Exceeds daily limit</p>
                <p className="text-xs">
                  UAE law limits overtime to {maxOvertimeHours} hours per day. Current: {hours.toFixed(1)} hours.
                </p>
              </div>
            </div>
          )}

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
              className="flex-1 px-4 py-2 bg-teal-600 text-white rounded-lg hover:bg-teal-700 transition-colors font-medium"
            >
              Log Overtime
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
