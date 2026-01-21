import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/lib/db';
import { UserRole, SubscriptionPlan } from '@prisma/client';

const DEFAULT_COMPANY_ID = 'company-1';
const DEFAULT_USER_ID = 'user-1';

// GET /api/settings - Get settings
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const type = searchParams.get('type');

    switch (type) {
      case 'company': {
        const company = await prisma.company.findUnique({
          where: { id: DEFAULT_COMPANY_ID },
        });

        if (!company) {
          return NextResponse.json({ error: 'Company not found' }, { status: 404 });
        }

        return NextResponse.json({
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
          website: company.website,
          logoUrl: company.logoUrl,
          wpsEmployerCode: company.wpsEmployerCode || '',
          wpsRoutingCode: company.wpsRoutingCode || '',
        });
      }

      case 'users': {
        const users = await prisma.user.findMany({
          where: { companyId: DEFAULT_COMPANY_ID },
          orderBy: { createdAt: 'asc' },
        });

        return NextResponse.json(users.map((user) => ({
          id: user.id,
          email: user.email,
          firstName: user.firstName,
          lastName: user.lastName,
          role: user.role.toLowerCase(),
          isActive: user.isActive,
          lastLogin: user.lastLogin?.toISOString(),
          createdAt: user.createdAt.toISOString(),
          invitedBy: user.invitedBy,
        })));
      }

      case 'subscription': {
        const subscription = await prisma.subscription.findUnique({
          where: { companyId: DEFAULT_COMPANY_ID },
          include: {
            billingHistory: {
              orderBy: { date: 'desc' },
              take: 10,
            },
          },
        });

        if (!subscription) {
          return NextResponse.json({ error: 'Subscription not found' }, { status: 404 });
        }

        return NextResponse.json({
          subscription: {
            id: subscription.id,
            plan: subscription.plan.toLowerCase(),
            status: subscription.status.toLowerCase(),
            currentPeriodStart: subscription.currentPeriodStart.toISOString().split('T')[0],
            currentPeriodEnd: subscription.currentPeriodEnd.toISOString().split('T')[0],
            employeeLimit: subscription.employeeLimit,
            monthlyPrice: Number(subscription.monthlyPrice),
            currency: subscription.currency,
          },
          billingHistory: subscription.billingHistory.map((bill) => ({
            id: bill.id,
            date: bill.date.toISOString().split('T')[0],
            description: bill.description,
            amount: Number(bill.amount),
            currency: bill.currency,
            status: bill.status.toLowerCase(),
            invoiceUrl: bill.invoiceUrl,
          })),
        });
      }

      case 'system': {
        const settings = await prisma.systemSettings.findUnique({
          where: { companyId: DEFAULT_COMPANY_ID },
        });

        if (!settings) {
          // Return defaults
          return NextResponse.json({
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
          });
        }

        return NextResponse.json({
          id: settings.id,
          workingDays: settings.workingDays,
          weekendDays: settings.weekendDays,
          fiscalYearStartMonth: settings.fiscalYearStartMonth,
          dateFormat: settings.dateFormat,
          timeFormat: settings.timeFormat,
          currency: settings.currency,
          currencySymbol: settings.currencySymbol,
          timezone: settings.timezone,
          ramadanModeEnabled: settings.ramadanModeEnabled,
          ramadanWorkingHours: settings.ramadanWorkingHours,
          regularWorkingHours: settings.regularWorkingHours,
        });
      }

      case 'notifications': {
        const settings = await prisma.notificationSettings.findUnique({
          where: { userId: DEFAULT_USER_ID },
        });

        if (!settings) {
          return NextResponse.json({
            emailNotifications: true,
            documentExpiryAlertDays: [90, 60, 30, 7],
            leaveRequestNotifications: true,
            leaveApprovalNotifications: true,
            payrollCompletionAlerts: true,
            newEmployeeAlerts: true,
            contractExpiryAlerts: true,
          });
        }

        return NextResponse.json({
          id: settings.id,
          emailNotifications: settings.emailNotifications,
          documentExpiryAlertDays: settings.documentExpiryAlertDays,
          leaveRequestNotifications: settings.leaveRequestNotifications,
          leaveApprovalNotifications: settings.leaveApprovalNotifications,
          payrollCompletionAlerts: settings.payrollCompletionAlerts,
          newEmployeeAlerts: settings.newEmployeeAlerts,
          contractExpiryAlerts: settings.contractExpiryAlerts,
        });
      }

      default:
        return NextResponse.json({ error: 'Invalid settings type' }, { status: 400 });
    }
  } catch (error) {
    console.error('Error fetching settings:', error);
    return NextResponse.json({ error: 'Failed to fetch settings' }, { status: 500 });
  }
}

// PUT /api/settings - Update settings
export async function PUT(request: NextRequest) {
  try {
    const body = await request.json();
    const { type, ...data } = body;

    switch (type) {
      case 'company': {
        const company = await prisma.company.update({
          where: { id: DEFAULT_COMPANY_ID },
          data: {
            ...(data.name && { name: data.name }),
            ...(data.nameAr !== undefined && { nameAr: data.nameAr }),
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

        return NextResponse.json({ success: true, id: company.id });
      }

      case 'system': {
        const settings = await prisma.systemSettings.upsert({
          where: { companyId: DEFAULT_COMPANY_ID },
          update: {
            ...(data.workingDays && { workingDays: data.workingDays }),
            ...(data.weekendDays && { weekendDays: data.weekendDays }),
            ...(data.fiscalYearStartMonth && { fiscalYearStartMonth: data.fiscalYearStartMonth }),
            ...(data.dateFormat && { dateFormat: data.dateFormat }),
            ...(data.timeFormat && { timeFormat: data.timeFormat }),
            ...(data.currency && { currency: data.currency }),
            ...(data.currencySymbol && { currencySymbol: data.currencySymbol }),
            ...(data.timezone && { timezone: data.timezone }),
            ...(data.ramadanModeEnabled !== undefined && { ramadanModeEnabled: data.ramadanModeEnabled }),
            ...(data.ramadanWorkingHours && { ramadanWorkingHours: data.ramadanWorkingHours }),
            ...(data.regularWorkingHours && { regularWorkingHours: data.regularWorkingHours }),
          },
          create: {
            companyId: DEFAULT_COMPANY_ID,
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

        return NextResponse.json({ success: true, id: settings.id });
      }

      case 'notifications': {
        const settings = await prisma.notificationSettings.upsert({
          where: { userId: DEFAULT_USER_ID },
          update: {
            ...(data.emailNotifications !== undefined && { emailNotifications: data.emailNotifications }),
            ...(data.documentExpiryAlertDays && { documentExpiryAlertDays: data.documentExpiryAlertDays }),
            ...(data.leaveRequestNotifications !== undefined && { leaveRequestNotifications: data.leaveRequestNotifications }),
            ...(data.leaveApprovalNotifications !== undefined && { leaveApprovalNotifications: data.leaveApprovalNotifications }),
            ...(data.payrollCompletionAlerts !== undefined && { payrollCompletionAlerts: data.payrollCompletionAlerts }),
            ...(data.newEmployeeAlerts !== undefined && { newEmployeeAlerts: data.newEmployeeAlerts }),
            ...(data.contractExpiryAlerts !== undefined && { contractExpiryAlerts: data.contractExpiryAlerts }),
          },
          create: {
            userId: DEFAULT_USER_ID,
            emailNotifications: data.emailNotifications ?? true,
            documentExpiryAlertDays: data.documentExpiryAlertDays ?? [90, 60, 30, 7],
            leaveRequestNotifications: data.leaveRequestNotifications ?? true,
            leaveApprovalNotifications: data.leaveApprovalNotifications ?? true,
            payrollCompletionAlerts: data.payrollCompletionAlerts ?? true,
            newEmployeeAlerts: data.newEmployeeAlerts ?? true,
            contractExpiryAlerts: data.contractExpiryAlerts ?? true,
          },
        });

        return NextResponse.json({ success: true, id: settings.id });
      }

      default:
        return NextResponse.json({ error: 'Invalid settings type' }, { status: 400 });
    }
  } catch (error) {
    console.error('Error updating settings:', error);
    return NextResponse.json({ error: 'Failed to update settings' }, { status: 500 });
  }
}

// POST /api/settings/users - Create user
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();

    const user = await prisma.user.create({
      data: {
        companyId: DEFAULT_COMPANY_ID,
        email: body.email,
        firstName: body.firstName,
        lastName: body.lastName,
        role: body.role.toUpperCase().replace(' ', '_') as UserRole,
        invitedBy: body.invitedBy || DEFAULT_USER_ID,
        isActive: true,
      },
    });

    return NextResponse.json({
      id: user.id,
      email: user.email,
      firstName: user.firstName,
      lastName: user.lastName,
      role: user.role.toLowerCase(),
      isActive: user.isActive,
      createdAt: user.createdAt.toISOString(),
    }, { status: 201 });
  } catch (error) {
    console.error('Error creating user:', error);
    return NextResponse.json({ error: 'Failed to create user' }, { status: 500 });
  }
}

// PATCH /api/settings - Update user status
export async function PATCH(request: NextRequest) {
  try {
    const body = await request.json();
    const { userId, isActive, role } = body;

    const user = await prisma.user.update({
      where: { id: userId },
      data: {
        ...(isActive !== undefined && { isActive }),
        ...(role && { role: role.toUpperCase().replace(' ', '_') as UserRole }),
      },
    });

    return NextResponse.json({ success: true, isActive: user.isActive });
  } catch (error) {
    console.error('Error updating user:', error);
    return NextResponse.json({ error: 'Failed to update user' }, { status: 500 });
  }
}

// DELETE /api/settings - Delete user
export async function DELETE(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const userId = searchParams.get('userId');

    if (!userId) {
      return NextResponse.json({ error: 'User ID is required' }, { status: 400 });
    }

    await prisma.user.delete({
      where: { id: userId },
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error deleting user:', error);
    return NextResponse.json({ error: 'Failed to delete user' }, { status: 500 });
  }
}
