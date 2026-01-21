import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/lib/db';
import { OvertimeType, ApprovalStatus } from '@prisma/client';

const DEFAULT_COMPANY_ID = 'company-1';

// GET /api/overtime - Get overtime entries
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const employeeId = searchParams.get('employeeId');
    const status = searchParams.get('status');
    const startDate = searchParams.get('startDate');
    const endDate = searchParams.get('endDate');
    const month = searchParams.get('month');
    const year = searchParams.get('year');

    let dateFilter = {};
    if (startDate && endDate) {
      dateFilter = {
        date: {
          gte: new Date(startDate),
          lte: new Date(endDate),
        },
      };
    } else if (month && year) {
      const startOfMonth = new Date(parseInt(year), parseInt(month) - 1, 1);
      const endOfMonth = new Date(parseInt(year), parseInt(month), 0);
      dateFilter = {
        date: {
          gte: startOfMonth,
          lte: endOfMonth,
        },
      };
    }

    const entries = await prisma.overtimeEntry.findMany({
      where: {
        companyId: DEFAULT_COMPANY_ID,
        ...(employeeId && { employeeId }),
        ...(status && { status: status.toUpperCase() as ApprovalStatus }),
        ...dateFilter,
      },
      include: {
        employee: {
          select: {
            firstName: true,
            lastName: true,
            employeeId: true,
            department: true,
            basicSalary: true,
          },
        },
      },
      orderBy: { date: 'desc' },
    });

    const result = entries.map((entry) => ({
      id: entry.id,
      employeeId: entry.employeeId,
      employeeName: `${entry.employee.firstName} ${entry.employee.lastName}`,
      employeeCode: entry.employee.employeeId,
      department: entry.employee.department,
      date: entry.date.toISOString().split('T')[0],
      hours: Number(entry.hours),
      overtimeType: entry.overtimeType.toLowerCase(),
      multiplier: Number(entry.multiplier),
      hourlyRate: Number(entry.hourlyRate),
      amount: Number(entry.amount),
      reason: entry.reason || '',
      status: entry.status.toLowerCase(),
      approvedBy: entry.approvedBy,
      approvedAt: entry.approvedAt?.toISOString(),
      isRamadan: entry.isRamadan,
      createdAt: entry.createdAt.toISOString(),
    }));

    return NextResponse.json(result);
  } catch (error) {
    console.error('Error fetching overtime entries:', error);
    return NextResponse.json({ error: 'Failed to fetch overtime entries' }, { status: 500 });
  }
}

// POST /api/overtime - Create overtime entry
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();

    // Calculate hourly rate and amount
    const employee = await prisma.employee.findUnique({
      where: { id: body.employeeId },
      select: { basicSalary: true },
    });

    if (!employee) {
      return NextResponse.json({ error: 'Employee not found' }, { status: 404 });
    }

    const workingHours = body.isRamadan ? 6 : 8;
    const hourlyRate = Number(employee.basicSalary) / (30 * workingHours);
    const multiplier = getMultiplier(body.overtimeType);
    const amount = hourlyRate * multiplier * body.hours;

    const entry = await prisma.overtimeEntry.create({
      data: {
        companyId: DEFAULT_COMPANY_ID,
        employeeId: body.employeeId,
        date: new Date(body.date),
        hours: body.hours,
        overtimeType: body.overtimeType.toUpperCase() as OvertimeType,
        multiplier,
        hourlyRate,
        amount,
        reason: body.reason,
        status: ApprovalStatus.PENDING,
        isRamadan: body.isRamadan || false,
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

    return NextResponse.json({
      id: entry.id,
      employeeId: entry.employeeId,
      employeeName: `${entry.employee.firstName} ${entry.employee.lastName}`,
      date: entry.date.toISOString().split('T')[0],
      hours: Number(entry.hours),
      overtimeType: entry.overtimeType.toLowerCase(),
      multiplier: Number(entry.multiplier),
      hourlyRate: Number(entry.hourlyRate),
      amount: Number(entry.amount),
      status: entry.status.toLowerCase(),
    }, { status: 201 });
  } catch (error) {
    console.error('Error creating overtime entry:', error);
    return NextResponse.json({ error: 'Failed to create overtime entry' }, { status: 500 });
  }
}

// PATCH /api/overtime - Update overtime entry status
export async function PATCH(request: NextRequest) {
  try {
    const body = await request.json();
    const { id, status, approvedBy } = body;

    const entry = await prisma.overtimeEntry.update({
      where: { id },
      data: {
        status: status.toUpperCase() as ApprovalStatus,
        ...(approvedBy && { approvedBy, approvedAt: new Date() }),
      },
    });

    return NextResponse.json({ success: true, status: entry.status.toLowerCase() });
  } catch (error) {
    console.error('Error updating overtime entry:', error);
    return NextResponse.json({ error: 'Failed to update overtime entry' }, { status: 500 });
  }
}

// DELETE /api/overtime - Delete overtime entry
export async function DELETE(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const id = searchParams.get('id');

    if (!id) {
      return NextResponse.json({ error: 'ID is required' }, { status: 400 });
    }

    await prisma.overtimeEntry.delete({
      where: { id },
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error deleting overtime entry:', error);
    return NextResponse.json({ error: 'Failed to delete overtime entry' }, { status: 500 });
  }
}

function getMultiplier(type: string): number {
  switch (type.toLowerCase()) {
    case 'regular':
      return 1.25;
    case 'night':
    case 'friday':
      return 1.5;
    case 'holiday':
      return 2.5;
    default:
      return 1.25;
  }
}
