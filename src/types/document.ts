// Document Management Types - UAE Compliance

export type DocumentType =
  | 'passport'
  | 'emirates_id'
  | 'employment_visa'
  | 'labor_card'
  | 'trade_license'
  | 'establishment_card'
  | 'visa'
  | 'health_insurance'
  | 'driving_license';

export type DocumentCategory = 'employee' | 'company';

export type ExpiryStatus = 'valid' | 'expiring_soon' | 'expiring' | 'urgent' | 'critical' | 'expired' | 'warning' | 'upcoming';

export interface Document {
  id: string;
  employeeId?: string; // For employee documents
  documentType: DocumentType;
  category: DocumentCategory;
  documentNumber: string;
  issueDate: string;
  expiryDate: string;
  issuingAuthority?: string;
  fileName?: string; // Uploaded file name
  fileUrl?: string;
  notes?: string;
  isRenewed: boolean;
  renewedDate?: string;
  createdAt: string;
  updatedAt: string;
}

// Employee document with employee info
export interface EmployeeDocument {
  id: string;
  employeeId: string;
  employeeName: string;
  employeeCode: string;
  department: string;
  documentType: DocumentType;
  documentNumber: string;
  issueDate: string;
  expiryDate: string;
  issuingAuthority: string;
  status: ExpiryStatus;
  daysRemaining: number;
  fileUrl?: string;
  notes?: string;
}

export interface DocumentAlert {
  documentId: string;
  status: ExpiryStatus;
  daysRemaining: number;
  alertLevel: 'info' | 'warning' | 'urgent' | 'critical' | 'expired';
}

export interface NotificationPreferences {
  emailEnabled: boolean;
  alertDays: number[]; // Days before expiry to send alerts
}

// Document type configuration
export const DOCUMENT_TYPES: Record<
  DocumentType,
  { label: string; labelAr: string; category: DocumentCategory; icon: string }
> = {
  passport: {
    label: 'Passport',
    labelAr: 'جواز السفر',
    category: 'employee',
    icon: '🛂',
  },
  emirates_id: {
    label: 'Emirates ID',
    labelAr: 'الهوية الإماراتية',
    category: 'employee',
    icon: '🪪',
  },
  employment_visa: {
    label: 'Employment Visa',
    labelAr: 'تأشيرة العمل',
    category: 'employee',
    icon: '📋',
  },
  labor_card: {
    label: 'Labor Card',
    labelAr: 'بطاقة العمل',
    category: 'employee',
    icon: '💳',
  },
  trade_license: {
    label: 'Trade License',
    labelAr: 'الرخصة التجارية',
    category: 'company',
    icon: '📜',
  },
  establishment_card: {
    label: 'Establishment Card',
    labelAr: 'بطاقة المنشأة',
    category: 'company',
    icon: '🏢',
  },
};

// Alert thresholds in days
export const ALERT_THRESHOLDS = {
  info: 90,      // Green: >90 days - First notification
  warning: 60,   // Yellow: 60-90 days - Second notification
  urgent: 30,    // Orange: 30-60 days - Urgent notification
  critical: 7,   // Red: <30 days - Critical alert
  expired: 0,    // Dark red/gray: Expired
} as const;

// Status labels and colors
export const EXPIRY_STATUS_CONFIG: Record<
  ExpiryStatus,
  { label: string; bgColor: string; textColor: string; borderColor: string }
> = {
  valid: {
    label: 'Valid',
    bgColor: 'bg-emerald-100',
    textColor: 'text-emerald-700',
    borderColor: 'border-emerald-200',
  },
  expiring_soon: {
    label: 'Expiring Soon',
    bgColor: 'bg-yellow-100',
    textColor: 'text-yellow-700',
    borderColor: 'border-yellow-200',
  },
  expiring: {
    label: 'Expiring',
    bgColor: 'bg-amber-100',
    textColor: 'text-amber-700',
    borderColor: 'border-amber-200',
  },
  urgent: {
    label: 'Urgent',
    bgColor: 'bg-orange-100',
    textColor: 'text-orange-700',
    borderColor: 'border-orange-200',
  },
  critical: {
    label: 'Critical',
    bgColor: 'bg-red-100',
    textColor: 'text-red-700',
    borderColor: 'border-red-200',
  },
  expired: {
    label: 'Expired',
    bgColor: 'bg-gray-200',
    textColor: 'text-gray-700',
    borderColor: 'border-gray-300',
  },
  warning: {
    label: 'Warning',
    bgColor: 'bg-amber-100',
    textColor: 'text-amber-700',
    borderColor: 'border-amber-200',
  },
  upcoming: {
    label: 'Upcoming',
    bgColor: 'bg-blue-100',
    textColor: 'text-blue-700',
    borderColor: 'border-blue-200',
  },
};

// Color classes for progress/visual indicators
export const EXPIRY_COLORS = {
  valid: 'bg-emerald-500',      // >90 days
  expiring_soon: 'bg-yellow-500', // 60-90 days
  expiring: 'bg-amber-500',     // 30-60 days
  urgent: 'bg-orange-500',      // 7-30 days
  critical: 'bg-red-500',       // <7 days
  expired: 'bg-gray-500',       // Expired
  warning: 'bg-amber-500',      // 30-60 days (same as expiring)
  upcoming: 'bg-blue-500',      // 60-90 days
} as const;
