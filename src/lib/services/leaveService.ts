import prisma from '@/lib/db';
import { LeaveRequest, LeaveBalance, LeaveType as FrontendLeaveType } from '@/types/leave';
import { LeaveType, LeaveStatus } from '@prisma/client';

// Map Prisma LeaveType to Frontend LeaveType
function toFrontendLeaveType(type: LeaveType): FrontendLeaveType {
  return type.toLowerCase() as FrontendLeaveType;
}

function toPrismaLeaveType(type: FrontendLeaveType): LeaveType {
  return type.toUpperCase() as LeaveType;
}

function toFrontendLeaveStatus(status: LeaveStatus): LeaveRequest['status'] {
  return status.toLowerCase() as LeaveRequest['status'];
}

function toPrismaLeaveStatus(status: LeaveRequest['status']): LeaveStatus {
  return status.toUpperCase() as LeaveStatus;
}

export async function getLeaveBalances(
  companyId: string,
  employeeId?: string,
  year?: number
): Promise<LeaveBalance[]> {
  const currentYear = year || new Date().getFullYear();

  const balances = await prisma.leaveBalance.findMany({
    where: {
      companyId,
      ...(employeeId && { employeeId }),
      year: currentYear,
    },
    include: {
      employee: {
        select: {
          firstName: true,
          lastName: true,
          employeeId: true,
        },
      },
    },
  });

  return balances.map((b) => ({
    id: b.id,
    employeeId: b.employeeId,
    leaveType: toFrontendLeaveType(b.leaveType),
    year: b.year,
    entitled: Number(b.entitled),
    used: Number(b.used),
    pending: Number(b.pending),
    remaining: Number(b.entitled) + Number(b.carriedOver) - Number(b.used) - Number(b.pending),
    carriedOver: Number(b.carriedOver),
  }));
}

export async function getLeaveRequests(
  companyId: string,
  filters?: {
    employeeId?: string;
    status?: LeaveRequest['status'];
    startDate?: string;
    endDate?: string;
  }
): Promise<LeaveRequest[]> {
  const requests = await prisma.leaveRequest.findMany({
    where: {
      companyId,
      ...(filters?.employeeId && { employeeId: filters.employeeId }),
      ...(filters?.status && { status: toPrismaLeaveStatus(filters.status) }),
      ...(filters?.startDate && {
        startDate: { gte: new Date(filters.startDate) },
      }),
      ...(filters?.endDate && {
        endDate: { lte: new Date(filters.endDate) },
      }),
    },
    include: {
      employee: {
        select: {
          firstName: true,
          lastName: true,
          employeeId: true,
          department: true,
        },
      },
    },
    orderBy: { createdAt: 'desc' },
  });

  return requests.map((r) => ({
    id: r.id,
    employeeId: r.employeeId,
    employeeName: `${r.employee.firstName} ${r.employee.lastName}`,
    leaveType: toFrontendLeaveType(r.leaveType),
    startDate: r.startDate.toISOString().split('T')[0],
    endDate: r.endDate.toISOString().split('T')[0],
    totalDays: Number(r.totalDays),
    reason: r.reason || '',
    status: toFrontendLeaveStatus(r.status),
    approvedBy: r.approvedBy || undefined,
    approvedAt: r.approvedAt?.toISOString(),
    rejectionReason: r.rejectionReason || undefined,
    createdAt: r.createdAt.toISOString(),
    updatedAt: r.updatedAt.toISOString(),
  }));
}

export async function createLeaveRequest(
  companyId: string,
  data: {
    employeeId: string;
    leaveType: FrontendLeaveType;
    startDate: string;
    endDate: string;
    totalDays: number;
    reason?: string;
  }
): Promise<LeaveRequest> {
  const request = await prisma.leaveRequest.create({
    data: {
      companyId,
      employeeId: data.employeeId,
      leaveType: toPrismaLeaveType(data.leaveType),
      startDate: new Date(data.startDate),
      endDate: new Date(data.endDate),
      totalDays: data.totalDays,
      reason: data.reason,
      status: LeaveStatus.PENDING,
    },
    include: {
      employee: {
        select: {
          firstName: true,
          lastName: true,
        },
      },
    },
  });

  // Update pending balance
  await prisma.leaveBalance.updateMany({
    where: {
      employeeId: data.employeeId,
      leaveType: toPrismaLeaveType(data.leaveType),
      year: new Date().getFullYear(),
    },
    data: {
      pending: { increment: data.totalDays },
    },
  });

  return {
    id: request.id,
    employeeId: request.employeeId,
    employeeName: `${request.employee.firstName} ${request.employee.lastName}`,
    leaveType: toFrontendLeaveType(request.leaveType),
    startDate: request.startDate.toISOString().split('T')[0],
    endDate: request.endDate.toISOString().split('T')[0],
    totalDays: Number(request.totalDays),
    reason: request.reason || '',
    status: toFrontendLeaveStatus(request.status),
    createdAt: request.createdAt.toISOString(),
    updatedAt: request.updatedAt.toISOString(),
  };
}

export async function updateLeaveRequestStatus(
  id: string,
  status: LeaveRequest['status'],
  approvedBy?: string,
  rejectionReason?: string
): Promise<LeaveRequest> {
  const request = await prisma.leaveRequest.update({
    where: { id },
    data: {
      status: toPrismaLeaveStatus(status),
      ...(approvedBy && { approvedBy, approvedAt: new Date() }),
      ...(rejectionReason && { rejectionReason }),
    },
    include: {
      employee: {
        select: {
          firstName: true,
          lastName: true,
        },
      },
    },
  });

  // Update balances based on status
  if (status === 'approved') {
    await prisma.leaveBalance.updateMany({
      where: {
        employeeId: request.employeeId,
        leaveType: request.leaveType,
        year: new Date().getFullYear(),
      },
      data: {
        used: { increment: Number(request.totalDays) },
        pending: { decrement: Number(request.totalDays) },
      },
    });
  } else if (status === 'rejected' || status === 'cancelled') {
    await prisma.leaveBalance.updateMany({
      where: {
        employeeId: request.employeeId,
        leaveType: request.leaveType,
        year: new Date().getFullYear(),
      },
      data: {
        pending: { decrement: Number(request.totalDays) },
      },
    });
  }

  return {
    id: request.id,
    employeeId: request.employeeId,
    employeeName: `${request.employee.firstName} ${request.employee.lastName}`,
    leaveType: toFrontendLeaveType(request.leaveType),
    startDate: request.startDate.toISOString().split('T')[0],
    endDate: request.endDate.toISOString().split('T')[0],
    totalDays: Number(request.totalDays),
    reason: request.reason || '',
    status: toFrontendLeaveStatus(request.status),
    approvedBy: request.approvedBy || undefined,
    approvedAt: request.approvedAt?.toISOString(),
    rejectionReason: request.rejectionReason || undefined,
    createdAt: request.createdAt.toISOString(),
    updatedAt: request.updatedAt.toISOString(),
  };
}

export async function deleteLeaveRequest(id: string): Promise<void> {
  const request = await prisma.leaveRequest.findUnique({
    where: { id },
  });

  if (request && request.status === 'PENDING') {
    // Restore pending balance
    await prisma.leaveBalance.updateMany({
      where: {
        employeeId: request.employeeId,
        leaveType: request.leaveType,
        year: new Date().getFullYear(),
      },
      data: {
        pending: { decrement: Number(request.totalDays) },
      },
    });
  }

  await prisma.leaveRequest.delete({
    where: { id },
  });
}
