import { useQuery } from '@tanstack/react-query';
import { Link } from 'react-router-dom';
import { format } from 'date-fns';
import { Stethoscope, TrendingUp, Clock, ChevronRight, AlertCircle } from 'lucide-react';
import { symptomsApi } from '../api/symptoms';
import { useAuthStore } from '../store/authStore';

const urgencyBadge = (level: string) => {
  const map: Record<string, string> = {
    low: 'badge-low',
    moderate: 'badge-moderate',
    high: 'badge-high',
    emergency: 'badge-emergency',
  };
  return map[level] ?? 'badge';
};

export default function DashboardPage() {
  const user = useAuthStore((s) => s.user);

  const { data: stats, isLoading } = useQuery({
    queryKey: ['stats'],
    queryFn: symptomsApi.stats,
  });

  const greeting = () => {
    const h = new Date().getHours();
    if (h < 12) return 'Good morning';
    if (h < 17) return 'Good afternoon';
    return 'Good evening';
  };

  const urgencyOrder = ['emergency', 'high', 'moderate', 'low'];
  const urgencyLabels: Record<string, string> = {
    low: 'Low', moderate: 'Moderate', high: 'High', emergency: 'Emergency',
  };

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Header */}
      <div className="flex items-end justify-between">
        <div>
          <p className="text-sm text-gray-400 font-medium">
            {format(new Date(), 'EEEE, MMMM d')}
          </p>
          <h1 className="font-display text-3xl font-bold text-gray-900 mt-0.5">
            {greeting()}, {user?.name?.split(' ')[0]}
          </h1>
        </div>
        <Link to="/app/checker" className="btn-primary">
          <Stethoscope size={15} />
          New Check
        </Link>
      </div>

      {/* Stats row */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="card p-5">
          <div className="flex items-center justify-between mb-3">
            <p className="text-xs font-semibold text-gray-400 uppercase tracking-wider">Total Checks</p>
            <div className="h-8 w-8 rounded-lg bg-brand-50 flex items-center justify-center">
              <TrendingUp size={15} className="text-brand-500" />
            </div>
          </div>
          <p className="font-display text-4xl font-bold text-gray-900">
            {isLoading ? '...' : stats?.total ?? 0}
          </p>
          <p className="text-xs text-gray-400 mt-1">Lifetime analyses</p>
        </div>

        {urgencyOrder.slice(0, 2).map((level) => (
          <div key={level} className="card p-5">
            <div className="flex items-center justify-between mb-3">
              <p className="text-xs font-semibold text-gray-400 uppercase tracking-wider">
                {urgencyLabels[level]}
              </p>
              <span className={urgencyBadge(level)}>{level}</span>
            </div>
            <p className="font-display text-4xl font-bold text-gray-900">
              {isLoading ? '...' : stats?.urgencyBreakdown?.[level] ?? 0}
            </p>
            <p className="text-xs text-gray-400 mt-1">Checks at this level</p>
          </div>
        ))}
      </div>

      {/* Recent activity */}
      <div className="card">
        <div className="flex items-center justify-between p-5 border-b border-gray-50">
          <div className="flex items-center gap-2">
            <Clock size={16} className="text-gray-400" />
            <h2 className="font-semibold text-gray-800">Recent Activity</h2>
          </div>
          <Link to="/app/history" className="text-xs font-semibold text-brand-600 hover:text-brand-700 flex items-center gap-1">
            View all <ChevronRight size={13} />
          </Link>
        </div>

        {isLoading ? (
          <div className="p-8 text-center text-gray-400 text-sm">Loading…</div>
        ) : !stats?.recentChecks?.length ? (
          <div className="p-10 text-center">
            <div className="h-12 w-12 rounded-2xl bg-brand-50 flex items-center justify-center mx-auto mb-3">
              <Stethoscope size={20} className="text-brand-400" />
            </div>
            <p className="text-sm font-medium text-gray-600">No checks yet</p>
            <p className="text-xs text-gray-400 mt-1">Run your first symptom analysis to get started</p>
            <Link to="/app/checker" className="btn-primary mt-4 text-xs py-2">
              Start Checking
            </Link>
          </div>
        ) : (
          <div className="divide-y divide-gray-50 dark:divide-slate-800">
            {stats.recentChecks.map((check) => (
              <Link
                key={check.id}
                to="/app/history"
                className="group flex items-center gap-4 px-5 py-3.5 hover:bg-gray-50 dark:hover:bg-slate-800/80 transition-colors"
              >
                <div className="h-8 w-8 rounded-lg bg-brand-50 dark:bg-brand-500/15 flex items-center justify-center flex-shrink-0">
                  <AlertCircle size={14} className="text-brand-500" />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-gray-800 dark:text-slate-100 truncate group-hover:text-gray-900 dark:group-hover:text-white">
                    {check.symptoms.slice(0, 3).join(', ')}
                    {check.symptoms.length > 3 && ` +${check.symptoms.length - 3} more`}
                  </p>
                  <p className="text-xs text-gray-400 dark:text-slate-400 mt-0.5 group-hover:text-gray-500 dark:group-hover:text-slate-300">
                    {format(new Date(check.createdAt), 'MMM d, yyyy · h:mm a')}
                  </p>
                </div>
                <span className={urgencyBadge(check.urgencyLevel)}>
                  {check.urgencyLevel}
                </span>
              </Link>
            ))}
          </div>
        )}
      </div>

      {/* Urgency breakdown */}
      {stats && stats.total > 0 && (
        <div className="card p-5">
          <h2 className="font-semibold text-gray-800 mb-4">Urgency Breakdown</h2>
          <div className="space-y-3">
            {urgencyOrder.map((level) => {
              const count = stats.urgencyBreakdown?.[level] ?? 0;
              const pct = stats.total ? Math.round((count / stats.total) * 100) : 0;
              const barColors: Record<string, string> = {
                low: 'bg-emerald-400',
                moderate: 'bg-amber-400',
                high: 'bg-orange-400',
                emergency: 'bg-red-500',
              };
              return (
                <div key={level}>
                  <div className="flex justify-between text-xs mb-1.5">
                    <span className="font-medium text-gray-600 capitalize">{level}</span>
                    <span className="text-gray-400">{count} ({pct}%)</span>
                  </div>
                  <div className="h-1.5 bg-gray-100 rounded-full overflow-hidden">
                    <div
                      className={`h-full rounded-full ${barColors[level]} transition-all duration-700`}
                      style={{ width: `${pct}%` }}
                    />
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
}
