'use client';

import { OvertimeSummary, OVERTIME_TYPE_COLORS } from '@/types/overtime';
import { formatCurrency, getMonthName } from '@/lib/overtimeCalculator';
import { Clock, Moon, Sun, Star, TrendingUp } from 'lucide-react';

interface OvertimeSummaryCardProps {
  summary: OvertimeSummary;
  employeeName: string;
}

export default function OvertimeSummaryCard({
  summary,
  employeeName,
}: OvertimeSummaryCardProps) {
  const items = [
    {
      label: 'Regular',
      hours: summary.regularHours,
      amount: summary.regularAmount,
      color: 'bg-blue-500',
      icon: <Clock size={14} />,
    },
    {
      label: 'Night',
      hours: summary.nightHours,
      amount: summary.nightAmount,
      color: 'bg-purple-500',
      icon: <Moon size={14} />,
    },
    {
      label: 'Friday',
      hours: summary.fridayHours,
      amount: summary.fridayAmount,
      color: 'bg-amber-500',
      icon: <Sun size={14} />,
    },
    {
      label: 'Holiday',
      hours: summary.holidayHours,
      amount: summary.holidayAmount,
      color: 'bg-rose-500',
      icon: <Star size={14} />,
    },
  ];

  const maxHours = Math.max(...items.map((i) => i.hours), 1);

  return (
    <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
      <div className="p-4 border-b border-gray-100 bg-gradient-to-r from-teal-50 to-white">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="font-display font-semibold text-gray-900">{employeeName}</h3>
            <p className="text-sm text-gray-500">
              {getMonthName(summary.month)} {summary.year}
            </p>
          </div>
          <div className="text-right">
            <p className="text-2xl font-bold text-teal-600">
              {formatCurrency(summary.totalAmount)}
            </p>
            <p className="text-xs text-gray-500">{summary.totalHours.toFixed(1)} total hours</p>
          </div>
        </div>
      </div>

      <div className="p-4 space-y-3">
        {items.map((item) => (
          <div key={item.label} className="space-y-1">
            <div className="flex items-center justify-between text-sm">
              <div className="flex items-center gap-2 text-gray-600">
                <span className={`w-5 h-5 ${item.color} rounded flex items-center justify-center text-white`}>
                  {item.icon}
                </span>
                {item.label}
              </div>
              <div className="flex items-center gap-4">
                <span className="text-gray-500">{item.hours.toFixed(1)}h</span>
                <span className="font-medium text-gray-900 w-24 text-right">
                  {formatCurrency(item.amount)}
                </span>
              </div>
            </div>
            <div className="h-1.5 bg-gray-100 rounded-full overflow-hidden">
              <div
                className={`h-full ${item.color} transition-all duration-500`}
                style={{ width: `${(item.hours / maxHours) * 100}%` }}
              />
            </div>
          </div>
        ))}
      </div>

      <div className="px-4 py-3 bg-gray-50 border-t border-gray-100">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2 text-sm text-gray-600">
            <TrendingUp size={14} />
            Total Overtime
          </div>
          <div className="flex items-center gap-4">
            <span className="text-gray-700 font-medium">{summary.totalHours.toFixed(1)} hours</span>
            <span className="font-bold text-teal-600">{formatCurrency(summary.totalAmount)}</span>
          </div>
        </div>
      </div>
    </div>
  );
}
