'use client';

import { useState } from 'react';
import { X, Calendar, FileText, RefreshCw, Upload } from 'lucide-react';
import { Document, DOCUMENT_TYPES } from '@/types/document';
import { formatDate } from '@/lib/documentManager';

interface DocumentRenewalModalProps {
  document: Document;
  onClose: () => void;
  onSubmit: (documentId: string, newExpiryDate: string, fileName?: string) => void;
}

export default function DocumentRenewalModal({
  document,
  onClose,
  onSubmit,
}: DocumentRenewalModalProps) {
  const [newExpiryDate, setNewExpiryDate] = useState('');
  const [fileName, setFileName] = useState(document.fileName || '');

  const docType = DOCUMENT_TYPES[document.documentType];

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (newExpiryDate) {
      onSubmit(document.id, newExpiryDate, fileName || undefined);
    }
  };

  // Calculate suggested expiry date (1 year from now for most docs)
  const suggestedDate = new Date();
  suggestedDate.setFullYear(suggestedDate.getFullYear() + 1);
  const suggestedDateStr = suggestedDate.toISOString().split('T')[0];

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-2xl shadow-xl w-full max-w-md animate-scale-in">
        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b border-gray-100">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-teal-100 rounded-xl flex items-center justify-center text-xl">
              {docType.icon}
            </div>
            <div>
              <h2 className="font-display font-semibold text-gray-900">
                Mark as Renewed
              </h2>
              <p className="text-sm text-gray-500">{docType.label}</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
          >
            <X size={20} className="text-gray-400" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-4 space-y-4">
          {/* Current Info */}
          <div className="bg-gray-50 rounded-lg p-3 space-y-2">
            <div className="flex justify-between text-sm">
              <span className="text-gray-500">Document Number</span>
              <span className="font-medium text-gray-900">{document.documentNumber}</span>
            </div>
            <div className="flex justify-between text-sm">
              <span className="text-gray-500">Current Expiry</span>
              <span className="font-medium text-gray-900">
                {formatDate(document.expiryDate)}
              </span>
            </div>
          </div>

          {/* New Expiry Date */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              New Expiry Date
            </label>
            <div className="relative">
              <Calendar
                size={16}
                className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400"
              />
              <input
                type="date"
                value={newExpiryDate}
                onChange={(e) => setNewExpiryDate(e.target.value)}
                min={new Date().toISOString().split('T')[0]}
                className="w-full pl-10 pr-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-transparent"
                required
              />
            </div>
            <button
              type="button"
              onClick={() => setNewExpiryDate(suggestedDateStr)}
              className="text-xs text-teal-600 hover:text-teal-700 mt-1"
            >
              Set to 1 year from today
            </button>
          </div>

          {/* File Upload Placeholder */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Upload Renewed Document (Optional)
            </label>
            <div className="border-2 border-dashed border-gray-300 rounded-lg p-4 text-center hover:border-teal-500 transition-colors cursor-pointer">
              <Upload size={24} className="mx-auto text-gray-400 mb-2" />
              <p className="text-sm text-gray-500">
                Click to upload or drag and drop
              </p>
              <p className="text-xs text-gray-400 mt-1">PDF, JPG, PNG up to 10MB</p>
            </div>
            {fileName && (
              <div className="flex items-center gap-2 mt-2 text-sm text-gray-600">
                <FileText size={14} />
                <span>{fileName}</span>
              </div>
            )}
          </div>

          {/* File Name */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              File Name (Optional)
            </label>
            <input
              type="text"
              value={fileName}
              onChange={(e) => setFileName(e.target.value)}
              placeholder="e.g., passport_renewed_2025.pdf"
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-transparent"
            />
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
              disabled={!newExpiryDate}
              className="flex-1 flex items-center justify-center gap-2 px-4 py-2 bg-teal-600 text-white rounded-lg hover:bg-teal-700 transition-colors font-medium disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <RefreshCw size={16} />
              Update Document
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
