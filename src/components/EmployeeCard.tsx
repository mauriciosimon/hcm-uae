'use client';

import { Employee } from '@/types/employee';
import { calculateYearsOfService, formatCurrency, getExpiryStatus } from '@/lib/data';
import { 
  User, 
  Mail, 
  Phone, 
  MapPin, 
  Calendar, 
  Briefcase,
  AlertTriangle,
  CheckCircle,
  Clock,
  MoreVertical,
  Eye,
  Edit,
  Trash2
} from 'lucide-react';
import { useState } from 'react';

interface EmployeeCardProps {
  employee: Employee;
  onView?: (employee: Employee) => void;
  onEdit?: (employee: Employee) => void;
}

export default function EmployeeCard({ employee, onView, onEdit }: EmployeeCardProps) {
  const [showMenu, setShowMenu] = useState(false);
  
  const yearsOfService = calculateYearsOfService(employee.employmentInfo.employmentStartDate);
  const visaStatus = employee.documents.visaExpiry 
    ? getExpiryStatus(employee.documents.visaExpiry) 
    : 'valid';
  const emiratesIdStatus = getExpiryStatus(employee.documents.emiratesIdExpiry);

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'active': return 'bg-emerald-100 text-emerald-700';
      case 'on_leave': return 'bg-amber-100 text-amber-700';
      case 'terminated': return 'bg-red-100 text-red-700';
      case 'resigned': return 'bg-gray-100 text-gray-700';
      default: return 'bg-gray-100 text-gray-700';
    }
  };

  const getDocumentStatusIcon = (status: string) => {
    switch (status) {
      case 'valid': return <CheckCircle size={14} className="text-emerald-500" />;
      case 'expiring_soon': return <Clock size={14} className="text-amber-500" />;
      case 'expired': return <AlertTriangle size={14} className="text-red-500" />;
      default: return null;
    }
  };

  const initials = `${employee.personalInfo.firstName[0]}${employee.personalInfo.lastName[0]}`;

  return (
    <div className="bg-white rounded-xl border border-gray-200 p-5 card-hover relative group">
      {/* Menu Button */}
      <div className="absolute top-4 right-4">
        <button 
          onClick={() => setShowMenu(!showMenu)}
          className="p-1.5 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-lg opacity-0 group-hover:opacity-100 transition-all"
        >
          <MoreVertical size={18} />
        </button>
        {showMenu && (
          <div className="absolute right-0 top-8 bg-white border border-gray-200 rounded-lg shadow-lg py-1 w-36 z-10 animate-fade-in">
            <button 
              onClick={() => { onView?.(employee); setShowMenu(false); }}
              className="w-full flex items-center gap-2 px-3 py-2 text-sm text-gray-700 hover:bg-gray-50"
            >
              <Eye size={16} /> View Details
            </button>
            <button 
              onClick={() => { onEdit?.(employee); setShowMenu(false); }}
              className="w-full flex items-center gap-2 px-3 py-2 text-sm text-gray-700 hover:bg-gray-50"
            >
              <Edit size={16} /> Edit
            </button>
            <button className="w-full flex items-center gap-2 px-3 py-2 text-sm text-red-600 hover:bg-red-50">
              <Trash2 size={16} /> Delete
            </button>
          </div>
        )}
      </div>

      {/* Header */}
      <div className="flex items-start gap-4">
        {/* Avatar */}
        <div className="w-14 h-14 bg-gradient-to-br from-teal-500 to-teal-600 rounded-xl flex items-center justify-center flex-shrink-0 shadow-md">
          <span className="text-white font-display font-bold text-lg">{initials}</span>
        </div>

        {/* Basic Info */}
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2">
            <h3 className="font-display font-semibold text-gray-900 truncate">
              {employee.personalInfo.firstName} {employee.personalInfo.lastName}
            </h3>
            <span className={`px-2 py-0.5 rounded-full text-xs font-medium capitalize ${getStatusColor(employee.employmentInfo.employmentStatus)}`}>
              {employee.employmentInfo.employmentStatus.replace('_', ' ')}
            </span>
          </div>
          <p className="text-sm text-gray-500 truncate">{employee.employmentInfo.jobTitle}</p>
          <p className="text-xs text-gray-400 mt-0.5">{employee.employeeId}</p>
        </div>
      </div>

      {/* Details Grid */}
      <div className="mt-4 grid grid-cols-2 gap-3">
        <div className="flex items-center gap-2 text-sm text-gray-600">
          <Briefcase size={14} className="text-gray-400" />
          <span className="truncate">{employee.employmentInfo.department}</span>
        </div>
        <div className="flex items-center gap-2 text-sm text-gray-600">
          <MapPin size={14} className="text-gray-400" />
          <span className="truncate">{employee.personalInfo.nationality}</span>
        </div>
        <div className="flex items-center gap-2 text-sm text-gray-600">
          <Calendar size={14} className="text-gray-400" />
          <span>{yearsOfService} years</span>
        </div>
        <div className="flex items-center gap-2 text-sm text-gray-600">
          <Mail size={14} className="text-gray-400" />
          <span className="truncate">{employee.personalInfo.email.split('@')[0]}@...</span>
        </div>
      </div>

      {/* Salary */}
      <div className="mt-4 pt-4 border-t border-gray-100">
        <div className="flex items-center justify-between">
          <span className="text-xs text-gray-500 uppercase tracking-wide">Total Package</span>
          <span className="font-display font-semibold text-teal-700">
            {formatCurrency(employee.compensation.totalPackage)}
          </span>
        </div>
      </div>

      {/* Document Status */}
      <div className="mt-3 flex items-center gap-3">
        <div className="flex items-center gap-1.5 text-xs">
          {getDocumentStatusIcon(visaStatus)}
          <span className="text-gray-500">Visa</span>
        </div>
        <div className="flex items-center gap-1.5 text-xs">
          {getDocumentStatusIcon(emiratesIdStatus)}
          <span className="text-gray-500">Emirates ID</span>
        </div>
      </div>
    </div>
  );
}
