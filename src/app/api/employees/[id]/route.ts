import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/lib/db';

// GET /api/employees/[id] - Get single employee
export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const employee = await prisma.employee.findUnique({
      where: { id: params.id },
      include: { documents: true },
    });

    if (!employee) {
      return NextResponse.json({ error: 'Employee not found' }, { status: 404 });
    }

    return NextResponse.json(employee);
  } catch (error) {
    console.error('Error fetching employee:', error);
    return NextResponse.json({ error: 'Failed to fetch employee' }, { status: 500 });
  }
}

// PUT /api/employees/[id] - Update employee
export async function PUT(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const body = await request.json();

    const employee = await prisma.employee.update({
      where: { id: params.id },
      data: {
        ...(body.firstName && { firstName: body.firstName }),
        ...(body.lastName && { lastName: body.lastName }),
        ...(body.email && { email: body.email }),
        ...(body.phone && { phone: body.phone }),
        ...(body.department && { department: body.department }),
        ...(body.jobTitle && { jobTitle: body.jobTitle }),
        ...(body.basicSalary && { basicSalary: body.basicSalary }),
        ...(body.housingAllowance !== undefined && { housingAllowance: body.housingAllowance }),
        ...(body.transportAllowance !== undefined && { transportAllowance: body.transportAllowance }),
        ...(body.otherAllowances !== undefined && { otherAllowances: body.otherAllowances }),
        ...(body.totalPackage && { totalPackage: body.totalPackage }),
        ...(body.employmentStatus && { employmentStatus: body.employmentStatus.toUpperCase() }),
        ...(body.bankName && { bankName: body.bankName }),
        ...(body.bankAccountNumber && { bankAccountNumber: body.bankAccountNumber }),
        ...(body.iban && { iban: body.iban }),
      },
    });

    return NextResponse.json(employee);
  } catch (error) {
    console.error('Error updating employee:', error);
    return NextResponse.json({ error: 'Failed to update employee' }, { status: 500 });
  }
}

// DELETE /api/employees/[id] - Delete employee
export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    await prisma.employee.delete({
      where: { id: params.id },
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error deleting employee:', error);
    return NextResponse.json({ error: 'Failed to delete employee' }, { status: 500 });
  }
}
