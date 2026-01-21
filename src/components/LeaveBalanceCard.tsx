'use client';

import { LeaveBalance, UAE_LEAVE_POLICY } from '@/types/leave';
import { Calendar, Thermometer, Baby, User } from 'lucide-react';

interface LeaveBalanceCardProps {
  balance: LeaveBalance;
  gender: 'male' | 'female';
}

interface BalanceItemProps {
  label: string;
  used: number;
  available: number;
  total: number;
  color: string;
  subLabel?: string;
}

function BalanceItem({ label, used, available, total, color, subLabel }: BalanceItemProps) {
  const percentage = total > 0 ? ((total - available) / total) * 100 : 0;

  return (
    <div className="space-y-2">
      <div className="flex justify-between items-center">
        <span className="text-sm text-gray-600">
          {label}
          {subLabel && <span className="text-xs text-gray-400 ml-1">({subLabel})</span>}
        </span>
        <span className="text-sm font-medium text-gray-900">
          {available} <span className="text-gray-400">/ {total} days</span>
        </span>
      </div>
      <div className="h-2 bg-gray-100 rounded-full overflow-hidden">
        <div
          className={`h-full ${color} transition-all duration-500`}
          style={{ width: `${percentage}%` }}
        />
      </div>
    </div>
  );
}

export default function LeaveBalanceCard({ balance, gender }: LeaveBalanceCardProps) {
  return (
    <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
      <div className="p-4 border-b border-gray-100 bg-gradient-to-r from-teal-50 to-white">
        <h3 className="font-display font-semibold text-gray-900">Leave Balance</h3>
        <p className="text-sm text-gray-500">UAE Labor Law Entitlements</p>
      </div>

      <div className="p-4 space-y-6">
        {/* Annual Leave */}
        <div className="space-y-3">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 bg-teal-100 rounded-lg flex items-center justify-center">
              <Calendar size={16} className="text-teal-600" />
            </div>
            <span className="font-medium text-gray-900">Annual Leave</span>
          </div>
          <BalanceItem
            label="Available"
            used={balance.annual.used}
            available={balance.annual.available}
            total={balance.annual.entitled}
            color="bg-teal-500"
          />
          {balance.annual.pending > 0 && (
            <p className="text-xs text-amber-600 bg-amber-50 px-2 py-1 rounded">
              {balance.annual.pending} days pending approval
            </p>
          )}
        </div>

        {/* Sick Leave */}
        <div className="space-y-3">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 bg-rose-100 rounded-lg flex items-center justify-center">
              <Thermometer size={16} className="text-rose-600" />
            </div>
            <span className="font-medium text-gray-900">Sick Leave</span>
          </div>
          <BalanceItem
            label="Full Pay"
            used={balance.sick.fullPay.used}
            available={balance.sick.fullPay.available}
            total={balance.sick.fullPay.entitled}
            color="bg-rose-500"
            subLabel="100%"
          />
          <BalanceItem
            label="Half Pay"
            used={balance.sick.halfPay.used}
            available={balance.sick.halfPay.available}
            total={balance.sick.halfPay.entitled}
            color="bg-rose-400"
            subLabel="50%"
          />
          <BalanceItem
            label="Unpaid"
            used={balance.sick.unpaid.used}
            available={balance.sick.unpaid.available}
            total={balance.sick.unpaid.entitled}
            color="bg-rose-300"
            subLabel="0%"
          />
        </div>

        {/* Maternity Leave - Female Only */}
        {gender === 'female' && (
          <div className="space-y-3">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 bg-purple-100 rounded-lg flex items-center justify-center">
                <Baby size={16} className="text-purple-600" />
              </div>
              <span className="font-medium text-gray-900">Maternity Leave</span>
            </div>
            <BalanceItem
              label="Full Pay"
              used={balance.maternity.fullPay.used}
              available={balance.maternity.fullPay.available}
              total={balance.maternity.fullPay.entitled}
              color="bg-purple-500"
              subLabel="100%"
            />
            <BalanceItem
              label="Half Pay"
              used={balance.maternity.halfPay.used}
              available={balance.maternity.halfPay.available}
              total={balance.maternity.halfPay.entitled}
              color="bg-purple-400"
              subLabel="50%"
            />
          </div>
        )}

        {/* Paternity Leave - Male Only */}
        {gender === 'male' && (
          <div className="space-y-3">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 bg-blue-100 rounded-lg flex items-center justify-center">
                <User size={16} className="text-blue-600" />
              </div>
              <span className="font-medium text-gray-900">Paternity Leave</span>
            </div>
            <BalanceItem
              label="Paid Leave"
              used={balance.paternity.used}
              available={balance.paternity.available}
              total={balance.paternity.entitled}
              color="bg-blue-500"
              subLabel="100%"
            />
          </div>
        )}
      </div>

      {/* UAE Law Reference */}
      <div className="px-4 py-3 bg-gray-50 border-t border-gray-100">
        <p className="text-xs text-gray-500">
          Per UAE Labor Law: Annual leave {UAE_LEAVE_POLICY.annual.fullEntitlement} days/year after 1 year,
          {UAE_LEAVE_POLICY.annual.probationRate} days/month after 6 months
        </p>
      </div>
    </div>
  );
}
