'use client';

import { useState } from 'react';
import Sidebar from '@/components/Sidebar';
import Header from '@/components/Header';
import EmployeeCard from '@/components/EmployeeCard';
import StatsCard from '@/components/StatsCard';
import EmployeeDetailModal from '@/components/EmployeeDetailModal';
import AddEmployeeForm from '@/components/AddEmployeeForm';
import { mockEmployees, formatCurrency } from '@/lib/data';
import { Employee } from '@/types/employee';
import {
  Users,
  UserCheck,
  AlertTriangle,
  DollarSign,
  Plus,
  Filter,
  Download,
  Grid3X3,
  List,
  Search
} from 'lucide-react';

export default function EmployeesPage() {
  const [employees, setEmployees] = useState<Employee[]>(mockEmployees);
  const [selectedEmployee, setSelectedEmployee] = useState<Employee | null>(null);
  const [showAddForm, setShowAddForm] = useState(false);
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
  const [filterDepartment, setFilterDepartment] = useState<string>('all');

  // Calculate stats
  const totalEmployees = employees.length;
  const activeEmployees = employees.filter(e => e.employmentInfo.employmentStatus === 'active').length;
  const expiringDocs = employees.filter(e => {
    const visaExpiry = e.documents.visaExpiry ? new Date(e.documents.visaExpiry) : null;
    const today = new Date();
    const thirtyDaysFromNow = new Date(today.getTime() + 30 * 24 * 60 * 60 * 1000);
    return visaExpiry && visaExpiry <= thirtyDaysFromNow;
  }).length;
  const totalPayroll = employees.reduce((sum, e) => sum + e.compensation.totalPackage, 0);

  // Get unique departments
  const departments = ['all', ...Array.from(new Set(employees.map(e => e.employmentInfo.department)))];

  // Filter employees
  const filteredEmployees = filterDepartment === 'all'
    ? employees
    : employees.filter(e => e.employmentInfo.department === filterDepartment);

  const handleAddEmployee = (data: any) => {
    console.log('New employee data:', data);
    setShowAddForm(false);
  };

  return (
    <div className="flex min-h-screen bg-stone-50">
      <Sidebar />

      <main className="flex-1 ml-64 transition-all duration-300">
        <Header
          title="Employee Management"
          subtitle={`${totalEmployees} employees in your organization`}
        />

        <div className="p-6">
          {/* Stats Row */}
          <div data-tour="stats-cards" className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
            <StatsCard
              title="Total Employees"
              value={totalEmployees}
              icon={<Users size={24} />}
              color="teal"
              change={{ value: 12, type: 'increase' }}
            />
            <StatsCard
              title="Active Employees"
              value={activeEmployees}
              icon={<UserCheck size={24} />}
              color="emerald"
            />
            <StatsCard
              title="Expiring Documents"
              value={expiringDocs}
              icon={<AlertTriangle size={24} />}
              color="amber"
            />
            <StatsCard
              title="Monthly Payroll"
              value={formatCurrency(totalPayroll)}
              icon={<DollarSign size={24} />}
              color="blue"
            />
          </div>

          {/* Actions Bar */}
          <div className="bg-white rounded-xl border border-gray-200 p-4 mb-6">
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
              <div className="flex items-center gap-3">
                <button
                  data-tour="add-employee"
                  onClick={() => setShowAddForm(true)}
                  className="btn btn-primary flex items-center gap-2"
                >
                  <Plus size={18} />
                  Add Employee
                </button>
                <button className="btn btn-secondary flex items-center gap-2">
                  <Download size={18} />
                  Export
                </button>
              </div>

              <div className="flex items-center gap-3">
                {/* Search Input */}
                <div data-tour="employee-search" className="relative">
                  <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                  <input
                    type="text"
                    placeholder="Search..."
                    className="pl-9 pr-3 py-2 w-40 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-teal-500 focus:border-transparent"
                  />
                </div>

                {/* Department Filter */}
                <div data-tour="department-filter" className="flex items-center gap-2">
                  <Filter size={16} className="text-gray-400" />
                  <select
                    value={filterDepartment}
                    onChange={(e) => setFilterDepartment(e.target.value)}
                    className="px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-teal-500 focus:border-transparent"
                  >
                    {departments.map(dept => (
                      <option key={dept} value={dept}>
                        {dept === 'all' ? 'All Departments' : dept}
                      </option>
                    ))}
                  </select>
                </div>

                {/* View Toggle */}
                <div data-tour="view-toggle" className="flex items-center bg-gray-100 rounded-lg p-1">
                  <button
                    onClick={() => setViewMode('grid')}
                    className={`p-2 rounded-md transition-colors ${
                      viewMode === 'grid' ? 'bg-white shadow text-teal-600' : 'text-gray-500'
                    }`}
                  >
                    <Grid3X3 size={18} />
                  </button>
                  <button
                    onClick={() => setViewMode('list')}
                    className={`p-2 rounded-md transition-colors ${
                      viewMode === 'list' ? 'bg-white shadow text-teal-600' : 'text-gray-500'
                    }`}
                  >
                    <List size={18} />
                  </button>
                </div>
              </div>
            </div>
          </div>

          {/* Employee Grid/List */}
          {viewMode === 'grid' ? (
            <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
              {filteredEmployees.map((employee, index) => (
                <div
                  key={employee.id}
                  style={{ animationDelay: `${index * 50}ms` }}
                  className="animate-fade-in"
                  {...(index === 0 ? { 'data-tour': 'employee-card' } : {})}
                >
                  <EmployeeCard
                    employee={employee}
                    onView={(emp) => setSelectedEmployee(emp)}
                    onEdit={(emp) => console.log('Edit:', emp)}
                  />
                </div>
              ))}
            </div>
          ) : (
            <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
              <table className="w-full">
                <thead className="bg-gray-50 border-b border-gray-200">
                  <tr>
                    <th className="text-left px-4 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wide">Employee</th>
                    <th className="text-left px-4 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wide">Department</th>
                    <th className="text-left px-4 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wide">Status</th>
                    <th className="text-left px-4 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wide">Salary</th>
                    <th className="text-left px-4 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wide">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100">
                  {filteredEmployees.map((employee) => (
                    <tr key={employee.id} className="hover:bg-gray-50">
                      <td className="px-4 py-3">
                        <div className="flex items-center gap-3">
                          <div className="w-10 h-10 bg-gradient-to-br from-teal-500 to-teal-600 rounded-lg flex items-center justify-center">
                            <span className="text-white font-medium text-sm">
                              {employee.personalInfo.firstName[0]}{employee.personalInfo.lastName[0]}
                            </span>
                          </div>
                          <div>
                            <p className="font-medium text-gray-900">
                              {employee.personalInfo.firstName} {employee.personalInfo.lastName}
                            </p>
                            <p className="text-sm text-gray-500">{employee.employmentInfo.jobTitle}</p>
                          </div>
                        </div>
                      </td>
                      <td className="px-4 py-3 text-sm text-gray-600">{employee.employmentInfo.department}</td>
                      <td className="px-4 py-3">
                        <span className={`badge ${
                          employee.employmentInfo.employmentStatus === 'active' ? 'badge-success' : 'badge-warning'
                        } capitalize`}>
                          {employee.employmentInfo.employmentStatus}
                        </span>
                      </td>
                      <td className="px-4 py-3 text-sm font-medium text-gray-900">
                        {formatCurrency(employee.compensation.totalPackage)}
                      </td>
                      <td className="px-4 py-3">
                        <button
                          onClick={() => setSelectedEmployee(employee)}
                          className="text-teal-600 hover:text-teal-800 text-sm font-medium"
                        >
                          View Details
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}

          {/* Empty State */}
          {filteredEmployees.length === 0 && (
            <div className="bg-white rounded-xl border border-gray-200 p-12 text-center">
              <Users size={48} className="mx-auto text-gray-300 mb-4" />
              <h3 className="font-display font-semibold text-gray-900 mb-2">No employees found</h3>
              <p className="text-gray-500 mb-4">
                {filterDepartment !== 'all'
                  ? `No employees in ${filterDepartment} department.`
                  : 'Get started by adding your first employee.'}
              </p>
              <button
                onClick={() => setShowAddForm(true)}
                className="btn btn-primary"
              >
                Add Employee
              </button>
            </div>
          )}
        </div>
      </main>

      {/* Modals */}
      {selectedEmployee && (
        <EmployeeDetailModal
          employee={selectedEmployee}
          onClose={() => setSelectedEmployee(null)}
          onEdit={() => console.log('Edit employee')}
        />
      )}

      {showAddForm && (
        <AddEmployeeForm
          onClose={() => setShowAddForm(false)}
          onSubmit={handleAddEmployee}
        />
      )}
    </div>
  );
}
