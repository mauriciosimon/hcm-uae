'use client';

import { useState } from 'react';
import Link from 'next/link';
import {
  Users,
  Calendar,
  DollarSign,
  Award,
  FileText,
  Clock,
  BarChart3,
  Settings,
  ChevronLeft,
  ChevronRight,
  Building2,
  Bell,
  Menu,
  Home
} from 'lucide-react';

interface NavItem {
  name: string;
  href: string;
  icon: React.ReactNode;
  badge?: number;
}

const navigation: NavItem[] = [
  { name: 'Dashboard', href: '/', icon: <Home size={20} /> },
  { name: 'Employees', href: '/employees', icon: <Users size={20} /> },
  { name: 'Leave Management', href: '/leave', icon: <Calendar size={20} /> },
  { name: 'Payroll', href: '/payroll', icon: <DollarSign size={20} /> },
  { name: 'Gratuity', href: '/gratuity', icon: <Award size={20} /> },
  { name: 'Documents', href: '/documents', icon: <FileText size={20} />, badge: 3 },
  { name: 'Overtime', href: '/overtime', icon: <Clock size={20} /> },
  { name: 'Reports', href: '/reports', icon: <BarChart3 size={20} /> },
  { name: 'Settings', href: '/settings', icon: <Settings size={20} /> },
];

export default function Sidebar() {
  const [collapsed, setCollapsed] = useState(false);
  const [activeItem, setActiveItem] = useState('Dashboard');

  return (
    <aside
      data-tour="sidebar"
      className={`fixed left-0 top-0 h-screen bg-gradient-to-b from-teal-900 to-teal-950 text-white transition-all duration-300 z-50 ${
        collapsed ? 'w-20' : 'w-64'
      }`}
    >
      {/* Logo */}
      <div className="flex items-center justify-between p-4 border-b border-teal-800">
        <div className={`flex items-center gap-3 ${collapsed ? 'justify-center w-full' : ''}`}>
          <div className="w-10 h-10 bg-gradient-to-br from-amber-400 to-amber-500 rounded-xl flex items-center justify-center shadow-lg">
            <Building2 size={22} className="text-teal-900" />
          </div>
          {!collapsed && (
            <div className="animate-fade-in">
              <h1 className="font-display font-bold text-lg leading-tight">HCM UAE</h1>
              <p className="text-xs text-teal-300">by Pantaia</p>
            </div>
          )}
        </div>
      </div>

      {/* Navigation */}
      <nav className="p-3 space-y-1">
        {navigation.map((item) => (
          <Link
            key={item.name}
            href={item.href}
            onClick={() => setActiveItem(item.name)}
            className={`flex items-center gap-3 px-3 py-2.5 rounded-lg transition-all duration-200 group relative ${
              activeItem === item.name
                ? 'bg-white/15 text-white shadow-md'
                : 'text-teal-200 hover:bg-white/10 hover:text-white'
            }`}
          >
            <span className={`${activeItem === item.name ? 'text-amber-400' : 'text-teal-300 group-hover:text-amber-400'} transition-colors`}>
              {item.icon}
            </span>
            {!collapsed && (
              <span className="font-medium text-sm animate-fade-in">{item.name}</span>
            )}
            {item.badge && !collapsed && (
              <span className="absolute right-3 bg-amber-500 text-teal-900 text-xs font-bold px-2 py-0.5 rounded-full">
                {item.badge}
              </span>
            )}
            {item.badge && collapsed && (
              <span className="absolute -top-1 -right-1 bg-amber-500 text-teal-900 text-xs font-bold w-5 h-5 flex items-center justify-center rounded-full">
                {item.badge}
              </span>
            )}
          </Link>
        ))}
      </nav>

      {/* Collapse Button */}
      <button
        onClick={() => setCollapsed(!collapsed)}
        className="absolute bottom-4 left-1/2 -translate-x-1/2 w-8 h-8 bg-teal-800 hover:bg-teal-700 rounded-full flex items-center justify-center transition-colors"
      >
        {collapsed ? <ChevronRight size={16} /> : <ChevronLeft size={16} />}
      </button>
    </aside>
  );
}
