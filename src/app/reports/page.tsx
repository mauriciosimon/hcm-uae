'use client';

import { useState } from 'react';
import {
  FileText,
  Download,
  Filter,
  Calendar,
  Building2,
  User,
  ChevronRight,
  Clock,
  FileSpreadsheet,
  Printer,
  Search,
} from 'lucide-react';
import Sidebar from '@/components/Sidebar';
import {
  REPORT_CONFIGS,
  TEMPLATE_CONFIGS,
  CATEGORY_LABELS,
  ReportConfig,
  TemplateConfig,
  ReportCategory,
  GeneratedReport,
} from '@/types/report';
import { mockEmployees } from '@/lib/data';
import { mockLeaveRequests } from '@/lib/leaveData';
import { mockOvertimeEntries } from '@/lib/overtimeCalculator';
import { getReportData } from '@/lib/reportGenerator';
import ReportPreviewModal from '@/components/ReportPreviewModal';
import TemplateFillerModal from '@/components/TemplateFillerModal';

const CATEGORY_ICONS: Record<ReportCategory, React.ReactNode> = {
  employee: <User size={20} />,
  leave: <Calendar size={20} />,
  payroll: <FileSpreadsheet size={20} />,
  compliance: <FileText size={20} />,
};

const CATEGORY_COLORS: Record<ReportCategory, string> = {
  employee: 'bg-teal-100 text-teal-700',
  leave: 'bg-blue-100 text-blue-700',
  payroll: 'bg-emerald-100 text-emerald-700',
  compliance: 'bg-amber-100 text-amber-700',
};

export default function ReportsPage() {
  const [activeTab, setActiveTab] = useState<'reports' | 'templates'>('reports');
  const [selectedCategory, setSelectedCategory] = useState<ReportCategory | 'all'>('all');
  const [searchQuery, setSearchQuery] = useState('');

  // Filters
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const [selectedDepartment, setSelectedDepartment] = useState('');

  // Modals
  const [selectedReport, setSelectedReport] = useState<ReportConfig | null>(null);
  const [reportData, setReportData] = useState<string[][] | null>(null);
  const [selectedTemplate, setSelectedTemplate] = useState<TemplateConfig | null>(null);

  // Recently generated reports
  const [recentReports, setRecentReports] = useState<GeneratedReport[]>([]);

  // Get unique departments
  const departments = Array.from(new Set(mockEmployees.map((e) => e.employmentInfo.department)));

  // Filter reports by category and search
  const filteredReports = REPORT_CONFIGS.filter((report) => {
    const matchesCategory = selectedCategory === 'all' || report.category === selectedCategory;
    const matchesSearch =
      report.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      report.description.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesCategory && matchesSearch;
  });

  // Filter templates by search
  const filteredTemplates = TEMPLATE_CONFIGS.filter(
    (template) =>
      template.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      template.nameAr.includes(searchQuery) ||
      template.description.toLowerCase().includes(searchQuery.toLowerCase())
  );

  // Group reports by category
  const reportsByCategory = filteredReports.reduce((acc, report) => {
    if (!acc[report.category]) {
      acc[report.category] = [];
    }
    acc[report.category].push(report);
    return acc;
  }, {} as Record<ReportCategory, ReportConfig[]>);

  const handleGenerateReport = (report: ReportConfig) => {
    const filters = {
      startDate: startDate || undefined,
      endDate: endDate || undefined,
      department: selectedDepartment || undefined,
    };

    const data = getReportData(
      report.id,
      mockEmployees,
      mockLeaveRequests,
      mockOvertimeEntries,
      filters
    );

    setReportData(data);
    setSelectedReport(report);

    // Add to recent reports
    const newReport: GeneratedReport = {
      id: `report-${Date.now()}`,
      reportType: report.id,
      reportName: report.name,
      generatedAt: new Date().toISOString(),
      filters,
      format: 'pdf',
    };
    setRecentReports((prev) => [newReport, ...prev].slice(0, 10));
  };

  const handleOpenTemplate = (template: TemplateConfig) => {
    setSelectedTemplate(template);
  };

  return (
    <div className="flex min-h-screen bg-gray-50">
      <Sidebar />

      <main className="flex-1 ml-64">
        {/* Header */}
        <div className="bg-white border-b border-gray-200 px-8 py-6">
          <div className="flex items-center justify-between mb-6">
            <div>
              <h1 className="text-2xl font-display font-bold text-gray-900">
                Reports & Templates
              </h1>
              <p className="text-gray-600 mt-1">
                Generate reports and create UAE-compliant documents
              </p>
            </div>
          </div>

          {/* Tabs */}
          <div className="flex gap-4 border-b border-gray-200 -mb-6">
            <button
              onClick={() => setActiveTab('reports')}
              className={`px-4 py-3 font-medium text-sm border-b-2 transition-colors ${
                activeTab === 'reports'
                  ? 'border-teal-600 text-teal-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700'
              }`}
            >
              <FileSpreadsheet size={16} className="inline mr-2" />
              Reports
            </button>
            <button
              onClick={() => setActiveTab('templates')}
              className={`px-4 py-3 font-medium text-sm border-b-2 transition-colors ${
                activeTab === 'templates'
                  ? 'border-teal-600 text-teal-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700'
              }`}
            >
              <FileText size={16} className="inline mr-2" />
              Document Templates
            </button>
          </div>
        </div>

        <div className="p-8">
          {activeTab === 'reports' ? (
            <div className="grid grid-cols-4 gap-6">
              {/* Sidebar Filters */}
              <div className="col-span-1 space-y-6">
                {/* Search */}
                <div className="card p-4">
                  <div className="relative">
                    <Search
                      size={16}
                      className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400"
                    />
                    <input
                      type="text"
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      placeholder="Search reports..."
                      className="w-full pl-10 pr-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-teal-500 text-sm"
                    />
                  </div>
                </div>

                {/* Category Filter */}
                <div data-tour="report-categories" className="card p-4">
                  <h3 className="font-medium text-gray-900 mb-3 flex items-center gap-2">
                    <Filter size={16} />
                    Categories
                  </h3>
                  <div className="space-y-2">
                    <button
                      onClick={() => setSelectedCategory('all')}
                      className={`w-full text-left px-3 py-2 rounded-lg text-sm transition-colors ${
                        selectedCategory === 'all'
                          ? 'bg-teal-50 text-teal-700 font-medium'
                          : 'text-gray-600 hover:bg-gray-50'
                      }`}
                    >
                      All Reports
                    </button>
                    {(Object.keys(CATEGORY_LABELS) as ReportCategory[]).map((cat) => (
                      <button
                        key={cat}
                        onClick={() => setSelectedCategory(cat)}
                        className={`w-full text-left px-3 py-2 rounded-lg text-sm transition-colors flex items-center gap-2 ${
                          selectedCategory === cat
                            ? 'bg-teal-50 text-teal-700 font-medium'
                            : 'text-gray-600 hover:bg-gray-50'
                        }`}
                      >
                        <span className={`p-1 rounded ${CATEGORY_COLORS[cat]}`}>
                          {CATEGORY_ICONS[cat]}
                        </span>
                        {CATEGORY_LABELS[cat]}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Date Range Filter */}
                <div className="card p-4">
                  <h3 className="font-medium text-gray-900 mb-3 flex items-center gap-2">
                    <Calendar size={16} />
                    Date Range
                  </h3>
                  <div className="space-y-3">
                    <div>
                      <label className="block text-xs text-gray-500 mb-1">From</label>
                      <input
                        type="date"
                        value={startDate}
                        onChange={(e) => setStartDate(e.target.value)}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-teal-500 text-sm"
                      />
                    </div>
                    <div>
                      <label className="block text-xs text-gray-500 mb-1">To</label>
                      <input
                        type="date"
                        value={endDate}
                        onChange={(e) => setEndDate(e.target.value)}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-teal-500 text-sm"
                      />
                    </div>
                  </div>
                </div>

                {/* Department Filter */}
                <div className="card p-4">
                  <h3 className="font-medium text-gray-900 mb-3 flex items-center gap-2">
                    <Building2 size={16} />
                    Department
                  </h3>
                  <select
                    value={selectedDepartment}
                    onChange={(e) => setSelectedDepartment(e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-teal-500 text-sm"
                  >
                    <option value="">All Departments</option>
                    {departments.map((dept) => (
                      <option key={dept} value={dept}>
                        {dept}
                      </option>
                    ))}
                  </select>
                </div>

                {/* Recent Reports */}
                {recentReports.length > 0 && (
                  <div className="card p-4">
                    <h3 className="font-medium text-gray-900 mb-3 flex items-center gap-2">
                      <Clock size={16} />
                      Recent Reports
                    </h3>
                    <div className="space-y-2">
                      {recentReports.slice(0, 5).map((report) => (
                        <div
                          key={report.id}
                          className="p-2 bg-gray-50 rounded-lg text-sm"
                        >
                          <p className="font-medium text-gray-900 truncate">
                            {report.reportName}
                          </p>
                          <p className="text-xs text-gray-500">
                            {new Date(report.generatedAt).toLocaleString('en-AE', {
                              day: 'numeric',
                              month: 'short',
                              hour: '2-digit',
                              minute: '2-digit',
                            })}
                          </p>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>

              {/* Reports Grid */}
              <div className="col-span-3 space-y-6">
                {selectedCategory === 'all' ? (
                  // Show grouped by category
                  (Object.keys(reportsByCategory) as ReportCategory[]).map((category) => (
                    <div key={category}>
                      <h2 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
                        <span className={`p-1.5 rounded ${CATEGORY_COLORS[category]}`}>
                          {CATEGORY_ICONS[category]}
                        </span>
                        {CATEGORY_LABELS[category]}
                      </h2>
                      <div className="grid grid-cols-2 gap-4">
                        {reportsByCategory[category].map((report) => (
                          <ReportCard
                            key={report.id}
                            report={report}
                            onGenerate={() => handleGenerateReport(report)}
                          />
                        ))}
                      </div>
                    </div>
                  ))
                ) : (
                  // Show filtered list
                  <div className="grid grid-cols-2 gap-4">
                    {filteredReports.map((report) => (
                      <ReportCard
                        key={report.id}
                        report={report}
                        onGenerate={() => handleGenerateReport(report)}
                      />
                    ))}
                  </div>
                )}

                {filteredReports.length === 0 && (
                  <div className="card p-12 text-center">
                    <FileText size={48} className="mx-auto text-gray-300 mb-4" />
                    <h3 className="font-medium text-gray-900 mb-2">No Reports Found</h3>
                    <p className="text-sm text-gray-500">
                      Try adjusting your search or filter criteria.
                    </p>
                  </div>
                )}
              </div>
            </div>
          ) : (
            // Templates Tab
            <div data-tour="templates">
              {/* Search */}
              <div className="mb-6 max-w-md">
                <div className="relative">
                  <Search
                    size={16}
                    className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400"
                  />
                  <input
                    type="text"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    placeholder="Search templates..."
                    className="w-full pl-10 pr-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-teal-500 text-sm"
                  />
                </div>
              </div>

              {/* Templates Grid */}
              <div className="grid grid-cols-3 gap-4">
                {filteredTemplates.map((template) => (
                  <TemplateCard
                    key={template.id}
                    template={template}
                    onOpen={() => handleOpenTemplate(template)}
                  />
                ))}
              </div>

              {filteredTemplates.length === 0 && (
                <div className="card p-12 text-center">
                  <FileText size={48} className="mx-auto text-gray-300 mb-4" />
                  <h3 className="font-medium text-gray-900 mb-2">No Templates Found</h3>
                  <p className="text-sm text-gray-500">
                    Try adjusting your search criteria.
                  </p>
                </div>
              )}
            </div>
          )}
        </div>
      </main>

      {/* Report Preview Modal */}
      {selectedReport && reportData && (
        <ReportPreviewModal
          report={selectedReport}
          data={reportData}
          filters={{
            startDate: startDate || undefined,
            endDate: endDate || undefined,
            department: selectedDepartment || undefined,
          }}
          onClose={() => {
            setSelectedReport(null);
            setReportData(null);
          }}
        />
      )}

      {/* Template Filler Modal */}
      {selectedTemplate && (
        <TemplateFillerModal
          template={selectedTemplate}
          employees={mockEmployees}
          onClose={() => setSelectedTemplate(null)}
        />
      )}
    </div>
  );
}

// Report Card Component
function ReportCard({
  report,
  onGenerate,
}: {
  report: ReportConfig;
  onGenerate: () => void;
}) {
  return (
    <div className="card p-4 hover:shadow-md transition-shadow">
      <div className="flex items-start gap-3">
        <span className="text-2xl">{report.icon}</span>
        <div className="flex-1 min-w-0">
          <h3 className="font-medium text-gray-900">{report.name}</h3>
          <p className="text-sm text-gray-500 mt-1">{report.description}</p>
          <div className="flex items-center gap-2 mt-3">
            {report.hasDateRange && (
              <span className="inline-flex items-center gap-1 px-2 py-0.5 bg-gray-100 text-gray-600 rounded text-xs">
                <Calendar size={12} />
                Date Range
              </span>
            )}
            {report.hasDepartmentFilter && (
              <span className="inline-flex items-center gap-1 px-2 py-0.5 bg-gray-100 text-gray-600 rounded text-xs">
                <Building2 size={12} />
                Dept
              </span>
            )}
            {report.hasEmployeeFilter && (
              <span className="inline-flex items-center gap-1 px-2 py-0.5 bg-gray-100 text-gray-600 rounded text-xs">
                <User size={12} />
                Employee
              </span>
            )}
          </div>
        </div>
        <button
          onClick={onGenerate}
          className="flex items-center gap-1 px-3 py-1.5 text-sm text-teal-600 hover:bg-teal-50 rounded-lg transition-colors"
        >
          Generate
          <ChevronRight size={16} />
        </button>
      </div>
    </div>
  );
}

// Template Card Component
function TemplateCard({
  template,
  onOpen,
}: {
  template: TemplateConfig;
  onOpen: () => void;
}) {
  return (
    <div className="card p-4 hover:shadow-md transition-shadow">
      <div className="flex items-start gap-3">
        <span className="text-2xl">{template.icon}</span>
        <div className="flex-1 min-w-0">
          <h3 className="font-medium text-gray-900">{template.name}</h3>
          <p className="text-sm text-gray-500">{template.nameAr}</p>
          <p className="text-xs text-gray-400 mt-1">{template.description}</p>
        </div>
      </div>
      <div className="flex items-center gap-2 mt-4 pt-3 border-t border-gray-100">
        <button
          onClick={onOpen}
          className="flex-1 flex items-center justify-center gap-2 px-3 py-2 text-sm text-white bg-teal-600 hover:bg-teal-700 rounded-lg transition-colors"
        >
          <FileText size={14} />
          Create Document
        </button>
      </div>
    </div>
  );
}
