'use client';

import { LeaveRequest, LEAVE_TYPE_LABELS, LEAVE_STATUS_LABELS } from '@/types/leave';
import { Employee } from '@/types/employee';
import { formatDate } from '@/lib/leaveData';
import { Calendar, Clock, CheckCircle, XCircle, AlertCircle, User } from 'lucide-react';

interface LeaveRequestCardProps {
  request: LeaveRequest;
  employee?: Employee;
  onApprove?: (id: string) => void;
  onReject?: (id: string) => void;
  showActions?: boolean;
}

const statusConfig = {
  pending: {
    icon: <Clock size={14} />,
    className: 'bg-amber-100 text-amber-700',
  },
  approved: {
    icon: <CheckCircle size={14} />,
    className: 'bg-emerald-100 text-emerald-700',
  },
  rejected: {
    icon: <XCircle size={14} />,
    className: 'bg-red-100 text-red-700',
  },
  cancelled: {
    icon: <AlertCircle size={14} />,
    className: 'bg-gray-100 text-gray-600',
  },
};

const leaveTypeColors: Record<string, string> = {
  annual: 'bg-teal-500',
  sick: 'bg-rose-500',
  maternity: 'bg-purple-500',
  paternity: 'bg-blue-500',
  unpaid: 'bg-gray-500',
};

export default function LeaveRequestCard({
  request,
  employee,
  onApprove,
  onReject,
  showActions = false,
}: LeaveRequestCardProps) {
  const status = statusConfig[request.status];

  return (
    <div className="bg-white rounded-xl border border-gray-200 overflow-hidden hover:shadow-md transition-shadow">
      {/* Color Strip */}
      <div className={`h-1 ${leaveTypeColors[request.leaveType]}`} />

      <div className="p-4">
        {/* Header */}
        <div className="flex items-start justify-between mb-3">
          <div>
            <div className="flex items-center gap-2">
              <span className="font-medium text-gray-900">
                {LEAVE_TYPE_LABELS[request.leaveType]}
              </span>
              <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-medium ${status.className}`}>
                {status.icon}
                {LEAVE_STATUS_LABELS[request.status]}
              </span>
            </div>
            {employee && (
              <div className="flex items-center gap-1 mt-1 text-sm text-gray-500">
                <User size={12} />
                {employee.personalInfo.firstName} {employee.personalInfo.lastName}
              </div>
            )}
          </div>
          <span className="text-2xl font-bold text-gray-900">
            {request.totalDays}
            <span className="text-sm font-normal text-gray-400 ml-1">days</span>
          </span>
        </div>

        {/* Dates */}
        <div className="flex items-center gap-2 text-sm text-gray-600 mb-3">
          <Calendar size={14} className="text-gray-400" />
          <span>{formatDate(request.startDate)}</span>
          <span className="text-gray-300">→</span>
          <span>{formatDate(request.endDate)}</span>
        </div>

        {/* Reason */}
        <p className="text-sm text-gray-600 bg-gray-50 rounded-lg px-3 py-2 mb-3">
          {request.reason}
        </p>

        {/* Approval Info */}
        {request.status === 'approved' && request.approvedBy && (
          <p className="text-xs text-gray-400">
            Approved by {request.approvedBy} on {formatDate(request.approvedAt!)}
          </p>
        )}

        {/* Rejection Info */}
        {request.status === 'rejected' && request.rejectionReason && (
          <p className="text-xs text-red-500">
            Reason: {request.rejectionReason}
          </p>
        )}

        {/* Actions */}
        {showActions && request.status === 'pending' && (
          <div className="flex gap-2 mt-3 pt-3 border-t border-gray-100">
            <button
              onClick={() => onApprove?.(request.id)}
              className="flex-1 px-3 py-1.5 bg-emerald-600 text-white text-sm rounded-lg hover:bg-emerald-700 transition-colors"
            >
              Approve
            </button>
            <button
              onClick={() => onReject?.(request.id)}
              className="flex-1 px-3 py-1.5 border border-gray-300 text-gray-700 text-sm rounded-lg hover:bg-gray-50 transition-colors"
            >
              Reject
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
