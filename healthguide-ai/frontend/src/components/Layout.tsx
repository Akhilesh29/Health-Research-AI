import { Outlet, NavLink, useNavigate } from 'react-router-dom';
import {
  LayoutDashboard,
  Stethoscope,
  ClipboardList,
  User,
  LogOut,
  Plus,
} from 'lucide-react';
import { useAuthStore } from '../store/authStore';

const navItems = [
  { to: '/app/dashboard', icon: LayoutDashboard, label: 'Dashboard' },
  { to: '/app/checker', icon: Stethoscope, label: 'Symptom Checker' },
  { to: '/app/history', icon: ClipboardList, label: 'History' },
  { to: '/app/profile', icon: User, label: 'Profile' },
];

export default function Layout() {
  const { user, logout } = useAuthStore();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/auth');
  };

  return (
    <div className="flex h-screen bg-gray-50 dark:bg-slate-950 overflow-hidden">
      {/* Sidebar */}
      <aside className="flex w-64 flex-col bg-white dark:bg-slate-900/70 border-r border-gray-100 dark:border-slate-800 shadow-sm">
        {/* Logo */}
        <div className="flex items-center gap-3 px-6 py-5 border-b border-gray-100 dark:border-slate-800">
          <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-brand-600 shadow-brand">
            <svg viewBox="0 0 24 24" className="w-5 h-5" fill="white">
              <rect x="10" y="3" width="4" height="18" rx="1.5" />
              <rect x="3" y="10" width="18" height="4" rx="1.5" />
            </svg>
          </div>
          <div>
            <p className="font-display font-bold text-gray-900 dark:text-white leading-tight text-base">Health Research</p>
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
        <div className="max-w-5xl mx-auto px-6 py-8">
          <Outlet />
        </div>
      </main>
    </div>
  );
}
