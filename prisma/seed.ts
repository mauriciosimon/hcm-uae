import { PrismaClient, Gender, MaritalStatus, ContractType, EmploymentStatus, LeaveType, LeaveStatus, OvertimeType, ApprovalStatus, DocumentType, DocumentStatus, LoanType, LoanStatus, UserRole, SubscriptionPlan, SubscriptionStatus, PaymentStatus } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  console.log('Starting seed...');

  // Clean existing data
  console.log('Cleaning existing data...');
  await prisma.billingHistory.deleteMany();
  await prisma.subscription.deleteMany();
  await prisma.notificationSettings.deleteMany();
  await prisma.systemSettings.deleteMany();
  await prisma.payrollEntry.deleteMany();
  await prisma.payrollRun.deleteMany();
  await prisma.loan.deleteMany();
  await prisma.document.deleteMany();
  await prisma.overtimeEntry.deleteMany();
  await prisma.leaveRequest.deleteMany();
  await prisma.leaveBalance.deleteMany();
  await prisma.user.deleteMany();
  await prisma.employee.deleteMany();
  await prisma.company.deleteMany();

  // Create Company
  console.log('Creating company...');
  const company = await prisma.company.create({
    data: {
      id: 'company-1',
      name: 'TechCorp UAE LLC',
      nameAr: 'تك كورب الإمارات ذ.م.م',
      tradeLicenseNumber: 'TL-2024-123456',
      establishmentCard: 'EC-2024-789012',
      address: 'Office 501, Business Bay Tower',
      city: 'Dubai',
      emirate: 'Dubai',
      poBox: '12345',
      phone: '+971 4 123 4567',
      email: 'hr@techcorp.ae',
      website: 'https://techcorp.ae',
      wpsEmployerCode: 'TC001234',
      wpsRoutingCode: 'ENBD',
    },
  });

  // Create Employees
  console.log('Creating employees...');
  const employees = await Promise.all([
    prisma.employee.create({
      data: {
        id: 'emp-1',
        companyId: company.id,
        employeeId: 'EMP-001',
        firstName: 'Ahmed',
        lastName: 'Al-Rashid',
        firstNameAr: 'أحمد',
        lastNameAr: 'الراشد',
        dateOfBirth: new Date('1990-05-15'),
        gender: Gender.MALE,
        nationality: 'UAE',
        maritalStatus: MaritalStatus.MARRIED,
        email: 'ahmed.rashid@company.ae',
        phone: '+971501234567',
        addressLine1: 'Dubai Marina',
        city: 'Dubai',
        country: 'UAE',
        emergencyContactName: 'Fatima Al-Rashid',
        emergencyContactPhone: '+971509876543',
        emergencyContactRelation: 'Spouse',
        department: 'Information Technology',
        jobTitle: 'Senior Software Engineer',
        employmentStartDate: new Date('2020-03-01'),
        contractType: ContractType.LIMITED,
        employmentStatus: EmploymentStatus.ACTIVE,
        probationEndDate: new Date('2020-09-01'),
        workLocation: 'Dubai Office',
        basicSalary: 15000,
        housingAllowance: 5000,
        transportAllowance: 2000,
        otherAllowances: 1000,
        totalPackage: 23000,
        bankName: 'Emirates NBD',
        bankAccountNumber: '1234567890',
        iban: 'AE070331234567890123456',
        routingCode: 'ENBD',
      },
    }),
    prisma.employee.create({
      data: {
        id: 'emp-2',
        companyId: company.id,
        employeeId: 'EMP-002',
        firstName: 'Maria',
        lastName: 'Santos',
        dateOfBirth: new Date('1988-11-22'),
        gender: Gender.FEMALE,
        nationality: 'Philippines',
        maritalStatus: MaritalStatus.SINGLE,
        email: 'maria.santos@company.ae',
        phone: '+971551234567',
        addressLine1: 'Al Barsha',
        city: 'Dubai',
        country: 'UAE',
        emergencyContactName: 'Juan Santos',
        emergencyContactPhone: '+639171234567',
        emergencyContactRelation: 'Father',
        department: 'Human Resources',
        jobTitle: 'HR Manager',
        employmentStartDate: new Date('2019-06-15'),
        contractType: ContractType.LIMITED,
        employmentStatus: EmploymentStatus.ACTIVE,
        probationEndDate: new Date('2019-12-15'),
        workLocation: 'Dubai Office',
        basicSalary: 18000,
        housingAllowance: 6000,
        transportAllowance: 2500,
        otherAllowances: 1500,
        totalPackage: 28000,
        bankName: 'First Abu Dhabi Bank (FAB)',
        bankAccountNumber: '0987654321',
        iban: 'AE070350987654321098765',
        routingCode: 'FAB',
      },
    }),
    prisma.employee.create({
      data: {
        id: 'emp-3',
        companyId: company.id,
        employeeId: 'EMP-003',
        firstName: 'Rajesh',
        lastName: 'Kumar',
        dateOfBirth: new Date('1985-03-08'),
        gender: Gender.MALE,
        nationality: 'India',
        maritalStatus: MaritalStatus.MARRIED,
        email: 'rajesh.kumar@company.ae',
        phone: '+971561234567',
        addressLine1: 'International City',
        city: 'Dubai',
        country: 'UAE',
        emergencyContactName: 'Priya Kumar',
        emergencyContactPhone: '+971569876543',
        emergencyContactRelation: 'Spouse',
        department: 'Finance',
        jobTitle: 'Finance Director',
        employmentStartDate: new Date('2018-01-10'),
        contractType: ContractType.LIMITED,
        employmentStatus: EmploymentStatus.ACTIVE,
        probationEndDate: new Date('2018-07-10'),
        workLocation: 'Abu Dhabi Office',
        basicSalary: 25000,
        housingAllowance: 8000,
        transportAllowance: 3000,
        otherAllowances: 4000,
        totalPackage: 40000,
        bankName: 'Mashreq Bank',
        bankAccountNumber: '5678901234',
        iban: 'AE070465678901234567890',
        routingCode: 'MSHQ',
      },
    }),
    prisma.employee.create({
      data: {
        id: 'emp-4',
        companyId: company.id,
        employeeId: 'EMP-004',
        firstName: 'Sarah',
        lastName: 'Johnson',
        dateOfBirth: new Date('1992-07-20'),
        gender: Gender.FEMALE,
        nationality: 'United Kingdom',
        maritalStatus: MaritalStatus.SINGLE,
        email: 'sarah.johnson@company.ae',
        phone: '+971521234567',
        addressLine1: 'JLT Cluster W',
        city: 'Dubai',
        country: 'UAE',
        emergencyContactName: 'Michael Johnson',
        emergencyContactPhone: '+447911123456',
        emergencyContactRelation: 'Brother',
        department: 'Marketing',
        jobTitle: 'Marketing Manager',
        employmentStartDate: new Date('2021-09-01'),
        contractType: ContractType.LIMITED,
        employmentStatus: EmploymentStatus.ACTIVE,
        probationEndDate: new Date('2022-03-01'),
        workLocation: 'Dubai Office',
        basicSalary: 20000,
        housingAllowance: 7000,
        transportAllowance: 2500,
        otherAllowances: 2000,
        totalPackage: 31500,
        bankName: 'ADCB',
        bankAccountNumber: '1122334455',
        iban: 'AE071122334455667788990',
        routingCode: 'ADCB',
      },
    }),
    prisma.employee.create({
      data: {
        id: 'emp-5',
        companyId: company.id,
        employeeId: 'EMP-005',
        firstName: 'Mohammed',
        lastName: 'Hassan',
        firstNameAr: 'محمد',
        lastNameAr: 'حسن',
        dateOfBirth: new Date('1987-12-03'),
        gender: Gender.MALE,
        nationality: 'Egypt',
        maritalStatus: MaritalStatus.MARRIED,
        email: 'mohammed.hassan@company.ae',
        phone: '+971541234567',
        addressLine1: 'Silicon Oasis',
        city: 'Dubai',
        country: 'UAE',
        emergencyContactName: 'Nour Hassan',
        emergencyContactPhone: '+971549876543',
        emergencyContactRelation: 'Spouse',
        department: 'Operations',
        jobTitle: 'Operations Manager',
        employmentStartDate: new Date('2019-02-15'),
        contractType: ContractType.UNLIMITED,
        employmentStatus: EmploymentStatus.ACTIVE,
        probationEndDate: new Date('2019-08-15'),
        workLocation: 'Dubai Office',
        basicSalary: 16000,
        housingAllowance: 5500,
        transportAllowance: 2000,
        otherAllowances: 1500,
        totalPackage: 25000,
        bankName: 'Dubai Islamic Bank',
        bankAccountNumber: '9988776655',
        iban: 'AE079988776655443322110',
        routingCode: 'DIB',
      },
    }),
  ]);

  // Create Users
  console.log('Creating users...');
  const users = await Promise.all([
    prisma.user.create({
      data: {
        id: 'user-1',
        companyId: company.id,
        email: 'admin@techcorp.ae',
        firstName: 'Mohammed',
        lastName: 'Al Rashid',
        role: UserRole.ADMIN,
        isActive: true,
        lastLogin: new Date('2024-12-15T09:30:00Z'),
      },
    }),
    prisma.user.create({
      data: {
        id: 'user-2',
        companyId: company.id,
        email: 'hr@techcorp.ae',
        firstName: 'Sara',
        lastName: 'Ahmed',
        role: UserRole.HR_MANAGER,
        isActive: true,
        lastLogin: new Date('2024-12-15T08:45:00Z'),
        invitedBy: 'user-1',
        employeeId: 'emp-2',
      },
    }),
    prisma.user.create({
      data: {
        id: 'user-3',
        companyId: company.id,
        email: 'finance.manager@techcorp.ae',
        firstName: 'Khalid',
        lastName: 'Hassan',
        role: UserRole.MANAGER,
        isActive: true,
        lastLogin: new Date('2024-12-14T16:20:00Z'),
        invitedBy: 'user-1',
        employeeId: 'emp-3',
      },
    }),
  ]);

  // Create Documents
  console.log('Creating documents...');
  for (const emp of employees) {
    // Passport
    await prisma.document.create({
      data: {
        companyId: company.id,
        employeeId: emp.id,
        documentType: DocumentType.PASSPORT,
        documentNumber: `P${emp.employeeId.replace('EMP-', '')}123456`,
        issueDate: new Date('2020-01-01'),
        expiryDate: new Date('2028-01-01'),
        issuingAuthority: emp.nationality === 'UAE' ? 'UAE Government' : `${emp.nationality} Government`,
        status: DocumentStatus.ACTIVE,
      },
    });

    // Emirates ID
    await prisma.document.create({
      data: {
        companyId: company.id,
        employeeId: emp.id,
        documentType: DocumentType.EMIRATES_ID,
        documentNumber: `784-${emp.dateOfBirth.getFullYear()}-${Math.random().toString().slice(2, 9)}-1`,
        issueDate: new Date('2022-01-01'),
        expiryDate: new Date('2025-06-01'),
        issuingAuthority: 'ICA - UAE',
        status: DocumentStatus.ACTIVE,
      },
    });

    // Visa
    await prisma.document.create({
      data: {
        companyId: company.id,
        employeeId: emp.id,
        documentType: DocumentType.VISA,
        documentNumber: `V${Math.random().toString().slice(2, 11)}`,
        issueDate: new Date('2023-01-01'),
        expiryDate: new Date('2025-03-15'),
        issuingAuthority: 'GDRFA Dubai',
        status: DocumentStatus.ACTIVE,
      },
    });

    // Labor Card
    await prisma.document.create({
      data: {
        companyId: company.id,
        employeeId: emp.id,
        documentType: DocumentType.LABOR_CARD,
        documentNumber: `LC${Math.random().toString().slice(2, 8)}`,
        issueDate: new Date('2023-01-01'),
        expiryDate: new Date('2025-02-28'),
        issuingAuthority: 'MOHRE',
        status: DocumentStatus.ACTIVE,
      },
    });

    // Health Insurance
    await prisma.document.create({
      data: {
        companyId: company.id,
        employeeId: emp.id,
        documentType: DocumentType.HEALTH_INSURANCE,
        documentNumber: `HI${Math.random().toString().slice(2, 10)}`,
        issueDate: new Date('2024-01-01'),
        expiryDate: new Date('2024-12-31'),
        issuingAuthority: 'Daman Health',
        status: DocumentStatus.ACTIVE,
      },
    });
  }

  // Create Leave Balances
  console.log('Creating leave balances...');
  const currentYear = new Date().getFullYear();
  for (const emp of employees) {
    await prisma.leaveBalance.create({
      data: {
        companyId: company.id,
        employeeId: emp.id,
        leaveType: LeaveType.ANNUAL,
        year: currentYear,
        entitled: 30,
        used: Math.floor(Math.random() * 15),
        pending: Math.floor(Math.random() * 3),
        carriedOver: Math.floor(Math.random() * 5),
      },
    });

    await prisma.leaveBalance.create({
      data: {
        companyId: company.id,
        employeeId: emp.id,
        leaveType: LeaveType.SICK,
        year: currentYear,
        entitled: 15,
        used: Math.floor(Math.random() * 5),
        pending: 0,
        carriedOver: 0,
      },
    });
  }

  // Create Leave Requests
  console.log('Creating leave requests...');
  await prisma.leaveRequest.createMany({
    data: [
      {
        companyId: company.id,
        employeeId: 'emp-1',
        leaveType: LeaveType.ANNUAL,
        startDate: new Date('2024-12-20'),
        endDate: new Date('2024-12-25'),
        totalDays: 4,
        reason: 'Family vacation',
        status: LeaveStatus.PENDING,
      },
      {
        companyId: company.id,
        employeeId: 'emp-2',
        leaveType: LeaveType.SICK,
        startDate: new Date('2024-12-10'),
        endDate: new Date('2024-12-11'),
        totalDays: 2,
        reason: 'Medical appointment',
        status: LeaveStatus.APPROVED,
        approvedBy: 'user-1',
        approvedAt: new Date('2024-12-09'),
      },
      {
        companyId: company.id,
        employeeId: 'emp-3',
        leaveType: LeaveType.ANNUAL,
        startDate: new Date('2025-01-15'),
        endDate: new Date('2025-01-20'),
        totalDays: 4,
        reason: 'Personal travel',
        status: LeaveStatus.PENDING,
      },
    ],
  });

  // Create Overtime Entries
  console.log('Creating overtime entries...');
  await prisma.overtimeEntry.createMany({
    data: [
      {
        companyId: company.id,
        employeeId: 'emp-1',
        date: new Date('2024-12-01'),
        hours: 3,
        overtimeType: OvertimeType.REGULAR,
        multiplier: 1.25,
        hourlyRate: 68.18,
        amount: 255.68,
        reason: 'Project deadline',
        status: ApprovalStatus.APPROVED,
        approvedBy: 'user-2',
        approvedAt: new Date('2024-12-02'),
      },
      {
        companyId: company.id,
        employeeId: 'emp-1',
        date: new Date('2024-12-06'),
        hours: 4,
        overtimeType: OvertimeType.FRIDAY,
        multiplier: 1.5,
        hourlyRate: 68.18,
        amount: 409.09,
        reason: 'System maintenance',
        status: ApprovalStatus.APPROVED,
        approvedBy: 'user-2',
        approvedAt: new Date('2024-12-07'),
      },
      {
        companyId: company.id,
        employeeId: 'emp-4',
        date: new Date('2024-12-02'),
        hours: 2,
        overtimeType: OvertimeType.NIGHT,
        multiplier: 1.5,
        hourlyRate: 90.91,
        amount: 272.73,
        reason: 'Campaign launch',
        status: ApprovalStatus.PENDING,
      },
    ],
  });

  // Create Loans
  console.log('Creating loans...');
  await prisma.loan.createMany({
    data: [
      {
        companyId: company.id,
        employeeId: 'emp-1',
        type: LoanType.LOAN,
        amount: 10000,
        monthlyDeduction: 1000,
        totalInstallments: 10,
        paidInstallments: 3,
        remainingBalance: 7000,
        status: LoanStatus.ACTIVE,
        reason: 'Personal emergency',
        approvedBy: 'user-1',
        approvedAt: new Date('2024-09-01'),
        startDate: new Date('2024-10-01'),
      },
      {
        companyId: company.id,
        employeeId: 'emp-4',
        type: LoanType.ADVANCE,
        amount: 5000,
        monthlyDeduction: 2500,
        totalInstallments: 2,
        paidInstallments: 0,
        remainingBalance: 5000,
        status: LoanStatus.ACTIVE,
        reason: 'Rent payment',
        approvedBy: 'user-2',
        approvedAt: new Date('2024-12-01'),
        startDate: new Date('2025-01-01'),
      },
    ],
  });

  // Create System Settings
  console.log('Creating system settings...');
  await prisma.systemSettings.create({
    data: {
      companyId: company.id,
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
    },
  });

  // Create Notification Settings for admin user
  console.log('Creating notification settings...');
  await prisma.notificationSettings.create({
    data: {
      userId: 'user-1',
      emailNotifications: true,
      documentExpiryAlertDays: [90, 60, 30, 7],
      leaveRequestNotifications: true,
      leaveApprovalNotifications: true,
      payrollCompletionAlerts: true,
      newEmployeeAlerts: true,
      contractExpiryAlerts: true,
    },
  });

  // Create Subscription
  console.log('Creating subscription...');
  const subscription = await prisma.subscription.create({
    data: {
      companyId: company.id,
      plan: SubscriptionPlan.BUSINESS,
      status: SubscriptionStatus.ACTIVE,
      currentPeriodStart: new Date('2024-12-01'),
      currentPeriodEnd: new Date('2025-01-01'),
      employeeLimit: 100,
      monthlyPrice: 499,
      currency: 'AED',
    },
  });

  // Create Billing History
  console.log('Creating billing history...');
  await prisma.billingHistory.createMany({
    data: [
      {
        subscriptionId: subscription.id,
        date: new Date('2024-12-01'),
        description: 'Business Plan - Monthly',
        amount: 499,
        currency: 'AED',
        status: PaymentStatus.PAID,
      },
      {
        subscriptionId: subscription.id,
        date: new Date('2024-11-01'),
        description: 'Business Plan - Monthly',
        amount: 499,
        currency: 'AED',
        status: PaymentStatus.PAID,
      },
      {
        subscriptionId: subscription.id,
        date: new Date('2024-10-01'),
        description: 'Business Plan - Monthly',
        amount: 499,
        currency: 'AED',
        status: PaymentStatus.PAID,
      },
      {
        subscriptionId: subscription.id,
        date: new Date('2024-09-01'),
        description: 'Business Plan - Monthly',
        amount: 499,
        currency: 'AED',
        status: PaymentStatus.PAID,
      },
    ],
  });

  console.log('Seed completed successfully!');
  console.log(`Created company: ${company.name}`);
  console.log(`Created ${employees.length} employees`);
  console.log(`Created ${users.length} users`);
}

main()
  .catch((e) => {
    console.error('Error during seed:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
