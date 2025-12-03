import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { useAuth } from '@/hooks/useAuth';
import {
  LayoutDashboard,
  Users,
  ListTodo,
  Workflow,
  Briefcase,
  BarChart3,
} from 'lucide-react';

interface AppShellProps {
  children: React.ReactNode;
}

export function AppShell({ children }: AppShellProps) {
  const { user } = useAuth();
  const location = useLocation();

  const navItems = [
    { path: '/dashboard', icon: LayoutDashboard, label: 'Dashboard' },
    { path: '/people', icon: Users, label: 'People' },
    { path: '/tasks', icon: ListTodo, label: 'Tasks' },
    { path: '/ministry', icon: Briefcase, label: 'Ministry' },
    { path: '/workflows', icon: Workflow, label: 'Automation' },
    { path: '/reports', icon: BarChart3, label: 'Reports' },
  ];

  return (
    <div className="flex h-screen bg-slate-50 font-sans text-slate-600">
      {/* Sidebar Navigation */}
      <aside className="w-20 lg:w-64 bg-slate-900 text-slate-300 flex flex-col flex-shrink-0 transition-all duration-300">
        <div className="p-6 flex items-center gap-3 overflow-hidden">
          <LayoutDashboard className="text-amber-500 flex-shrink-0" size={24} />
          <span className="text-white text-xl font-bold hidden lg:block">Pathways</span>
        </div>

        <nav className="flex-1 px-4 space-y-2 mt-4">
          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive = location.pathname === item.path;
            return (
              <Link
                key={item.path}
                to={item.path}
                className={`w-full flex items-center gap-3 px-3 py-3 rounded-lg transition-colors group relative ${isActive ? 'bg-amber-600 text-white' : 'hover:bg-slate-800'}`}
              >
                <Icon size={20} className={isActive ? 'text-white' : 'text-slate-400 group-hover:text-slate-200'} />
                <span className="hidden lg:block font-medium">{item.label}</span>
              </Link>
            );
          })}
        </nav>
      </aside>

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col h-screen overflow-hidden">
        {/* Top Header */}
        <header className="h-16 bg-white border-b border-slate-200 flex items-center justify-between px-8 flex-shrink-0 z-10">
          <h2 className="text-xl font-bold text-slate-800 capitalize flex items-center gap-2">
            {location.pathname.replace('/', '') || 'Dashboard'}
          </h2>
          <div className="flex items-center gap-4">
            <div className="text-right">
              <p className="text-sm font-medium text-slate-900">{user?.displayName ?? user?.email}</p>
              <p className="text-xs text-slate-500">{user?.isAdmin ? 'Admin' : 'User'}</p>
            </div>
          </div>
        </header>

        {/* View Content Container */}
        <main className="flex-1 overflow-auto bg-slate-50 p-6 lg:p-8">{children}</main>
      </div>
    </div>
  );
}
