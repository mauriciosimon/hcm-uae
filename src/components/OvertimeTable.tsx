'use client';

import { OvertimeEntry, OVERTIME_TYPE_LABELS, OVERTIME_TYPE_COLORS } from '@/types/overtime';
import { Employee } from '@/types/employee';
import {
  formatDate,
  formatTime,
  formatCurrency,
  getHolidayName,
} from '@/lib/overtimeCalculator';
import { Clock, Moon, Sun, Star, Trash2, Edit2 } from 'lucide-react';

interface OvertimeTableProps {
  entries: OvertimeEntry[];
  employees: Employee[];
  onDelete?: (id: string) => void;
  onEdit?: (entry: OvertimeEntry) => void;
  showEmployee?: boolean;
}

const typeIcons = {
  regular: <Clock size={14} />,
  night: <Moon size={14} />,
  friday: <Sun size={14} />,
  holiday: <Star size={14} />,
};

const typeBgColors = {
  regular: 'bg-blue-100 text-blue-700',
  night: 'bg-purple-100 text-purple-700',
  friday: 'bg-amber-100 text-amber-700',
  holiday: 'bg-rose-100 text-rose-700',
};

export default function OvertimeTable({
  entries,
  employees,
  onDelete,
  onEdit,
  showEmployee = true,
}: OvertimeTableProps) {
  const getEmployee = (employeeId: string) =>
    employees.find((e) => e.id === employeeId);

  if (entries.length === 0) {
    return (
      <div className="bg-white rounded-xl border border-gray-200 p-8 text-center">
        <Clock size={48} className="mx-auto text-gray-300 mb-4" />
        <h4 className="font-medium text-gray-900 mb-2">No overtime entries</h4>
        <p className="text-sm text-gray-500">
          Log overtime hours to see them here.
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
              {showEmployee && (
                <th className="text-left px-4 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wide">
                  Employee
                </th>
              )}
              <th className="text-left px-4 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wide">
                Date
              </th>
              <th className="text-left px-4 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wide">
                Time
              </th>
              <th className="text-left px-4 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wide">
                Type
              </th>
              <th className="text-right px-4 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wide">
                Hours
              </th>
              <th className="text-right px-4 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wide">
                Rate
              </th>
              <th className="text-right px-4 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wide">
                Amount
              </th>
              {(onDelete || onEdit) && (
                <th className="text-right px-4 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wide">
                  Actions
                </th>
              )}
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100">
            {entries.map((entry) => {
              const employee = getEmployee(entry.employeeId);
              const holidayName = getHolidayName(entry.date);

              return (
                <tr key={entry.id} className="hover:bg-gray-50">
                  {showEmployee && (
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
                            {employee?.personalInfo.firstName} {employee?.personalInfo.lastName}
                          </p>
                          <p className="text-xs text-gray-500">
                            {employee?.employmentInfo.department}
                          </p>
                        </div>
                      </div>
                    </td>
                  )}
                  <td className="px-4 py-3">
                    <div>
                      <p className="text-sm text-gray-900">{formatDate(entry.date)}</p>
                      {holidayName && (
                        <p className="text-xs text-rose-600">{holidayName}</p>
                      )}
                    </div>
                  </td>
                  <td className="px-4 py-3 text-sm text-gray-600">
                    {formatTime(entry.startTime)} - {formatTime(entry.endTime)}
                  </td>
                  <td className="px-4 py-3">
                    <span
                      className={`inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs font-medium ${
                        typeBgColors[entry.overtimeType]
                      }`}
                    >
                      {typeIcons[entry.overtimeType]}
                      {entry.overtimeType.charAt(0).toUpperCase() + entry.overtimeType.slice(1)}
                    </span>
                  </td>
                  <td className="px-4 py-3 text-sm text-gray-900 text-right font-medium">
                    {entry.hours.toFixed(1)}h
                  </td>
                  <td className="px-4 py-3 text-sm text-gray-600 text-right">
                    {entry.rate}×
                  </td>
                  <td className="px-4 py-3 text-right">
                    <span className="font-semibold text-gray-900">
                      {formatCurrency(entry.amount)}
                    </span>
                  </td>
                  {(onDelete || onEdit) && (
                    <td className="px-4 py-3 text-right">
                      <div className="flex items-center justify-end gap-1">
                        {onEdit && (
                          <button
                            onClick={() => onEdit(entry)}
                            className="p-1.5 text-gray-400 hover:text-teal-600 hover:bg-teal-50 rounded transition-colors"
                          >
                            <Edit2 size={14} />
                          </button>
                        )}
                        {onDelete && (
                          <button
                            onClick={() => onDelete(entry.id)}
                            className="p-1.5 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded transition-colors"
                          >
                            <Trash2 size={14} />
                          </button>
                        )}
                      </div>
                    </td>
                  )}
                </tr>
              );
            })}
          </tbody>
          {/* Totals Row */}
          <tfoot className="bg-teal-50 border-t-2 border-teal-200">
            <tr>
              {showEmployee && <td className="px-4 py-3" />}
              <td colSpan={3} className="px-4 py-3 text-sm font-semibold text-teal-900">
                Total
              </td>
              <td className="px-4 py-3 text-sm font-semibold text-teal-900 text-right">
                {entries.reduce((sum, e) => sum + e.hours, 0).toFixed(1)}h
              </td>
              <td className="px-4 py-3" />
              <td className="px-4 py-3 text-right">
                <span className="font-bold text-teal-700">
                  {formatCurrency(entries.reduce((sum, e) => sum + e.amount, 0))}
                </span>
              </td>
              {(onDelete || onEdit) && <td className="px-4 py-3" />}
            </tr>
          </tfoot>
        </table>
      </div>
    </div>
  );
}
