import { useState } from 'react';
import { motion } from 'motion/react';
import { ArrowRight, ArrowLeft, ShieldCheck, Users, UserCheck, Check } from 'lucide-react';
import { useStore } from '@/store';
import { cn } from '@/lib/utils';
import {
  ROLE_OPTIONS,
  getModuleLabelsForRole,
  type UserRole,
} from '@/lib/rbac';
import { BrandLogo } from '@/components/ui/BrandLogo';

const ROLE_ICONS: Record<UserRole, typeof ShieldCheck> = {
  'Super Admin': ShieldCheck,
  'Community Host': Users,
  Receptionist: UserCheck,
};

export function RoleSelectScreen() {
  const { enterAppWithRole, setView } = useStore();
  const [selected, setSelected] = useState<UserRole | null>(null);

  const previewModules = selected ? getModuleLabelsForRole(selected) : [];

  return (
    <div className="min-h-screen bg-[#050505] text-zinc-200 flex flex-col relative overflow-hidden">
      <div className="absolute top-[-15%] left-[-10%] w-[45%] h-[45%] rounded-full bg-brand-600/10 blur-[120px] pointer-events-none" />
      <div className="absolute bottom-[-10%] right-[-5%] w-[35%] h-[35%] rounded-full bg-red-900/10 blur-[100px] pointer-events-none" />

      <header className="relative z-10 flex items-center justify-between px-6 py-5 max-w-4xl mx-auto w-full">
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
          className="text-center max-w-xl mb-10"
        >
          <p className="text-[10px] font-black uppercase tracking-[0.2em] text-brand-500 mb-3">
            Secure workspace access
          </p>
          <h1 className="text-3xl sm:text-4xl font-display font-extrabold text-white tracking-tight">
            Choose your operator role
          </h1>
          <p className="mt-3 text-sm text-zinc-500 font-medium leading-relaxed">
            Your session will only show ERP modules permitted for that role. Pick the profile that
            matches how you work on-site today.
          </p>
        </motion.div>

        <div className="w-full max-w-3xl grid grid-cols-1 md:grid-cols-3 gap-4">
          {ROLE_OPTIONS.map((opt, i) => {
            const Icon = ROLE_ICONS[opt.id];
            const isSelected = selected === opt.id;
            return (
              <motion.button
                key={opt.id}
                type="button"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.06 }}
                onClick={() => setSelected(opt.id)}
                className={cn(
                  'text-left p-5 rounded-3xl border transition-all cursor-pointer flex flex-col gap-3',
                  isSelected
                    ? 'bg-brand-500/10 border-brand-500/40 shadow-[0_0_30px_rgba(255,10,22,0.12)]'
                    : 'bg-zinc-950/80 border-zinc-805 hover:border-zinc-700 hover:bg-zinc-900/60'
                )}
              >
                <div
                  className={cn(
                    'w-10 h-10 rounded-xl flex items-center justify-center border',
                    isSelected
                      ? 'bg-brand-500/20 border-brand-500/30 text-brand-400'
                      : 'bg-zinc-900 border-zinc-800 text-zinc-500'
                  )}
                >
                  <Icon className="w-5 h-5" />
                </div>
                <div>
                  <span className="text-sm font-black text-white block">{opt.title}</span>
                  <span className="text-[11px] text-zinc-500 font-medium mt-1 block leading-snug">
                    {opt.subtitle}
                  </span>
                </div>
                {isSelected && (
                  <span className="text-[9px] font-black uppercase text-brand-400 flex items-center gap-1">
                    <Check className="w-3 h-3" /> Selected
                  </span>
                )}
              </motion.button>
            );
          })}
        </div>

        {selected && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            className="w-full max-w-3xl mt-8 overflow-hidden"
          >
            <div className="rounded-2xl border border-zinc-805 bg-zinc-950/60 p-5">
              <p className="text-[9px] font-black uppercase tracking-widest text-zinc-550 mb-3">
                Modules you can access as {selected}
              </p>
              <div className="flex flex-wrap gap-2">
                {previewModules.map((label) => (
                  <span
                    key={label}
                    className="text-[10px] font-bold px-2.5 py-1 rounded-lg bg-zinc-900 border border-zinc-805 text-zinc-300"
                  >
                    {label}
                  </span>
                ))}
                {selected === 'Super Admin' && (
                  <span className="text-[10px] font-bold px-2.5 py-1 rounded-lg bg-brand-500/10 border border-brand-500/25 text-brand-400">
                    Settings
                  </span>
                )}
              </div>
            </div>
          </motion.div>
        )}

        <motion.button
          type="button"
          disabled={!selected}
          onClick={() => selected && enterAppWithRole(selected)}
          className={cn(
            'mt-10 group px-8 py-4 rounded-full font-bold text-base flex items-center gap-2 transition-all',
            selected
              ? 'bg-brand-600 text-white hover:bg-brand-500 hover:scale-[1.02] shadow-[0_20px_40px_-10px_rgba(255,10,22,0.45)] cursor-pointer'
              : 'bg-zinc-900 text-zinc-600 cursor-not-allowed border border-zinc-805'
          )}
        >
          Continue to platform
          <ArrowRight className="w-5 h-5 group-hover:translate-x-0.5 transition-transform" />
        </motion.button>
      </main>
    </div>
  );
}
