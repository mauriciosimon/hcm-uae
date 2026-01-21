import prisma from '@/lib/db';
import {
  CompanyProfile,
  Subscription,
  BillingHistory,
  User,
  SystemSettings,
  NotificationSettings,
  UserRole as FrontendUserRole,
  SubscriptionPlan as FrontendSubscriptionPlan,
  WeekDay,
} from '@/types/settings';
import { UserRole, SubscriptionPlan, SubscriptionStatus, PaymentStatus } from '@prisma/client';

// Type mappings
function toFrontendUserRole(role: UserRole): FrontendUserRole {
  return role.toLowerCase() as FrontendUserRole;
}

function toPrismaUserRole(role: FrontendUserRole): UserRole {
  return role.toUpperCase().replace(' ', '_') as UserRole;
}

function toFrontendSubscriptionPlan(plan: SubscriptionPlan): FrontendSubscriptionPlan {
  return plan.toLowerCase() as FrontendSubscriptionPlan;
}

// Company Profile
export async function getCompanyProfile(companyId: string): Promise<CompanyProfile | null> {
  const company = await prisma.company.findUnique({
    where: { id: companyId },
  });

  if (!company) return null;

  return {
    id: company.id,
    name: company.name,
    nameAr: company.nameAr || '',
    tradeLicenseNumber: company.tradeLicenseNumber || '',
    establishmentCard: company.establishmentCard || '',
    address: company.address || '',
    city: company.city || '',
    emirate: company.emirate || '',
    poBox: company.poBox || '',
    phone: company.phone || '',
    email: company.email || '',
    website: company.website || undefined,
    logoUrl: company.logoUrl || undefined,
    wpsEmployerCode: company.wpsEmployerCode || '',
    wpsRoutingCode: company.wpsRoutingCode || '',
    createdAt: company.createdAt.toISOString(),
    updatedAt: company.updatedAt.toISOString(),
  };
}

export async function updateCompanyProfile(
  companyId: string,
  data: Partial<CompanyProfile>
): Promise<CompanyProfile> {
  const company = await prisma.company.update({
    where: { id: companyId },
    data: {
      ...(data.name && { name: data.name }),
      ...(data.nameAr && { nameAr: data.nameAr }),
      ...(data.tradeLicenseNumber && { tradeLicenseNumber: data.tradeLicenseNumber }),
      ...(data.establishmentCard && { establishmentCard: data.establishmentCard }),
      ...(data.address && { address: data.address }),
      ...(data.city && { city: data.city }),
      ...(data.emirate && { emirate: data.emirate }),
      ...(data.poBox && { poBox: data.poBox }),
      ...(data.phone && { phone: data.phone }),
      ...(data.email && { email: data.email }),
      ...(data.website !== undefined && { website: data.website }),
      ...(data.logoUrl !== undefined && { logoUrl: data.logoUrl }),
      ...(data.wpsEmployerCode && { wpsEmployerCode: data.wpsEmployerCode }),
      ...(data.wpsRoutingCode && { wpsRoutingCode: data.wpsRoutingCode }),
    },
  });

  return {
    id: company.id,
    name: company.name,
    nameAr: company.nameAr || '',
    tradeLicenseNumber: company.tradeLicenseNumber || '',
    establishmentCard: company.establishmentCard || '',
    address: company.address || '',
    city: company.city || '',
    emirate: company.emirate || '',
    poBox: company.poBox || '',
    phone: company.phone || '',
    email: company.email || '',
    website: company.website || undefined,
    logoUrl: company.logoUrl || undefined,
    wpsEmployerCode: company.wpsEmployerCode || '',
    wpsRoutingCode: company.wpsRoutingCode || '',
    createdAt: company.createdAt.toISOString(),
    updatedAt: company.updatedAt.toISOString(),
  };
}

// Users
export async function getUsers(companyId: string): Promise<User[]> {
  const users = await prisma.user.findMany({
    where: { companyId },
    orderBy: { createdAt: 'asc' },
  });

  return users.map((user) => ({
    id: user.id,
    companyId: user.companyId,
    email: user.email,
    firstName: user.firstName,
    lastName: user.lastName,
    role: toFrontendUserRole(user.role),
    isActive: user.isActive,
    lastLogin: user.lastLogin?.toISOString(),
    createdAt: user.createdAt.toISOString(),
    invitedBy: user.invitedBy || undefined,
    employeeId: user.employeeId || undefined,
  }));
}

export async function createUser(
  companyId: string,
  data: {
    email: string;
    firstName: string;
    lastName: string;
    role: FrontendUserRole;
    invitedBy?: string;
  }
): Promise<User> {
  const user = await prisma.user.create({
    data: {
      companyId,
      email: data.email,
      firstName: data.firstName,
      lastName: data.lastName,
      role: toPrismaUserRole(data.role),
      invitedBy: data.invitedBy,
      isActive: true,
    },
  });

  return {
    id: user.id,
    companyId: user.companyId,
    email: user.email,
    firstName: user.firstName,
    lastName: user.lastName,
    role: toFrontendUserRole(user.role),
    isActive: user.isActive,
    lastLogin: user.lastLogin?.toISOString(),
    createdAt: user.createdAt.toISOString(),
    invitedBy: user.invitedBy || undefined,
    employeeId: user.employeeId || undefined,
  };
}

export async function updateUser(
  id: string,
  data: Partial<{
    firstName: string;
    lastName: string;
    role: FrontendUserRole;
    isActive: boolean;
  }>
): Promise<User> {
  const user = await prisma.user.update({
    where: { id },
    data: {
      ...(data.firstName && { firstName: data.firstName }),
      ...(data.lastName && { lastName: data.lastName }),
      ...(data.role && { role: toPrismaUserRole(data.role) }),
      ...(data.isActive !== undefined && { isActive: data.isActive }),
    },
  });

  return {
    id: user.id,
    companyId: user.companyId,
    email: user.email,
    firstName: user.firstName,
    lastName: user.lastName,
    role: toFrontendUserRole(user.role),
    isActive: user.isActive,
    lastLogin: user.lastLogin?.toISOString(),
    createdAt: user.createdAt.toISOString(),
    invitedBy: user.invitedBy || undefined,
    employeeId: user.employeeId || undefined,
  };
}

export async function deleteUser(id: string): Promise<void> {
  await prisma.user.delete({
    where: { id },
  });
}

// Subscription
export async function getSubscription(companyId: string): Promise<Subscription | null> {
  const subscription = await prisma.subscription.findUnique({
    where: { companyId },
  });

  if (!subscription) return null;

  return {
    id: subscription.id,
    companyId: subscription.companyId,
    plan: toFrontendSubscriptionPlan(subscription.plan),
    status: subscription.status.toLowerCase() as Subscription['status'],
    currentPeriodStart: subscription.currentPeriodStart.toISOString().split('T')[0],
    currentPeriodEnd: subscription.currentPeriodEnd.toISOString().split('T')[0],
    employeeLimit: subscription.employeeLimit,
    monthlyPrice: Number(subscription.monthlyPrice),
    currency: subscription.currency,
  };
}

export async function getBillingHistory(companyId: string): Promise<BillingHistory[]> {
  const subscription = await prisma.subscription.findUnique({
    where: { companyId },
    include: {
      billingHistory: {
        orderBy: { date: 'desc' },
      },
    },
  });

  if (!subscription) return [];

  return subscription.billingHistory.map((bill) => ({
    id: bill.id,
    date: bill.date.toISOString().split('T')[0],
    description: bill.description,
    amount: Number(bill.amount),
    currency: bill.currency,
    status: bill.status.toLowerCase() as BillingHistory['status'],
    invoiceUrl: bill.invoiceUrl || undefined,
  }));
}

// System Settings
export async function getSystemSettings(companyId: string): Promise<SystemSettings | null> {
  const settings = await prisma.systemSettings.findUnique({
    where: { companyId },
  });

  if (!settings) return null;

  return {
    id: settings.id,
    companyId: settings.companyId,
    workingDays: settings.workingDays as WeekDay[],
    weekendDays: settings.weekendDays as WeekDay[],
    fiscalYearStartMonth: settings.fiscalYearStartMonth,
    dateFormat: settings.dateFormat as SystemSettings['dateFormat'],
    timeFormat: settings.timeFormat as SystemSettings['timeFormat'],
    currency: settings.currency,
    currencySymbol: settings.currencySymbol,
    timezone: settings.timezone,
    ramadanModeEnabled: settings.ramadanModeEnabled,
    ramadanWorkingHours: settings.ramadanWorkingHours,
    regularWorkingHours: settings.regularWorkingHours,
  };
}

export async function updateSystemSettings(
  companyId: string,
  data: Partial<SystemSettings>
): Promise<SystemSettings> {
  const settings = await prisma.systemSettings.upsert({
    where: { companyId },
    update: {
      ...(data.workingDays && { workingDays: data.workingDays }),
      ...(data.weekendDays && { weekendDays: data.weekendDays }),
      ...(data.fiscalYearStartMonth && { fiscalYearStartMonth: data.fiscalYearStartMonth }),
      ...(data.dateFormat && { dateFormat: data.dateFormat }),
      ...(data.timeFormat && { timeFormat: data.timeFormat }),
      ...(data.currency && { currency: data.currency }),
      ...(data.currencySymbol && { currencySymbol: data.currencySymbol }),
      ...(data.timezone && { timezone: data.timezone }),
      ...(data.ramadanModeEnabled !== undefined && {
        ramadanModeEnabled: data.ramadanModeEnabled,
      }),
      ...(data.ramadanWorkingHours && { ramadanWorkingHours: data.ramadanWorkingHours }),
      ...(data.regularWorkingHours && { regularWorkingHours: data.regularWorkingHours }),
    },
    create: {
      companyId,
      workingDays: data.workingDays || ['sunday', 'monday', 'tuesday', 'wednesday', 'thursday'],
      weekendDays: data.weekendDays || ['friday', 'saturday'],
      fiscalYearStartMonth: data.fiscalYearStartMonth || 1,
      dateFormat: data.dateFormat || 'DD/MM/YYYY',
      timeFormat: data.timeFormat || '24h',
      currency: data.currency || 'AED',
      currencySymbol: data.currencySymbol || 'AED',
      timezone: data.timezone || 'Asia/Dubai',
      ramadanModeEnabled: data.ramadanModeEnabled || false,
      ramadanWorkingHours: data.ramadanWorkingHours || 6,
      regularWorkingHours: data.regularWorkingHours || 8,
    },
  });

  return {
    id: settings.id,
    companyId: settings.companyId,
    workingDays: settings.workingDays as WeekDay[],
    weekendDays: settings.weekendDays as WeekDay[],
    fiscalYearStartMonth: settings.fiscalYearStartMonth,
    dateFormat: settings.dateFormat as SystemSettings['dateFormat'],
    timeFormat: settings.timeFormat as SystemSettings['timeFormat'],
    currency: settings.currency,
    currencySymbol: settings.currencySymbol,
    timezone: settings.timezone,
    ramadanModeEnabled: settings.ramadanModeEnabled,
    ramadanWorkingHours: settings.ramadanWorkingHours,
    regularWorkingHours: settings.regularWorkingHours,
  };
}

// Notification Settings
export async function getNotificationSettings(userId: string): Promise<NotificationSettings | null> {
  const settings = await prisma.notificationSettings.findUnique({
    where: { userId },
  });

  if (!settings) return null;

  return {
    id: settings.id,
    companyId: '', // Will need to get from user
    userId: settings.userId,
    emailNotifications: settings.emailNotifications,
    documentExpiryAlertDays: settings.documentExpiryAlertDays,
    leaveRequestNotifications: settings.leaveRequestNotifications,
    leaveApprovalNotifications: settings.leaveApprovalNotifications,
    payrollCompletionAlerts: settings.payrollCompletionAlerts,
    newEmployeeAlerts: settings.newEmployeeAlerts,
    contractExpiryAlerts: settings.contractExpiryAlerts,
  };
}

export async function updateNotificationSettings(
  userId: string,
  data: Partial<NotificationSettings>
): Promise<NotificationSettings> {
  const settings = await prisma.notificationSettings.upsert({
    where: { userId },
    update: {
      ...(data.emailNotifications !== undefined && {
        emailNotifications: data.emailNotifications,
      }),
      ...(data.documentExpiryAlertDays && {
        documentExpiryAlertDays: data.documentExpiryAlertDays,
      }),
      ...(data.leaveRequestNotifications !== undefined && {
        leaveRequestNotifications: data.leaveRequestNotifications,
      }),
      ...(data.leaveApprovalNotifications !== undefined && {
        leaveApprovalNotifications: data.leaveApprovalNotifications,
      }),
      ...(data.payrollCompletionAlerts !== undefined && {
        payrollCompletionAlerts: data.payrollCompletionAlerts,
      }),
      ...(data.newEmployeeAlerts !== undefined && {
        newEmployeeAlerts: data.newEmployeeAlerts,
      }),
      ...(data.contractExpiryAlerts !== undefined && {
        contractExpiryAlerts: data.contractExpiryAlerts,
      }),
    },
    create: {
      userId,
      emailNotifications: data.emailNotifications ?? true,
      documentExpiryAlertDays: data.documentExpiryAlertDays ?? [90, 60, 30, 7],
      leaveRequestNotifications: data.leaveRequestNotifications ?? true,
      leaveApprovalNotifications: data.leaveApprovalNotifications ?? true,
      payrollCompletionAlerts: data.payrollCompletionAlerts ?? true,
      newEmployeeAlerts: data.newEmployeeAlerts ?? true,
      contractExpiryAlerts: data.contractExpiryAlerts ?? true,
    },
  });

  return {
    id: settings.id,
    companyId: '',
    userId: settings.userId,
    emailNotifications: settings.emailNotifications,
    documentExpiryAlertDays: settings.documentExpiryAlertDays,
    leaveRequestNotifications: settings.leaveRequestNotifications,
    leaveApprovalNotifications: settings.leaveApprovalNotifications,
    payrollCompletionAlerts: settings.payrollCompletionAlerts,
    newEmployeeAlerts: settings.newEmployeeAlerts,
    contractExpiryAlerts: settings.contractExpiryAlerts,
  };
}
