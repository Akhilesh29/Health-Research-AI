import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { format } from 'date-fns';
import { Trash2, ChevronDown, ChevronUp, ClipboardList, AlertCircle, Loader2 } from 'lucide-react';
import { symptomsApi } from '../api/symptoms';
import { SymptomCheck } from '../types';
import SymptomResult from '../components/SymptomResult';

const urgencyBadge = (level: string) => {
  const map: Record<string, string> = {
    low: 'badge-low',
    moderate: 'badge-moderate',
    high: 'badge-high',
    emergency: 'badge-emergency',
  };
  return map[level] ?? 'badge';
};

function CheckCard({ check }: { check: SymptomCheck }) {
  const [expanded, setExpanded] = useState(false);
  const qc = useQueryClient();

  const deleteMutation = useMutation({
    mutationFn: () => symptomsApi.delete(check.id),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['symptoms'] });
      qc.invalidateQueries({ queryKey: ['stats'] });
    },
  });

  return (
    <div className="card overflow-hidden">
      <div
        className="group flex items-center gap-4 px-5 py-4 cursor-pointer hover:bg-gray-50 dark:hover:bg-slate-800/80 transition-colors"
        onClick={() => setExpanded((e) => !e)}
      >
        <div className="h-9 w-9 rounded-xl bg-brand-50 flex items-center justify-center flex-shrink-0">
          <AlertCircle size={15} className="text-brand-500" />
        </div>

        <div className="flex-1 min-w-0">
          <p className="text-sm font-semibold text-gray-800 dark:text-slate-100 truncate group-hover:text-gray-900 dark:group-hover:text-white">
            {check.symptoms.slice(0, 4).join(', ')}
            {check.symptoms.length > 4 && (
              <span className="text-gray-400 dark:text-slate-400"> +{check.symptoms.length - 4} more</span>
            )}
          </p>
          <p className="text-xs text-gray-400 dark:text-slate-400 mt-0.5 group-hover:text-gray-500 dark:group-hover:text-slate-300">
            {format(new Date(check.createdAt), 'MMM d, yyyy · h:mm a')}
          </p>
        </div>

        <div className="flex items-center gap-3">
          <span className={urgencyBadge(check.urgencyLevel)}>{check.urgencyLevel}</span>
          <button
            onClick={(e) => {
              e.stopPropagation();
              if (confirm('Delete this check?')) deleteMutation.mutate();
            }}
            disabled={deleteMutation.isPending}
            className="p-1.5 rounded-lg text-gray-400 hover:text-red-500 hover:bg-red-50 transition-colors"
          >
            {deleteMutation.isPending ? (
              <Loader2 size={13} className="animate-spin" />
            ) : (
              <Trash2 size={13} />
            )}
          </button>
          {expanded ? (
            <ChevronUp size={14} className="text-gray-400" />
          ) : (
            <ChevronDown size={14} className="text-gray-400" />
          )}
        </div>
      </div>

      {expanded && (
        <div className="px-5 pb-5 border-t border-gray-50">
          <div className="pt-4">
            <SymptomResult analysis={check.analysis} symptoms={check.symptoms} />
          </div>
        </div>
      )}
    </div>
  );
}

export default function HistoryPage() {
  const [page, setPage] = useState(1);

  const { data, isLoading } = useQuery({
    queryKey: ['symptoms', page],
    queryFn: () => symptomsApi.list(page, 10),
  });

  return (
    <div className="space-y-5 animate-fade-in">
      <div>
        <h1 className="font-display text-3xl font-bold text-gray-900">Check History</h1>
        <p className="text-sm text-gray-400 mt-1">
          {data?.pagination.total
            ? `${data.pagination.total} total analyses`
            : 'All your symptom analyses'}
        </p>
      </div>

      {isLoading ? (
        <div className="flex items-center justify-center py-20">
          <Loader2 size={24} className="animate-spin text-brand-400" />
        </div>
      ) : !data?.checks.length ? (
        <div className="card p-12 text-center">
          <div className="h-14 w-14 rounded-2xl bg-brand-50 flex items-center justify-center mx-auto mb-4">
            <ClipboardList size={22} className="text-brand-400" />
          </div>
          <p className="font-semibold text-gray-700">No checks yet</p>
          <p className="text-sm text-gray-400 mt-1">
            Run your first symptom analysis to see it here
          </p>
        </div>
      ) : (
        <>
          <div className="space-y-3">
            {data.checks.map((check) => (
              <CheckCard key={check.id} check={check} />
            ))}
          </div>

          {/* Pagination */}
          {data.pagination.pages > 1 && (
            <div className="flex items-center justify-between pt-2">
              <button
                onClick={() => setPage((p) => Math.max(1, p - 1))}
                disabled={page === 1}
                className="btn-secondary text-xs py-2"
              >
                Previous
              </button>
              <span className="text-xs text-gray-500">
                Page {page} of {data.pagination.pages}
              </span>
              <button
                onClick={() => setPage((p) => Math.min(data.pagination.pages, p + 1))}
                disabled={page === data.pagination.pages}
                className="btn-secondary text-xs py-2"
              >
                Next
              </button>
            </div>
          )}
        </>
      )}
    </div>
  );
}
