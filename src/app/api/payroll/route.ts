import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/lib/db';
import { PayrollStatus } from '@prisma/client';

const DEFAULT_COMPANY_ID = 'company-1';

// GET /api/payroll - Get payroll runs and entries
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const type = searchParams.get('type'); // 'runs' or 'entries'
    const month = searchParams.get('month');
    const year = searchParams.get('year');
    const runId = searchParams.get('runId');

    if (type === 'entries' && runId) {
      const entries = await prisma.payrollEntry.findMany({
        where: { payrollRunId: runId },
        include: {
          employee: {
            select: {
              firstName: true,
              lastName: true,
              employeeId: true,
              department: true,
              bankName: true,
              iban: true,
            },
          },
        },
        orderBy: { employee: { employeeId: 'asc' } },
      });

      const result = entries.map((entry) => ({
        id: entry.id,
        employeeId: entry.employeeId,
        employeeName: `${entry.employee.firstName} ${entry.employee.lastName}`,
        employeeCode: entry.employee.employeeId,
        department: entry.employee.department,
        bankName: entry.employee.bankName,
        iban: entry.employee.iban,
        basicSalary: Number(entry.basicSalary),
        housingAllowance: Number(entry.housingAllowance),
        transportAllowance: Number(entry.transportAllowance),
        otherAllowances: Number(entry.otherAllowances),
        overtimeAmount: Number(entry.overtimeAmount),
        bonus: Number(entry.bonus),
        commission: Number(entry.commission),
        grossSalary: Number(entry.grossSalary),
        unpaidLeave: Number(entry.unpaidLeave),
        loanDeduction: Number(entry.loanDeduction),
        advanceDeduction: Number(entry.advanceDeduction),
        otherDeductions: Number(entry.otherDeductions),
        totalDeductions: Number(entry.totalDeductions),
        netSalary: Number(entry.netSalary),
        workingDays: entry.workingDays,
        daysWorked: entry.daysWorked,
      }));

      return NextResponse.json(result);
    }

    // Get payroll runs
    const runs = await prisma.payrollRun.findMany({
      where: {
        companyId: DEFAULT_COMPANY_ID,
        ...(month && { month: parseInt(month) }),
        ...(year && { year: parseInt(year) }),
      },
      include: {
        _count: { select: { entries: true } },
      },
      orderBy: [{ year: 'desc' }, { month: 'desc' }],
    });

    const result = runs.map((run) => ({
      id: run.id,
      month: run.month,
      year: run.year,
      status: run.status.toLowerCase(),
      totalGross: Number(run.totalGross),
      totalDeductions: Number(run.totalDeductions),
      totalNet: Number(run.totalNet),
      employeeCount: run._count.entries,
      processedBy: run.processedBy,
      processedAt: run.processedAt?.toISOString(),
      wpsFileUrl: run.wpsFileUrl,
      createdAt: run.createdAt.toISOString(),
    }));

    return NextResponse.json(result);
  } catch (error) {
    console.error('Error fetching payroll data:', error);
    return NextResponse.json({ error: 'Failed to fetch payroll data' }, { status: 500 });
  }
}

// POST /api/payroll - Create payroll run
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { month, year } = body;

    // Check if payroll run already exists
    const existing = await prisma.payrollRun.findFirst({
      where: {
        companyId: DEFAULT_COMPANY_ID,
        month,
        year,
      },
    });

    if (existing) {
      return NextResponse.json({ error: 'Payroll run already exists for this period' }, { status: 400 });
    }

    // Get all active employees
    const employees = await prisma.employee.findMany({
      where: {
        companyId: DEFAULT_COMPANY_ID,
        employmentStatus: 'ACTIVE',
      },
    });

    // Get overtime for the month
    const startDate = new Date(year, month - 1, 1);
    const endDate = new Date(year, month, 0);

    const overtimeEntries = await prisma.overtimeEntry.findMany({
      where: {
        companyId: DEFAULT_COMPANY_ID,
        date: { gte: startDate, lte: endDate },
        status: 'APPROVED',
      },
    });

    // Get active loans
    const loans = await prisma.loan.findMany({
      where: {
        companyId: DEFAULT_COMPANY_ID,
        status: 'ACTIVE',
      },
    });

    // Create payroll run
    const payrollRun = await prisma.payrollRun.create({
      data: {
        companyId: DEFAULT_COMPANY_ID,
        month,
        year,
        status: PayrollStatus.DRAFT,
      },
    });

    // Create payroll entries for each employee
    let totalGross = 0;
    let totalDeductions = 0;
    let totalNet = 0;

    for (const emp of employees) {
      // Calculate overtime for this employee
      const empOvertime = overtimeEntries
        .filter((ot) => ot.employeeId === emp.id)
        .reduce((sum, ot) => sum + Number(ot.amount), 0);

      // Calculate loan deductions
      const empLoans = loans.filter((l) => l.employeeId === emp.id);
      const loanDeduction = empLoans
        .filter((l) => l.type === 'LOAN')
        .reduce((sum, l) => sum + Number(l.monthlyDeduction), 0);
      const advanceDeduction = empLoans
        .filter((l) => l.type === 'ADVANCE')
        .reduce((sum, l) => sum + Number(l.monthlyDeduction), 0);

      const grossSalary = Number(emp.basicSalary) +
        Number(emp.housingAllowance) +
        Number(emp.transportAllowance) +
        Number(emp.otherAllowances) +
        empOvertime;

      const totalDed = loanDeduction + advanceDeduction;
      const netSalary = grossSalary - totalDed;

      await prisma.payrollEntry.create({
        data: {
          payrollRunId: payrollRun.id,
          employeeId: emp.id,
          basicSalary: emp.basicSalary,
          housingAllowance: emp.housingAllowance,
          transportAllowance: emp.transportAllowance,
          otherAllowances: emp.otherAllowances,
          overtimeAmount: empOvertime,
          grossSalary,
          loanDeduction,
          advanceDeduction,
          totalDeductions: totalDed,
          netSalary,
          workingDays: 22,
          daysWorked: 22,
        },
      });

      totalGross += grossSalary;
      totalDeductions += totalDed;
      totalNet += netSalary;
    }

    // Update payroll run totals
    await prisma.payrollRun.update({
      where: { id: payrollRun.id },
      data: {
        totalGross,
        totalDeductions,
        totalNet,
        employeeCount: employees.length,
      },
    });

    return NextResponse.json({
      id: payrollRun.id,
      month: payrollRun.month,
      year: payrollRun.year,
      status: 'draft',
      employeeCount: employees.length,
      totalGross,
      totalNet,
    }, { status: 201 });
  } catch (error) {
    console.error('Error creating payroll run:', error);
    return NextResponse.json({ error: 'Failed to create payroll run' }, { status: 500 });
  }
}

// PATCH /api/payroll - Update payroll run status
export async function PATCH(request: NextRequest) {
  try {
    const body = await request.json();
    const { id, status, processedBy } = body;

    const payrollRun = await prisma.payrollRun.update({
      where: { id },
      data: {
        status: status.toUpperCase() as PayrollStatus,
        ...(processedBy && { processedBy, processedAt: new Date() }),
      },
    });

    // If completed, update loan installments
    if (status === 'completed') {
      const entries = await prisma.payrollEntry.findMany({
        where: { payrollRunId: id },
      });

      for (const entry of entries) {
        if (Number(entry.loanDeduction) > 0 || Number(entry.advanceDeduction) > 0) {
          // Update loans
          await prisma.loan.updateMany({
            where: {
              employeeId: entry.employeeId,
              status: 'ACTIVE',
            },
            data: {
              paidInstallments: { increment: 1 },
              remainingBalance: { decrement: Number(entry.loanDeduction) + Number(entry.advanceDeduction) },
            },
          });

          // Check if any loans are completed
          const completedLoans = await prisma.loan.findMany({
            where: {
              employeeId: entry.employeeId,
              status: 'ACTIVE',
              remainingBalance: { lte: 0 },
            },
          });

          for (const loan of completedLoans) {
            await prisma.loan.update({
              where: { id: loan.id },
              data: { status: 'COMPLETED' },
            });
          }
        }
      }
    }

    return NextResponse.json({ success: true, status: payrollRun.status.toLowerCase() });
  } catch (error) {
    console.error('Error updating payroll run:', error);
    return NextResponse.json({ error: 'Failed to update payroll run' }, { status: 500 });
  }
}
