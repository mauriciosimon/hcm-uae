import prisma from '@/lib/db';
import { Employee } from '@/types/employee';
import { Prisma } from '@prisma/client';

// Convert Prisma Employee to Frontend Employee type
function toFrontendEmployee(dbEmployee: any): Employee {
  return {
    id: dbEmployee.id,
    employeeId: dbEmployee.employeeId,
    personalInfo: {
      firstName: dbEmployee.firstName,
      lastName: dbEmployee.lastName,
      arabicName: dbEmployee.firstNameAr && dbEmployee.lastNameAr
        ? `${dbEmployee.firstNameAr} ${dbEmployee.lastNameAr}`
        : undefined,
      dateOfBirth: dbEmployee.dateOfBirth.toISOString().split('T')[0],
      gender: dbEmployee.gender.toLowerCase() as 'male' | 'female',
      nationality: dbEmployee.nationality,
      maritalStatus: dbEmployee.maritalStatus.toLowerCase() as 'single' | 'married' | 'divorced' | 'widowed',
      email: dbEmployee.email,
      phone: dbEmployee.phone,
      address: [dbEmployee.addressLine1, dbEmployee.addressLine2, dbEmployee.city, dbEmployee.country]
        .filter(Boolean)
        .join(', '),
      emergencyContact: {
        name: dbEmployee.emergencyContactName || '',
        relationship: dbEmployee.emergencyContactRelation || '',
        phone: dbEmployee.emergencyContactPhone || '',
      },
    },
    employmentInfo: {
      jobTitle: dbEmployee.jobTitle,
      department: dbEmployee.department,
      employmentStartDate: dbEmployee.employmentStartDate.toISOString().split('T')[0],
      contractType: dbEmployee.contractType.toLowerCase() as 'limited' | 'unlimited',
      contractEndDate: dbEmployee.employmentEndDate?.toISOString().split('T')[0],
      probationEndDate: dbEmployee.probationEndDate?.toISOString().split('T')[0],
      workLocation: dbEmployee.workLocation || '',
      reportingTo: dbEmployee.reportingManagerId || '',
      employmentStatus: dbEmployee.employmentStatus.toLowerCase().replace('_', ' ') as any,
    },
    compensation: {
      basicSalary: Number(dbEmployee.basicSalary),
      housingAllowance: Number(dbEmployee.housingAllowance),
      transportAllowance: Number(dbEmployee.transportAllowance),
      otherAllowances: Number(dbEmployee.otherAllowances),
      totalPackage: Number(dbEmployee.totalPackage),
      currency: 'AED',
    },
    bankDetails: {
      bankName: dbEmployee.bankName || '',
      accountNumber: dbEmployee.bankAccountNumber || '',
      iban: dbEmployee.iban || '',
    },
    documents: {
      // These would come from the documents relation
      passportNumber: '',
      passportExpiry: '',
      emiratesId: '',
      emiratesIdExpiry: '',
      visaNumber: '',
      visaExpiry: '',
      laborCardNumber: '',
      laborCardExpiry: '',
    },
    createdAt: dbEmployee.createdAt.toISOString(),
    updatedAt: dbEmployee.updatedAt.toISOString(),
  };
}

export async function getEmployees(companyId: string): Promise<Employee[]> {
  const employees = await prisma.employee.findMany({
    where: { companyId },
    include: {
      documents: true,
    },
    orderBy: { employeeId: 'asc' },
  });

  return employees.map((emp) => {
    const employee = toFrontendEmployee(emp);

    // Map documents
    emp.documents.forEach((doc) => {
      const expiryDate = doc.expiryDate?.toISOString().split('T')[0] || '';
      switch (doc.documentType) {
        case 'PASSPORT':
          employee.documents.passportNumber = doc.documentNumber || '';
          employee.documents.passportExpiry = expiryDate;
          break;
        case 'EMIRATES_ID':
          employee.documents.emiratesId = doc.documentNumber || '';
          employee.documents.emiratesIdExpiry = expiryDate;
          break;
        case 'VISA':
          employee.documents.visaNumber = doc.documentNumber || '';
          employee.documents.visaExpiry = expiryDate;
          break;
        case 'LABOR_CARD':
          employee.documents.laborCardNumber = doc.documentNumber || '';
          employee.documents.laborCardExpiry = expiryDate;
          break;
      }
    });

    return employee;
  });
}

export async function getEmployeeById(id: string): Promise<Employee | null> {
  const employee = await prisma.employee.findUnique({
    where: { id },
    include: {
      documents: true,
    },
  });

  if (!employee) return null;

  const frontendEmployee = toFrontendEmployee(employee);

  // Map documents
  employee.documents.forEach((doc) => {
    const expiryDate = doc.expiryDate?.toISOString().split('T')[0] || '';
    switch (doc.documentType) {
      case 'PASSPORT':
        frontendEmployee.documents.passportNumber = doc.documentNumber || '';
        frontendEmployee.documents.passportExpiry = expiryDate;
        break;
      case 'EMIRATES_ID':
        frontendEmployee.documents.emiratesId = doc.documentNumber || '';
        frontendEmployee.documents.emiratesIdExpiry = expiryDate;
        break;
      case 'VISA':
        frontendEmployee.documents.visaNumber = doc.documentNumber || '';
        frontendEmployee.documents.visaExpiry = expiryDate;
        break;
      case 'LABOR_CARD':
        frontendEmployee.documents.laborCardNumber = doc.documentNumber || '';
        frontendEmployee.documents.laborCardExpiry = expiryDate;
        break;
    }
  });

  return frontendEmployee;
}

export async function createEmployee(
  companyId: string,
  data: Omit<Employee, 'id' | 'createdAt' | 'updatedAt'>
): Promise<Employee> {
  const employee = await prisma.employee.create({
    data: {
      companyId,
      employeeId: data.employeeId,
      firstName: data.personalInfo.firstName,
      lastName: data.personalInfo.lastName,
      dateOfBirth: new Date(data.personalInfo.dateOfBirth),
      gender: data.personalInfo.gender.toUpperCase() as any,
      nationality: data.personalInfo.nationality,
      maritalStatus: data.personalInfo.maritalStatus.toUpperCase() as any,
      email: data.personalInfo.email,
      phone: data.personalInfo.phone,
      department: data.employmentInfo.department,
      jobTitle: data.employmentInfo.jobTitle,
      employmentStartDate: new Date(data.employmentInfo.employmentStartDate),
      contractType: data.employmentInfo.contractType.toUpperCase() as any,
      basicSalary: data.compensation.basicSalary,
      housingAllowance: data.compensation.housingAllowance,
      transportAllowance: data.compensation.transportAllowance,
      otherAllowances: data.compensation.otherAllowances,
      totalPackage: data.compensation.totalPackage,
      bankName: data.bankDetails.bankName,
      bankAccountNumber: data.bankDetails.accountNumber,
      iban: data.bankDetails.iban,
    },
    include: {
      documents: true,
    },
  });

  return toFrontendEmployee(employee);
}

export async function updateEmployee(
  id: string,
  data: Partial<Employee>
): Promise<Employee> {
  const updateData: Prisma.EmployeeUpdateInput = {};

  if (data.personalInfo) {
    if (data.personalInfo.firstName) updateData.firstName = data.personalInfo.firstName;
    if (data.personalInfo.lastName) updateData.lastName = data.personalInfo.lastName;
    if (data.personalInfo.email) updateData.email = data.personalInfo.email;
    if (data.personalInfo.phone) updateData.phone = data.personalInfo.phone;
    if (data.personalInfo.nationality) updateData.nationality = data.personalInfo.nationality;
  }

  if (data.employmentInfo) {
    if (data.employmentInfo.department) updateData.department = data.employmentInfo.department;
    if (data.employmentInfo.jobTitle) updateData.jobTitle = data.employmentInfo.jobTitle;
  }

  if (data.compensation) {
    if (data.compensation.basicSalary) updateData.basicSalary = data.compensation.basicSalary;
    if (data.compensation.housingAllowance) updateData.housingAllowance = data.compensation.housingAllowance;
    if (data.compensation.transportAllowance) updateData.transportAllowance = data.compensation.transportAllowance;
    if (data.compensation.otherAllowances) updateData.otherAllowances = data.compensation.otherAllowances;
    if (data.compensation.totalPackage) updateData.totalPackage = data.compensation.totalPackage;
  }

  const employee = await prisma.employee.update({
    where: { id },
    data: updateData,
    include: {
      documents: true,
    },
  });

  return toFrontendEmployee(employee);
}

export async function deleteEmployee(id: string): Promise<void> {
  await prisma.employee.delete({
    where: { id },
  });
}

export async function getEmployeesByDepartment(
  companyId: string,
  department: string
): Promise<Employee[]> {
  const employees = await prisma.employee.findMany({
    where: { companyId, department },
    include: {
      documents: true,
    },
    orderBy: { employeeId: 'asc' },
  });

  return employees.map(toFrontendEmployee);
}

export async function getDepartments(companyId: string): Promise<string[]> {
  const departments = await prisma.employee.findMany({
    where: { companyId },
    select: { department: true },
    distinct: ['department'],
  });

  return departments.map((d) => d.department);
}
