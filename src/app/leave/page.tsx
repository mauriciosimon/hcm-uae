'use client';

import { useState } from 'react';
import Sidebar from '@/components/Sidebar';
import Header from '@/components/Header';
import StatsCard from '@/components/StatsCard';
import LeaveBalanceCard from '@/components/LeaveBalanceCard';
import LeaveRequestForm, { LeaveRequestFormData } from '@/components/LeaveRequestForm';
import LeaveRequestCard from '@/components/LeaveRequestCard';
import { mockEmployees } from '@/lib/data';
import { mockLeaveRequests, calculateLeaveBalance, calculateBusinessDays } from '@/lib/leaveData';
import { LeaveRequest, LeaveStatus } from '@/types/leave';
import { Employee } from '@/types/employee';
import {
  Calendar,
  Clock,
  CheckCircle,
  XCircle,
  Plus,
  Filter,
  Users,
} from 'lucide-react';

export default function LeavePage() {
  const [leaveRequests, setLeaveRequests] = useState<LeaveRequest[]>(mockLeaveRequests);
  const [showRequestForm, setShowRequestForm] = useState(false);
  const [selectedEmployee, setSelectedEmployee] = useState<Employee>(mockEmployees[0]);
  const [filterStatus, setFilterStatus] = useState<LeaveStatus | 'all'>('all');
  const [viewMode, setViewMode] = useState<'my-leaves' | 'team-requests'>('my-leaves');

  // Calculate stats
  const pendingRequests = leaveRequests.filter((r) => r.status === 'pending').length;
  const approvedThisMonth = leaveRequests.filter((r) => {
    const approvedDate = r.approvedAt ? new Date(r.approvedAt) : null;
    const now = new Date();
    return (
      r.status === 'approved' &&
      approvedDate &&
      approvedDate.getMonth() === now.getMonth() &&
      approvedDate.getFullYear() === now.getFullYear()
    );
  }).length;
  const employeesOnLeave = new Set(
    leaveRequests
      .filter((r) => {
        const start = new Date(r.startDate);
        const end = new Date(r.endDate);
        const today = new Date();
        return r.status === 'approved' && today >= start && today <= end;
      })
      .map((r) => r.employeeId)
  ).size;

  // Calculate leave balance for selected employee
  const balance = calculateLeaveBalance(selectedEmployee, leaveRequests);

  // Filter requests
  const filteredRequests =
    filterStatus === 'all'
      ? leaveRequests
      : leaveRequests.filter((r) => r.status === filterStatus);

  const myRequests = filteredRequests.filter((r) => r.employeeId === selectedEmployee.id);
  const teamRequests = filteredRequests.filter((r) => r.employeeId !== selectedEmployee.id);

  const handleSubmitRequest = (data: LeaveRequestFormData) => {
    const newRequest: LeaveRequest = {
      id: `LR-${String(leaveRequests.length + 1).padStart(3, '0')}`,
      employeeId: selectedEmployee.id,
      leaveType: data.leaveType,
      startDate: data.startDate,
      endDate: data.endDate,
      totalDays: calculateBusinessDays(data.startDate, data.endDate),
      reason: data.reason,
      status: 'pending',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };
    setLeaveRequests([newRequest, ...leaveRequests]);
    setShowRequestForm(false);
  };

  const handleApprove = (id: string) => {
    setLeaveRequests(
      leaveRequests.map((r) =>
        r.id === id
          ? {
              ...r,
              status: 'approved' as LeaveStatus,
              approvedBy: selectedEmployee.personalInfo.firstName,
              approvedAt: new Date().toISOString(),
              updatedAt: new Date().toISOString(),
            }
          : r
      )
    );
  };

  const handleReject = (id: string) => {
    setLeaveRequests(
      leaveRequests.map((r) =>
        r.id === id
          ? {
              ...r,
              status: 'rejected' as LeaveStatus,
              rejectionReason: 'Request declined',
              updatedAt: new Date().toISOString(),
            }
          : r
      )
    );
  };

  return (
    <div className="flex min-h-screen bg-stone-50">
      <Sidebar />

      <main className="flex-1 ml-64 transition-all duration-300">
        <Header
          title="Leave Management"
          subtitle="UAE Labor Law Compliant Leave Tracking"
        />

        <div className="p-6">
          {/* Stats Row */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
            <StatsCard
              title="Pending Requests"
              value={pendingRequests}
              icon={<Clock size={24} />}
              color="amber"
            />
            <StatsCard
              title="Approved This Month"
              value={approvedThisMonth}
              icon={<CheckCircle size={24} />}
              color="emerald"
            />
            <StatsCard
              title="Employees on Leave"
              value={employeesOnLeave}
              icon={<Users size={24} />}
              color="teal"
            />
            <StatsCard
              title="My Available Days"
              value={balance.annual.available}
              icon={<Calendar size={24} />}
              color="blue"
            />
          </div>

          {/* Actions Bar */}
          <div className="bg-white rounded-xl border border-gray-200 p-4 mb-6">
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
              <div className="flex items-center gap-3">
                <button
                  data-tour="request-leave"
                  onClick={() => setShowRequestForm(true)}
                  className="btn btn-primary flex items-center gap-2"
                >
                  <Plus size={18} />
                  Request Leave
                </button>

                {/* View Toggle */}
                <div data-tour="leave-tabs" className="flex items-center bg-gray-100 rounded-lg p-1">
                  <button
                    onClick={() => setViewMode('my-leaves')}
                    className={`px-3 py-1.5 rounded-md text-sm font-medium transition-colors ${
                      viewMode === 'my-leaves'
                        ? 'bg-white shadow text-teal-600'
                        : 'text-gray-500'
                    }`}
                  >
                    My Leaves
                  </button>
                  <button
                    onClick={() => setViewMode('team-requests')}
                    className={`px-3 py-1.5 rounded-md text-sm font-medium transition-colors ${
                      viewMode === 'team-requests'
                        ? 'bg-white shadow text-teal-600'
                        : 'text-gray-500'
                    }`}
                  >
                    Team Requests
                  </button>
                </div>
              </div>

              <div className="flex items-center gap-3">
                {/* Employee Selector */}
                <select
                  value={selectedEmployee.id}
                  onChange={(e) => {
                    const emp = mockEmployees.find((emp) => emp.id === e.target.value);
                    if (emp) setSelectedEmployee(emp);
                  }}
                  className="px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-teal-500 focus:border-transparent"
                >
                  {mockEmployees.map((emp) => (
                    <option key={emp.id} value={emp.id}>
                      {emp.personalInfo.firstName} {emp.personalInfo.lastName}
                    </option>
                  ))}
                </select>

                {/* Status Filter */}
                <div className="flex items-center gap-2">
                  <Filter size={16} className="text-gray-400" />
                  <select
                    value={filterStatus}
                    onChange={(e) => setFilterStatus(e.target.value as LeaveStatus | 'all')}
                    className="px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-teal-500 focus:border-transparent"
                  >
                    <option value="all">All Status</option>
                    <option value="pending">Pending</option>
                    <option value="approved">Approved</option>
                    <option value="rejected">Rejected</option>
                  </select>
                </div>
              </div>
            </div>
          </div>

          {/* Main Content */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Leave Balance Sidebar */}
            <div data-tour="leave-balance" className="lg:col-span-1">
              <LeaveBalanceCard
                balance={balance}
                gender={selectedEmployee.personalInfo.gender}
              />
            </div>

            {/* Leave Requests */}
            <div data-tour="leave-list" className="lg:col-span-2">
              <div className="bg-white rounded-xl border border-gray-200 p-4">
                <h3 className="font-display font-semibold text-gray-900 mb-4">
                  {viewMode === 'my-leaves' ? 'My Leave Requests' : 'Team Leave Requests'}
                </h3>

                {viewMode === 'my-leaves' ? (
                  myRequests.length > 0 ? (
                    <div className="grid gap-4">
                      {myRequests.map((request, index) => (
                        <div
                          key={request.id}
                          style={{ animationDelay: `${index * 50}ms` }}
                          className="animate-fade-in"
                        >
                          <LeaveRequestCard request={request} />
                        </div>
                      ))}
                    </div>
                  ) : (
                    <div className="text-center py-12">
                      <Calendar size={48} className="mx-auto text-gray-300 mb-4" />
                      <h4 className="font-medium text-gray-900 mb-2">No leave requests</h4>
                      <p className="text-sm text-gray-500 mb-4">
                        You haven't submitted any leave requests yet.
                      </p>
                      <button
                        onClick={() => setShowRequestForm(true)}
                        className="btn btn-primary"
                      >
                        Request Leave
                      </button>
                    </div>
                  )
                ) : teamRequests.length > 0 ? (
                  <div className="grid gap-4">
                    {teamRequests.map((request, index) => {
                      const employee = mockEmployees.find((e) => e.id === request.employeeId);
                      return (
                        <div
                          key={request.id}
                          style={{ animationDelay: `${index * 50}ms` }}
                          className="animate-fade-in"
                        >
                          <LeaveRequestCard
                            request={request}
                            employee={employee}
                            showActions={request.status === 'pending'}
                            onApprove={handleApprove}
                            onReject={handleReject}
                          />
                        </div>
                      );
                    })}
                  </div>
                ) : (
                  <div className="text-center py-12">
                    <Users size={48} className="mx-auto text-gray-300 mb-4" />
                    <h4 className="font-medium text-gray-900 mb-2">No team requests</h4>
                    <p className="text-sm text-gray-500">
                      There are no leave requests from team members.
                    </p>
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* UAE Policy Reference */}
          <div className="mt-6 bg-gradient-to-r from-teal-50 to-amber-50 rounded-xl border border-teal-200 p-4">
            <h4 className="font-display font-semibold text-teal-900 mb-2">
              UAE Labor Law - Leave Entitlements
            </h4>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 text-sm">
              <div>
                <span className="font-medium text-gray-700">Annual Leave:</span>
                <p className="text-gray-600">30 days/year after 1 year service</p>
                <p className="text-gray-500 text-xs">2 days/month after 6 months</p>
              </div>
              <div>
                <span className="font-medium text-gray-700">Sick Leave:</span>
                <p className="text-gray-600">15 days full → 30 days half → 45 days unpaid</p>
              </div>
              <div>
                <span className="font-medium text-gray-700">Maternity Leave:</span>
                <p className="text-gray-600">45 days full pay + 15 days half pay</p>
              </div>
              <div>
                <span className="font-medium text-gray-700">Paternity Leave:</span>
                <p className="text-gray-600">5 days paid leave</p>
              </div>
            </div>
          </div>
        </div>
      </main>

      {/* Request Form Modal */}
      {showRequestForm && (
        <LeaveRequestForm
          onClose={() => setShowRequestForm(false)}
          onSubmit={handleSubmitRequest}
          balance={balance}
          gender={selectedEmployee.personalInfo.gender}
        />
      )}

    </div>
  );
}
