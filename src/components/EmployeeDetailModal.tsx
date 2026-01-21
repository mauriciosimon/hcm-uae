'use client';

import { Employee } from '@/types/employee';
import { calculateYearsOfService, formatCurrency, getExpiryStatus } from '@/lib/data';
import { 
  X, 
  User, 
  Mail, 
  Phone, 
  MapPin, 
  Calendar, 
  Briefcase,
  Building,
  CreditCard,
  FileText,
  AlertTriangle,
  CheckCircle,
  Clock,
  Edit,
  Download
} from 'lucide-react';

interface EmployeeDetailModalProps {
  employee: Employee;
  onClose: () => void;
  onEdit?: () => void;
}

export default function EmployeeDetailModal({ employee, onClose, onEdit }: EmployeeDetailModalProps) {
  const yearsOfService = calculateYearsOfService(employee.employmentInfo.employmentStartDate);

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'valid': return <span className="badge badge-success"><CheckCircle size={12} className="mr-1" />Valid</span>;
      case 'expiring_soon': return <span className="badge badge-warning"><Clock size={12} className="mr-1" />Expiring Soon</span>;
      case 'expired': return <span className="badge badge-error"><AlertTriangle size={12} className="mr-1" />Expired</span>;
      default: return null;
    }
  };

  const formatDate = (dateStr: string) => {
    return new Date(dateStr).toLocaleDateString('en-AE', { 
      year: 'numeric', 
      month: 'long', 
      day: 'numeric' 
    });
  };

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-2xl w-full max-w-4xl max-h-[90vh] overflow-hidden animate-fade-in">
        {/* Header */}
        <div className="bg-gradient-to-r from-teal-600 to-teal-700 text-white p-6">
          <div className="flex items-start justify-between">
            <div className="flex items-center gap-4">
              <div className="w-16 h-16 bg-white/20 rounded-xl flex items-center justify-center backdrop-blur">
                <span className="font-display font-bold text-2xl">
                  {employee.personalInfo.firstName[0]}{employee.personalInfo.lastName[0]}
                </span>
              </div>
              <div>
                <h2 className="font-display text-2xl font-bold">
                  {employee.personalInfo.firstName} {employee.personalInfo.lastName}
                </h2>
                {employee.personalInfo.arabicName && (
                  <p className="text-teal-100 text-lg">{employee.personalInfo.arabicName}</p>
                )}
                <p className="text-teal-200 mt-1">{employee.employmentInfo.jobTitle} • {employee.employeeId}</p>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <button 
                onClick={onEdit}
                className="p-2 hover:bg-white/10 rounded-lg transition-colors"
              >
                <Edit size={20} />
              </button>
              <button 
                onClick={onClose}
                className="p-2 hover:bg-white/10 rounded-lg transition-colors"
              >
                <X size={20} />
              </button>
            </div>
          </div>
        </div>

        {/* Content */}
        <div className="p-6 overflow-y-auto max-h-[calc(90vh-180px)]">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            
            {/* Personal Information */}
            <div className="space-y-4">
              <h3 className="font-display font-semibold text-gray-900 flex items-center gap-2">
                <User size={18} className="text-teal-600" />
                Personal Information
              </h3>
              <div className="bg-gray-50 rounded-xl p-4 space-y-3">
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="text-xs text-gray-500 uppercase tracking-wide">Date of Birth</label>
                    <p className="text-sm font-medium text-gray-900">{formatDate(employee.personalInfo.dateOfBirth)}</p>
                  </div>
                  <div>
                    <label className="text-xs text-gray-500 uppercase tracking-wide">Gender</label>
                    <p className="text-sm font-medium text-gray-900 capitalize">{employee.personalInfo.gender}</p>
                  </div>
                  <div>
                    <label className="text-xs text-gray-500 uppercase tracking-wide">Nationality</label>
                    <p className="text-sm font-medium text-gray-900">{employee.personalInfo.nationality}</p>
                  </div>
                  <div>
                    <label className="text-xs text-gray-500 uppercase tracking-wide">Marital Status</label>
                    <p className="text-sm font-medium text-gray-900 capitalize">{employee.personalInfo.maritalStatus}</p>
                  </div>
                </div>
                <div>
                  <label className="text-xs text-gray-500 uppercase tracking-wide">Email</label>
                  <p className="text-sm font-medium text-gray-900">{employee.personalInfo.email}</p>
                </div>
                <div>
                  <label className="text-xs text-gray-500 uppercase tracking-wide">Phone</label>
                  <p className="text-sm font-medium text-gray-900">{employee.personalInfo.phone}</p>
                </div>
                <div>
                  <label className="text-xs text-gray-500 uppercase tracking-wide">Address</label>
                  <p className="text-sm font-medium text-gray-900">{employee.personalInfo.address}</p>
                </div>
                <div className="pt-2 border-t border-gray-200">
                  <label className="text-xs text-gray-500 uppercase tracking-wide">Emergency Contact</label>
                  <p className="text-sm font-medium text-gray-900">
                    {employee.personalInfo.emergencyContact.name} ({employee.personalInfo.emergencyContact.relationship})
                  </p>
                  <p className="text-sm text-gray-600">{employee.personalInfo.emergencyContact.phone}</p>
                </div>
              </div>
            </div>

            {/* Employment Information */}
            <div className="space-y-4">
              <h3 className="font-display font-semibold text-gray-900 flex items-center gap-2">
                <Briefcase size={18} className="text-teal-600" />
                Employment Information
              </h3>
              <div className="bg-gray-50 rounded-xl p-4 space-y-3">
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="text-xs text-gray-500 uppercase tracking-wide">Department</label>
                    <p className="text-sm font-medium text-gray-900">{employee.employmentInfo.department}</p>
                  </div>
                  <div>
                    <label className="text-xs text-gray-500 uppercase tracking-wide">Work Location</label>
                    <p className="text-sm font-medium text-gray-900">{employee.employmentInfo.workLocation}</p>
                  </div>
                  <div>
                    <label className="text-xs text-gray-500 uppercase tracking-wide">Start Date</label>
                    <p className="text-sm font-medium text-gray-900">{formatDate(employee.employmentInfo.employmentStartDate)}</p>
                  </div>
                  <div>
                    <label className="text-xs text-gray-500 uppercase tracking-wide">Years of Service</label>
                    <p className="text-sm font-medium text-gray-900">{yearsOfService} years</p>
                  </div>
                  <div>
                    <label className="text-xs text-gray-500 uppercase tracking-wide">Contract Type</label>
                    <p className="text-sm font-medium text-gray-900 capitalize">{employee.employmentInfo.contractType}</p>
                  </div>
                  <div>
                    <label className="text-xs text-gray-500 uppercase tracking-wide">Contract End</label>
                    <p className="text-sm font-medium text-gray-900">
                      {employee.employmentInfo.contractEndDate 
                        ? formatDate(employee.employmentInfo.contractEndDate)
                        : 'N/A'}
                    </p>
                  </div>
                </div>
                {employee.employmentInfo.reportingTo && (
                  <div>
                    <label className="text-xs text-gray-500 uppercase tracking-wide">Reporting To</label>
                    <p className="text-sm font-medium text-gray-900">{employee.employmentInfo.reportingTo}</p>
                  </div>
                )}
              </div>
            </div>

            {/* Compensation */}
            <div className="space-y-4">
              <h3 className="font-display font-semibold text-gray-900 flex items-center gap-2">
                <CreditCard size={18} className="text-teal-600" />
                Compensation (Monthly)
              </h3>
              <div className="bg-gray-50 rounded-xl p-4 space-y-3">
                <div className="flex justify-between items-center">
                  <span className="text-sm text-gray-600">Basic Salary</span>
                  <span className="text-sm font-medium">{formatCurrency(employee.compensation.basicSalary)}</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-sm text-gray-600">Housing Allowance</span>
                  <span className="text-sm font-medium">{formatCurrency(employee.compensation.housingAllowance)}</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-sm text-gray-600">Transport Allowance</span>
                  <span className="text-sm font-medium">{formatCurrency(employee.compensation.transportAllowance)}</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-sm text-gray-600">Other Allowances</span>
                  <span className="text-sm font-medium">{formatCurrency(employee.compensation.otherAllowances)}</span>
                </div>
                <div className="flex justify-between items-center pt-2 border-t border-gray-200">
                  <span className="text-sm font-semibold text-gray-900">Total Package</span>
                  <span className="text-lg font-bold text-teal-600">{formatCurrency(employee.compensation.totalPackage)}</span>
                </div>
              </div>

              {/* Bank Details */}
              <div className="bg-gray-50 rounded-xl p-4 space-y-2">
                <h4 className="text-xs text-gray-500 uppercase tracking-wide">Bank Details (WPS)</h4>
                <p className="text-sm font-medium text-gray-900">{employee.bankDetails.bankName}</p>
                <p className="text-sm text-gray-600">IBAN: {employee.bankDetails.iban}</p>
              </div>
            </div>

            {/* Documents */}
            <div className="space-y-4">
              <h3 className="font-display font-semibold text-gray-900 flex items-center gap-2">
                <FileText size={18} className="text-teal-600" />
                Documents
              </h3>
              <div className="bg-gray-50 rounded-xl p-4 space-y-3">
                <div className="flex justify-between items-center">
                  <div>
                    <p className="text-sm font-medium text-gray-900">Passport</p>
                    <p className="text-xs text-gray-500">{employee.documents.passportNumber} • Exp: {formatDate(employee.documents.passportExpiry)}</p>
                  </div>
                  {getStatusBadge(getExpiryStatus(employee.documents.passportExpiry))}
                </div>
                <div className="flex justify-between items-center">
                  <div>
                    <p className="text-sm font-medium text-gray-900">Emirates ID</p>
                    <p className="text-xs text-gray-500">{employee.documents.emiratesId} • Exp: {formatDate(employee.documents.emiratesIdExpiry)}</p>
                  </div>
                  {getStatusBadge(getExpiryStatus(employee.documents.emiratesIdExpiry))}
                </div>
                {employee.documents.visaNumber && (
                  <div className="flex justify-between items-center">
                    <div>
                      <p className="text-sm font-medium text-gray-900">Visa</p>
                      <p className="text-xs text-gray-500">{employee.documents.visaNumber} • Exp: {formatDate(employee.documents.visaExpiry!)}</p>
                    </div>
                    {getStatusBadge(getExpiryStatus(employee.documents.visaExpiry!))}
                  </div>
                )}
                {employee.documents.laborCardNumber && (
                  <div className="flex justify-between items-center">
                    <div>
                      <p className="text-sm font-medium text-gray-900">Labor Card</p>
                      <p className="text-xs text-gray-500">{employee.documents.laborCardNumber} • Exp: {formatDate(employee.documents.laborCardExpiry!)}</p>
                    </div>
                    {getStatusBadge(getExpiryStatus(employee.documents.laborCardExpiry!))}
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="border-t border-gray-200 p-4 bg-gray-50 flex justify-end gap-3">
          <button className="btn btn-secondary" onClick={onClose}>
            Close
          </button>
          <button className="btn btn-primary flex items-center gap-2">
            <Download size={16} />
            Export Profile
          </button>
        </div>
      </div>
    </div>
  );
}
