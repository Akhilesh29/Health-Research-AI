import { useQuery } from '@tanstack/react-query';
import { format } from 'date-fns';
import { User, Mail, Calendar, Shield, LogOut, Stethoscope } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useAuthStore } from '../store/authStore';
import { symptomsApi } from '../api/symptoms';

export default function ProfilePage() {
  const { user, logout } = useAuthStore();
  const navigate = useNavigate();

  const { data: stats } = useQuery({
    queryKey: ['stats'],
    queryFn: symptomsApi.stats,
  });

  const handleLogout = () => {
    logout();
    navigate('/auth');
  };

  const initials = user?.name
    ? user.name.split(' ').map((n) => n[0]).join('').toUpperCase().slice(0, 2)
    : 'U';

  return (
    <div className="max-w-2xl space-y-6 animate-fade-in">
      <div>
        <h1 className="font-display text-3xl font-bold text-gray-900">Profile</h1>
        <p className="text-sm text-gray-400 mt-1">Your account information</p>
      </div>

      {/* Avatar + name */}
      <div className="card p-6 flex items-center gap-5">
        <div className="h-16 w-16 rounded-2xl bg-brand-600 flex items-center justify-center text-white font-display font-bold text-xl shadow-brand flex-shrink-0">
          {initials}
        </div>
        <div>
          <h2 className="font-display text-xl font-bold text-gray-900">{user?.name}</h2>
          <p className="text-sm text-gray-400">{user?.email}</p>
        </div>
      </div>

      {/* Account details */}
      <div className="card divide-y divide-gray-50">
        <div className="flex items-center gap-4 px-5 py-4">
          <div className="h-8 w-8 rounded-lg bg-gray-100 flex items-center justify-center flex-shrink-0">
            <User size={14} className="text-gray-500" />
          </div>
          <div className="flex-1">
            <p className="text-xs font-semibold text-gray-400 uppercase tracking-wider">Full Name</p>
            <p className="text-sm font-medium text-gray-800 mt-0.5">{user?.name}</p>
          </div>
        </div>

        <div className="flex items-center gap-4 px-5 py-4">
          <div className="h-8 w-8 rounded-lg bg-gray-100 flex items-center justify-center flex-shrink-0">
            <Mail size={14} className="text-gray-500" />
          </div>
          <div className="flex-1">
            <p className="text-xs font-semibold text-gray-400 uppercase tracking-wider">Email</p>
            <p className="text-sm font-medium text-gray-800 mt-0.5">{user?.email}</p>
          </div>
        </div>

        <div className="flex items-center gap-4 px-5 py-4">
          <div className="h-8 w-8 rounded-lg bg-gray-100 flex items-center justify-center flex-shrink-0">
            <Calendar size={14} className="text-gray-500" />
          </div>
          <div className="flex-1">
            <p className="text-xs font-semibold text-gray-400 uppercase tracking-wider">Member Since</p>
            <p className="text-sm font-medium text-gray-800 mt-0.5">
              {user?.createdAt ? format(new Date(user.createdAt), 'MMMM d, yyyy') : 'N/A'}
            </p>
          </div>
        </div>

        <div className="flex items-center gap-4 px-5 py-4">
          <div className="h-8 w-8 rounded-lg bg-brand-50 flex items-center justify-center flex-shrink-0">
            <Stethoscope size={14} className="text-brand-500" />
          </div>
          <div className="flex-1">
            <p className="text-xs font-semibold text-gray-400 uppercase tracking-wider">Total Analyses</p>
            <p className="text-sm font-medium text-gray-800 mt-0.5">{stats?.total ?? 0} symptom checks</p>
          </div>
        </div>
      </div>

      {/* Security note */}
      <div className="rounded-2xl bg-brand-50 border border-brand-100 p-4 flex items-start gap-3">
        <Shield size={16} className="text-brand-500 mt-0.5 flex-shrink-0" />
        <p className="text-sm text-brand-700 leading-relaxed">
          Your health data is encrypted and stored securely. We never share your personal information with third parties.
        </p>
      </div>

      {/* Logout */}
      <div className="card p-5">
        <h3 className="text-sm font-semibold text-gray-700 mb-3">Account Actions</h3>
        <button
          onClick={handleLogout}
          className="flex items-center gap-2 rounded-xl border border-red-200 bg-red-50 px-4 py-2.5 text-sm font-semibold text-red-600 hover:bg-red-100 transition-colors"
        >
          <LogOut size={15} />
          Sign Out
        </button>
      </div>
    </div>
  );
}
