'use client';

import { useState, useMemo } from 'react';
import Sidebar from '@/components/Sidebar';
import Header from '@/components/Header';
import StatsCard from '@/components/StatsCard';
import OvertimeEntryForm, { OvertimeFormData } from '@/components/OvertimeEntryForm';
import OvertimeSummaryCard from '@/components/OvertimeSummaryCard';
import OvertimeTable from '@/components/OvertimeTable';
import { mockEmployees } from '@/lib/data';
import {
  mockOvertimeEntries,
  calculateMonthlySummary,
  createOvertimeEntry,
  calculateHourlyRate,
  formatCurrency,
  getMonthName,
} from '@/lib/overtimeCalculator';
import {
  OvertimeEntry,
  UAE_OVERTIME_LAW,
  UAE_PUBLIC_HOLIDAYS_2025,
} from '@/types/overtime';
import {
  Clock,
  Plus,
  Filter,
  Moon,
  Sun,
  Star,
  Calendar,
  DollarSign,
  Users,
  AlertCircle,
  Info,
} from 'lucide-react';

export default function OvertimePage() {
  const [entries, setEntries] = useState<OvertimeEntry[]>(mockOvertimeEntries);
  const [showEntryForm, setShowEntryForm] = useState(false);
  const [isRamadan, setIsRamadan] = useState(false);
  const [selectedMonth, setSelectedMonth] = useState(new Date().getMonth());
  const [selectedYear, setSelectedYear] = useState(new Date().getFullYear());
  const [filterEmployee, setFilterEmployee] = useState<string>('all');

  // Filter entries by month and employee
  const filteredEntries = useMemo(() => {
    return entries.filter((entry) => {
      const entryDate = new Date(entry.date);
      const matchesMonth =
        entryDate.getMonth() === selectedMonth && entryDate.getFullYear() === selectedYear;
      const matchesEmployee =
        filterEmployee === 'all' || entry.employeeId === filterEmployee;
      return matchesMonth && matchesEmployee;
    });
  }, [entries, selectedMonth, selectedYear, filterEmployee]);

  // Calculate stats
  const stats = useMemo(() => {
    const totalHours = filteredEntries.reduce((sum, e) => sum + e.hours, 0);
    const totalAmount = filteredEntries.reduce((sum, e) => sum + e.amount, 0);
    const uniqueEmployees = new Set(filteredEntries.map((e) => e.employeeId)).size;
    const holidayHours = filteredEntries
      .filter((e) => e.overtimeType === 'holiday')
      .reduce((sum, e) => sum + e.hours, 0);

    return { totalHours, totalAmount, uniqueEmployees, holidayHours };
  }, [filteredEntries]);

  // Calculate summaries per employee
  const employeeSummaries = useMemo(() => {
    const summaries = mockEmployees.map((emp) => ({
      employee: emp,
      summary: calculateMonthlySummary(entries, emp.id, selectedMonth, selectedYear),
    }));
    return summaries.filter((s) => s.summary.totalHours > 0);
  }, [entries, selectedMonth, selectedYear]);

  const handleAddEntry = (formData: OvertimeFormData) => {
    const employee = mockEmployees.find((e) => e.id === formData.employeeId);
    if (!employee) return;

    const entryData = createOvertimeEntry(
      formData.employeeId,
      employee.compensation.basicSalary,
      formData.date,
      formData.startTime,
      formData.endTime,
      formData.overtimeType,
      formData.notes
    );

    const newEntry: OvertimeEntry = {
      ...entryData,
      id: `OT-${String(entries.length + 1).padStart(3, '0')}`,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    setEntries([newEntry, ...entries]);
    setShowEntryForm(false);
  };

  const handleDeleteEntry = (id: string) => {
    setEntries(entries.filter((e) => e.id !== id));
  };

  // Generate month options
  const months = Array.from({ length: 12 }, (_, i) => ({
    value: i,
    label: getMonthName(i),
  }));

  return (
    <div className="flex min-h-screen bg-stone-50">
      <Sidebar />

      <main className="flex-1 ml-0 md:ml-64 transition-all duration-300">
        <Header
          title="Overtime Tracking"
          subtitle="UAE Federal Decree-Law No. 33/2021, Articles 17-19"
        />

        <div className="p-6">
          {/* Stats Row */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
            <StatsCard
              title="Total OT Hours"
              value={`${stats.totalHours.toFixed(1)}h`}
              icon={<Clock size={24} />}
              color="teal"
            />
            <StatsCard
              title="Total OT Cost"
              value={formatCurrency(stats.totalAmount)}
              icon={<DollarSign size={24} />}
              color="emerald"
            />
            <StatsCard
              title="Employees with OT"
              value={stats.uniqueEmployees}
              icon={<Users size={24} />}
              color="blue"
            />
            <StatsCard
              title="Holiday Hours"
              value={`${stats.holidayHours.toFixed(1)}h`}
              icon={<Star size={24} />}
              color="amber"
            />
          </div>

          {/* Actions Bar */}
          <div className="bg-white rounded-xl border border-gray-200 p-4 mb-6">
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
              <div className="flex items-center gap-3">
                <button
                  data-tour="add-overtime"
                  onClick={() => setShowEntryForm(true)}
                  className="btn btn-primary flex items-center gap-2"
                >
                  <Plus size={18} />
                  Log Overtime
                </button>

                {/* Ramadan Toggle */}
                <div data-tour="ramadan-toggle" className="flex items-center gap-2 px-3 py-2 bg-gray-100 rounded-lg">
                  <Moon size={16} className={isRamadan ? 'text-purple-600' : 'text-gray-400'} />
                  <label className="relative inline-flex items-center cursor-pointer">
                    <input
                      type="checkbox"
                      checked={isRamadan}
                      onChange={(e) => setIsRamadan(e.target.checked)}
                      className="sr-only peer"
                    />
                    <div className="w-9 h-5 bg-gray-300 peer-focus:ring-2 peer-focus:ring-purple-500 rounded-full peer peer-checked:after:translate-x-full after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:rounded-full after:h-4 after:w-4 after:transition-all peer-checked:bg-purple-600"></div>
                  </label>
                  <span className="text-sm text-gray-600">
                    Ramadan {isRamadan ? '(6h/day)' : '(Off)'}
                  </span>
                </div>
              </div>

              <div className="flex items-center gap-3 flex-wrap">
                {/* Month Selector */}
                <div className="flex items-center gap-2">
                  <Calendar size={16} className="text-gray-400" />
                  <select
                    value={selectedMonth}
                    onChange={(e) => setSelectedMonth(parseInt(e.target.value))}
                    className="px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-teal-500 focus:border-transparent"
                  >
                    {months.map((month) => (
                      <option key={month.value} value={month.value}>
                        {month.label}
                      </option>
                    ))}
                  </select>
                  <select
                    value={selectedYear}
                    onChange={(e) => setSelectedYear(parseInt(e.target.value))}
                    className="px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-teal-500 focus:border-transparent"
                  >
                    <option value={2024}>2024</option>
                    <option value={2025}>2025</option>
                  </select>
                </div>

                {/* Employee Filter */}
                <div className="flex items-center gap-2">
                  <Filter size={16} className="text-gray-400" />
                  <select
                    value={filterEmployee}
                    onChange={(e) => setFilterEmployee(e.target.value)}
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
              </div>
            </div>
          </div>

          {/* Main Content Grid */}
          <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">
            {/* Overtime Table */}
            <div data-tour="overtime-table" className="xl:col-span-2">
              <OvertimeTable
                entries={filteredEntries}
                employees={mockEmployees}
                onDelete={handleDeleteEntry}
                showEmployee={filterEmployee === 'all'}
              />
            </div>

            {/* Summaries Sidebar */}
            <div className="space-y-4">
              <h3 className="font-display font-semibold text-gray-900">
                {getMonthName(selectedMonth)} Summary
              </h3>

              {employeeSummaries.length > 0 ? (
                employeeSummaries.map(({ employee, summary }) => (
                  <OvertimeSummaryCard
                    key={employee.id}
                    summary={summary}
                    employeeName={`${employee.personalInfo.firstName} ${employee.personalInfo.lastName}`}
                  />
                ))
              ) : (
                <div className="bg-white rounded-xl border border-gray-200 p-6 text-center">
                  <Clock size={32} className="mx-auto text-gray-300 mb-3" />
                  <p className="text-sm text-gray-500">
                    No overtime logged for {getMonthName(selectedMonth)} {selectedYear}
                  </p>
                </div>
              )}

              {/* Public Holidays Card */}
              <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
                <div className="p-3 border-b border-gray-100 bg-rose-50">
                  <div className="flex items-center gap-2">
                    <Star size={16} className="text-rose-600" />
                    <h4 className="font-medium text-gray-900 text-sm">UAE Public Holidays 2025</h4>
                  </div>
                </div>
                <div className="p-3 space-y-2 max-h-64 overflow-y-auto">
                  {UAE_PUBLIC_HOLIDAYS_2025.map((holiday, index) => (
                    <div
                      key={index}
                      className="flex items-center justify-between text-sm py-1 border-b border-gray-50 last:border-0"
                    >
                      <span className="text-gray-900">{holiday.name}</span>
                      <span className="text-gray-500 text-xs">
                        {new Date(holiday.date).toLocaleDateString('en-AE', {
                          month: 'short',
                          day: 'numeric',
                        })}
                        {holiday.endDate && (
                          <>
                            {' - '}
                            {new Date(holiday.endDate).toLocaleDateString('en-AE', {
                              month: 'short',
                              day: 'numeric',
                            })}
                          </>
                        )}
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>

          {/* UAE Law Reference */}
          <div className="mt-6 bg-gradient-to-r from-teal-50 to-amber-50 rounded-xl border border-teal-200 p-4">
            <div className="flex items-start gap-3">
              <Info size={20} className="text-teal-600 mt-0.5" />
              <div>
                <h4 className="font-display font-semibold text-teal-900 mb-2">
                  UAE Overtime Law - Articles 17-19, Federal Decree-Law No. 33/2021
                </h4>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 text-sm">
                  <div>
                    <span className="font-medium text-gray-700">Working Hours:</span>
                    <p className="text-gray-600">8h/day (6h during Ramadan)</p>
                    <p className="text-gray-500 text-xs">Max 2h overtime/day</p>
                  </div>
                  <div>
                    <span className="font-medium text-gray-700">Regular OT (1.25×):</span>
                    <p className="text-gray-600">Basic hourly + 25%</p>
                  </div>
                  <div>
                    <span className="font-medium text-gray-700">Night/Friday (1.50×):</span>
                    <p className="text-gray-600">Basic hourly + 50%</p>
                    <p className="text-gray-500 text-xs">Night: 10PM-4AM</p>
                  </div>
                  <div>
                    <span className="font-medium text-gray-700">Holiday (2.50×):</span>
                    <p className="text-gray-600">Basic hourly + 150%</p>
                  </div>
                </div>
                <p className="text-xs text-gray-500 mt-3">
                  Formula: Hourly Rate = (Basic Salary × 12) ÷ 365 ÷ 8
                </p>
              </div>
            </div>
          </div>
        </div>
      </main>

      {/* Entry Form Modal */}
      {showEntryForm && (
        <OvertimeEntryForm
          employees={mockEmployees}
          onClose={() => setShowEntryForm(false)}
          onSubmit={handleAddEntry}
          isRamadan={isRamadan}
        />
      )}
    </div>
  );
}
