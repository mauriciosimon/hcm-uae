import {
  Document,
  DocumentType,
  ExpiryStatus,
  DocumentAlert,
  ALERT_THRESHOLDS,
  DOCUMENT_TYPES,
  EXPIRY_STATUS_CONFIG,
} from '@/types/document';
import { Employee } from '@/types/employee';

/**
 * Calculate days remaining until expiry
 */
export function calculateDaysRemaining(expiryDate: string): number {
  const expiry = new Date(expiryDate);
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  expiry.setHours(0, 0, 0, 0);
  return Math.ceil((expiry.getTime() - today.getTime()) / (1000 * 60 * 60 * 24));
}

/**
 * Determine expiry status based on days remaining
 */
export function getExpiryStatus(daysRemaining: number): ExpiryStatus {
  if (daysRemaining < 0) return 'expired';
  if (daysRemaining <= ALERT_THRESHOLDS.critical) return 'critical';
  if (daysRemaining <= ALERT_THRESHOLDS.urgent) return 'urgent';
  if (daysRemaining <= ALERT_THRESHOLDS.warning) return 'expiring';
  if (daysRemaining <= ALERT_THRESHOLDS.info) return 'expiring_soon';
  return 'valid';
}

/**
 * Get alert level based on days remaining
 */
export function getAlertLevel(
  daysRemaining: number
): 'info' | 'warning' | 'urgent' | 'critical' | 'expired' {
  if (daysRemaining < 0) return 'expired';
  if (daysRemaining <= ALERT_THRESHOLDS.critical) return 'critical';
  if (daysRemaining <= ALERT_THRESHOLDS.urgent) return 'urgent';
  if (daysRemaining <= ALERT_THRESHOLDS.warning) return 'warning';
  return 'info';
}

/**
 * Create document alert from document
 */
export function createDocumentAlert(document: Document): DocumentAlert {
  const daysRemaining = calculateDaysRemaining(document.expiryDate);
  return {
    documentId: document.id,
    status: getExpiryStatus(daysRemaining),
    daysRemaining,
    alertLevel: getAlertLevel(daysRemaining),
  };
}

/**
 * Format date for display
 */
export function formatDate(dateStr: string): string {
  return new Date(dateStr).toLocaleDateString('en-AE', {
    day: 'numeric',
    month: 'short',
    year: 'numeric',
  });
}

/**
 * Format days remaining as human-readable string
 */
export function formatDaysRemaining(days: number): string {
  if (days < 0) {
    const absDays = Math.abs(days);
    return `Expired ${absDays} day${absDays !== 1 ? 's' : ''} ago`;
  }
  if (days === 0) return 'Expires today';
  if (days === 1) return '1 day remaining';
  if (days < 30) return `${days} days remaining`;
  if (days < 60) return `${Math.floor(days / 7)} weeks remaining`;
  if (days < 365) return `${Math.floor(days / 30)} months remaining`;
  return `${Math.floor(days / 365)} year${days >= 730 ? 's' : ''} remaining`;
}

/**
 * Calculate compliance percentage
 */
export function calculateCompliancePercentage(documents: Document[]): number {
  if (documents.length === 0) return 100;
  const validDocs = documents.filter((doc) => {
    const days = calculateDaysRemaining(doc.expiryDate);
    return days > 0;
  });
  return Math.round((validDocs.length / documents.length) * 100);
}

/**
 * Get documents expiring within specified days
 */
export function getExpiringDocuments(
  documents: Document[],
  withinDays: number
): Document[] {
  return documents.filter((doc) => {
    const days = calculateDaysRemaining(doc.expiryDate);
    return days >= 0 && days <= withinDays;
  });
}

/**
 * Get expired documents
 */
export function getExpiredDocuments(documents: Document[]): Document[] {
  return documents.filter((doc) => calculateDaysRemaining(doc.expiryDate) < 0);
}

/**
 * Sort documents by expiry date (nearest first)
 */
export function sortByExpiryDate(
  documents: Document[],
  direction: 'asc' | 'desc' = 'asc'
): Document[] {
  return [...documents].sort((a, b) => {
    const daysA = calculateDaysRemaining(a.expiryDate);
    const daysB = calculateDaysRemaining(b.expiryDate);
    return direction === 'asc' ? daysA - daysB : daysB - daysA;
  });
}

/**
 * Filter documents by status
 */
export function filterByStatus(
  documents: Document[],
  status: ExpiryStatus | 'all'
): Document[] {
  if (status === 'all') return documents;
  return documents.filter((doc) => {
    const days = calculateDaysRemaining(doc.expiryDate);
    return getExpiryStatus(days) === status;
  });
}

/**
 * Filter documents by type
 */
export function filterByType(
  documents: Document[],
  type: DocumentType | 'all'
): Document[] {
  if (type === 'all') return documents;
  return documents.filter((doc) => doc.documentType === type);
}

/**
 * Generate documents from employee data
 */
export function generateEmployeeDocuments(employee: Employee): Document[] {
  const docs: Document[] = [];
  const baseDate = new Date().toISOString();

  // Passport
  if (employee.documents.passportNumber) {
    docs.push({
      id: `DOC-${employee.id}-passport`,
      employeeId: employee.id,
      documentType: 'passport',
      category: 'employee',
      documentNumber: employee.documents.passportNumber,
      issueDate: '2020-01-01', // Mock issue date
      expiryDate: employee.documents.passportExpiry,
      issuingAuthority: employee.personalInfo.nationality,
      isRenewed: false,
      createdAt: baseDate,
      updatedAt: baseDate,
    });
  }

  // Emirates ID
  if (employee.documents.emiratesId) {
    docs.push({
      id: `DOC-${employee.id}-eid`,
      employeeId: employee.id,
      documentType: 'emirates_id',
      category: 'employee',
      documentNumber: employee.documents.emiratesId,
      issueDate: '2020-01-01',
      expiryDate: employee.documents.emiratesIdExpiry,
      issuingAuthority: 'Federal Authority for Identity & Citizenship',
      isRenewed: false,
      createdAt: baseDate,
      updatedAt: baseDate,
    });
  }

  // Employment Visa
  if (employee.documents.visaNumber) {
    docs.push({
      id: `DOC-${employee.id}-visa`,
      employeeId: employee.id,
      documentType: 'employment_visa',
      category: 'employee',
      documentNumber: employee.documents.visaNumber,
      issueDate: '2020-01-01',
      expiryDate: employee.documents.visaExpiry || '2025-12-31',
      issuingAuthority: 'General Directorate of Residency and Foreigners Affairs',
      isRenewed: false,
      createdAt: baseDate,
      updatedAt: baseDate,
    });
  }

  // Labor Card
  if (employee.documents.laborCardNumber) {
    docs.push({
      id: `DOC-${employee.id}-labor`,
      employeeId: employee.id,
      documentType: 'labor_card',
      category: 'employee',
      documentNumber: employee.documents.laborCardNumber,
      issueDate: '2020-01-01',
      expiryDate: employee.documents.laborCardExpiry || '2025-12-31',
      issuingAuthority: 'Ministry of Human Resources and Emiratisation',
      isRenewed: false,
      createdAt: baseDate,
      updatedAt: baseDate,
    });
  }

  return docs;
}

/**
 * Mock company documents
 */
export const mockCompanyDocuments: Document[] = [
  {
    id: 'DOC-COMPANY-TL',
    documentType: 'trade_license',
    category: 'company',
    documentNumber: 'TL-2024-123456',
    issueDate: '2024-01-15',
    expiryDate: '2025-01-14',
    issuingAuthority: 'Department of Economic Development',
    fileName: 'trade_license_2024.pdf',
    isRenewed: false,
    createdAt: '2024-01-15T00:00:00Z',
    updatedAt: '2024-01-15T00:00:00Z',
  },
  {
    id: 'DOC-COMPANY-EC',
    documentType: 'establishment_card',
    category: 'company',
    documentNumber: 'EC-2024-789012',
    issueDate: '2024-02-01',
    expiryDate: '2025-04-30',
    issuingAuthority: 'Ministry of Human Resources and Emiratisation',
    fileName: 'establishment_card_2024.pdf',
    isRenewed: false,
    createdAt: '2024-02-01T00:00:00Z',
    updatedAt: '2024-02-01T00:00:00Z',
  },
];

/**
 * Generate export data for documents expiring within days
 */
export function generateExportData(
  documents: Document[],
  employees: Employee[],
  withinDays: number
): string {
  const expiringDocs = getExpiringDocuments(documents, withinDays);
  const sorted = sortByExpiryDate(expiringDocs);

  const headers = [
    'Document Type',
    'Document Number',
    'Employee Name',
    'Expiry Date',
    'Days Remaining',
    'Status',
    'Issuing Authority',
  ];

  const rows = sorted.map((doc) => {
    const employee = employees.find((e) => e.id === doc.employeeId);
    const daysRemaining = calculateDaysRemaining(doc.expiryDate);
    const status = getExpiryStatus(daysRemaining);

    return [
      DOCUMENT_TYPES[doc.documentType].label,
      doc.documentNumber,
      employee
        ? `${employee.personalInfo.firstName} ${employee.personalInfo.lastName}`
        : 'Company Document',
      formatDate(doc.expiryDate),
      daysRemaining.toString(),
      EXPIRY_STATUS_CONFIG[status].label,
      doc.issuingAuthority || '',
    ];
  });

  return [headers.join(','), ...rows.map((row) => row.join(','))].join('\n');
}

/**
 * Group documents by expiry month for calendar view
 */
export function groupByExpiryMonth(
  documents: Document[]
): Map<string, Document[]> {
  const grouped = new Map<string, Document[]>();

  documents.forEach((doc) => {
    const date = new Date(doc.expiryDate);
    const key = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`;

    if (!grouped.has(key)) {
      grouped.set(key, []);
    }
    grouped.get(key)!.push(doc);
  });

  return grouped;
}

/**
 * Get calendar days with documents for a specific month
 */
export function getCalendarDays(
  documents: Document[],
  year: number,
  month: number
): Map<number, Document[]> {
  const dayMap = new Map<number, Document[]>();

  documents.forEach((doc) => {
    const date = new Date(doc.expiryDate);
    if (date.getFullYear() === year && date.getMonth() === month) {
      const day = date.getDate();
      if (!dayMap.has(day)) {
        dayMap.set(day, []);
      }
      dayMap.get(day)!.push(doc);
    }
  });

  return dayMap;
}
