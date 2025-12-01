import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { useAuth } from '@hooks/useAuth';
import {
  LayoutDashboard,
  Users,
  CheckCircle,
  MessageCircle,
  Calendar,
  Workflow,
  UserCheck,
  LogOut,
} from 'lucide-react';

interface AppShellProps {
  children: React.ReactNode;
}

export function AppShell({ children }: AppShellProps) {
  const { user, signOut } = useAuth();
  const location = useLocation();

  const navItems = [
    { path: '/dashboard', icon: LayoutDashboard, label: 'Dashboard' },
    { path: '/pipeline', icon: Workflow, label: 'Pipeline' },
    { path: '/people', icon: Users, label: 'People' },
    { path: '/checkin', icon: CheckCircle, label: 'Check-in' },
    { path: '/groups', icon: MessageCircle, label: 'Groups' },
    { path: '/workflows', icon: Calendar, label: 'Workflows' },
    { path: '/ministries', icon: UserCheck, label: 'Ministries' },
  ];

  return (
    <div className="min-h-screen bg-slate-50">
      {/* Sidebar */}
      <aside className="fixed inset-y-0 left-0 w-64 bg-white border-r border-slate-200">
        <div className="p-6">
          <h1 className="text-2xl font-bold text-blue-600">Pathways</h1>
          <p className="text-sm text-slate-500">Church Management</p>
        </div>

        <nav className="px-4 space-y-1">
          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive = location.pathname === item.path;
            return (
              <Link
                key={item.path}
                to={item.path}
                className={`flex items-center gap-3 px-4 py-2.5 rounded-lg transition-colors ${
                  isActive
                    ? 'bg-blue-50 text-blue-600 font-medium'
                    : 'text-slate-600 hover:bg-slate-50'
                }`}
              >
                <Icon size={20} />
                {item.label}
              </Link>
            );
          })}
        </nav>

        {/* User section */}
        <div className="absolute bottom-0 left-0 right-0 p-4 border-t border-slate-200">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-slate-900">{user?.displayName ?? user?.email}</p>
              <p className="text-xs text-slate-500">{user?.isAdmin ? 'Admin' : 'User'}</p>
            </div>
            <button
              onClick={() => signOut()}
              className="text-slate-400 hover:text-red-600 transition-colors"
              title="Sign out"
            >
              <LogOut size={20} />
            </button>
          </div>
        </div>
      </aside>

      {/* Main content */}
      <main className="ml-64 p-8">{children}</main>
    </div>
  );
}
