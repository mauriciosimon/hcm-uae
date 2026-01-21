'use client';

import { useState } from 'react';
import { X, Download, Printer, User, FileText } from 'lucide-react';
import { TemplateConfig } from '@/types/report';
import { Employee } from '@/types/employee';
import { generateTemplateHTML } from '@/lib/templateGenerator';

interface TemplateFillerModalProps {
  template: TemplateConfig;
  employees: Employee[];
  onClose: () => void;
}

export default function TemplateFillerModal({
  template,
  employees,
  onClose,
}: TemplateFillerModalProps) {
  const [selectedEmployeeId, setSelectedEmployeeId] = useState<string>(
    employees[0]?.id || ''
  );
  const [additionalData, setAdditionalData] = useState<Record<string, string>>({
    purpose: '',
    reason: '',
    lastDate: '',
    endDate: new Date().toISOString().split('T')[0],
  });
  const [previewHTML, setPreviewHTML] = useState<string>('');

  const selectedEmployee = employees.find((e) => e.id === selectedEmployeeId);

  const handleGenerate = () => {
    if (!selectedEmployee) return;
    const html = generateTemplateHTML(template.id, selectedEmployee, additionalData);
    setPreviewHTML(html);
  };

  const handlePrint = () => {
    if (!previewHTML) return;
    const printWindow = window.open('', '_blank');
    if (printWindow) {
      printWindow.document.write(previewHTML);
      printWindow.document.close();
      printWindow.focus();
      setTimeout(() => printWindow.print(), 250);
    }
  };

  const handleDownload = () => {
    if (!previewHTML || !selectedEmployee) return;
    const blob = new Blob([previewHTML], { type: 'text/html' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${template.id}_${selectedEmployee.employeeId}.html`;
    a.click();
    URL.revokeObjectURL(url);
  };

  // Determine which additional fields to show based on template type
  const showPurpose = template.id === 'noc';
  const showReason = ['warning_letter_1', 'warning_letter_2', 'warning_letter_final', 'termination_letter'].includes(template.id);
  const showLastDate = template.id === 'resignation_acceptance';
  const showEndDate = template.id === 'final_settlement';

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-2xl shadow-xl w-full max-w-4xl animate-scale-in max-h-[90vh] flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b border-gray-100">
          <div className="flex items-center gap-3">
            <span className="text-2xl">{template.icon}</span>
            <div>
              <h2 className="font-display font-semibold text-lg text-gray-900">
                {template.name}
              </h2>
              <p className="text-sm text-gray-500">{template.nameAr}</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
          >
            <X size={20} className="text-gray-400" />
          </button>
        </div>

        <div className="flex-1 overflow-auto">
          <div className="grid grid-cols-3 h-full">
            {/* Form Panel */}
            <div className="col-span-1 p-4 border-r border-gray-200 bg-gray-50">
              <h3 className="font-medium text-gray-900 mb-4 flex items-center gap-2">
                <FileText size={16} />
                Template Details
              </h3>

              <div className="space-y-4">
                {/* Employee Selector */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Select Employee
                  </label>
                  <div className="relative">
                    <User
                      size={16}
                      className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400"
                    />
                    <select
                      value={selectedEmployeeId}
                      onChange={(e) => {
                        setSelectedEmployeeId(e.target.value);
                        setPreviewHTML('');
                      }}
                      className="w-full pl-10 pr-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-teal-500 text-sm"
                    >
                      {employees.map((emp) => (
                        <option key={emp.id} value={emp.id}>
                          {emp.personalInfo.firstName} {emp.personalInfo.lastName}
                        </option>
                      ))}
                    </select>
                  </div>
                </div>

                {/* Employee Preview */}
                {selectedEmployee && (
                  <div className="p-3 bg-white rounded-lg border border-gray-200 text-sm">
                    <p className="font-medium text-gray-900">
                      {selectedEmployee.personalInfo.firstName}{' '}
                      {selectedEmployee.personalInfo.lastName}
                    </p>
                    <p className="text-gray-500">{selectedEmployee.employeeId}</p>
                    <p className="text-gray-500">
                      {selectedEmployee.employmentInfo.department}
                    </p>
                    <p className="text-gray-500">
                      {selectedEmployee.employmentInfo.jobTitle}
                    </p>
                  </div>
                )}

                {/* Additional Fields */}
                {showPurpose && (
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Purpose of NOC
                    </label>
                    <input
                      type="text"
                      value={additionalData.purpose}
                      onChange={(e) =>
                        setAdditionalData({ ...additionalData, purpose: e.target.value })
                      }
                      placeholder="e.g., bank loan application"
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-teal-500 text-sm"
                    />
                  </div>
                )}

                {showReason && (
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Reason / Details
                    </label>
                    <textarea
                      value={additionalData.reason}
                      onChange={(e) =>
                        setAdditionalData({ ...additionalData, reason: e.target.value })
                      }
                      placeholder="Describe the reason..."
                      rows={3}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-teal-500 text-sm resize-none"
                    />
                  </div>
                )}

                {showLastDate && (
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Last Working Day
                    </label>
                    <input
                      type="date"
                      value={additionalData.lastDate}
                      onChange={(e) =>
                        setAdditionalData({ ...additionalData, lastDate: e.target.value })
                      }
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-teal-500 text-sm"
                    />
                  </div>
                )}

                {showEndDate && (
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Employment End Date
                    </label>
                    <input
                      type="date"
                      value={additionalData.endDate}
                      onChange={(e) =>
                        setAdditionalData({ ...additionalData, endDate: e.target.value })
                      }
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-teal-500 text-sm"
                    />
                  </div>
                )}

                <button
                  onClick={handleGenerate}
                  className="w-full btn btn-primary"
                >
                  Generate Document
                </button>
              </div>
            </div>

            {/* Preview Panel */}
            <div className="col-span-2 flex flex-col">
              {previewHTML ? (
                <>
                  <div className="flex items-center justify-between p-3 border-b border-gray-200 bg-gray-50">
                    <span className="text-sm font-medium text-gray-700">Preview</span>
                    <div className="flex items-center gap-2">
                      <button
                        onClick={handleDownload}
                        className="flex items-center gap-1 px-3 py-1.5 text-sm text-gray-700 hover:bg-gray-200 rounded-lg transition-colors"
                      >
                        <Download size={14} />
                        Download
                      </button>
                      <button
                        onClick={handlePrint}
                        className="flex items-center gap-1 px-3 py-1.5 text-sm text-white bg-teal-600 hover:bg-teal-700 rounded-lg transition-colors"
                      >
                        <Printer size={14} />
                        Print
                      </button>
                    </div>
                  </div>
                  <div className="flex-1 overflow-auto bg-gray-100 p-4">
                    <div className="bg-white shadow-lg mx-auto max-w-[800px]">
                      <iframe
                        srcDoc={previewHTML}
                        className="w-full h-[600px] border-0"
                        title="Document Preview"
                      />
                    </div>
                  </div>
                </>
              ) : (
                <div className="flex-1 flex items-center justify-center text-center p-8">
                  <div>
                    <FileText size={48} className="mx-auto text-gray-300 mb-4" />
                    <h4 className="font-medium text-gray-900 mb-2">No Preview</h4>
                    <p className="text-sm text-gray-500">
                      Select an employee and click "Generate Document" to see a preview.
                    </p>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
