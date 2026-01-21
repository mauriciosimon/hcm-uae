'use client';

import {
  Document,
  DOCUMENT_TYPES,
  EXPIRY_STATUS_CONFIG,
  EXPIRY_COLORS,
} from '@/types/document';
import { Employee } from '@/types/employee';
import {
  calculateDaysRemaining,
  getExpiryStatus,
  formatDate,
  formatDaysRemaining,
} from '@/lib/documentManager';
import {
  FileText,
  Calendar,
  User,
  Building2,
  RefreshCw,
  Upload,
  ExternalLink,
  AlertCircle,
} from 'lucide-react';
import Link from 'next/link';

interface DocumentCardProps {
  document: Document;
  employee?: Employee;
  onRenew?: (doc: Document) => void;
  onUpload?: (doc: Document) => void;
  compact?: boolean;
}

export default function DocumentCard({
  document,
  employee,
  onRenew,
  onUpload,
  compact = false,
}: DocumentCardProps) {
  const daysRemaining = calculateDaysRemaining(document.expiryDate);
  const status = getExpiryStatus(daysRemaining);
  const statusConfig = EXPIRY_STATUS_CONFIG[status];
  const docType = DOCUMENT_TYPES[document.documentType];
  const colorClass = EXPIRY_COLORS[status];

  if (compact) {
    return (
      <div
        className={`flex items-center justify-between p-3 rounded-lg border ${statusConfig.borderColor} ${statusConfig.bgColor}`}
      >
        <div className="flex items-center gap-3">
          <span className="text-xl">{docType.icon}</span>
          <div>
            <p className="font-medium text-gray-900 text-sm">{docType.label}</p>
            <p className="text-xs text-gray-500">
              {employee
                ? `${employee.personalInfo.firstName} ${employee.personalInfo.lastName}`
                : 'Company'}
            </p>
          </div>
        </div>
        <div className="text-right">
          <span
            className={`inline-block px-2 py-0.5 rounded-full text-xs font-medium ${statusConfig.bgColor} ${statusConfig.textColor}`}
          >
            {formatDaysRemaining(daysRemaining)}
          </span>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-xl border border-gray-200 overflow-hidden hover:shadow-md transition-shadow">
      {/* Color indicator */}
      <div className={`h-1 ${colorClass}`} />

      <div className="p-4">
        {/* Header */}
        <div className="flex items-start justify-between mb-3">
          <div className="flex items-center gap-3">
            <div
              className={`w-10 h-10 rounded-xl flex items-center justify-center text-xl ${
                document.category === 'employee' ? 'bg-teal-100' : 'bg-blue-100'
              }`}
            >
              {docType.icon}
            </div>
            <div>
              <h4 className="font-medium text-gray-900">{docType.label}</h4>
              <p className="text-xs text-gray-500">{document.documentNumber}</p>
            </div>
          </div>
          <span
            className={`px-2 py-1 rounded-full text-xs font-medium ${statusConfig.bgColor} ${statusConfig.textColor}`}
          >
            {statusConfig.label}
          </span>
        </div>

        {/* Employee/Company Info */}
        <div className="flex items-center gap-2 mb-3 text-sm text-gray-600">
          {document.category === 'employee' && employee ? (
            <>
              <User size={14} className="text-gray-400" />
              <Link
                href={`/?employee=${employee.id}`}
                className="hover:text-teal-600 transition-colors"
              >
                {employee.personalInfo.firstName} {employee.personalInfo.lastName}
              </Link>
              <span className="text-gray-300">•</span>
              <span className="text-gray-500">{employee.employmentInfo.department}</span>
            </>
          ) : (
            <>
              <Building2 size={14} className="text-gray-400" />
              <span>Company Document</span>
            </>
          )}
        </div>

        {/* Dates */}
        <div className="grid grid-cols-2 gap-3 mb-3">
          <div className="bg-gray-50 rounded-lg px-3 py-2">
            <p className="text-xs text-gray-500 mb-0.5">Issue Date</p>
            <p className="text-sm font-medium text-gray-900">
              {formatDate(document.issueDate)}
            </p>
          </div>
          <div className={`rounded-lg px-3 py-2 ${statusConfig.bgColor}`}>
            <p className={`text-xs ${statusConfig.textColor} opacity-75 mb-0.5`}>
              Expiry Date
            </p>
            <p className={`text-sm font-medium ${statusConfig.textColor}`}>
              {formatDate(document.expiryDate)}
            </p>
          </div>
        </div>

        {/* Days Remaining */}
        <div
          className={`flex items-center gap-2 p-2 rounded-lg mb-3 ${
            status === 'expired'
              ? 'bg-red-50 border border-red-200'
              : status === 'critical' || status === 'urgent'
              ? 'bg-orange-50 border border-orange-200'
              : 'bg-gray-50'
          }`}
        >
          {(status === 'expired' || status === 'critical') && (
            <AlertCircle
              size={16}
              className={status === 'expired' ? 'text-red-500' : 'text-orange-500'}
            />
          )}
          <Calendar size={14} className="text-gray-400" />
          <span
            className={`text-sm font-medium ${
              status === 'expired'
                ? 'text-red-700'
                : status === 'critical'
                ? 'text-orange-700'
                : 'text-gray-700'
            }`}
          >
            {formatDaysRemaining(daysRemaining)}
          </span>
        </div>

        {/* Progress bar */}
        <div className="mb-3">
          <div className="h-1.5 bg-gray-100 rounded-full overflow-hidden">
            <div
              className={`h-full ${colorClass} transition-all duration-500`}
              style={{
                width: `${Math.max(0, Math.min(100, (daysRemaining / 365) * 100))}%`,
              }}
            />
          </div>
        </div>

        {/* File Upload Indicator */}
        {document.fileName && (
          <div className="flex items-center gap-2 text-xs text-gray-500 mb-3">
            <FileText size={12} />
            <span className="truncate">{document.fileName}</span>
          </div>
        )}

        {/* Issuing Authority */}
        {document.issuingAuthority && (
          <p className="text-xs text-gray-500 mb-3">
            Issued by: {document.issuingAuthority}
          </p>
        )}

        {/* Actions */}
        <div className="flex gap-2 pt-3 border-t border-gray-100">
          {onRenew && (
            <button
              onClick={() => onRenew(document)}
              className="flex-1 flex items-center justify-center gap-1 px-3 py-1.5 bg-teal-600 text-white text-sm rounded-lg hover:bg-teal-700 transition-colors"
            >
              <RefreshCw size={14} />
              Mark Renewed
            </button>
          )}
          {onUpload && (
            <button
              onClick={() => onUpload(document)}
              className="flex items-center justify-center gap-1 px-3 py-1.5 border border-gray-300 text-gray-700 text-sm rounded-lg hover:bg-gray-50 transition-colors"
            >
              <Upload size={14} />
              Upload
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
