import { useState } from 'react';
import { motion } from 'motion/react';
import { ArrowLeft, ShieldCheck, Users, UserCheck, Check, Mail, Lock, LogIn } from 'lucide-react';
import { useStore } from '@/store';
import { cn } from '@/lib/utils';
import {
  ROLE_OPTIONS,
  getModuleLabelsForRole,
  type UserRole,
} from '@/lib/rbac';
import { BrandLogo } from '@/components/ui/BrandLogo';

const DEFAULT_EMAIL = 'admin@coworking.os';
const DEFAULT_PASSWORD = 'demo123';

const ROLE_ICONS: Record<UserRole, typeof ShieldCheck> = {
  'Super Admin': ShieldCheck,
  'Community Host': Users,
  Receptionist: UserCheck,
};

export function SignInScreen() {
  const { signIn, setView } = useStore();
  const [email, setEmail] = useState(DEFAULT_EMAIL);
  const [password, setPassword] = useState(DEFAULT_PASSWORD);
  const [selectedRole, setSelectedRole] = useState<UserRole>('Super Admin');
  const [error, setError] = useState('');

  const previewModules = getModuleLabelsForRole(selectedRole);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    if (!email.trim() || !password.trim()) {
      setError('Enter your email and password.');
      return;
    }
    const ok = signIn(email.trim(), password, selectedRole);
    if (!ok) {
      setError('Invalid credentials. Use the default demo password shown below.');
    }
  };

  return (
    <div className="min-h-screen bg-[#050505] text-zinc-200 flex flex-col relative overflow-hidden">
      <div className="absolute top-[-15%] left-[-10%] w-[45%] h-[45%] rounded-full bg-brand-600/10 blur-[120px] pointer-events-none" />
      <div className="absolute bottom-[-10%] right-[-5%] w-[35%] h-[35%] rounded-full bg-red-900/10 blur-[100px] pointer-events-none" />

      <header className="relative z-10 flex items-center justify-between px-6 py-5 max-w-lg mx-auto w-full">
        <button
          type="button"
          onClick={() => setView('landing')}
          className="flex items-center gap-2 text-sm font-bold text-zinc-500 hover:text-zinc-200 transition-colors cursor-pointer"
        >
          <ArrowLeft className="w-4 h-4" />
          Back
        </button>
        <div className="flex items-center gap-2">
          <BrandLogo size="sm" />
          <span className="font-bold text-white text-sm">CoworkingOS</span>
        </div>
        <div className="w-16" aria-hidden />
      </header>

      <main className="relative z-10 flex-1 flex flex-col items-center px-6 pb-12 pt-4">
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          className="w-full max-w-lg"
        >
          <div className="text-center mb-8">
            <p className="text-[10px] font-black uppercase tracking-[0.2em] text-brand-500 mb-3">
              Operator portal
            </p>
            <h1 className="text-3xl font-display font-extrabold text-white tracking-tight">
              Sign in
            </h1>
            <p className="mt-2 text-sm text-zinc-500 font-medium">
              Default demo credentials are pre-filled — choose your role below, then sign in.
            </p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-1.5">
              <label htmlFor="signin-email" className="text-[10px] font-bold uppercase tracking-wider text-zinc-500">
                Work email
              </label>
              <div className="relative">
                <Mail className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-zinc-600" />
                <input
                  id="signin-email"
                  type="email"
                  autoComplete="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full bg-zinc-950 border border-zinc-805 rounded-xl py-3 pl-10 pr-4 text-sm text-zinc-100 focus:outline-none focus:border-brand-500/50 focus:ring-1 focus:ring-brand-500/30"
                />
              </div>
            </div>

            <div className="space-y-1.5">
              <label htmlFor="signin-password" className="text-[10px] font-bold uppercase tracking-wider text-zinc-500">
                Password
              </label>
              <div className="relative">
                <Lock className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-zinc-600" />
                <input
                  id="signin-password"
                  type="password"
                  autoComplete="current-password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full bg-zinc-950 border border-zinc-805 rounded-xl py-3 pl-10 pr-4 text-sm text-zinc-100 focus:outline-none focus:border-brand-500/50 focus:ring-1 focus:ring-brand-500/30"
                />
              </div>
            </div>

            {error && (
              <p className="text-xs font-semibold text-brand-400 bg-brand-500/10 border border-brand-500/20 rounded-lg px-3 py-2">
                {error}
              </p>
            )}

            <button
              type="submit"
              className="w-full flex items-center justify-center gap-2 py-3.5 rounded-xl bg-brand-600 hover:bg-brand-500 text-white font-bold text-sm transition-all shadow-[0_12px_30px_-8px_rgba(255,10,22,0.45)] cursor-pointer"
            >
              <LogIn className="w-4 h-4" />
              Sign in
            </button>

            <p className="text-[10px] text-center text-zinc-600 font-mono">
              Demo: {DEFAULT_EMAIL} · {DEFAULT_PASSWORD}
            </p>
          </form>

          <div className="mt-10 pt-8 border-t border-zinc-850">
            <p className="text-[10px] font-black uppercase tracking-[0.15em] text-zinc-550 mb-4 text-center">
              Choose your role
            </p>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              {ROLE_OPTIONS.map((opt) => {
                const Icon = ROLE_ICONS[opt.id];
                const isSelected = selectedRole === opt.id;
                return (
                  <button
                    key={opt.id}
                    type="button"
                    onClick={() => setSelectedRole(opt.id)}
                    className={cn(
                      'text-left p-4 rounded-2xl border transition-all cursor-pointer flex flex-col gap-2',
                      isSelected
                        ? 'bg-brand-500/10 border-brand-500/40 shadow-[0_0_24px_rgba(255,10,22,0.1)]'
                        : 'bg-zinc-950/80 border-zinc-805 hover:border-zinc-700'
                    )}
                  >
                    <div
                      className={cn(
                        'w-9 h-9 rounded-lg flex items-center justify-center border',
                        isSelected
                          ? 'bg-brand-500/20 border-brand-500/30 text-brand-400'
                          : 'bg-zinc-900 border-zinc-800 text-zinc-500'
                      )}
                    >
                      <Icon className="w-4 h-4" />
                    </div>
                    <span className="text-xs font-black text-white">{opt.title}</span>
                    {isSelected && (
                      <span className="text-[8px] font-black uppercase text-brand-400 flex items-center gap-1">
                        <Check className="w-2.5 h-2.5" /> Active
                      </span>
                    )}
                  </button>
                );
              })}
            </div>

            <div className="mt-4 rounded-xl border border-zinc-805 bg-zinc-950/50 p-4">
              <p className="text-[9px] font-black uppercase tracking-widest text-zinc-550 mb-2">
                Modules for {selectedRole}
              </p>
              <div className="flex flex-wrap gap-1.5">
                {previewModules.map((label) => (
                  <span
                    key={label}
                    className="text-[9px] font-bold px-2 py-0.5 rounded-md bg-zinc-900 border border-zinc-805 text-zinc-400"
                  >
                    {label}
                  </span>
                ))}
                {selectedRole === 'Super Admin' && (
                  <span className="text-[9px] font-bold px-2 py-0.5 rounded-md bg-brand-500/10 border border-brand-500/25 text-brand-400">
                    Settings
                  </span>
                )}
              </div>
            </div>
          </div>
        </motion.div>
      </main>
    </div>
  );
}
