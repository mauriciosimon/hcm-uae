import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/lib/db';
import { Prisma } from '@prisma/client';

const DEFAULT_COMPANY_ID = 'company-1';

// GET /api/employees - List all employees
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const department = searchParams.get('department');
    const status = searchParams.get('status');

    const employees = await prisma.employee.findMany({
      where: {
        companyId: DEFAULT_COMPANY_ID,
        ...(department && { department }),
        ...(status && { employmentStatus: status.toUpperCase() as any }),
      },
      include: {
        documents: true,
      },
      orderBy: { employeeId: 'asc' },
    });

    // Transform to frontend format
    const result = employees.map((emp) => ({
      id: emp.id,
      employeeId: emp.employeeId,
      personalInfo: {
        firstName: emp.firstName,
        lastName: emp.lastName,
        arabicName: emp.firstNameAr && emp.lastNameAr ? `${emp.firstNameAr} ${emp.lastNameAr}` : undefined,
        dateOfBirth: emp.dateOfBirth.toISOString().split('T')[0],
        gender: emp.gender.toLowerCase(),
        nationality: emp.nationality,
        maritalStatus: emp.maritalStatus.toLowerCase(),
        email: emp.email,
        phone: emp.phone,
        address: [emp.addressLine1, emp.city, emp.country].filter(Boolean).join(', '),
        emergencyContact: {
          name: emp.emergencyContactName || '',
          relationship: emp.emergencyContactRelation || '',
          phone: emp.emergencyContactPhone || '',
        },
      },
      employmentInfo: {
        jobTitle: emp.jobTitle,
        department: emp.department,
        employmentStartDate: emp.employmentStartDate.toISOString().split('T')[0],
        contractType: emp.contractType.toLowerCase(),
        contractEndDate: emp.employmentEndDate?.toISOString().split('T')[0],
        probationEndDate: emp.probationEndDate?.toISOString().split('T')[0],
        workLocation: emp.workLocation || '',
        reportingTo: emp.reportingManagerId || '',
        employmentStatus: emp.employmentStatus.toLowerCase(),
      },
      compensation: {
        basicSalary: Number(emp.basicSalary),
        housingAllowance: Number(emp.housingAllowance),
        transportAllowance: Number(emp.transportAllowance),
        otherAllowances: Number(emp.otherAllowances),
        totalPackage: Number(emp.totalPackage),
        currency: 'AED',
      },
      bankDetails: {
        bankName: emp.bankName || '',
        accountNumber: emp.bankAccountNumber || '',
        iban: emp.iban || '',
      },
      documents: emp.documents.reduce((acc, doc) => {
        const expiryDate = doc.expiryDate?.toISOString().split('T')[0] || '';
        switch (doc.documentType) {
          case 'PASSPORT':
            acc.passportNumber = doc.documentNumber || '';
            acc.passportExpiry = expiryDate;
            break;
          case 'EMIRATES_ID':
            acc.emiratesId = doc.documentNumber || '';
            acc.emiratesIdExpiry = expiryDate;
            break;
          case 'VISA':
            acc.visaNumber = doc.documentNumber || '';
            acc.visaExpiry = expiryDate;
            break;
          case 'LABOR_CARD':
            acc.laborCardNumber = doc.documentNumber || '';
            acc.laborCardExpiry = expiryDate;
            break;
        }
        return acc;
      }, {
        passportNumber: '',
        passportExpiry: '',
        emiratesId: '',
        emiratesIdExpiry: '',
        visaNumber: '',
        visaExpiry: '',
        laborCardNumber: '',
        laborCardExpiry: '',
      }),
      createdAt: emp.createdAt.toISOString(),
      updatedAt: emp.updatedAt.toISOString(),
    }));

    return NextResponse.json(result);
  } catch (error) {
    console.error('Error fetching employees:', error);
    return NextResponse.json({ error: 'Failed to fetch employees' }, { status: 500 });
  }
}

// POST /api/employees - Create a new employee
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();

    const employee = await prisma.employee.create({
      data: {
        companyId: DEFAULT_COMPANY_ID,
        employeeId: body.employeeId,
        firstName: body.personalInfo.firstName,
        lastName: body.personalInfo.lastName,
        firstNameAr: body.personalInfo.firstNameAr,
        lastNameAr: body.personalInfo.lastNameAr,
        dateOfBirth: new Date(body.personalInfo.dateOfBirth),
        gender: body.personalInfo.gender.toUpperCase(),
        nationality: body.personalInfo.nationality,
        maritalStatus: body.personalInfo.maritalStatus.toUpperCase(),
        email: body.personalInfo.email,
        phone: body.personalInfo.phone,
        addressLine1: body.personalInfo.address,
        emergencyContactName: body.personalInfo.emergencyContact?.name,
        emergencyContactPhone: body.personalInfo.emergencyContact?.phone,
        emergencyContactRelation: body.personalInfo.emergencyContact?.relationship,
        department: body.employmentInfo.department,
        jobTitle: body.employmentInfo.jobTitle,
        employmentStartDate: new Date(body.employmentInfo.employmentStartDate),
        contractType: body.employmentInfo.contractType.toUpperCase(),
        employmentStatus: 'ACTIVE',
        workLocation: body.employmentInfo.workLocation,
        basicSalary: body.compensation.basicSalary,
        housingAllowance: body.compensation.housingAllowance || 0,
        transportAllowance: body.compensation.transportAllowance || 0,
        otherAllowances: body.compensation.otherAllowances || 0,
        totalPackage: body.compensation.totalPackage || (
          body.compensation.basicSalary +
          (body.compensation.housingAllowance || 0) +
          (body.compensation.transportAllowance || 0) +
          (body.compensation.otherAllowances || 0)
        ),
        bankName: body.bankDetails?.bankName,
        bankAccountNumber: body.bankDetails?.accountNumber,
        iban: body.bankDetails?.iban,
      },
    });

    return NextResponse.json(employee, { status: 201 });
  } catch (error) {
    console.error('Error creating employee:', error);
    return NextResponse.json({ error: 'Failed to create employee' }, { status: 500 });
  }
}
