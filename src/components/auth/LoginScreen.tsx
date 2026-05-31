import { useState } from 'react';
import { motion } from 'motion/react';
import { ArrowLeft, LogIn, Loader2, Database } from 'lucide-react';
import { useStore } from '@/store';
import { BrandLogo } from '@/components/ui/BrandLogo';

export function LoginScreen() {
  const { loginWithCredentials, setView, apiError } = useStore();
  const [email, setEmail] = useState('admin@example.com');
  const [password, setPassword] = useState('Admin@123');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    try {
      await loginWithCredentials(email.trim(), password);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Login failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#050505] text-zinc-200 flex flex-col relative overflow-hidden">
      <div className="absolute top-[-15%] left-[-10%] w-[45%] h-[45%] rounded-full bg-brand-600/10 blur-[120px] pointer-events-none" />

      <header className="relative z-10 flex items-center justify-between px-6 py-5 max-w-md mx-auto w-full">
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

      <main className="relative z-10 flex-1 flex flex-col items-center justify-center px-6 pb-12">
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          className="w-full max-w-md bg-zinc-900 border border-zinc-805 rounded-3xl p-8 shadow-2xl"
        >
          <div className="flex items-center gap-3 mb-6">
            <div className="p-2.5 rounded-xl bg-brand-500/15">
              <Database className="w-5 h-5 text-brand-500" />
            </div>
            <div>
              <h1 className="text-xl font-display font-bold text-white">Sign in</h1>
              <p className="text-xs text-zinc-500">SereniBase backend · production workspace</p>
            </div>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="text-[10px] font-bold uppercase tracking-wider text-zinc-500 block mb-1.5">
                Email
              </label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                autoComplete="email"
                className="w-full bg-zinc-950 border border-zinc-805 rounded-xl px-4 py-2.5 text-sm text-zinc-100 focus:outline-none focus:ring-1 focus:ring-brand-500/40"
              />
            </div>
            <div>
              <label className="text-[10px] font-bold uppercase tracking-wider text-zinc-500 block mb-1.5">
                Password
              </label>
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                autoComplete="current-password"
                className="w-full bg-zinc-950 border border-zinc-805 rounded-xl px-4 py-2.5 text-sm text-zinc-100 focus:outline-none focus:ring-1 focus:ring-brand-500/40"
              />
            </div>

            {(error || apiError) && (
              <p className="text-xs text-brand-400 font-semibold bg-brand-500/10 border border-brand-500/20 rounded-lg px-3 py-2">
                {error || apiError}
              </p>
            )}

            <button
              type="submit"
              disabled={loading}
              className="w-full flex items-center justify-center gap-2 py-3 rounded-xl bg-brand-500 hover:bg-brand-600 text-white font-bold text-sm transition-colors cursor-pointer disabled:opacity-60"
            >
              {loading ? (
                <Loader2 className="w-4 h-4 animate-spin" />
              ) : (
                <LogIn className="w-4 h-4" />
              )}
              {loading ? 'Connecting…' : 'Enter workspace'}
            </button>
          </form>

          <p className="mt-6 text-[10px] text-zinc-600 text-center leading-relaxed">
            Default owner: admin@example.com / Admin@123 (from SereniBase .env). Data persists in
            PostgreSQL via SereniBase.
          </p>
        </motion.div>
      </main>
    </div>
  );
}
