'use client';

import { Bell, Search, User, ChevronDown, HelpCircle } from 'lucide-react';
import { useTour, TourStatus } from '@/contexts/TourContext';
import { usePathname } from 'next/navigation';

interface HeaderProps {
  title: string;
  subtitle?: string;
  children?: React.ReactNode;
}

// Map pathname to tour key
const pathToTourKey: Record<string, keyof TourStatus> = {
  '/': 'welcome',
  '/employees': 'employees',
  '/leave': 'leave',
  '/gratuity': 'gratuity',
  '/overtime': 'overtime',
  '/documents': 'documents',
  '/payroll': 'payroll',
  '/reports': 'reports',
  '/settings': 'settings',
};

export default function Header({ title, subtitle, children }: HeaderProps) {
  const { startTour } = useTour();
  const pathname = usePathname();

  const handleTakeTour = () => {
    const tourKey = pathToTourKey[pathname] || 'welcome';
    startTour(tourKey);
  };

  return (
    <header className="bg-white border-b border-gray-200 px-6 py-4">
      <div className="flex items-center justify-between">
        {/* Title Section */}
        <div className="flex items-center gap-4">
          <div>
            <h1 className="font-display text-2xl font-bold text-gray-900">{title}</h1>
            {subtitle && <p className="text-sm text-gray-500 mt-0.5">{subtitle}</p>}
          </div>
          {children}
        </div>

        {/* Actions Section */}
        <div className="flex items-center gap-4">
          {/* Search */}
          <div className="relative">
            <Search size={18} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
            <input
              type="text"
              placeholder="Search employees..."
              className="pl-10 pr-4 py-2 w-64 bg-gray-50 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-teal-500 focus:border-transparent transition-all"
            />
          </div>

          {/* Take a Tour Button */}
          <button
            onClick={handleTakeTour}
            className="flex items-center gap-1.5 px-3 py-2 text-teal-600 hover:text-teal-700 hover:bg-teal-50 rounded-lg transition-colors text-sm font-medium"
            title="Take a Tour"
          >
            <HelpCircle size={18} />
            <span className="hidden sm:inline">Tour</span>
          </button>

          {/* Notifications */}
          <button className="relative p-2 text-gray-500 hover:text-gray-700 hover:bg-gray-100 rounded-lg transition-colors">
            <Bell size={20} />
            <span className="absolute top-1 right-1 w-2.5 h-2.5 bg-red-500 rounded-full border-2 border-white"></span>
          </button>

          {/* User Menu */}
          <button className="flex items-center gap-2 p-1.5 hover:bg-gray-100 rounded-lg transition-colors">
            <div className="w-8 h-8 bg-gradient-to-br from-teal-500 to-teal-600 rounded-full flex items-center justify-center">
              <User size={16} className="text-white" />
            </div>
            <span className="text-sm font-medium text-gray-700">Admin</span>
            <ChevronDown size={16} className="text-gray-400" />
          </button>
        </div>
      </div>
    </header>
  );
}
