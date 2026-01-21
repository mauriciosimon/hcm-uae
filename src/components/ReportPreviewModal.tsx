'use client';

import { X, Download, Printer, FileSpreadsheet } from 'lucide-react';
import { ReportConfig } from '@/types/report';
import { reportToCSV, generateReportHTML } from '@/lib/reportGenerator';

interface ReportPreviewModalProps {
  report: ReportConfig;
  data: string[][];
  filters: {
    startDate?: string;
    endDate?: string;
    department?: string;
  };
  onClose: () => void;
}

export default function ReportPreviewModal({
  report,
  data,
  filters,
  onClose,
}: ReportPreviewModalProps) {
  const headers = data[0];
  const rows = data.slice(1);

  const handlePrint = () => {
    const html = generateReportHTML(report.name, data, filters);
    const printWindow = window.open('', '_blank');
    if (printWindow) {
      printWindow.document.write(html);
      printWindow.document.close();
      printWindow.focus();
      setTimeout(() => printWindow.print(), 250);
    }
  };

  const handleDownloadPDF = () => {
    const html = generateReportHTML(report.name, data, filters);
    const printWindow = window.open('', '_blank');
    if (printWindow) {
      printWindow.document.write(html);
      printWindow.document.close();
      printWindow.focus();
      setTimeout(() => printWindow.print(), 250);
    }
  };

  const handleDownloadCSV = () => {
    const csv = reportToCSV(data);
    const blob = new Blob([csv], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${report.id}_${new Date().toISOString().split('T')[0]}.csv`;
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-2xl shadow-xl w-full max-w-5xl animate-scale-in max-h-[90vh] flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b border-gray-100">
          <div className="flex items-center gap-3">
            <span className="text-2xl">{report.icon}</span>
            <div>
              <h2 className="font-display font-semibold text-lg text-gray-900">
                {report.name}
              </h2>
              <p className="text-sm text-gray-500">{report.description}</p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={handleDownloadCSV}
              className="flex items-center gap-2 px-3 py-2 text-sm text-gray-700 hover:bg-gray-100 rounded-lg transition-colors"
              title="Download CSV"
            >
              <FileSpreadsheet size={16} />
              CSV
            </button>
            <button
              onClick={handleDownloadPDF}
              className="flex items-center gap-2 px-3 py-2 text-sm text-gray-700 hover:bg-gray-100 rounded-lg transition-colors"
              title="Download PDF"
            >
              <Download size={16} />
              PDF
            </button>
            <button
              onClick={handlePrint}
              className="flex items-center gap-2 px-3 py-2 text-sm text-gray-700 hover:bg-gray-100 rounded-lg transition-colors"
              title="Print"
            >
              <Printer size={16} />
              Print
            </button>
            <button
              onClick={onClose}
              className="p-2 hover:bg-gray-100 rounded-lg transition-colors ml-2"
            >
              <X size={20} className="text-gray-400" />
            </button>
          </div>
        </div>

        {/* Filters Display */}
        {(filters.startDate || filters.endDate || filters.department) && (
          <div className="px-4 py-2 bg-gray-50 border-b border-gray-100 text-sm text-gray-600">
            Filters:
            {filters.startDate && ` From ${filters.startDate}`}
            {filters.endDate && ` To ${filters.endDate}`}
            {filters.department && ` | Department: ${filters.department}`}
          </div>
        )}

        {/* Table */}
        <div className="flex-1 overflow-auto p-4">
          <table className="w-full border-collapse">
            <thead className="sticky top-0 bg-teal-600 text-white">
              <tr>
                {headers.map((header, i) => (
                  <th
                    key={i}
                    className="text-left px-4 py-3 text-xs font-semibold uppercase tracking-wide"
                  >
                    {header}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {rows.map((row, rowIndex) => (
                <tr
                  key={rowIndex}
                  className={`${
                    rowIndex === rows.length - 1
                      ? 'bg-teal-50 font-semibold'
                      : rowIndex % 2 === 0
                      ? 'bg-white'
                      : 'bg-gray-50'
                  } hover:bg-teal-50/50`}
                >
                  {row.map((cell, cellIndex) => (
                    <td
                      key={cellIndex}
                      className="px-4 py-3 text-sm text-gray-700 border-b border-gray-100"
                    >
                      {cell}
                    </td>
                  ))}
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Footer */}
        <div className="px-4 py-3 bg-gray-50 border-t border-gray-100 text-xs text-gray-500 text-center">
          {rows.length} records • Generated on{' '}
          {new Date().toLocaleDateString('en-AE', {
            day: 'numeric',
            month: 'long',
            year: 'numeric',
            hour: '2-digit',
            minute: '2-digit',
          })}
        </div>
      </div>
    </div>
  );
}
