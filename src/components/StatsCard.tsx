'use client';

import { ReactNode } from 'react';
import { TrendingUp, TrendingDown } from 'lucide-react';

interface StatsCardProps {
  title: string;
  value: string | number;
  change?: {
    value: number;
    type: 'increase' | 'decrease';
  };
  icon: ReactNode;
  color: 'teal' | 'amber' | 'emerald' | 'red' | 'blue' | 'purple';
  subtitle?: string;
}

const colorClasses = {
  teal: {
    bg: 'bg-teal-50',
    icon: 'bg-teal-100 text-teal-600',
    text: 'text-teal-600',
  },
  amber: {
    bg: 'bg-amber-50',
    icon: 'bg-amber-100 text-amber-600',
    text: 'text-amber-600',
  },
  emerald: {
    bg: 'bg-emerald-50',
    icon: 'bg-emerald-100 text-emerald-600',
    text: 'text-emerald-600',
  },
  red: {
    bg: 'bg-red-50',
    icon: 'bg-red-100 text-red-600',
    text: 'text-red-600',
  },
  blue: {
    bg: 'bg-blue-50',
    icon: 'bg-blue-100 text-blue-600',
    text: 'text-blue-600',
  },
  purple: {
    bg: 'bg-purple-50',
    icon: 'bg-purple-100 text-purple-600',
    text: 'text-purple-600',
  },
};

export default function StatsCard({ title, value, change, icon, color, subtitle }: StatsCardProps) {
  const colors = colorClasses[color];

  return (
    <div className="bg-white rounded-xl border border-gray-200 p-5 card-hover">
      <div className="flex flex-col items-center md:flex-row md:items-start md:justify-between">
        <div className={`w-12 h-12 rounded-xl flex items-center justify-center ${colors.icon}`}>
          {icon}
        </div>
        {change && (
          <div className={`flex items-center gap-1 text-sm mt-2 md:mt-0 ${
            change.type === 'increase' ? 'text-emerald-600' : 'text-red-600'
          }`}>
            {change.type === 'increase' ? (
              <TrendingUp size={16} />
            ) : (
              <TrendingDown size={16} />
            )}
            <span className="font-medium">{Math.abs(change.value)}%</span>
          </div>
        )}
      </div>
      <div className="mt-4 text-center md:text-left">
        <p className="text-sm text-gray-500">{title}</p>
        <p className={`font-display text-2xl font-bold mt-1 ${colors.text}`}>{value}</p>
        {subtitle && <p className="text-xs text-gray-400 mt-0.5">{subtitle}</p>}
      </div>
    </div>
  );
}
