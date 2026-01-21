'use client';

import { useState } from 'react';
import {
  Building2,
  CreditCard,
  Users,
  Settings,
  Bell,
  Save,
  Upload,
  Plus,
  Mail,
  Trash2,
  Check,
  X,
  ChevronRight,
  Calendar,
  Globe,
  Clock,
  DollarSign,
  Moon,
  Shield,
  Download,
  ExternalLink,
} from 'lucide-react';
import Sidebar from '@/components/Sidebar';
import {
  CompanyProfile,
  User,
  UserRole,
  SystemSettings,
  NotificationSettings,
  SubscriptionPlan,
  PLAN_FEATURES,
  PLAN_PRICING,
  ROLE_LABELS,
  UAE_EMIRATES,
  WeekDay,
} from '@/types/settings';
import {
  mockCompanyProfile,
  mockSubscription,
  mockBillingHistory,
  mockUsers,
  mockSystemSettings,
  mockNotificationSettings,
} from '@/lib/settingsData';

type SettingsTab = 'company' | 'subscription' | 'users' | 'system' | 'notifications';

const TABS: { id: SettingsTab; label: string; icon: React.ReactNode }[] = [
  { id: 'company', label: 'Company Profile', icon: <Building2 size={18} /> },
  { id: 'subscription', label: 'Subscription', icon: <CreditCard size={18} /> },
  { id: 'users', label: 'User Management', icon: <Users size={18} /> },
  { id: 'system', label: 'System Settings', icon: <Settings size={18} /> },
  { id: 'notifications', label: 'Notifications', icon: <Bell size={18} /> },
];

const WEEKDAYS: { id: WeekDay; label: string }[] = [
  { id: 'sunday', label: 'Sun' },
  { id: 'monday', label: 'Mon' },
  { id: 'tuesday', label: 'Tue' },
  { id: 'wednesday', label: 'Wed' },
  { id: 'thursday', label: 'Thu' },
  { id: 'friday', label: 'Fri' },
  { id: 'saturday', label: 'Sat' },
];

export default function SettingsPage() {
  const [activeTab, setActiveTab] = useState<SettingsTab>('company');
  const [companyProfile, setCompanyProfile] = useState<CompanyProfile>(mockCompanyProfile);
  const [users, setUsers] = useState<User[]>(mockUsers);
  const [systemSettings, setSystemSettings] = useState<SystemSettings>(mockSystemSettings);
  const [notificationSettings, setNotificationSettings] = useState<NotificationSettings>(mockNotificationSettings);
  const [showInviteModal, setShowInviteModal] = useState(false);
  const [saveMessage, setSaveMessage] = useState<string | null>(null);

  const handleSave = () => {
    setSaveMessage('Settings saved successfully!');
    setTimeout(() => setSaveMessage(null), 3000);
  };

  return (
    <div className="flex min-h-screen bg-gray-50">
      <Sidebar />

      <main className="flex-1 ml-64">
        {/* Header */}
        <div className="bg-white border-b border-gray-200 px-8 py-6">
          <h1 className="text-2xl font-display font-bold text-gray-900">Settings</h1>
          <p className="text-gray-600 mt-1">Manage your company settings and preferences</p>
        </div>

        <div className="p-8">
          <div className="flex gap-8">
            {/* Sidebar Navigation */}
            <div className="w-64 flex-shrink-0">
              <nav className="space-y-1">
                {TABS.map((tab) => (
                  <button
                    key={tab.id}
                    onClick={() => setActiveTab(tab.id)}
                    className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg text-left transition-colors ${
                      activeTab === tab.id
                        ? 'bg-teal-50 text-teal-700 font-medium'
                        : 'text-gray-600 hover:bg-gray-100'
                    }`}
                  >
                    {tab.icon}
                    {tab.label}
                  </button>
                ))}
              </nav>
            </div>

            {/* Content Area */}
            <div className="flex-1 max-w-4xl">
              {/* Save Message */}
              {saveMessage && (
                <div className="mb-4 p-3 bg-green-50 border border-green-200 rounded-lg text-green-700 text-sm flex items-center gap-2">
                  <Check size={16} />
                  {saveMessage}
                </div>
              )}

              {activeTab === 'company' && (
                <CompanyProfileTab
                  profile={companyProfile}
                  onChange={setCompanyProfile}
                  onSave={handleSave}
                />
              )}

              {activeTab === 'subscription' && <SubscriptionTab />}

              {activeTab === 'users' && (
                <UsersTab
                  users={users}
                  onUsersChange={setUsers}
                  onShowInvite={() => setShowInviteModal(true)}
                />
              )}

              {activeTab === 'system' && (
                <SystemSettingsTab
                  settings={systemSettings}
                  onChange={setSystemSettings}
                  onSave={handleSave}
                />
              )}

              {activeTab === 'notifications' && (
                <NotificationsTab
                  settings={notificationSettings}
                  onChange={setNotificationSettings}
                  onSave={handleSave}
                />
              )}
            </div>
          </div>
        </div>
      </main>

      {/* Invite User Modal */}
      {showInviteModal && (
        <InviteUserModal
          onClose={() => setShowInviteModal(false)}
          onInvite={(user) => {
            setUsers([...users, user]);
            setShowInviteModal(false);
          }}
        />
      )}
    </div>
  );
}

// Company Profile Tab
function CompanyProfileTab({
  profile,
  onChange,
  onSave,
}: {
  profile: CompanyProfile;
  onChange: (p: CompanyProfile) => void;
  onSave: () => void;
}) {
  return (
    <div className="space-y-6">
      <div className="card p-6">
        <h2 className="text-lg font-semibold text-gray-900 mb-6">Company Information</h2>

        {/* Logo Upload */}
        <div className="mb-6">
          <label className="block text-sm font-medium text-gray-700 mb-2">Company Logo</label>
          <div className="flex items-center gap-4">
            <div className="w-24 h-24 bg-gray-100 rounded-lg flex items-center justify-center border-2 border-dashed border-gray-300">
              {profile.logoUrl ? (
                <img src={profile.logoUrl} alt="Logo" className="w-full h-full object-contain rounded-lg" />
              ) : (
                <Building2 size={32} className="text-gray-400" />
              )}
            </div>
            <div>
              <button className="btn btn-secondary flex items-center gap-2">
                <Upload size={16} />
                Upload Logo
              </button>
              <p className="text-xs text-gray-500 mt-1">PNG, JPG up to 2MB</p>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Company Name (English)
            </label>
            <input
              type="text"
              value={profile.name}
              onChange={(e) => onChange({ ...profile, name: e.target.value })}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-teal-500"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Company Name (Arabic)
            </label>
            <input
              type="text"
              value={profile.nameAr}
              onChange={(e) => onChange({ ...profile, nameAr: e.target.value })}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-teal-500 text-right"
              dir="rtl"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Trade License Number
            </label>
            <input
              type="text"
              value={profile.tradeLicenseNumber}
              onChange={(e) => onChange({ ...profile, tradeLicenseNumber: e.target.value })}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-teal-500"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Establishment Card
            </label>
            <input
              type="text"
              value={profile.establishmentCard}
              onChange={(e) => onChange({ ...profile, establishmentCard: e.target.value })}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-teal-500"
            />
          </div>
        </div>
      </div>

      <div className="card p-6">
        <h2 className="text-lg font-semibold text-gray-900 mb-6">Contact Information</h2>
        <div className="grid grid-cols-2 gap-4">
          <div className="col-span-2">
            <label className="block text-sm font-medium text-gray-700 mb-1">Address</label>
            <input
              type="text"
              value={profile.address}
              onChange={(e) => onChange({ ...profile, address: e.target.value })}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-teal-500"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">City</label>
            <input
              type="text"
              value={profile.city}
              onChange={(e) => onChange({ ...profile, city: e.target.value })}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-teal-500"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Emirate</label>
            <select
              value={profile.emirate}
              onChange={(e) => onChange({ ...profile, emirate: e.target.value })}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-teal-500"
            >
              {UAE_EMIRATES.map((emirate) => (
                <option key={emirate} value={emirate}>
                  {emirate}
                </option>
              ))}
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">P.O. Box</label>
            <input
              type="text"
              value={profile.poBox}
              onChange={(e) => onChange({ ...profile, poBox: e.target.value })}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-teal-500"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Phone</label>
            <input
              type="tel"
              value={profile.phone}
              onChange={(e) => onChange({ ...profile, phone: e.target.value })}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-teal-500"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Email</label>
            <input
              type="email"
              value={profile.email}
              onChange={(e) => onChange({ ...profile, email: e.target.value })}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-teal-500"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Website</label>
            <input
              type="url"
              value={profile.website || ''}
              onChange={(e) => onChange({ ...profile, website: e.target.value })}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-teal-500"
            />
          </div>
        </div>
      </div>

      <div className="card p-6">
        <h2 className="text-lg font-semibold text-gray-900 mb-6">WPS Configuration</h2>
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              WPS Employer Code
            </label>
            <input
              type="text"
              value={profile.wpsEmployerCode}
              onChange={(e) => onChange({ ...profile, wpsEmployerCode: e.target.value })}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-teal-500"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              WPS Routing Code (Bank)
            </label>
            <input
              type="text"
              value={profile.wpsRoutingCode}
              onChange={(e) => onChange({ ...profile, wpsRoutingCode: e.target.value })}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-teal-500"
            />
          </div>
        </div>
      </div>

      <div className="flex justify-end">
        <button onClick={onSave} className="btn btn-primary flex items-center gap-2">
          <Save size={16} />
          Save Changes
        </button>
      </div>
    </div>
  );
}

// Subscription Tab
function SubscriptionTab() {
  const [selectedPlan, setSelectedPlan] = useState<SubscriptionPlan>(mockSubscription.plan);
  const [billingCycle, setBillingCycle] = useState<'monthly' | 'annual'>('monthly');

  return (
    <div className="space-y-6">
      {/* Current Plan */}
      <div className="card p-6">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h2 className="text-lg font-semibold text-gray-900">Current Plan</h2>
            <p className="text-sm text-gray-500">You are currently on the Business plan</p>
          </div>
          <span className="px-3 py-1 bg-teal-100 text-teal-700 rounded-full text-sm font-medium">
            Active
          </span>
        </div>

        <div className="grid grid-cols-3 gap-4 p-4 bg-gray-50 rounded-lg">
          <div>
            <p className="text-sm text-gray-500">Plan</p>
            <p className="font-semibold text-gray-900 capitalize">{mockSubscription.plan}</p>
          </div>
          <div>
            <p className="text-sm text-gray-500">Billing Period</p>
            <p className="font-semibold text-gray-900">
              {new Date(mockSubscription.currentPeriodStart).toLocaleDateString()} -{' '}
              {new Date(mockSubscription.currentPeriodEnd).toLocaleDateString()}
            </p>
          </div>
          <div>
            <p className="text-sm text-gray-500">Employee Limit</p>
            <p className="font-semibold text-gray-900">{mockSubscription.employeeLimit}</p>
          </div>
        </div>
      </div>

      {/* Billing Cycle Toggle */}
      <div className="flex justify-center">
        <div className="inline-flex items-center bg-gray-100 rounded-lg p-1">
          <button
            onClick={() => setBillingCycle('monthly')}
            className={`px-4 py-2 rounded-md text-sm font-medium transition-colors ${
              billingCycle === 'monthly' ? 'bg-white shadow text-gray-900' : 'text-gray-600'
            }`}
          >
            Monthly
          </button>
          <button
            onClick={() => setBillingCycle('annual')}
            className={`px-4 py-2 rounded-md text-sm font-medium transition-colors ${
              billingCycle === 'annual' ? 'bg-white shadow text-gray-900' : 'text-gray-600'
            }`}
          >
            Annual (Save 17%)
          </button>
        </div>
      </div>

      {/* Plans */}
      <div className="grid grid-cols-3 gap-4">
        {(['starter', 'business', 'enterprise'] as SubscriptionPlan[]).map((plan) => (
          <div
            key={plan}
            className={`card p-6 relative ${
              plan === mockSubscription.plan ? 'ring-2 ring-teal-500' : ''
            } ${selectedPlan === plan ? 'border-teal-500' : ''}`}
          >
            {plan === mockSubscription.plan && (
              <span className="absolute -top-3 left-1/2 -translate-x-1/2 px-3 py-1 bg-teal-500 text-white text-xs font-medium rounded-full">
                Current Plan
              </span>
            )}
            <h3 className="text-lg font-semibold text-gray-900 capitalize mb-2">{plan}</h3>
            <div className="mb-4">
              <span className="text-3xl font-bold text-gray-900">
                AED {billingCycle === 'monthly' ? PLAN_PRICING[plan].monthly : Math.round(PLAN_PRICING[plan].annual / 12)}
              </span>
              <span className="text-gray-500">/month</span>
              {billingCycle === 'annual' && (
                <p className="text-sm text-gray-500">
                  Billed AED {PLAN_PRICING[plan].annual}/year
                </p>
              )}
            </div>
            <ul className="space-y-2 mb-6 text-sm">
              {PLAN_FEATURES.slice(0, 6).map((feature) => (
                <li key={feature.name} className="flex items-center gap-2">
                  {feature[plan] ? (
                    <Check size={16} className="text-teal-500" />
                  ) : (
                    <X size={16} className="text-gray-300" />
                  )}
                  <span className={feature[plan] ? 'text-gray-700' : 'text-gray-400'}>
                    {typeof feature[plan] === 'string' ? feature[plan] : feature.name}
                  </span>
                </li>
              ))}
            </ul>
            {plan !== mockSubscription.plan && (
              <button
                onClick={() => setSelectedPlan(plan)}
                className={`w-full py-2 rounded-lg font-medium transition-colors ${
                  plan === 'enterprise'
                    ? 'bg-gray-900 text-white hover:bg-gray-800'
                    : 'bg-teal-600 text-white hover:bg-teal-700'
                }`}
              >
                {plan === 'starter' ? 'Downgrade' : 'Upgrade'}
              </button>
            )}
          </div>
        ))}
      </div>

      {/* Features Comparison */}
      <div className="card p-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Full Feature Comparison</h3>
        <table className="w-full">
          <thead>
            <tr className="border-b border-gray-200">
              <th className="text-left py-3 text-sm font-medium text-gray-500">Feature</th>
              <th className="text-center py-3 text-sm font-medium text-gray-500">Starter</th>
              <th className="text-center py-3 text-sm font-medium text-gray-500">Business</th>
              <th className="text-center py-3 text-sm font-medium text-gray-500">Enterprise</th>
            </tr>
          </thead>
          <tbody>
            {PLAN_FEATURES.map((feature) => (
              <tr key={feature.name} className="border-b border-gray-100">
                <td className="py-3 text-sm text-gray-700">{feature.name}</td>
                <td className="py-3 text-center">
                  {typeof feature.starter === 'boolean' ? (
                    feature.starter ? (
                      <Check size={16} className="inline text-teal-500" />
                    ) : (
                      <X size={16} className="inline text-gray-300" />
                    )
                  ) : (
                    <span className="text-sm text-gray-600">{feature.starter}</span>
                  )}
                </td>
                <td className="py-3 text-center">
                  {typeof feature.business === 'boolean' ? (
                    feature.business ? (
                      <Check size={16} className="inline text-teal-500" />
                    ) : (
                      <X size={16} className="inline text-gray-300" />
                    )
                  ) : (
                    <span className="text-sm text-gray-600">{feature.business}</span>
                  )}
                </td>
                <td className="py-3 text-center">
                  {typeof feature.enterprise === 'boolean' ? (
                    feature.enterprise ? (
                      <Check size={16} className="inline text-teal-500" />
                    ) : (
                      <X size={16} className="inline text-gray-300" />
                    )
                  ) : (
                    <span className="text-sm text-gray-600">{feature.enterprise}</span>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Billing History */}
      <div className="card p-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Billing History</h3>
        <table className="w-full">
          <thead>
            <tr className="border-b border-gray-200">
              <th className="text-left py-3 text-sm font-medium text-gray-500">Date</th>
              <th className="text-left py-3 text-sm font-medium text-gray-500">Description</th>
              <th className="text-left py-3 text-sm font-medium text-gray-500">Amount</th>
              <th className="text-left py-3 text-sm font-medium text-gray-500">Status</th>
              <th className="text-right py-3 text-sm font-medium text-gray-500">Invoice</th>
            </tr>
          </thead>
          <tbody>
            {mockBillingHistory.map((invoice) => (
              <tr key={invoice.id} className="border-b border-gray-100">
                <td className="py-3 text-sm text-gray-700">
                  {new Date(invoice.date).toLocaleDateString()}
                </td>
                <td className="py-3 text-sm text-gray-700">{invoice.description}</td>
                <td className="py-3 text-sm text-gray-900 font-medium">
                  {invoice.currency} {invoice.amount}
                </td>
                <td className="py-3">
                  <span
                    className={`px-2 py-1 rounded text-xs font-medium ${
                      invoice.status === 'paid'
                        ? 'bg-green-100 text-green-700'
                        : invoice.status === 'pending'
                        ? 'bg-yellow-100 text-yellow-700'
                        : 'bg-red-100 text-red-700'
                    }`}
                  >
                    {invoice.status}
                  </span>
                </td>
                <td className="py-3 text-right">
                  <button className="text-teal-600 hover:text-teal-700 text-sm flex items-center gap-1 ml-auto">
                    <Download size={14} />
                    PDF
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

// Users Tab
function UsersTab({
  users,
  onUsersChange,
  onShowInvite,
}: {
  users: User[];
  onUsersChange: (users: User[]) => void;
  onShowInvite: () => void;
}) {
  const handleToggleActive = (userId: string) => {
    onUsersChange(
      users.map((u) => (u.id === userId ? { ...u, isActive: !u.isActive } : u))
    );
  };

  const handleDeleteUser = (userId: string) => {
    if (confirm('Are you sure you want to remove this user?')) {
      onUsersChange(users.filter((u) => u.id !== userId));
    }
  };

  return (
    <div className="space-y-6">
      <div className="card p-6">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h2 className="text-lg font-semibold text-gray-900">Team Members</h2>
            <p className="text-sm text-gray-500">
              {users.filter((u) => u.isActive).length} active users
            </p>
          </div>
          <button onClick={onShowInvite} className="btn btn-primary flex items-center gap-2">
            <Plus size={16} />
            Invite User
          </button>
        </div>

        <div className="space-y-3">
          {users.map((user) => (
            <div
              key={user.id}
              className={`flex items-center justify-between p-4 rounded-lg border ${
                user.isActive ? 'bg-white border-gray-200' : 'bg-gray-50 border-gray-100'
              }`}
            >
              <div className="flex items-center gap-4">
                <div
                  className={`w-10 h-10 rounded-full flex items-center justify-center font-medium ${
                    user.isActive ? 'bg-teal-100 text-teal-700' : 'bg-gray-200 text-gray-500'
                  }`}
                >
                  {user.firstName[0]}
                  {user.lastName[0]}
                </div>
                <div>
                  <p className={`font-medium ${user.isActive ? 'text-gray-900' : 'text-gray-500'}`}>
                    {user.firstName} {user.lastName}
                  </p>
                  <p className="text-sm text-gray-500">{user.email}</p>
                </div>
              </div>

              <div className="flex items-center gap-4">
                <span
                  className={`px-2 py-1 rounded text-xs font-medium ${
                    user.role === 'admin'
                      ? 'bg-purple-100 text-purple-700'
                      : user.role === 'hr_manager'
                      ? 'bg-blue-100 text-blue-700'
                      : user.role === 'manager'
                      ? 'bg-amber-100 text-amber-700'
                      : 'bg-gray-100 text-gray-700'
                  }`}
                >
                  {ROLE_LABELS[user.role]}
                </span>

                {user.lastLogin && (
                  <span className="text-xs text-gray-400">
                    Last login: {new Date(user.lastLogin).toLocaleDateString()}
                  </span>
                )}

                <button
                  onClick={() => handleToggleActive(user.id)}
                  className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                    user.isActive ? 'bg-teal-600' : 'bg-gray-200'
                  }`}
                >
                  <span
                    className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                      user.isActive ? 'translate-x-6' : 'translate-x-1'
                    }`}
                  />
                </button>

                <button
                  onClick={() => handleDeleteUser(user.id)}
                  className="p-2 text-gray-400 hover:text-red-500 transition-colors"
                  disabled={user.role === 'admin'}
                >
                  <Trash2 size={16} />
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Role Permissions */}
      <div className="card p-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Role Permissions</h3>
        <div className="grid grid-cols-2 gap-4">
          {Object.entries(ROLE_LABELS).map(([role, label]) => (
            <div key={role} className="p-4 bg-gray-50 rounded-lg">
              <div className="flex items-center gap-2 mb-2">
                <Shield size={16} className="text-gray-400" />
                <span className="font-medium text-gray-900">{label}</span>
              </div>
              <ul className="text-sm text-gray-600 space-y-1">
                {role === 'admin' && (
                  <>
                    <li>Full system access</li>
                    <li>Manage all settings</li>
                    <li>User management</li>
                  </>
                )}
                {role === 'hr_manager' && (
                  <>
                    <li>Employee management</li>
                    <li>Leave & payroll</li>
                    <li>Reports access</li>
                  </>
                )}
                {role === 'manager' && (
                  <>
                    <li>View team members</li>
                    <li>Approve leave requests</li>
                    <li>Team reports</li>
                  </>
                )}
                {role === 'employee' && (
                  <>
                    <li>View own profile</li>
                    <li>Submit leave requests</li>
                    <li>View payslips</li>
                  </>
                )}
              </ul>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

// System Settings Tab
function SystemSettingsTab({
  settings,
  onChange,
  onSave,
}: {
  settings: SystemSettings;
  onChange: (s: SystemSettings) => void;
  onSave: () => void;
}) {
  const toggleWorkingDay = (day: WeekDay) => {
    const newWorkingDays = settings.workingDays.includes(day)
      ? settings.workingDays.filter((d) => d !== day)
      : [...settings.workingDays, day];
    const newWeekendDays = WEEKDAYS.map((d) => d.id).filter(
      (d) => !newWorkingDays.includes(d)
    );
    onChange({ ...settings, workingDays: newWorkingDays, weekendDays: newWeekendDays });
  };

  return (
    <div className="space-y-6">
      <div className="card p-6">
        <h2 className="text-lg font-semibold text-gray-900 mb-6 flex items-center gap-2">
          <Calendar size={20} />
          Work Schedule
        </h2>

        <div className="mb-6">
          <label className="block text-sm font-medium text-gray-700 mb-3">Working Days</label>
          <div className="flex gap-2">
            {WEEKDAYS.map((day) => (
              <button
                key={day.id}
                onClick={() => toggleWorkingDay(day.id)}
                className={`w-12 h-12 rounded-lg font-medium text-sm transition-colors ${
                  settings.workingDays.includes(day.id)
                    ? 'bg-teal-600 text-white'
                    : 'bg-gray-100 text-gray-500 hover:bg-gray-200'
                }`}
              >
                {day.label}
              </button>
            ))}
          </div>
          <p className="text-xs text-gray-500 mt-2">
            Weekend: {settings.weekendDays.map((d) => d.charAt(0).toUpperCase() + d.slice(1)).join(', ')}
          </p>
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Regular Working Hours
            </label>
            <input
              type="number"
              value={settings.regularWorkingHours}
              onChange={(e) =>
                onChange({ ...settings, regularWorkingHours: parseInt(e.target.value) || 8 })
              }
              min={1}
              max={12}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-teal-500"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Fiscal Year Start Month
            </label>
            <select
              value={settings.fiscalYearStartMonth}
              onChange={(e) =>
                onChange({ ...settings, fiscalYearStartMonth: parseInt(e.target.value) })
              }
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-teal-500"
            >
              {Array.from({ length: 12 }, (_, i) => (
                <option key={i + 1} value={i + 1}>
                  {new Date(2024, i, 1).toLocaleDateString('en-US', { month: 'long' })}
                </option>
              ))}
            </select>
          </div>
        </div>
      </div>

      <div className="card p-6">
        <h2 className="text-lg font-semibold text-gray-900 mb-6 flex items-center gap-2">
          <Moon size={20} />
          Ramadan Settings
        </h2>

        <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg mb-4">
          <div>
            <p className="font-medium text-gray-900">Ramadan Mode</p>
            <p className="text-sm text-gray-500">
              Reduced working hours during Ramadan (6 hours/day)
            </p>
          </div>
          <button
            onClick={() =>
              onChange({ ...settings, ramadanModeEnabled: !settings.ramadanModeEnabled })
            }
            className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
              settings.ramadanModeEnabled ? 'bg-teal-600' : 'bg-gray-200'
            }`}
          >
            <span
              className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                settings.ramadanModeEnabled ? 'translate-x-6' : 'translate-x-1'
              }`}
            />
          </button>
        </div>

        {settings.ramadanModeEnabled && (
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Ramadan Working Hours
            </label>
            <input
              type="number"
              value={settings.ramadanWorkingHours}
              onChange={(e) =>
                onChange({ ...settings, ramadanWorkingHours: parseInt(e.target.value) || 6 })
              }
              min={1}
              max={8}
              className="w-32 px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-teal-500"
            />
          </div>
        )}
      </div>

      <div className="card p-6">
        <h2 className="text-lg font-semibold text-gray-900 mb-6 flex items-center gap-2">
          <Globe size={20} />
          Regional Settings
        </h2>

        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Date Format</label>
            <select
              value={settings.dateFormat}
              onChange={(e) =>
                onChange({ ...settings, dateFormat: e.target.value as SystemSettings['dateFormat'] })
              }
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-teal-500"
            >
              <option value="DD/MM/YYYY">DD/MM/YYYY (31/12/2024)</option>
              <option value="MM/DD/YYYY">MM/DD/YYYY (12/31/2024)</option>
              <option value="YYYY-MM-DD">YYYY-MM-DD (2024-12-31)</option>
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Time Format</label>
            <select
              value={settings.timeFormat}
              onChange={(e) =>
                onChange({ ...settings, timeFormat: e.target.value as '12h' | '24h' })
              }
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-teal-500"
            >
              <option value="24h">24-hour (14:30)</option>
              <option value="12h">12-hour (2:30 PM)</option>
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Currency</label>
            <select
              value={settings.currency}
              onChange={(e) => onChange({ ...settings, currency: e.target.value })}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-teal-500"
            >
              <option value="AED">AED - UAE Dirham</option>
              <option value="USD">USD - US Dollar</option>
              <option value="EUR">EUR - Euro</option>
              <option value="GBP">GBP - British Pound</option>
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Timezone</label>
            <select
              value={settings.timezone}
              onChange={(e) => onChange({ ...settings, timezone: e.target.value })}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-teal-500"
            >
              <option value="Asia/Dubai">Asia/Dubai (GMT+4)</option>
              <option value="Asia/Abu_Dhabi">Asia/Abu Dhabi (GMT+4)</option>
            </select>
          </div>
        </div>
      </div>

      <div className="flex justify-end">
        <button onClick={onSave} className="btn btn-primary flex items-center gap-2">
          <Save size={16} />
          Save Changes
        </button>
      </div>
    </div>
  );
}

// Notifications Tab
function NotificationsTab({
  settings,
  onChange,
  onSave,
}: {
  settings: NotificationSettings;
  onChange: (s: NotificationSettings) => void;
  onSave: () => void;
}) {
  const toggleAlertDay = (day: number) => {
    const newDays = settings.documentExpiryAlertDays.includes(day)
      ? settings.documentExpiryAlertDays.filter((d) => d !== day)
      : [...settings.documentExpiryAlertDays, day].sort((a, b) => b - a);
    onChange({ ...settings, documentExpiryAlertDays: newDays });
  };

  return (
    <div className="space-y-6">
      <div className="card p-6">
        <h2 className="text-lg font-semibold text-gray-900 mb-6 flex items-center gap-2">
          <Mail size={20} />
          Email Notifications
        </h2>

        <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg mb-6">
          <div>
            <p className="font-medium text-gray-900">Email Notifications</p>
            <p className="text-sm text-gray-500">Receive email alerts for important events</p>
          </div>
          <button
            onClick={() =>
              onChange({ ...settings, emailNotifications: !settings.emailNotifications })
            }
            className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
              settings.emailNotifications ? 'bg-teal-600' : 'bg-gray-200'
            }`}
          >
            <span
              className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                settings.emailNotifications ? 'translate-x-6' : 'translate-x-1'
              }`}
            />
          </button>
        </div>

        {settings.emailNotifications && (
          <div className="space-y-4">
            <NotificationToggle
              label="Leave Request Notifications"
              description="Get notified when employees submit leave requests"
              enabled={settings.leaveRequestNotifications}
              onChange={() =>
                onChange({
                  ...settings,
                  leaveRequestNotifications: !settings.leaveRequestNotifications,
                })
              }
            />
            <NotificationToggle
              label="Leave Approval Notifications"
              description="Get notified when leave requests are approved/rejected"
              enabled={settings.leaveApprovalNotifications}
              onChange={() =>
                onChange({
                  ...settings,
                  leaveApprovalNotifications: !settings.leaveApprovalNotifications,
                })
              }
            />
            <NotificationToggle
              label="Payroll Completion Alerts"
              description="Get notified when payroll processing is complete"
              enabled={settings.payrollCompletionAlerts}
              onChange={() =>
                onChange({
                  ...settings,
                  payrollCompletionAlerts: !settings.payrollCompletionAlerts,
                })
              }
            />
            <NotificationToggle
              label="New Employee Alerts"
              description="Get notified when new employees are added"
              enabled={settings.newEmployeeAlerts}
              onChange={() =>
                onChange({ ...settings, newEmployeeAlerts: !settings.newEmployeeAlerts })
              }
            />
            <NotificationToggle
              label="Contract Expiry Alerts"
              description="Get notified before employee contracts expire"
              enabled={settings.contractExpiryAlerts}
              onChange={() =>
                onChange({
                  ...settings,
                  contractExpiryAlerts: !settings.contractExpiryAlerts,
                })
              }
            />
          </div>
        )}
      </div>

      <div className="card p-6">
        <h2 className="text-lg font-semibold text-gray-900 mb-6 flex items-center gap-2">
          <Clock size={20} />
          Document Expiry Alerts
        </h2>

        <p className="text-sm text-gray-600 mb-4">
          Select when to receive alerts before documents expire:
        </p>

        <div className="flex gap-3">
          {[90, 60, 30, 14, 7].map((days) => (
            <button
              key={days}
              onClick={() => toggleAlertDay(days)}
              className={`px-4 py-2 rounded-lg font-medium text-sm transition-colors ${
                settings.documentExpiryAlertDays.includes(days)
                  ? 'bg-teal-600 text-white'
                  : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
              }`}
            >
              {days} days
            </button>
          ))}
        </div>

        <p className="text-xs text-gray-500 mt-3">
          Currently alerting at: {settings.documentExpiryAlertDays.join(', ')} days before expiry
        </p>
      </div>

      <div className="flex justify-end">
        <button onClick={onSave} className="btn btn-primary flex items-center gap-2">
          <Save size={16} />
          Save Changes
        </button>
      </div>
    </div>
  );
}

// Notification Toggle Component
function NotificationToggle({
  label,
  description,
  enabled,
  onChange,
}: {
  label: string;
  description: string;
  enabled: boolean;
  onChange: () => void;
}) {
  return (
    <div className="flex items-center justify-between py-3 border-b border-gray-100 last:border-0">
      <div>
        <p className="font-medium text-gray-900">{label}</p>
        <p className="text-sm text-gray-500">{description}</p>
      </div>
      <button
        onClick={onChange}
        className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
          enabled ? 'bg-teal-600' : 'bg-gray-200'
        }`}
      >
        <span
          className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
            enabled ? 'translate-x-6' : 'translate-x-1'
          }`}
        />
      </button>
    </div>
  );
}

// Invite User Modal
function InviteUserModal({
  onClose,
  onInvite,
}: {
  onClose: () => void;
  onInvite: (user: User) => void;
}) {
  const [email, setEmail] = useState('');
  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [role, setRole] = useState<UserRole>('employee');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const newUser: User = {
      id: `user-${Date.now()}`,
      companyId: 'company-1',
      email,
      firstName,
      lastName,
      role,
      isActive: true,
      createdAt: new Date().toISOString(),
      invitedBy: 'user-1',
    };
    onInvite(newUser);
  };

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-2xl shadow-xl w-full max-w-md animate-scale-in">
        <div className="flex items-center justify-between p-4 border-b border-gray-100">
          <h2 className="font-display font-semibold text-lg text-gray-900">Invite User</h2>
          <button
            onClick={onClose}
            className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
          >
            <X size={20} className="text-gray-400" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-4 space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">First Name</label>
              <input
                type="text"
                value={firstName}
                onChange={(e) => setFirstName(e.target.value)}
                required
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-teal-500"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Last Name</label>
              <input
                type="text"
                value={lastName}
                onChange={(e) => setLastName(e.target.value)}
                required
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-teal-500"
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Email Address</label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              placeholder="user@company.ae"
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-teal-500"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Role</label>
            <select
              value={role}
              onChange={(e) => setRole(e.target.value as UserRole)}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-teal-500"
            >
              {Object.entries(ROLE_LABELS).map(([value, label]) => (
                <option key={value} value={value}>
                  {label}
                </option>
              ))}
            </select>
          </div>

          <div className="flex gap-3 pt-4">
            <button type="button" onClick={onClose} className="flex-1 btn btn-secondary">
              Cancel
            </button>
            <button type="submit" className="flex-1 btn btn-primary flex items-center justify-center gap-2">
              <Mail size={16} />
              Send Invite
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
