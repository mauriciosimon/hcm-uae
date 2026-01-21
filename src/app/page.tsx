'use client';

import { useMemo } from 'react';
import Link from 'next/link';
import Sidebar from '@/components/Sidebar';
import Header from '@/components/Header';
import StatsCard from '@/components/StatsCard';
import { useTour } from '@/contexts/TourContext';
import { mockEmployees, formatCurrency, calculateYearsOfService } from '@/lib/data';
import { mockLeaveRequests } from '@/lib/leaveData';
import { mockOvertimeEntries, calculateMonthlySummary } from '@/lib/overtimeCalculator';
import { calculateGratuity } from '@/lib/gratuityCalculator';
import {
  PieChart,
  Pie,
  Cell,
  LineChart,
  Line,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Legend,
} from 'recharts';
import {
  Users,
  Clock,
  FileText,
  DollarSign,
  Award,
  Timer,
  Calendar,
  Settings,
  FileSpreadsheet,
  BarChart3,
  AlertTriangle,
  ChevronRight,
  Play,
  Cake,
  Briefcase,
  UserCheck,
  Home,
} from 'lucide-react';

// Color palette for charts
const CHART_COLORS = ['#0d9488', '#f59e0b', '#3b82f6', '#8b5cf6', '#ec4899', '#10b981'];

export default function DashboardPage() {
  const { setIsTourActive } = useTour();

  // Calculate key metrics
  const metrics = useMemo(() => {
    const today = new Date();
    const currentMonth = today.getMonth();
    const currentYear = today.getFullYear();
    const thirtyDaysFromNow = new Date(today.getTime() + 30 * 24 * 60 * 60 * 1000);

    // Active employees
    const activeEmployees = mockEmployees.filter(
      (e) => e.employmentInfo.employmentStatus === 'active'
    ).length;

    // Pending leave requests
    const pendingLeaveRequests = mockLeaveRequests.filter(
      (r) => r.status === 'pending'
    ).length;

    // Expiring documents (next 30 days)
    const expiringDocuments = mockEmployees.filter((e) => {
      const visaExpiry = e.documents.visaExpiry ? new Date(e.documents.visaExpiry) : null;
      const passportExpiry = e.documents.passportExpiry ? new Date(e.documents.passportExpiry) : null;
      const emiratesIdExpiry = e.documents.emiratesIdExpiry ? new Date(e.documents.emiratesIdExpiry) : null;
      return (
        (visaExpiry && visaExpiry <= thirtyDaysFromNow && visaExpiry >= today) ||
        (passportExpiry && passportExpiry <= thirtyDaysFromNow && passportExpiry >= today) ||
        (emiratesIdExpiry && emiratesIdExpiry <= thirtyDaysFromNow && emiratesIdExpiry >= today)
      );
    }).length;

    // Monthly payroll
    const monthlyPayroll = mockEmployees
      .filter((e) => e.employmentInfo.employmentStatus === 'active')
      .reduce((sum, e) => sum + e.compensation.totalPackage, 0);

    // Total gratuity liability
    const gratuityLiability = mockEmployees
      .filter((e) => calculateYearsOfService(e.employmentInfo.employmentStartDate) >= 1)
      .reduce((sum, e) => {
        const result = calculateGratuity({
          basicSalary: e.compensation.basicSalary,
          employmentStartDate: e.employmentInfo.employmentStartDate,
          employmentEndDate: new Date().toISOString().split('T')[0],
          contractType: e.employmentInfo.contractType,
          terminationType: 'termination',
          unpaidLeaveDays: 0,
        });
        return sum + result.cappedGratuity;
      }, 0);

    // Overtime this month
    const overtimeThisMonth = mockOvertimeEntries.filter((entry) => {
      const entryDate = new Date(entry.date);
      return (
        entryDate.getMonth() === currentMonth && entryDate.getFullYear() === currentYear
      );
    });
    const overtimeHours = overtimeThisMonth.reduce((sum, e) => sum + e.hours, 0);
    const overtimeCost = overtimeThisMonth.reduce((sum, e) => sum + e.amount, 0);

    return {
      activeEmployees,
      pendingLeaveRequests,
      expiringDocuments,
      monthlyPayroll,
      gratuityLiability,
      overtimeHours,
      overtimeCost,
    };
  }, []);

  // Alerts data
  const alerts = useMemo(() => {
    const today = new Date();
    const thirtyDaysFromNow = new Date(today.getTime() + 30 * 24 * 60 * 60 * 1000);
    const sixtyDaysFromNow = new Date(today.getTime() + 60 * 24 * 60 * 60 * 1000);
    const ninetyDaysFromNow = new Date(today.getTime() + 90 * 24 * 60 * 60 * 1000);

    // Expiring documents
    const expiringDocs: { employee: string; document: string; expiryDate: string; daysLeft: number; urgency: 'critical' | 'urgent' | 'warning' }[] = [];
    mockEmployees.forEach((emp) => {
      const docs = [
        { type: 'Visa', date: emp.documents.visaExpiry },
        { type: 'Passport', date: emp.documents.passportExpiry },
        { type: 'Emirates ID', date: emp.documents.emiratesIdExpiry },
      ];
      docs.forEach((doc) => {
        if (doc.date) {
          const expiry = new Date(doc.date);
          if (expiry <= ninetyDaysFromNow && expiry >= today) {
            const daysLeft = Math.ceil((expiry.getTime() - today.getTime()) / (1000 * 60 * 60 * 24));
            let urgency: 'critical' | 'urgent' | 'warning' = 'warning';
            if (daysLeft <= 30) urgency = 'critical';
            else if (daysLeft <= 60) urgency = 'urgent';
            expiringDocs.push({
              employee: `${emp.personalInfo.firstName} ${emp.personalInfo.lastName}`,
              document: doc.type,
              expiryDate: doc.date,
              daysLeft,
              urgency,
            });
          }
        }
      });
    });
    expiringDocs.sort((a, b) => a.daysLeft - b.daysLeft);

    // Pending leave requests
    const pendingLeaves = mockLeaveRequests
      .filter((r) => r.status === 'pending')
      .map((r) => {
        const emp = mockEmployees.find((e) => e.id === r.employeeId);
        return {
          employee: emp ? `${emp.personalInfo.firstName} ${emp.personalInfo.lastName}` : 'Unknown',
          type: r.leaveType,
          dates: `${new Date(r.startDate).toLocaleDateString('en-AE', { day: 'numeric', month: 'short' })} - ${new Date(r.endDate).toLocaleDateString('en-AE', { day: 'numeric', month: 'short' })}`,
          days: r.totalDays,
        };
      });

    // Employees on leave today
    const onLeaveToday = mockLeaveRequests
      .filter((r) => {
        const start = new Date(r.startDate);
        const end = new Date(r.endDate);
        return r.status === 'approved' && today >= start && today <= end;
      })
      .map((r) => {
        const emp = mockEmployees.find((e) => e.id === r.employeeId);
        return {
          employee: emp ? `${emp.personalInfo.firstName} ${emp.personalInfo.lastName}` : 'Unknown',
          type: r.leaveType,
          returnDate: r.endDate,
        };
      });

    // Probation endings (within 30 days)
    const probationEndings = mockEmployees
      .filter((emp) => {
        if (emp.employmentInfo.probationEndDate) {
          const probEnd = new Date(emp.employmentInfo.probationEndDate);
          return probEnd >= today && probEnd <= thirtyDaysFromNow;
        }
        return false;
      })
      .map((emp) => ({
        employee: `${emp.personalInfo.firstName} ${emp.personalInfo.lastName}`,
        endDate: emp.employmentInfo.probationEndDate!,
        daysLeft: Math.ceil((new Date(emp.employmentInfo.probationEndDate!).getTime() - today.getTime()) / (1000 * 60 * 60 * 24)),
      }));

    // Birthdays this week
    const weekFromNow = new Date(today.getTime() + 7 * 24 * 60 * 60 * 1000);
    const birthdaysThisWeek = mockEmployees
      .filter((emp) => {
        const dob = new Date(emp.personalInfo.dateOfBirth);
        const birthdayThisYear = new Date(today.getFullYear(), dob.getMonth(), dob.getDate());
        return birthdayThisYear >= today && birthdayThisYear <= weekFromNow;
      })
      .map((emp) => {
        const dob = new Date(emp.personalInfo.dateOfBirth);
        const birthdayThisYear = new Date(today.getFullYear(), dob.getMonth(), dob.getDate());
        return {
          employee: `${emp.personalInfo.firstName} ${emp.personalInfo.lastName}`,
          date: birthdayThisYear.toLocaleDateString('en-AE', { weekday: 'short', month: 'short', day: 'numeric' }),
        };
      });

    return {
      expiringDocs: expiringDocs.slice(0, 5),
      pendingLeaves: pendingLeaves.slice(0, 5),
      onLeaveToday,
      probationEndings: probationEndings.slice(0, 5),
      birthdaysThisWeek,
    };
  }, []);

  // Chart data
  const chartData = useMemo(() => {
    // Headcount by department
    const deptCount: Record<string, number> = {};
    mockEmployees.forEach((emp) => {
      const dept = emp.employmentInfo.department;
      deptCount[dept] = (deptCount[dept] || 0) + 1;
    });
    const departmentData = Object.entries(deptCount).map(([name, value]) => ({
      name,
      value,
    }));

    // Payroll trend (last 6 months - simulated)
    const payrollTrend = [];
    const monthlyBase = mockEmployees
      .filter((e) => e.employmentInfo.employmentStatus === 'active')
      .reduce((sum, e) => sum + e.compensation.totalPackage, 0);
    for (let i = 5; i >= 0; i--) {
      const date = new Date();
      date.setMonth(date.getMonth() - i);
      const variance = 0.95 + Math.random() * 0.1; // +/- 5% variance
      payrollTrend.push({
        month: date.toLocaleDateString('en-AE', { month: 'short' }),
        amount: Math.round(monthlyBase * variance),
      });
    }

    // Leave utilization this month (by type)
    const currentMonth = new Date().getMonth();
    const currentYear = new Date().getFullYear();
    const leaveByType: Record<string, number> = {};
    mockLeaveRequests
      .filter((r) => {
        const start = new Date(r.startDate);
        return (
          r.status === 'approved' &&
          start.getMonth() === currentMonth &&
          start.getFullYear() === currentYear
        );
      })
      .forEach((r) => {
        const type = r.leaveType.replace('_', ' ').replace(/\b\w/g, (l) => l.toUpperCase());
        leaveByType[type] = (leaveByType[type] || 0) + r.totalDays;
      });
    const leaveData = Object.entries(leaveByType).map(([name, days]) => ({
      name,
      days,
    }));

    return { departmentData, payrollTrend, leaveData };
  }, []);

  // Quick links configuration
  const quickLinks = [
    { href: '/employees', icon: Users, label: 'Employees', color: 'bg-teal-500' },
    { href: '/leave', icon: Calendar, label: 'Leave', color: 'bg-blue-500' },
    { href: '/gratuity', icon: Award, label: 'Gratuity', color: 'bg-amber-500' },
    { href: '/overtime', icon: Timer, label: 'Overtime', color: 'bg-purple-500' },
    { href: '/documents', icon: FileText, label: 'Documents', color: 'bg-rose-500' },
    { href: '/payroll', icon: DollarSign, label: 'Payroll', color: 'bg-emerald-500' },
    { href: '/reports', icon: BarChart3, label: 'Reports', color: 'bg-indigo-500' },
    { href: '/settings', icon: Settings, label: 'Settings', color: 'bg-gray-500' },
  ];

  const handleStartTour = () => {
    setIsTourActive(true);
  };

  const getUrgencyColor = (urgency: 'critical' | 'urgent' | 'warning') => {
    switch (urgency) {
      case 'critical':
        return 'bg-red-100 text-red-700 border-red-200';
      case 'urgent':
        return 'bg-orange-100 text-orange-700 border-orange-200';
      case 'warning':
        return 'bg-yellow-100 text-yellow-700 border-yellow-200';
    }
  };

  return (
    <div className="flex min-h-screen bg-stone-50">
      <Sidebar />

      <main className="flex-1 ml-0 md:ml-64 transition-all duration-300">
        <Header title="Dashboard" subtitle="Welcome to HCM UAE">
          <button
            data-tour="start-tour-btn"
            onClick={handleStartTour}
            className="btn btn-secondary flex items-center gap-2"
          >
            <Play size={16} />
            Start Tour
          </button>
        </Header>

        <div className="p-6">
          {/* Key Metrics Row */}
          <div data-tour="dashboard-metrics" className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-4 mb-6">
            <StatsCard
              title="Active Employees"
              value={metrics.activeEmployees}
              icon={<Users size={24} />}
              color="teal"
            />
            <StatsCard
              title="Pending Leaves"
              value={metrics.pendingLeaveRequests}
              icon={<Clock size={24} />}
              color="amber"
            />
            <StatsCard
              title="Expiring Docs"
              value={metrics.expiringDocuments}
              icon={<FileText size={24} />}
              color="red"
            />
            <StatsCard
              title="Monthly Payroll"
              value={formatCurrency(metrics.monthlyPayroll)}
              icon={<DollarSign size={24} />}
              color="emerald"
            />
            <StatsCard
              title="Gratuity Liability"
              value={formatCurrency(metrics.gratuityLiability)}
              icon={<Award size={24} />}
              color="blue"
            />
            <StatsCard
              title="OT This Month"
              value={`${metrics.overtimeHours.toFixed(1)}h`}
              icon={<Timer size={24} />}
              color="purple"
              subtitle={formatCurrency(metrics.overtimeCost)}
            />
          </div>

          {/* Alerts Section */}
          <div data-tour="dashboard-alerts" className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
            {/* Document Expiry Alerts */}
            <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
              <div className="px-4 py-3 border-b border-gray-100 flex items-center justify-between">
                <h3 className="font-semibold text-gray-900 flex items-center gap-2">
                  <AlertTriangle size={18} className="text-amber-500" />
                  Expiring Documents
                </h3>
                <Link href="/documents" className="text-sm text-teal-600 hover:text-teal-700 flex items-center gap-1">
                  View All <ChevronRight size={14} />
                </Link>
              </div>
              <div className="divide-y divide-gray-50">
                {alerts.expiringDocs.length > 0 ? (
                  alerts.expiringDocs.map((doc, idx) => (
                    <div key={idx} className="px-4 py-3 flex items-center justify-between">
                      <div>
                        <p className="font-medium text-gray-900 text-sm">{doc.employee}</p>
                        <p className="text-xs text-gray-500">{doc.document}</p>
                      </div>
                      <span className={`px-2 py-1 rounded-full text-xs font-medium border ${getUrgencyColor(doc.urgency)}`}>
                        {doc.daysLeft} days left
                      </span>
                    </div>
                  ))
                ) : (
                  <div className="px-4 py-8 text-center text-gray-500 text-sm">
                    No documents expiring soon
                  </div>
                )}
              </div>
            </div>

            {/* Pending Leave Requests */}
            <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
              <div className="px-4 py-3 border-b border-gray-100 flex items-center justify-between">
                <h3 className="font-semibold text-gray-900 flex items-center gap-2">
                  <Calendar size={18} className="text-blue-500" />
                  Pending Leave Requests
                </h3>
                <Link href="/leave" className="text-sm text-teal-600 hover:text-teal-700 flex items-center gap-1">
                  View All <ChevronRight size={14} />
                </Link>
              </div>
              <div className="divide-y divide-gray-50">
                {alerts.pendingLeaves.length > 0 ? (
                  alerts.pendingLeaves.map((leave, idx) => (
                    <div key={idx} className="px-4 py-3 flex items-center justify-between">
                      <div>
                        <p className="font-medium text-gray-900 text-sm">{leave.employee}</p>
                        <p className="text-xs text-gray-500 capitalize">{leave.type.replace('_', ' ')}</p>
                      </div>
                      <div className="text-right">
                        <p className="text-sm text-gray-700">{leave.dates}</p>
                        <p className="text-xs text-gray-500">{leave.days} days</p>
                      </div>
                    </div>
                  ))
                ) : (
                  <div className="px-4 py-8 text-center text-gray-500 text-sm">
                    No pending leave requests
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Charts Row */}
          <div data-tour="dashboard-charts" className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-6">
            {/* Headcount by Department */}
            <div className="bg-white rounded-xl border border-gray-200 p-4">
              <h3 className="font-semibold text-gray-900 mb-4">Headcount by Department</h3>
              <ResponsiveContainer width="100%" height={200}>
                <PieChart>
                  <Pie
                    data={chartData.departmentData}
                    cx="50%"
                    cy="50%"
                    innerRadius={50}
                    outerRadius={80}
                    paddingAngle={2}
                    dataKey="value"
                  >
                    {chartData.departmentData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={CHART_COLORS[index % CHART_COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip formatter={(value) => [`${value} employees`, 'Count']} />
                  <Legend
                    layout="vertical"
                    align="right"
                    verticalAlign="middle"
                    iconType="circle"
                    iconSize={8}
                    formatter={(value) => <span className="text-xs text-gray-600">{value}</span>}
                  />
                </PieChart>
              </ResponsiveContainer>
            </div>

            {/* Payroll Trend */}
            <div className="bg-white rounded-xl border border-gray-200 p-4">
              <h3 className="font-semibold text-gray-900 mb-4">Payroll Trend (6 Months)</h3>
              <ResponsiveContainer width="100%" height={200}>
                <LineChart data={chartData.payrollTrend}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                  <XAxis dataKey="month" tick={{ fontSize: 12 }} stroke="#9ca3af" />
                  <YAxis
                    tick={{ fontSize: 12 }}
                    stroke="#9ca3af"
                    tickFormatter={(value) => `${(value / 1000).toFixed(0)}K`}
                  />
                  <Tooltip
                    formatter={(value) => [formatCurrency(value as number), 'Payroll']}
                    contentStyle={{ fontSize: 12 }}
                  />
                  <Line
                    type="monotone"
                    dataKey="amount"
                    stroke="#0d9488"
                    strokeWidth={2}
                    dot={{ fill: '#0d9488', strokeWidth: 2, r: 4 }}
                    activeDot={{ r: 6 }}
                  />
                </LineChart>
              </ResponsiveContainer>
            </div>

            {/* Leave Utilization */}
            <div className="bg-white rounded-xl border border-gray-200 p-4">
              <h3 className="font-semibold text-gray-900 mb-4">Leave Utilization (This Month)</h3>
              {chartData.leaveData.length > 0 ? (
                <ResponsiveContainer width="100%" height={200}>
                  <BarChart data={chartData.leaveData} layout="vertical">
                    <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                    <XAxis type="number" tick={{ fontSize: 12 }} stroke="#9ca3af" />
                    <YAxis
                      dataKey="name"
                      type="category"
                      tick={{ fontSize: 11 }}
                      stroke="#9ca3af"
                      width={80}
                    />
                    <Tooltip formatter={(value) => [`${value} days`, 'Days']} contentStyle={{ fontSize: 12 }} />
                    <Bar dataKey="days" fill="#3b82f6" radius={[0, 4, 4, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              ) : (
                <div className="flex items-center justify-center h-[200px] text-gray-400 text-sm">
                  No leave data this month
                </div>
              )}
            </div>
          </div>

          {/* Quick Links & Today Snapshot */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Quick Links */}
            <div data-tour="dashboard-quicklinks" className="lg:col-span-2 bg-white rounded-xl border border-gray-200 p-4">
              <h3 className="font-semibold text-gray-900 mb-4">Quick Links</h3>
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                {quickLinks.map((link) => (
                  <Link
                    key={link.href}
                    href={link.href}
                    className="flex flex-col items-center gap-2 p-4 rounded-xl border border-gray-100 hover:border-teal-200 hover:bg-teal-50 transition-colors group"
                  >
                    <div className={`w-12 h-12 ${link.color} rounded-xl flex items-center justify-center text-white group-hover:scale-110 transition-transform`}>
                      <link.icon size={24} />
                    </div>
                    <span className="text-sm font-medium text-gray-700 group-hover:text-teal-700">
                      {link.label}
                    </span>
                  </Link>
                ))}
              </div>
            </div>

            {/* Today Snapshot */}
            <div data-tour="dashboard-snapshot" className="bg-white rounded-xl border border-gray-200 p-4">
              <h3 className="font-semibold text-gray-900 mb-4">Today's Snapshot</h3>
              <div className="space-y-4">
                {/* On Leave Today */}
                <div>
                  <div className="flex items-center gap-2 text-sm font-medium text-gray-700 mb-2">
                    <Calendar size={14} className="text-blue-500" />
                    On Leave Today ({alerts.onLeaveToday.length})
                  </div>
                  {alerts.onLeaveToday.length > 0 ? (
                    <div className="space-y-1">
                      {alerts.onLeaveToday.map((item, idx) => (
                        <div key={idx} className="text-sm text-gray-600 pl-5">
                          {item.employee}
                          <span className="text-gray-400 text-xs ml-1 capitalize">
                            ({item.type.replace('_', ' ')})
                          </span>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <p className="text-sm text-gray-400 pl-5">No one on leave</p>
                  )}
                </div>

                {/* Birthdays This Week */}
                <div>
                  <div className="flex items-center gap-2 text-sm font-medium text-gray-700 mb-2">
                    <Cake size={14} className="text-pink-500" />
                    Birthdays This Week ({alerts.birthdaysThisWeek.length})
                  </div>
                  {alerts.birthdaysThisWeek.length > 0 ? (
                    <div className="space-y-1">
                      {alerts.birthdaysThisWeek.map((item, idx) => (
                        <div key={idx} className="text-sm text-gray-600 pl-5">
                          {item.employee}
                          <span className="text-gray-400 text-xs ml-1">({item.date})</span>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <p className="text-sm text-gray-400 pl-5">No birthdays this week</p>
                  )}
                </div>

                {/* Probation Endings */}
                <div>
                  <div className="flex items-center gap-2 text-sm font-medium text-gray-700 mb-2">
                    <Briefcase size={14} className="text-amber-500" />
                    Probation Endings ({alerts.probationEndings.length})
                  </div>
                  {alerts.probationEndings.length > 0 ? (
                    <div className="space-y-1">
                      {alerts.probationEndings.map((item, idx) => (
                        <div key={idx} className="text-sm text-gray-600 pl-5">
                          {item.employee}
                          <span className="text-gray-400 text-xs ml-1">
                            ({item.daysLeft} days)
                          </span>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <p className="text-sm text-gray-400 pl-5">No probations ending soon</p>
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
