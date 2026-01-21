import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/lib/db';
import { LeaveType, LeaveStatus } from '@prisma/client';

const DEFAULT_COMPANY_ID = 'company-1';

// GET /api/leave - Get leave requests and balances
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const type = searchParams.get('type'); // 'requests' or 'balances'
    const employeeId = searchParams.get('employeeId');
    const status = searchParams.get('status');
    const year = searchParams.get('year');

    if (type === 'balances') {
      const currentYear = year ? parseInt(year) : new Date().getFullYear();

      const balances = await prisma.leaveBalance.findMany({
        where: {
          companyId: DEFAULT_COMPANY_ID,
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

      const result = balances.map((b) => ({
        id: b.id,
        employeeId: b.employeeId,
        employeeName: `${b.employee.firstName} ${b.employee.lastName}`,
        employeeCode: b.employee.employeeId,
        leaveType: b.leaveType.toLowerCase(),
        year: b.year,
        entitled: Number(b.entitled),
        used: Number(b.used),
        pending: Number(b.pending),
        remaining: Number(b.entitled) + Number(b.carriedOver) - Number(b.used) - Number(b.pending),
        carriedOver: Number(b.carriedOver),
      }));

      return NextResponse.json(result);
    }

    // Default: get leave requests
    const requests = await prisma.leaveRequest.findMany({
      where: {
        companyId: DEFAULT_COMPANY_ID,
        ...(employeeId && { employeeId }),
        ...(status && { status: status.toUpperCase() as LeaveStatus }),
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

    const result = requests.map((r) => ({
      id: r.id,
      employeeId: r.employeeId,
      employeeName: `${r.employee.firstName} ${r.employee.lastName}`,
      employeeCode: r.employee.employeeId,
      department: r.employee.department,
      leaveType: r.leaveType.toLowerCase(),
      startDate: r.startDate.toISOString().split('T')[0],
      endDate: r.endDate.toISOString().split('T')[0],
      totalDays: Number(r.totalDays),
      reason: r.reason || '',
      status: r.status.toLowerCase(),
      approvedBy: r.approvedBy,
      approvedAt: r.approvedAt?.toISOString(),
      rejectionReason: r.rejectionReason,
      createdAt: r.createdAt.toISOString(),
      updatedAt: r.updatedAt.toISOString(),
    }));

    return NextResponse.json(result);
  } catch (error) {
    console.error('Error fetching leave data:', error);
    return NextResponse.json({ error: 'Failed to fetch leave data' }, { status: 500 });
  }
}

// POST /api/leave - Create leave request
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();

    const leaveRequest = await prisma.leaveRequest.create({
      data: {
        companyId: DEFAULT_COMPANY_ID,
        employeeId: body.employeeId,
        leaveType: body.leaveType.toUpperCase() as LeaveType,
        startDate: new Date(body.startDate),
        endDate: new Date(body.endDate),
        totalDays: body.totalDays,
        reason: body.reason,
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
        employeeId: body.employeeId,
        leaveType: body.leaveType.toUpperCase() as LeaveType,
        year: new Date().getFullYear(),
      },
      data: {
        pending: { increment: body.totalDays },
      },
    });

    return NextResponse.json({
      id: leaveRequest.id,
      employeeId: leaveRequest.employeeId,
      employeeName: `${leaveRequest.employee.firstName} ${leaveRequest.employee.lastName}`,
      leaveType: leaveRequest.leaveType.toLowerCase(),
      startDate: leaveRequest.startDate.toISOString().split('T')[0],
      endDate: leaveRequest.endDate.toISOString().split('T')[0],
      totalDays: Number(leaveRequest.totalDays),
      reason: leaveRequest.reason || '',
      status: leaveRequest.status.toLowerCase(),
      createdAt: leaveRequest.createdAt.toISOString(),
    }, { status: 201 });
  } catch (error) {
    console.error('Error creating leave request:', error);
    return NextResponse.json({ error: 'Failed to create leave request' }, { status: 500 });
  }
}

// PATCH /api/leave - Update leave request status
export async function PATCH(request: NextRequest) {
  try {
    const body = await request.json();
    const { id, status, approvedBy, rejectionReason } = body;

    const leaveRequest = await prisma.leaveRequest.update({
      where: { id },
      data: {
        status: status.toUpperCase() as LeaveStatus,
        ...(approvedBy && { approvedBy, approvedAt: new Date() }),
        ...(rejectionReason && { rejectionReason }),
      },
    });

    // Update balances based on status
    if (status === 'approved') {
      await prisma.leaveBalance.updateMany({
        where: {
          employeeId: leaveRequest.employeeId,
          leaveType: leaveRequest.leaveType,
          year: new Date().getFullYear(),
        },
        data: {
          used: { increment: Number(leaveRequest.totalDays) },
          pending: { decrement: Number(leaveRequest.totalDays) },
        },
      });
    } else if (status === 'rejected' || status === 'cancelled') {
      await prisma.leaveBalance.updateMany({
        where: {
          employeeId: leaveRequest.employeeId,
          leaveType: leaveRequest.leaveType,
          year: new Date().getFullYear(),
        },
        data: {
          pending: { decrement: Number(leaveRequest.totalDays) },
        },
      });
    }

    return NextResponse.json({ success: true, status: leaveRequest.status.toLowerCase() });
  } catch (error) {
    console.error('Error updating leave request:', error);
    return NextResponse.json({ error: 'Failed to update leave request' }, { status: 500 });
  }
}
