import { Link } from 'react-router-dom';
import {
  ArrowRight,
  ShieldCheck,
  Sparkles,
  Stethoscope,
  LineChart,
  Clock,
  Lock,
  MapPin,
} from 'lucide-react';

const features = [
  {
    icon: Sparkles,
    title: 'Clinical-grade insights',
    description:
      'Structured, easy-to-read symptom analysis with clarity-first recommendations and urgency guidance.',
  },
  {
    icon: ShieldCheck,
    title: 'Private by design',
    description:
      'Your symptom checks are tied to your account. We keep the experience secure and straightforward.',
  },
  {
    icon: LineChart,
    title: 'Track your history',
    description:
      'See recent checks, patterns, and urgency breakdowns so you can follow your health journey over time.',
  },
  {
    icon: MapPin,
    title: 'Nearby care with contacts',
    description:
      'After each check, discover nearby doctors and hospitals with map links and available phone/email details.',
  },
];

const stats = [
  { label: 'Clarity-first', value: 'Structured' },
  { label: 'Health timeline', value: 'Live' },
  { label: 'Fast results', value: '< 10s' },
];

function GradientBlob({ className }: { className: string }) {
  return (
    <div
      aria-hidden
      className={[
        'absolute rounded-full blur-3xl opacity-30',
        'bg-gradient-to-br from-brand-300 via-brand-100 to-white',
        'animate-blob',
        className,
      ].join(' ')}
    />
  );
}

export default function LandingPage() {
  return (
    <div className="min-h-screen bg-gradient-to-b from-white via-gray-50 to-white dark:from-slate-950 dark:via-slate-950 dark:to-slate-950 overflow-hidden">
      <div className="relative">
        {/* Background texture */}
        <div aria-hidden className="pointer-events-none absolute inset-0">
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_1px_1px,rgba(15,23,42,0.06)_1px,transparent_0)] dark:bg-[radial-gradient(circle_at_1px_1px,rgba(148,163,184,0.14)_1px,transparent_0)] [background-size:24px_24px] opacity-40" />
          <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top,rgba(252,211,77,0.25),transparent_60%)] dark:bg-[radial-gradient(ellipse_at_top,rgba(252,211,77,0.10),transparent_60%)]" />
        </div>

        <GradientBlob className="-top-24 -left-24 h-80 w-80" />
        <GradientBlob className="top-16 -right-32 h-[28rem] w-[28rem] animate-delay-200" />
        <GradientBlob className="bottom-[-10rem] left-1/2 h-[30rem] w-[30rem] -translate-x-1/2 animate-delay-500" />

        {/* Top bar */}
        <header className="sticky top-0 z-30 backdrop-blur bg-white/70 border-b border-gray-100 dark:bg-slate-950/60 dark:border-slate-800">
          <div className="mx-auto max-w-6xl px-3 sm:px-6 py-3 sm:py-4 flex items-center justify-between gap-2">
            <div className="flex items-center gap-2 sm:gap-3 min-w-0">
              <div className="flex h-8 w-8 sm:h-9 sm:w-9 items-center justify-center rounded-lg sm:rounded-xl bg-brand-600 shadow-brand flex-shrink-0">
                <svg viewBox="0 0 24 24" className="w-5 h-5" fill="white">
                  <rect x="10" y="3" width="4" height="18" rx="1.5" />
                  <rect x="3" y="10" width="18" height="4" rx="1.5" />
                </svg>
              </div>
              <div className="leading-tight">
                <p className="text-[12px] sm:text-sm font-semibold text-gray-900 dark:text-white whitespace-nowrap">Health Research AI</p>
              </div>
            </div>

            <div className="flex items-center gap-1.5 sm:gap-2 flex-shrink-0">
              <Link to="/auth" className="btn-ghost px-2.5 sm:px-4 py-2 text-xs sm:text-sm whitespace-nowrap">
                Sign in
              </Link>
              <Link to="/auth" className="btn-primary px-3 sm:px-5 py-2 sm:py-2.5 text-xs sm:text-sm whitespace-nowrap">
                Get started <ArrowRight size={14} className="sm:w-4 sm:h-4" />
              </Link>
            </div>
          </div>
        </header>

        {/* Hero */}
        <section className="relative">
          <div className="mx-auto max-w-6xl px-6 pt-14 pb-10 lg:pt-20">
            <div className="grid gap-10 lg:grid-cols-2 lg:items-center">
              <div className="animate-fade-in">
                <div className="inline-flex items-center gap-2 rounded-full border border-gray-200 bg-white/70 px-3 py-1.5 text-xs font-semibold text-gray-700 shadow-sm dark:border-slate-800 dark:bg-slate-900/60 dark:text-slate-200">
                  <Sparkles size={14} className="text-brand-600" />
                  Modern symptom checker for everyday clarity
                </div>

                <h1 className="mt-4 text-4xl lg:text-5xl font-semibold tracking-tight text-gray-900 dark:text-white">
                  Feel better, faster.
                  <span className="block text-brand-700">
                    Understand your symptoms clearly.
                  </span>
                </h1>
                <p className="mt-4 text-base lg:text-lg text-gray-600 dark:text-slate-300 leading-relaxed max-w-xl">
                  Turn symptoms into a clear, structured summary with possible causes,
                  self-care tips, and when to seek care. Built for calm, not panic.
                </p>

                <div className="mt-6 flex flex-col sm:flex-row gap-3">
                  <Link to="/auth" className="btn-primary">
                    Start a check <ArrowRight size={16} />
                  </Link>
                  <a href="#features" className="btn-secondary">
                    Explore features
                  </a>
                </div>

                <div className="mt-8 grid grid-cols-3 gap-4 max-w-md">
                  {stats.map((s) => (
                    <div key={s.label} className="rounded-2xl bg-white/70 border border-gray-100 p-4 shadow-sm dark:bg-slate-900/60 dark:border-slate-800">
                      <p className="text-lg font-semibold text-gray-900 dark:text-white">{s.value}</p>
                      <p className="text-xs font-medium text-gray-500 dark:text-slate-400 mt-0.5">{s.label}</p>
                    </div>
                  ))}
                </div>
              </div>

              {/* Preview card */}
              <div className="relative animate-slide-up">
                <div className="absolute -inset-2 rounded-[2rem] bg-gradient-to-b from-brand-200/40 to-white/0 blur-2xl" />
                <div className="relative rounded-[2rem] border border-gray-100 bg-white shadow-card overflow-hidden dark:border-slate-800 dark:bg-slate-900/70">
                  <div className="p-6 border-b border-gray-100 dark:border-slate-800 flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div className="h-10 w-10 rounded-2xl bg-brand-50 flex items-center justify-center">
                        <Stethoscope className="text-brand-600" size={18} />
                      </div>
                      <div>
                        <p className="text-sm font-semibold text-gray-900 dark:text-white">New symptom check</p>
                        <p className="text-xs text-gray-500 dark:text-slate-400">2 minutes • private</p>
                      </div>
                    </div>
                    <div className="badge badge-moderate">Moderate</div>
                  </div>

                  <div className="p-6 space-y-4">
                    <div className="rounded-2xl bg-gray-50 border border-gray-100 p-4 dark:bg-slate-950/60 dark:border-slate-800">
                      <p className="text-xs font-semibold text-gray-500 dark:text-slate-400 uppercase tracking-wider">
                        Symptoms
                      </p>
                      <div className="mt-2 flex flex-wrap gap-2">
                        {['Fever', 'Headache', 'Fatigue'].map((t) => (
                          <span
                            key={t}
                            className="inline-flex items-center rounded-full bg-white border border-gray-200 px-3 py-1 text-xs font-semibold text-gray-700 dark:bg-slate-900 dark:border-slate-800 dark:text-slate-200"
                          >
                            {t}
                          </span>
                        ))}
                      </div>
                    </div>

                    <div className="grid grid-cols-3 gap-3">
                      {[
                        { icon: Clock, label: 'Duration', value: '2 days' },
                        { icon: Lock, label: 'Storage', value: 'Secure' },
                        { icon: ShieldCheck, label: 'Advice', value: 'Guided' },
                      ].map(({ icon: Icon, label, value }) => (
                        <div
                          key={label}
                          className="rounded-2xl bg-white border border-gray-100 p-4 shadow-sm hover:shadow-card-hover transition-all hover:-translate-y-0.5 dark:bg-slate-900/60 dark:border-slate-800"
                        >
                          <Icon size={16} className="text-gray-500 dark:text-slate-400" />
                          <p className="text-xs text-gray-500 dark:text-slate-400 mt-2">{label}</p>
                          <p className="text-sm font-semibold text-gray-900 dark:text-white">{value}</p>
                        </div>
                      ))}
                    </div>

                    <div className="rounded-2xl bg-brand-50 border border-brand-100 p-4">
                      <p className="text-xs font-semibold text-brand-700 uppercase tracking-wider">
                        Summary
                      </p>
                      <p className="text-sm text-brand-900 mt-2 leading-relaxed">
                        Your symptoms may fit a short-term viral illness. Focus on hydration and rest,
                        and monitor for worsening signs.
                      </p>
                    </div>
                  </div>

                  <div className="p-6 pt-0">
                    <Link
                      to="/auth"
                      className="w-full inline-flex items-center justify-center gap-2 rounded-xl bg-gray-900 text-white px-5 py-3 text-sm font-semibold transition-all hover:-translate-y-0.5 hover:shadow-lg"
                    >
                      Try the dashboard <ArrowRight size={16} />
                    </Link>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Features */}
        <section id="features" className="mx-auto max-w-6xl px-6 py-14">
          <div className="flex items-end justify-between gap-6">
            <div>
              <p className="text-xs font-semibold text-brand-700 uppercase tracking-widest">
                Why Health Research AI
              </p>
              <h2 className="mt-2 text-2xl lg:text-3xl font-semibold text-gray-900 tracking-tight">
                Built for real-world care decisions.
              </h2>
              <p className="mt-2 text-sm text-gray-600 max-w-xl">
                A practical medtech workflow that turns symptom input into structured triage guidance,
                nearby care discovery, and actionable next steps you can use immediately.
              </p>
            </div>
            <Link to="/auth" className="hidden sm:inline-flex btn-secondary">
              Create account <ArrowRight size={16} />
            </Link>
          </div>

          <div className="mt-8 grid gap-4 md:grid-cols-2 lg:grid-cols-4">
            {features.map(({ icon: Icon, title, description }, idx) => (
              <div
                key={title}
                className={[
                  'rounded-3xl bg-white border border-gray-100 shadow-card p-6',
                  'transition-all hover:shadow-card-hover hover:-translate-y-1',
                  'animate-fade-in',
                  idx === 0 ? 'animate-delay-100' : idx === 1 ? 'animate-delay-200' : 'animate-delay-300',
                ].join(' ')}
              >
                <div className="h-11 w-11 rounded-2xl bg-gray-50 border border-gray-100 flex items-center justify-center">
                  <Icon size={18} className="text-brand-600" />
                </div>
                <h3 className="mt-4 text-base font-semibold text-gray-900">{title}</h3>
                <p className="mt-2 text-sm text-gray-600 leading-relaxed">{description}</p>
              </div>
            ))}
          </div>
        </section>

        <footer className="mx-auto max-w-6xl px-6 pb-10 text-xs text-gray-500">
          <p>
            Health Research AI provides general information and does not replace professional medical advice.
          </p>
          <p className="mt-2">Created by - Akhilesh</p>
        </footer>
      </div>
    </div>
  );
}

