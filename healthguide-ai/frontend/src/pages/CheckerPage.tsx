import { useState } from 'react';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { X, Plus, Loader2, Stethoscope, ChevronDown, MapPin } from 'lucide-react';
import { symptomsApi } from '../api/symptoms';
import { SymptomCheck, SymptomCheckInput } from '../types';
import SymptomResult from '../components/SymptomResult';

const COMMON_SYMPTOMS = [
  'Headache', 'Fever', 'Cough', 'Fatigue', 'Nausea', 'Sore throat',
  'Shortness of breath', 'Chest pain', 'Back pain', 'Dizziness',
  'Stomach pain', 'Vomiting', 'Diarrhea', 'Rash', 'Joint pain',
  'Loss of appetite', 'Chills', 'Congestion', 'Muscle aches', 'Swollen glands',
];

export default function CheckerPage() {
  const [symptoms, setSymptoms] = useState<string[]>([]);
  const [input, setInput] = useState('');
  const [age, setAge] = useState('');
  const [gender, setGender] = useState('');
  const [severity, setSeverity] = useState('');
  const [duration, setDuration] = useState('');
  const [result, setResult] = useState<SymptomCheck | null>(null);
  const [showContext, setShowContext] = useState(false);

  const qc = useQueryClient();

  const mutation = useMutation({
    mutationFn: (data: SymptomCheckInput) => symptomsApi.create(data),
    onSuccess: (data) => {
      setResult(data);
      qc.invalidateQueries({ queryKey: ['stats'] });
      qc.invalidateQueries({ queryKey: ['symptoms'] });
    },
  });

  const addSymptom = (s: string) => {
    const trimmed = s.trim();
    if (trimmed && !symptoms.includes(trimmed) && symptoms.length < 20) {
      setSymptoms((prev) => [...prev, trimmed]);
    }
    setInput('');
  };

  const removeSymptom = (s: string) => {
    setSymptoms((prev) => prev.filter((x) => x !== s));
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter' || e.key === ',') {
      e.preventDefault();
      addSymptom(input);
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!symptoms.length) return;
    const payload: SymptomCheckInput = {
      symptoms,
      ...(age && { age: parseInt(age) }),
      ...(gender && { gender }),
      ...(severity && { severity: severity as 'mild' | 'moderate' | 'severe' }),
      ...(duration && { duration }),
    };
    mutation.mutate(payload);
  };

  const handleReset = () => {
    setResult(null);
    setSymptoms([]);
    setInput('');
    setAge('');
    setGender('');
    setSeverity('');
    setDuration('');
    mutation.reset();
  };

  if (result) {
    return (
      <div className="space-y-5 animate-fade-in">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="font-display text-2xl font-bold text-gray-900">Analysis Result</h1>
            <p className="text-sm text-gray-400 mt-0.5">Technical symptom insight</p>
            <p className="text-xs text-brand-500 mt-1">Nearby doctors/hospitals are available below this result.</p>
          </div>
          <button onClick={handleReset} className="btn-secondary text-xs">
            New Check
          </button>
        </div>
        <SymptomResult analysis={result.analysis} symptoms={result.symptoms} />
      </div>
    );
  }

  return (
    <div className="max-w-2xl space-y-6 animate-fade-in">
      <div>
        <h1 className="font-display text-3xl font-bold text-gray-900">Symptom Checker</h1>
        <p className="text-sm text-gray-400 mt-1">
          Describe your symptoms and get a structured clinical analysis in seconds
        </p>
      </div>

      <div className="card p-4 border-brand-100">
        <div className="flex items-start gap-3">
          <div className="h-8 w-8 rounded-lg bg-brand-50 text-brand-600 flex items-center justify-center">
            <MapPin size={16} />
          </div>
          <div>
            <p className="text-sm font-semibold text-gray-800">Nearby Care is enabled</p>
            <p className="text-xs text-gray-500 mt-1">
              After analysis, you can use your location to find nearby doctors, clinics, and hospitals.
            </p>
          </div>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="space-y-5">
        {/* Symptom input */}
        <div className="card p-5">
          <label className="block text-sm font-semibold text-gray-700 mb-3">
            What symptoms are you experiencing?
            <span className="text-brand-500 ml-1">*</span>
          </label>

          {/* Tag input */}
          <div className="flex flex-wrap gap-2 min-h-[42px] rounded-xl border border-gray-200 bg-white p-2 focus-within:border-brand-400 focus-within:ring-2 focus-within:ring-brand-100 transition-all">
            {symptoms.map((s) => (
              <span
                key={s}
                className="flex items-center gap-1 rounded-lg bg-brand-50 text-brand-700 px-2.5 py-1 text-xs font-medium"
              >
                {s}
                <button
                  type="button"
                  onClick={() => removeSymptom(s)}
                  className="hover:text-brand-900 transition-colors"
                >
                  <X size={11} />
                </button>
              </span>
            ))}
            <input
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={handleKeyDown}
              onBlur={() => input && addSymptom(input)}
              placeholder={symptoms.length ? 'Add more…' : 'Type a symptom and press Enter'}
              className="flex-1 min-w-[160px] text-sm outline-none placeholder-gray-400 bg-transparent"
            />
          </div>
          <p className="text-xs text-gray-400 mt-2">Press Enter or comma to add each symptom</p>

          {/* Common symptoms */}
          <div className="mt-4">
            <p className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-2">Common symptoms</p>
            <div className="flex flex-wrap gap-1.5">
              {COMMON_SYMPTOMS.filter((s) => !symptoms.includes(s)).slice(0, 12).map((s) => (
                <button
                  key={s}
                  type="button"
                  onClick={() => addSymptom(s)}
                  className="flex items-center gap-1 rounded-lg border border-gray-200 bg-gray-50 px-2.5 py-1 text-xs text-gray-600 hover:bg-brand-50 hover:border-brand-200 hover:text-brand-700 transition-colors"
                >
                  <Plus size={10} />
                  {s}
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Optional context */}
        <div className="card overflow-hidden">
          <button
            type="button"
            onClick={() => setShowContext((s) => !s)}
            className="flex items-center justify-between w-full p-5 text-sm font-semibold text-gray-700 hover:bg-gray-50 transition-colors"
          >
            Add context (optional)
            <ChevronDown
              size={16}
              className={`text-gray-400 transition-transform ${showContext ? 'rotate-180' : ''}`}
            />
          </button>

          {showContext && (
            <div className="px-5 pb-5 grid grid-cols-2 gap-4 border-t border-gray-50">
              <div>
                <label className="block text-xs font-semibold text-gray-500 mb-1.5">Age</label>
                <input
                  type="number"
                  min={0}
                  max={150}
                  placeholder="e.g. 32"
                  value={age}
                  onChange={(e) => setAge(e.target.value)}
                  className="input text-sm"
                />
              </div>
              <div>
                <label className="block text-xs font-semibold text-gray-500 mb-1.5">Gender</label>
                <select
                  value={gender}
                  onChange={(e) => setGender(e.target.value)}
                  className="input text-sm"
                >
                  <option value="">Prefer not to say</option>
                  <option value="male">Male</option>
                  <option value="female">Female</option>
                  <option value="other">Other</option>
                </select>
              </div>
              <div>
                <label className="block text-xs font-semibold text-gray-500 mb-1.5">Severity</label>
                <select
                  value={severity}
                  onChange={(e) => setSeverity(e.target.value)}
                  className="input text-sm"
                >
                  <option value="">Select…</option>
                  <option value="mild">Mild</option>
                  <option value="moderate">Moderate</option>
                  <option value="severe">Severe</option>
                </select>
              </div>
              <div>
                <label className="block text-xs font-semibold text-gray-500 mb-1.5">Duration</label>
                <input
                  type="text"
                  placeholder="e.g. 2 days"
                  value={duration}
                  onChange={(e) => setDuration(e.target.value)}
                  className="input text-sm"
                />
              </div>
            </div>
          )}
        </div>

        {/* Error */}
        {mutation.isError && (
          <div className="rounded-xl bg-red-50 border border-red-200 p-3 text-sm text-red-700">
            {(mutation.error as { response?: { data?: { error?: string } } })?.response?.data?.error ??
              'Failed to analyze symptoms. Please try again.'}
          </div>
        )}

        {/* Submit */}
        <button
          type="submit"
          disabled={!symptoms.length || mutation.isPending}
          className="btn-primary w-full py-3"
        >
          {mutation.isPending ? (
            <>
              <Loader2 size={16} className="animate-spin" />
              Processing symptom intelligence…
            </>
          ) : (
            <>
              <Stethoscope size={16} />
              Analyze Symptoms
            </>
          )}
        </button>

        <p className="text-center text-xs text-gray-400">
          This tool is for informational purposes only and does not replace professional medical advice.
        </p>
      </form>
    </div>
  );
}
