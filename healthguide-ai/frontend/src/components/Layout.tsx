import { Outlet, NavLink, useNavigate } from 'react-router-dom';
import {
  LayoutDashboard,
  Stethoscope,
  ClipboardList,
  User,
  LogOut,
  Plus,
  Menu,
  X,
} from 'lucide-react';
import { useQueryClient } from '@tanstack/react-query';
import { useAuthStore } from '../store/authStore';
import { useState } from 'react';

const navItems = [
  { to: '/app/dashboard', icon: LayoutDashboard, label: 'Dashboard' },
  { to: '/app/checker', icon: Stethoscope, label: 'Symptom Checker' },
  { to: '/app/history', icon: ClipboardList, label: 'History' },
  { to: '/app/profile', icon: User, label: 'Profile' },
];

export default function Layout() {
  const { user, logout } = useAuthStore();
  const navigate = useNavigate();
  const qc = useQueryClient();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const handleLogout = () => {
    qc.clear();
    logout();
    navigate('/auth');
  };

  const handleMobileNav = () => {
    setMobileMenuOpen(false);
  };

  return (
    <div className="flex h-screen bg-gray-50 dark:bg-slate-950 overflow-hidden">
      {/* Mobile top bar */}
      <div className="md:hidden fixed top-0 left-0 right-0 z-40 h-14 bg-white/95 dark:bg-slate-900/95 backdrop-blur border-b border-gray-100 dark:border-slate-800 px-4 flex items-center justify-between">
        <div className="flex items-center gap-2 min-w-0">
          <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-brand-600 shadow-brand">
            <svg viewBox="0 0 24 24" className="w-4 h-4" fill="white">
              <rect x="10" y="3" width="4" height="18" rx="1.5" />
              <rect x="3" y="10" width="18" height="4" rx="1.5" />
            </svg>
          </div>
          <p className="font-display font-bold text-gray-900 dark:text-white text-sm truncate">Health Research AI</p>
        </div>
        <button
          type="button"
          onClick={() => setMobileMenuOpen((v) => !v)}
          className="p-2 rounded-lg text-gray-500 dark:text-slate-300 hover:bg-gray-100 dark:hover:bg-slate-800"
          aria-label="Toggle menu"
        >
          {mobileMenuOpen ? <X size={18} /> : <Menu size={18} />}
        </button>
      </div>

      {/* Mobile slide-down menu */}
      {mobileMenuOpen && (
        <div className="md:hidden fixed top-14 left-0 right-0 z-30 border-b border-gray-100 dark:border-slate-800 bg-white dark:bg-slate-900 px-3 py-3 shadow-card">
          <div className="space-y-1">
            {navItems.map(({ to, icon: Icon, label }) => (
              <NavLink
                key={to}
                to={to}
                onClick={handleMobileNav}
                className={({ isActive }) =>
                  `flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium transition-all ${
                    isActive
                      ? 'bg-brand-50 text-brand-700 dark:bg-brand-500/10 dark:text-brand-200'
                      : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900 dark:text-slate-300 dark:hover:bg-slate-800/60 dark:hover:text-white'
                  }`
                }
              >
                <Icon size={17} />
                {label}
              </NavLink>
            ))}
          </div>
        </div>
      )}

      {/* Sidebar */}
      <aside className="hidden md:flex w-64 flex-col bg-white dark:bg-slate-900/70 border-r border-gray-100 dark:border-slate-800 shadow-sm">
        {/* Logo */}
        <div className="flex items-center gap-3 px-6 py-5 border-b border-gray-100 dark:border-slate-800">
          <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-brand-600 shadow-brand">
            <svg viewBox="0 0 24 24" className="w-5 h-5" fill="white">
              <rect x="10" y="3" width="4" height="18" rx="1.5" />
              <rect x="3" y="10" width="18" height="4" rx="1.5" />
            </svg>
          </div>
          <div>
            <p className="font-display font-bold text-gray-900 dark:text-white leading-tight text-base">Health Research AI</p>
          </div>
        </div>

        {/* Navigation */}
        <nav className="flex-1 px-3 py-4 space-y-0.5">
          {navItems.map(({ to, icon: Icon, label }) => (
            <NavLink
              key={to}
              to={to}
              className={({ isActive }) =>
                `flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium transition-all ${
                  isActive
                    ? 'bg-brand-50 text-brand-700 dark:bg-brand-500/10 dark:text-brand-200'
                    : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900 dark:text-slate-300 dark:hover:bg-slate-800/60 dark:hover:text-white'
                }`
              }
            >
              {({ isActive }) => (
                <>
                  <Icon
                    size={18}
                    className={isActive ? 'text-brand-600' : 'text-gray-400 dark:text-slate-500'}
                    strokeWidth={isActive ? 2.5 : 2}
                  />
                  {label}
                </>
              )}
            </NavLink>
          ))}
        </nav>

        {/* Quick action */}
        <div className="px-3 pb-3">
          <NavLink
            to="/app/checker"
            className="btn-primary w-full text-xs py-2"
          >
            <Plus size={15} />
            New Check
          </NavLink>
        </div>

        {/* User info */}
        <div className="flex items-center gap-3 px-4 py-4 border-t border-gray-100 dark:border-slate-800">
          <div className="flex h-8 w-8 items-center justify-center rounded-full bg-brand-100 text-brand-700 dark:bg-brand-500/15 dark:text-brand-200 text-sm font-bold flex-shrink-0">
            {user?.name?.[0]?.toUpperCase() ?? 'U'}
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-sm font-semibold text-gray-900 dark:text-white truncate">{user?.name}</p>
            <p className="text-xs text-gray-400 dark:text-slate-500 truncate">{user?.email}</p>
          </div>
          <button
            onClick={handleLogout}
            className="p-1.5 rounded-lg text-gray-400 dark:text-slate-500 hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-500/10 transition-colors"
            title="Logout"
          >
            <LogOut size={15} />
          </button>
        </div>
      </aside>

      {/* Main content */}
      <main className="flex-1 overflow-y-auto">
        <div className="max-w-5xl mx-auto px-4 md:px-6 pt-20 md:pt-8 pb-24 md:pb-8">
          <Outlet />
        </div>
      </main>

      {/* Mobile bottom nav */}
      <div className="md:hidden fixed bottom-0 left-0 right-0 z-40 bg-white/95 dark:bg-slate-900/95 backdrop-blur border-t border-gray-100 dark:border-slate-800 px-1.5 py-1.5">
        <div className="grid grid-cols-5 gap-1">
          {navItems.map(({ to, icon: Icon, label }) => (
            <NavLink
              key={to}
              to={to}
              className={({ isActive }) =>
                `flex flex-col items-center justify-center gap-0.5 rounded-lg py-1.5 text-[10px] font-medium ${
                  isActive
                    ? 'text-brand-700 bg-brand-50 dark:bg-brand-500/10 dark:text-brand-200'
                    : 'text-gray-500 dark:text-slate-400'
                }`
              }
            >
              <Icon size={16} />
              <span className="leading-none">{label === 'Symptom Checker' ? 'Checker' : label}</span>
            </NavLink>
          ))}
          <NavLink
            to="/app/checker"
            className="flex flex-col items-center justify-center gap-0.5 rounded-lg py-1.5 text-[10px] font-semibold text-brand-700 bg-brand-50 dark:bg-brand-500/10 dark:text-brand-200"
          >
            <Plus size={16} />
            <span className="leading-none">New</span>
          </NavLink>
        </div>
      </div>
    </div>
  );
}
