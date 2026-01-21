'use client';

import { useState, useMemo } from 'react';
import Sidebar from '@/components/Sidebar';
import Header from '@/components/Header';
import StatsCard from '@/components/StatsCard';
import DocumentCard from '@/components/DocumentCard';
import DocumentRenewalModal from '@/components/DocumentRenewalModal';
import DocumentCalendarView from '@/components/DocumentCalendarView';
import { mockEmployees } from '@/lib/data';
import {
  generateEmployeeDocuments,
  mockCompanyDocuments,
  calculateDaysRemaining,
  getExpiryStatus,
  calculateCompliancePercentage,
  getExpiringDocuments,
  getExpiredDocuments,
  sortByExpiryDate,
  filterByStatus,
  filterByType,
  generateExportData,
  formatDate,
} from '@/lib/documentManager';
import {
  Document,
  DocumentType,
  ExpiryStatus,
  DOCUMENT_TYPES,
  EXPIRY_STATUS_CONFIG,
  ALERT_THRESHOLDS,
} from '@/types/document';
import {
  FileText,
  AlertTriangle,
  CheckCircle,
  Clock,
  Filter,
  Download,
  Grid3X3,
  List,
  Calendar,
  Bell,
  Search,
  RefreshCw,
  Info,
  Shield,
} from 'lucide-react';

type ViewMode = 'grid' | 'list' | 'calendar';
type QuickFilter = 'all' | 'expiring_30' | 'expiring_this_month' | 'expired';

export default function DocumentsPage() {
  // Generate all documents
  const [allDocuments, setAllDocuments] = useState<Document[]>(() => {
    const employeeDocs = mockEmployees.flatMap((emp) =>
      generateEmployeeDocuments(emp)
    );
    return [...employeeDocs, ...mockCompanyDocuments];
  });

  const [viewMode, setViewMode] = useState<ViewMode>('grid');
  const [quickFilter, setQuickFilter] = useState<QuickFilter>('all');
  const [statusFilter, setStatusFilter] = useState<ExpiryStatus | 'all'>('all');
  const [typeFilter, setTypeFilter] = useState<DocumentType | 'all'>('all');
  const [employeeFilter, setEmployeeFilter] = useState<string>('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [sortDirection, setSortDirection] = useState<'asc' | 'desc'>('asc');
  const [renewalDoc, setRenewalDoc] = useState<Document | null>(null);
  const [showNotificationSettings, setShowNotificationSettings] = useState(false);
  const [notificationDays, setNotificationDays] = useState([90, 60, 30, 7]);

  // Calculate stats
  const stats = useMemo(() => {
    const total = allDocuments.length;
    const expiringSoon = getExpiringDocuments(allDocuments, 30).length;
    const expired = getExpiredDocuments(allDocuments).length;
    const compliance = calculateCompliancePercentage(allDocuments);
    return { total, expiringSoon, expired, compliance };
  }, [allDocuments]);

  // Filter and sort documents
  const filteredDocuments = useMemo(() => {
    let docs = [...allDocuments];

    // Apply quick filter
    switch (quickFilter) {
      case 'expiring_30':
        docs = getExpiringDocuments(docs, 30);
        break;
      case 'expiring_this_month':
        const now = new Date();
        const endOfMonth = new Date(now.getFullYear(), now.getMonth() + 1, 0);
        const daysUntilEndOfMonth = Math.ceil(
          (endOfMonth.getTime() - now.getTime()) / (1000 * 60 * 60 * 24)
        );
        docs = getExpiringDocuments(docs, daysUntilEndOfMonth);
        break;
      case 'expired':
        docs = getExpiredDocuments(docs);
        break;
    }

    // Apply status filter
    if (statusFilter !== 'all') {
      docs = filterByStatus(docs, statusFilter);
    }

    // Apply type filter
    if (typeFilter !== 'all') {
      docs = filterByType(docs, typeFilter);
    }

    // Apply employee filter
    if (employeeFilter !== 'all') {
      docs = docs.filter(
        (doc) => doc.employeeId === employeeFilter || doc.category === 'company'
      );
    }

    // Apply search
    if (searchQuery) {
      const query = searchQuery.toLowerCase();
      docs = docs.filter((doc) => {
        const employee = mockEmployees.find((e) => e.id === doc.employeeId);
        const employeeName = employee
          ? `${employee.personalInfo.firstName} ${employee.personalInfo.lastName}`.toLowerCase()
          : '';
        return (
          doc.documentNumber.toLowerCase().includes(query) ||
          DOCUMENT_TYPES[doc.documentType].label.toLowerCase().includes(query) ||
          employeeName.includes(query)
        );
      });
    }

    // Sort by expiry date
    docs = sortByExpiryDate(docs, sortDirection);

    return docs;
  }, [
    allDocuments,
    quickFilter,
    statusFilter,
    typeFilter,
    employeeFilter,
    searchQuery,
    sortDirection,
  ]);

  const handleRenewal = (docId: string, newExpiryDate: string, fileName?: string) => {
    setAllDocuments((prev) =>
      prev.map((doc) =>
        doc.id === docId
          ? {
              ...doc,
              expiryDate: newExpiryDate,
              isRenewed: true,
              renewedDate: new Date().toISOString(),
              fileName: fileName || doc.fileName,
              updatedAt: new Date().toISOString(),
            }
          : doc
      )
    );
    setRenewalDoc(null);
  };

  const handleExport = () => {
    const csvData = generateExportData(allDocuments, mockEmployees, 90);
    const blob = new Blob([csvData], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `document_expiry_report_${formatDate(new Date().toISOString())}.csv`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const getEmployee = (employeeId?: string) =>
    mockEmployees.find((e) => e.id === employeeId);

  return (
    <div className="flex min-h-screen bg-stone-50">
      <Sidebar />

      <main className="flex-1 ml-64 transition-all duration-300">
        <Header
          title="Document Management"
          subtitle="Track document expiry and compliance status"
        />

        <div className="p-6">
          {/* Stats Row */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
            <StatsCard
              title="Total Documents"
              value={stats.total}
              icon={<FileText size={24} />}
              color="teal"
            />
            <StatsCard
              title="Expiring Soon"
              value={stats.expiringSoon}
              icon={<Clock size={24} />}
              color="amber"
            />
            <StatsCard
              title="Expired"
              value={stats.expired}
              icon={<AlertTriangle size={24} />}
              color="red"
            />
            <StatsCard
              title="Compliance Rate"
              value={`${stats.compliance}%`}
              icon={<Shield size={24} />}
              color="emerald"
            />
          </div>

          {/* Quick Filters */}
          <div className="flex flex-wrap gap-2 mb-4">
            {[
              { key: 'all', label: 'All Documents', count: allDocuments.length },
              {
                key: 'expiring_this_month',
                label: 'Expiring This Month',
                count: getExpiringDocuments(
                  allDocuments,
                  new Date(
                    new Date().getFullYear(),
                    new Date().getMonth() + 1,
                    0
                  ).getDate() - new Date().getDate()
                ).length,
              },
              {
                key: 'expiring_30',
                label: 'Next 30 Days',
                count: getExpiringDocuments(allDocuments, 30).length,
              },
              {
                key: 'expired',
                label: 'Expired',
                count: stats.expired,
              },
            ].map((filter) => (
              <button
                key={filter.key}
                onClick={() => setQuickFilter(filter.key as QuickFilter)}
                className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                  quickFilter === filter.key
                    ? 'bg-teal-600 text-white'
                    : 'bg-white border border-gray-200 text-gray-700 hover:bg-gray-50'
                }`}
              >
                {filter.label}
                <span
                  className={`ml-2 px-1.5 py-0.5 rounded-full text-xs ${
                    quickFilter === filter.key
                      ? 'bg-white/20'
                      : 'bg-gray-100'
                  }`}
                >
                  {filter.count}
                </span>
              </button>
            ))}
          </div>

          {/* Actions Bar */}
          <div className="bg-white rounded-xl border border-gray-200 p-4 mb-6">
            <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
              <div className="flex items-center gap-3 flex-wrap">
                {/* Search */}
                <div className="relative">
                  <Search
                    size={16}
                    className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400"
                  />
                  <input
                    type="text"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    placeholder="Search documents..."
                    className="pl-10 pr-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-teal-500 focus:border-transparent w-64"
                  />
                </div>

                {/* Status Filter */}
                <select
                  value={statusFilter}
                  onChange={(e) =>
                    setStatusFilter(e.target.value as ExpiryStatus | 'all')
                  }
                  className="px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-teal-500 focus:border-transparent"
                >
                  <option value="all">All Status</option>
                  {Object.entries(EXPIRY_STATUS_CONFIG).map(([key, config]) => (
                    <option key={key} value={key}>
                      {config.label}
                    </option>
                  ))}
                </select>

                {/* Type Filter */}
                <select
                  value={typeFilter}
                  onChange={(e) =>
                    setTypeFilter(e.target.value as DocumentType | 'all')
                  }
                  className="px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-teal-500 focus:border-transparent"
                >
                  <option value="all">All Types</option>
                  {Object.entries(DOCUMENT_TYPES).map(([key, config]) => (
                    <option key={key} value={key}>
                      {config.icon} {config.label}
                    </option>
                  ))}
                </select>

                {/* Employee Filter */}
                <select
                  value={employeeFilter}
                  onChange={(e) => setEmployeeFilter(e.target.value)}
                  className="px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-teal-500 focus:border-transparent"
                >
                  <option value="all">All Employees</option>
                  {mockEmployees.map((emp) => (
                    <option key={emp.id} value={emp.id}>
                      {emp.personalInfo.firstName} {emp.personalInfo.lastName}
                    </option>
                  ))}
                </select>
              </div>

              <div className="flex items-center gap-3">
                {/* Sort Direction */}
                <button
                  onClick={() =>
                    setSortDirection((prev) => (prev === 'asc' ? 'desc' : 'asc'))
                  }
                  className="px-3 py-2 border border-gray-300 rounded-lg text-sm text-gray-700 hover:bg-gray-50"
                >
                  {sortDirection === 'asc' ? 'Nearest First' : 'Furthest First'}
                </button>

                {/* Export */}
                <button
                  onClick={handleExport}
                  className="flex items-center gap-2 px-3 py-2 border border-gray-300 rounded-lg text-sm text-gray-700 hover:bg-gray-50"
                >
                  <Download size={16} />
                  Export
                </button>

                {/* Notification Settings */}
                <button
                  onClick={() => setShowNotificationSettings(!showNotificationSettings)}
                  className={`p-2 rounded-lg border transition-colors ${
                    showNotificationSettings
                      ? 'bg-teal-50 border-teal-200 text-teal-600'
                      : 'border-gray-300 text-gray-500 hover:bg-gray-50'
                  }`}
                >
                  <Bell size={18} />
                </button>

                {/* View Mode */}
                <div className="flex items-center bg-gray-100 rounded-lg p-1">
                  <button
                    onClick={() => setViewMode('grid')}
                    className={`p-2 rounded-md transition-colors ${
                      viewMode === 'grid'
                        ? 'bg-white shadow text-teal-600'
                        : 'text-gray-500'
                    }`}
                  >
                    <Grid3X3 size={18} />
                  </button>
                  <button
                    onClick={() => setViewMode('list')}
                    className={`p-2 rounded-md transition-colors ${
                      viewMode === 'list'
                        ? 'bg-white shadow text-teal-600'
                        : 'text-gray-500'
                    }`}
                  >
                    <List size={18} />
                  </button>
                  <button
                    onClick={() => setViewMode('calendar')}
                    className={`p-2 rounded-md transition-colors ${
                      viewMode === 'calendar'
                        ? 'bg-white shadow text-teal-600'
                        : 'text-gray-500'
                    }`}
                  >
                    <Calendar size={18} />
                  </button>
                </div>
              </div>
            </div>

            {/* Notification Settings Panel */}
            {showNotificationSettings && (
              <div className="mt-4 pt-4 border-t border-gray-100">
                <h4 className="font-medium text-gray-900 mb-3 flex items-center gap-2">
                  <Bell size={16} />
                  Notification Preferences
                </h4>
                <div className="flex flex-wrap items-center gap-4">
                  <label className="flex items-center gap-2">
                    <input
                      type="checkbox"
                      defaultChecked
                      className="rounded border-gray-300 text-teal-600 focus:ring-teal-500"
                    />
                    <span className="text-sm text-gray-700">Email notifications</span>
                  </label>
                  <div className="flex items-center gap-2 text-sm text-gray-600">
                    <span>Alert days before expiry:</span>
                    {[90, 60, 30, 7].map((days) => (
                      <label
                        key={days}
                        className="flex items-center gap-1 px-2 py-1 bg-gray-100 rounded"
                      >
                        <input
                          type="checkbox"
                          checked={notificationDays.includes(days)}
                          onChange={(e) => {
                            if (e.target.checked) {
                              setNotificationDays([...notificationDays, days].sort((a, b) => b - a));
                            } else {
                              setNotificationDays(notificationDays.filter((d) => d !== days));
                            }
                          }}
                          className="rounded border-gray-300 text-teal-600 focus:ring-teal-500"
                        />
                        <span>{days}d</span>
                      </label>
                    ))}
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* Documents Display */}
          {viewMode === 'calendar' ? (
            <DocumentCalendarView
              documents={filteredDocuments}
              employees={mockEmployees}
              onDocumentClick={(doc) => setRenewalDoc(doc)}
            />
          ) : viewMode === 'grid' ? (
            <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
              {filteredDocuments.map((doc, index) => (
                <div
                  key={doc.id}
                  style={{ animationDelay: `${index * 30}ms` }}
                  className="animate-fade-in"
                >
                  <DocumentCard
                    document={doc}
                    employee={getEmployee(doc.employeeId)}
                    onRenew={(d) => setRenewalDoc(d)}
                  />
                </div>
              ))}
            </div>
          ) : (
            /* List View */
            <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
              <table className="w-full">
                <thead className="bg-gray-50 border-b border-gray-200">
                  <tr>
                    <th className="text-left px-4 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wide">
                      Document
                    </th>
                    <th className="text-left px-4 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wide">
                      Employee
                    </th>
                    <th className="text-left px-4 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wide">
                      Number
                    </th>
                    <th className="text-left px-4 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wide">
                      Expiry Date
                    </th>
                    <th className="text-left px-4 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wide">
                      Status
                    </th>
                    <th className="text-right px-4 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wide">
                      Actions
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100">
                  {filteredDocuments.map((doc) => {
                    const employee = getEmployee(doc.employeeId);
                    const daysRemaining = calculateDaysRemaining(doc.expiryDate);
                    const status = getExpiryStatus(daysRemaining);
                    const statusConfig = EXPIRY_STATUS_CONFIG[status];
                    const docType = DOCUMENT_TYPES[doc.documentType];

                    return (
                      <tr key={doc.id} className="hover:bg-gray-50">
                        <td className="px-4 py-3">
                          <div className="flex items-center gap-2">
                            <span className="text-lg">{docType.icon}</span>
                            <span className="font-medium text-gray-900">
                              {docType.label}
                            </span>
                          </div>
                        </td>
                        <td className="px-4 py-3 text-sm text-gray-600">
                          {employee
                            ? `${employee.personalInfo.firstName} ${employee.personalInfo.lastName}`
                            : 'Company'}
                        </td>
                        <td className="px-4 py-3 text-sm text-gray-600">
                          {doc.documentNumber}
                        </td>
                        <td className="px-4 py-3 text-sm text-gray-600">
                          {formatDate(doc.expiryDate)}
                        </td>
                        <td className="px-4 py-3">
                          <span
                            className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${statusConfig.bgColor} ${statusConfig.textColor}`}
                          >
                            {daysRemaining < 0
                              ? `Expired ${Math.abs(daysRemaining)}d ago`
                              : `${daysRemaining}d remaining`}
                          </span>
                        </td>
                        <td className="px-4 py-3 text-right">
                          <button
                            onClick={() => setRenewalDoc(doc)}
                            className="text-teal-600 hover:text-teal-700 text-sm font-medium"
                          >
                            Renew
                          </button>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          )}

          {/* Empty State */}
          {filteredDocuments.length === 0 && (
            <div className="bg-white rounded-xl border border-gray-200 p-12 text-center">
              <FileText size={48} className="mx-auto text-gray-300 mb-4" />
              <h3 className="font-display font-semibold text-gray-900 mb-2">
                No documents found
              </h3>
              <p className="text-gray-500">
                Try adjusting your filters or search query.
              </p>
            </div>
          )}

          {/* Alert Thresholds Reference */}
          <div className="mt-6 bg-gradient-to-r from-teal-50 to-amber-50 rounded-xl border border-teal-200 p-4">
            <div className="flex items-start gap-3">
              <Info size={20} className="text-teal-600 mt-0.5" />
              <div>
                <h4 className="font-display font-semibold text-teal-900 mb-2">
                  Document Expiry Alert Thresholds
                </h4>
                <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-3 text-sm">
                  <div className="flex items-center gap-2">
                    <div className="w-3 h-3 rounded-full bg-emerald-500" />
                    <span className="text-gray-700">&gt;90 days (Valid)</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <div className="w-3 h-3 rounded-full bg-yellow-500" />
                    <span className="text-gray-700">60-90 days (Info)</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <div className="w-3 h-3 rounded-full bg-amber-500" />
                    <span className="text-gray-700">30-60 days (Warning)</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <div className="w-3 h-3 rounded-full bg-orange-500" />
                    <span className="text-gray-700">7-30 days (Urgent)</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <div className="w-3 h-3 rounded-full bg-red-500" />
                    <span className="text-gray-700">&lt;7 days (Critical)</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <div className="w-3 h-3 rounded-full bg-gray-500" />
                    <span className="text-gray-700">Expired</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </main>

      {/* Renewal Modal */}
      {renewalDoc && (
        <DocumentRenewalModal
          document={renewalDoc}
          onClose={() => setRenewalDoc(null)}
          onSubmit={handleRenewal}
        />
      )}
    </div>
  );
}
