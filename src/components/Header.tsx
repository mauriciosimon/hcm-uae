'use client';

import { Search, User, ChevronDown, HelpCircle, Menu } from 'lucide-react';
import { useTour, TourStatus } from '@/contexts/TourContext';
import { useSidebar } from '@/contexts/SidebarContext';
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
  const { toggle } = useSidebar();
  const pathname = usePathname();

  const handleTakeTour = () => {
    const tourKey = pathToTourKey[pathname] || 'welcome';
    startTour(tourKey);
  };

  return (
    <header className="bg-white border-b border-gray-200 px-4 md:px-6 py-4">
      <div className="flex items-center justify-between">
        {/* Title Section */}
        <div className="flex items-center gap-3 md:gap-4">
          {/* Hamburger menu - mobile only */}
          <button
            onClick={toggle}
            className="p-2 -ml-2 hover:bg-gray-100 rounded-lg transition-colors md:hidden"
            aria-label="Toggle menu"
          >
            <Menu size={24} className="text-gray-600" />
          </button>

          <div>
            <h1 className="font-display text-xl md:text-2xl font-bold text-gray-900">{title}</h1>
            {subtitle && <p className="text-xs md:text-sm text-gray-500 mt-0.5">{subtitle}</p>}
          </div>
          {children}
        </div>

        {/* Actions Section */}
        <div className="flex items-center gap-2 md:gap-4">
          {/* Search - hidden on small mobile */}
          <div className="relative hidden sm:block">
            <Search size={18} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
            <input
              type="text"
              placeholder="Search employees..."
              className="pl-10 pr-4 py-2 w-40 md:w-64 bg-gray-50 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-teal-500 focus:border-transparent transition-all"
            />
          </div>

          {/* Mobile search icon */}
          <button className="p-2 hover:bg-gray-100 rounded-lg transition-colors sm:hidden">
            <Search size={20} className="text-gray-600" />
          </button>

          {/* Take a Tour Button */}
          <button
            onClick={handleTakeTour}
            className="flex items-center gap-1.5 px-2 md:px-3 py-2 text-teal-600 hover:text-teal-700 hover:bg-teal-50 rounded-lg transition-colors text-sm font-medium"
            title="Take a Tour"
          >
            <HelpCircle size={18} />
            <span className="hidden md:inline">Tour</span>
          </button>

          {/* User Menu */}
          <button className="flex items-center gap-2 p-1.5 hover:bg-gray-100 rounded-lg transition-colors">
            <div className="w-8 h-8 bg-gradient-to-br from-teal-500 to-teal-600 rounded-full flex items-center justify-center">
              <User size={16} className="text-white" />
            </div>
            <span className="text-sm font-medium text-gray-700 hidden md:inline">Admin</span>
            <ChevronDown size={16} className="text-gray-400 hidden md:inline" />
          </button>
        </div>
      </div>
    </header>
  );
}
