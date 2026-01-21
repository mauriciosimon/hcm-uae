// Settings Types

export interface CompanyProfile {
  id: string;
  name: string;
  nameAr: string;
  tradeLicenseNumber: string;
  establishmentCard: string;
  address: string;
  city: string;
  emirate: string;
  poBox: string;
  phone: string;
  email: string;
  website?: string;
  logoUrl?: string;
  wpsEmployerCode: string;
  wpsRoutingCode: string;
  createdAt: string;
  updatedAt: string;
}

export type SubscriptionPlan = 'starter' | 'business' | 'enterprise';

export interface Subscription {
  id: string;
  companyId: string;
  plan: SubscriptionPlan;
  status: 'active' | 'cancelled' | 'past_due' | 'trial';
  currentPeriodStart: string;
  currentPeriodEnd: string;
  employeeLimit: number;
  monthlyPrice: number;
  currency: string;
}

export interface BillingHistory {
  id: string;
  date: string;
  description: string;
  amount: number;
  currency: string;
  status: 'paid' | 'pending' | 'failed';
  invoiceUrl?: string;
}

export type UserRole = 'admin' | 'hr_manager' | 'manager' | 'employee';

export interface User {
  id: string;
  companyId: string;
  email: string;
  firstName: string;
  lastName: string;
  role: UserRole;
  isActive: boolean;
  lastLogin?: string;
  createdAt: string;
  invitedBy?: string;
  employeeId?: string; // Link to employee record
}

export interface UserInvite {
  email: string;
  role: UserRole;
  firstName: string;
  lastName: string;
}

export type WeekDay = 'sunday' | 'monday' | 'tuesday' | 'wednesday' | 'thursday' | 'friday' | 'saturday';

export interface SystemSettings {
  id: string;
  companyId: string;
  workingDays: WeekDay[];
  weekendDays: WeekDay[];
  fiscalYearStartMonth: number; // 1-12
  dateFormat: 'DD/MM/YYYY' | 'MM/DD/YYYY' | 'YYYY-MM-DD';
  timeFormat: '12h' | '24h';
  currency: string;
  currencySymbol: string;
  timezone: string;
  ramadanModeEnabled: boolean;
  ramadanWorkingHours: number;
  regularWorkingHours: number;
}

export interface NotificationSettings {
  id: string;
  companyId: string;
  userId: string;
  emailNotifications: boolean;
  documentExpiryAlertDays: number[];
  leaveRequestNotifications: boolean;
  leaveApprovalNotifications: boolean;
  payrollCompletionAlerts: boolean;
  newEmployeeAlerts: boolean;
  contractExpiryAlerts: boolean;
}

// Plan features
export interface PlanFeature {
  name: string;
  starter: boolean | string;
  business: boolean | string;
  enterprise: boolean | string;
}

export const PLAN_FEATURES: PlanFeature[] = [
  { name: 'Employees', starter: 'Up to 25', business: 'Up to 100', enterprise: 'Unlimited' },
  { name: 'Employee Management', starter: true, business: true, enterprise: true },
  { name: 'Leave Management', starter: true, business: true, enterprise: true },
  { name: 'Document Management', starter: true, business: true, enterprise: true },
  { name: 'Payroll Processing', starter: false, business: true, enterprise: true },
  { name: 'WPS File Generation', starter: false, business: true, enterprise: true },
  { name: 'Gratuity Calculator', starter: true, business: true, enterprise: true },
  { name: 'Overtime Tracking', starter: false, business: true, enterprise: true },
  { name: 'Reports & Analytics', starter: 'Basic', business: 'Advanced', enterprise: 'Custom' },
  { name: 'Document Templates', starter: '5', business: '12', enterprise: 'Unlimited' },
  { name: 'User Accounts', starter: '2', business: '10', enterprise: 'Unlimited' },
  { name: 'API Access', starter: false, business: false, enterprise: true },
  { name: 'Custom Integrations', starter: false, business: false, enterprise: true },
  { name: 'Priority Support', starter: false, business: true, enterprise: true },
  { name: 'Dedicated Account Manager', starter: false, business: false, enterprise: true },
];

export const PLAN_PRICING: Record<SubscriptionPlan, { monthly: number; annual: number }> = {
  starter: { monthly: 199, annual: 1990 },
  business: { monthly: 499, annual: 4990 },
  enterprise: { monthly: 999, annual: 9990 },
};

export const ROLE_PERMISSIONS: Record<UserRole, string[]> = {
  admin: [
    'manage_company',
    'manage_users',
    'manage_settings',
    'manage_employees',
    'manage_leave',
    'manage_payroll',
    'manage_documents',
    'view_reports',
    'export_data',
  ],
  hr_manager: [
    'manage_employees',
    'manage_leave',
    'manage_payroll',
    'manage_documents',
    'view_reports',
    'export_data',
  ],
  manager: [
    'view_team_employees',
    'approve_leave',
    'view_team_reports',
  ],
  employee: [
    'view_own_profile',
    'submit_leave',
    'view_own_documents',
    'view_own_payslips',
  ],
};

export const ROLE_LABELS: Record<UserRole, string> = {
  admin: 'Administrator',
  hr_manager: 'HR Manager',
  manager: 'Department Manager',
  employee: 'Employee',
};

export const UAE_EMIRATES = [
  'Abu Dhabi',
  'Dubai',
  'Sharjah',
  'Ajman',
  'Umm Al Quwain',
  'Ras Al Khaimah',
  'Fujairah',
];

export const DEFAULT_SYSTEM_SETTINGS: Omit<SystemSettings, 'id' | 'companyId'> = {
  workingDays: ['sunday', 'monday', 'tuesday', 'wednesday', 'thursday'],
  weekendDays: ['friday', 'saturday'],
  fiscalYearStartMonth: 1,
  dateFormat: 'DD/MM/YYYY',
  timeFormat: '24h',
  currency: 'AED',
  currencySymbol: 'AED',
  timezone: 'Asia/Dubai',
  ramadanModeEnabled: false,
  ramadanWorkingHours: 6,
  regularWorkingHours: 8,
};

export const DEFAULT_NOTIFICATION_SETTINGS: Omit<NotificationSettings, 'id' | 'companyId' | 'userId'> = {
  emailNotifications: true,
  documentExpiryAlertDays: [90, 60, 30, 7],
  leaveRequestNotifications: true,
  leaveApprovalNotifications: true,
  payrollCompletionAlerts: true,
  newEmployeeAlerts: true,
  contractExpiryAlerts: true,
};
