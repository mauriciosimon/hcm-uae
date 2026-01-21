import prisma from '@/lib/db';
import { EmployeeDocument, DocumentType as FrontendDocumentType, ExpiryStatus } from '@/types/document';
import { DocumentType, DocumentStatus } from '@prisma/client';

// Map Prisma DocumentType to Frontend DocumentType
function toFrontendDocumentType(type: DocumentType): FrontendDocumentType {
  const mapping: Record<DocumentType, FrontendDocumentType> = {
    PASSPORT: 'passport',
    EMIRATES_ID: 'emirates_id',
    VISA: 'visa',
    LABOR_CARD: 'labor_card',
    HEALTH_INSURANCE: 'health_insurance',
    DRIVING_LICENSE: 'driving_license',
    TRADE_LICENSE: 'trade_license',
    OTHER: 'trade_license', // Fallback
  };
  return mapping[type] || 'trade_license';
}

function toPrismaDocumentType(type: FrontendDocumentType): DocumentType {
  const mapping: Partial<Record<FrontendDocumentType, DocumentType>> = {
    passport: DocumentType.PASSPORT,
    emirates_id: DocumentType.EMIRATES_ID,
    visa: DocumentType.VISA,
    labor_card: DocumentType.LABOR_CARD,
    health_insurance: DocumentType.HEALTH_INSURANCE,
    driving_license: DocumentType.DRIVING_LICENSE,
    trade_license: DocumentType.TRADE_LICENSE,
    employment_visa: DocumentType.VISA,
    establishment_card: DocumentType.OTHER,
  };
  return mapping[type] || DocumentType.OTHER;
}

function calculateExpiryStatus(expiryDate: Date | null): ExpiryStatus {
  if (!expiryDate) return 'valid';

  const today = new Date();
  const daysUntilExpiry = Math.ceil(
    (expiryDate.getTime() - today.getTime()) / (1000 * 60 * 60 * 24)
  );

  if (daysUntilExpiry < 0) return 'expired';
  if (daysUntilExpiry <= 7) return 'critical';
  if (daysUntilExpiry <= 30) return 'urgent';
  if (daysUntilExpiry <= 60) return 'warning';
  if (daysUntilExpiry <= 90) return 'upcoming';
  return 'valid';
}

function calculateDaysRemaining(expiryDate: Date | null): number {
  if (!expiryDate) return 999;

  const today = new Date();
  return Math.ceil(
    (expiryDate.getTime() - today.getTime()) / (1000 * 60 * 60 * 24)
  );
}

export async function getDocuments(
  companyId: string,
  filters?: {
    employeeId?: string;
    documentType?: FrontendDocumentType;
    expiryStatus?: ExpiryStatus;
  }
): Promise<EmployeeDocument[]> {
  const documents = await prisma.document.findMany({
    where: {
      companyId,
      ...(filters?.employeeId && { employeeId: filters.employeeId }),
      ...(filters?.documentType && {
        documentType: toPrismaDocumentType(filters.documentType),
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
    orderBy: { expiryDate: 'asc' },
  });

  let result = documents.map((doc) => ({
    id: doc.id,
    employeeId: doc.employeeId,
    employeeName: `${doc.employee.firstName} ${doc.employee.lastName}`,
    employeeCode: doc.employee.employeeId,
    department: doc.employee.department,
    documentType: toFrontendDocumentType(doc.documentType),
    documentNumber: doc.documentNumber || '',
    issueDate: doc.issueDate?.toISOString().split('T')[0] || '',
    expiryDate: doc.expiryDate?.toISOString().split('T')[0] || '',
    issuingAuthority: doc.issuingAuthority || '',
    status: calculateExpiryStatus(doc.expiryDate),
    daysRemaining: calculateDaysRemaining(doc.expiryDate),
    fileUrl: doc.fileUrl || undefined,
    notes: doc.notes || undefined,
  }));

  // Filter by expiry status if specified
  if (filters?.expiryStatus) {
    result = result.filter((doc) => doc.status === filters.expiryStatus);
  }

  return result;
}

export async function getDocumentById(id: string): Promise<EmployeeDocument | null> {
  const doc = await prisma.document.findUnique({
    where: { id },
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
  });

  if (!doc) return null;

  return {
    id: doc.id,
    employeeId: doc.employeeId,
    employeeName: `${doc.employee.firstName} ${doc.employee.lastName}`,
    employeeCode: doc.employee.employeeId,
    department: doc.employee.department,
    documentType: toFrontendDocumentType(doc.documentType),
    documentNumber: doc.documentNumber || '',
    issueDate: doc.issueDate?.toISOString().split('T')[0] || '',
    expiryDate: doc.expiryDate?.toISOString().split('T')[0] || '',
    issuingAuthority: doc.issuingAuthority || '',
    status: calculateExpiryStatus(doc.expiryDate),
    daysRemaining: calculateDaysRemaining(doc.expiryDate),
    fileUrl: doc.fileUrl || undefined,
    notes: doc.notes || undefined,
  };
}

export async function createDocument(
  companyId: string,
  data: {
    employeeId: string;
    documentType: FrontendDocumentType;
    documentNumber: string;
    issueDate?: string;
    expiryDate: string;
    issuingAuthority?: string;
    fileUrl?: string;
    notes?: string;
  }
): Promise<EmployeeDocument> {
  const doc = await prisma.document.create({
    data: {
      companyId,
      employeeId: data.employeeId,
      documentType: toPrismaDocumentType(data.documentType),
      documentNumber: data.documentNumber,
      issueDate: data.issueDate ? new Date(data.issueDate) : null,
      expiryDate: new Date(data.expiryDate),
      issuingAuthority: data.issuingAuthority,
      fileUrl: data.fileUrl,
      notes: data.notes,
      status: DocumentStatus.ACTIVE,
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
  });

  return {
    id: doc.id,
    employeeId: doc.employeeId,
    employeeName: `${doc.employee.firstName} ${doc.employee.lastName}`,
    employeeCode: doc.employee.employeeId,
    department: doc.employee.department,
    documentType: toFrontendDocumentType(doc.documentType),
    documentNumber: doc.documentNumber || '',
    issueDate: doc.issueDate?.toISOString().split('T')[0] || '',
    expiryDate: doc.expiryDate?.toISOString().split('T')[0] || '',
    issuingAuthority: doc.issuingAuthority || '',
    status: calculateExpiryStatus(doc.expiryDate),
    daysRemaining: calculateDaysRemaining(doc.expiryDate),
    fileUrl: doc.fileUrl || undefined,
    notes: doc.notes || undefined,
  };
}

export async function updateDocument(
  id: string,
  data: Partial<{
    documentNumber: string;
    issueDate: string;
    expiryDate: string;
    issuingAuthority: string;
    fileUrl: string;
    notes: string;
  }>
): Promise<EmployeeDocument> {
  const doc = await prisma.document.update({
    where: { id },
    data: {
      ...(data.documentNumber && { documentNumber: data.documentNumber }),
      ...(data.issueDate && { issueDate: new Date(data.issueDate) }),
      ...(data.expiryDate && { expiryDate: new Date(data.expiryDate) }),
      ...(data.issuingAuthority && { issuingAuthority: data.issuingAuthority }),
      ...(data.fileUrl && { fileUrl: data.fileUrl }),
      ...(data.notes !== undefined && { notes: data.notes }),
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
  });

  return {
    id: doc.id,
    employeeId: doc.employeeId,
    employeeName: `${doc.employee.firstName} ${doc.employee.lastName}`,
    employeeCode: doc.employee.employeeId,
    department: doc.employee.department,
    documentType: toFrontendDocumentType(doc.documentType),
    documentNumber: doc.documentNumber || '',
    issueDate: doc.issueDate?.toISOString().split('T')[0] || '',
    expiryDate: doc.expiryDate?.toISOString().split('T')[0] || '',
    issuingAuthority: doc.issuingAuthority || '',
    status: calculateExpiryStatus(doc.expiryDate),
    daysRemaining: calculateDaysRemaining(doc.expiryDate),
    fileUrl: doc.fileUrl || undefined,
    notes: doc.notes || undefined,
  };
}

export async function deleteDocument(id: string): Promise<void> {
  await prisma.document.delete({
    where: { id },
  });
}

export async function getExpiringDocuments(
  companyId: string,
  daysAhead: number = 90
): Promise<EmployeeDocument[]> {
  const futureDate = new Date();
  futureDate.setDate(futureDate.getDate() + daysAhead);

  const documents = await prisma.document.findMany({
    where: {
      companyId,
      expiryDate: {
        lte: futureDate,
      },
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
    orderBy: { expiryDate: 'asc' },
  });

  return documents.map((doc) => ({
    id: doc.id,
    employeeId: doc.employeeId,
    employeeName: `${doc.employee.firstName} ${doc.employee.lastName}`,
    employeeCode: doc.employee.employeeId,
    department: doc.employee.department,
    documentType: toFrontendDocumentType(doc.documentType),
    documentNumber: doc.documentNumber || '',
    issueDate: doc.issueDate?.toISOString().split('T')[0] || '',
    expiryDate: doc.expiryDate?.toISOString().split('T')[0] || '',
    issuingAuthority: doc.issuingAuthority || '',
    status: calculateExpiryStatus(doc.expiryDate),
    daysRemaining: calculateDaysRemaining(doc.expiryDate),
    fileUrl: doc.fileUrl || undefined,
    notes: doc.notes || undefined,
  }));
}

export async function getDocumentStatsByStatus(
  companyId: string
): Promise<Record<ExpiryStatus, number>> {
  const documents = await prisma.document.findMany({
    where: { companyId },
    select: { expiryDate: true },
  });

  const stats: Record<ExpiryStatus, number> = {
    expired: 0,
    critical: 0,
    urgent: 0,
    warning: 0,
    upcoming: 0,
    valid: 0,
    expiring_soon: 0,
    expiring: 0,
  };

  documents.forEach((doc) => {
    const status = calculateExpiryStatus(doc.expiryDate);
    stats[status]++;
  });

  return stats;
}
