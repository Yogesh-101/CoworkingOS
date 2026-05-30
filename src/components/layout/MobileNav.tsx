import { useStore } from '@/store';
import { cn } from '@/lib/utils';
import { isTabAllowed } from '@/lib/rbac';
import {
  LayoutDashboard,
  Map,
  Users,
  UserCheck,
  Brain,
  MoreHorizontal,
} from 'lucide-react';
import { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';

const PRIMARY_TABS = [
  { id: 'dashboard', label: 'Home', icon: LayoutDashboard },
  { id: 'floor-map', label: 'Floor', icon: Map },
  { id: 'crm', label: 'CRM', icon: Users },
  { id: 'visitors', label: 'Guests', icon: UserCheck },
  { id: 'intelligence', label: 'AI', icon: Brain },
] as const;

const MORE_TABS = [
  { id: 'helpdesk', label: 'Helpdesk' },
  { id: 'billing', label: 'Billing' },
  { id: 'team-chat', label: 'Team Chat' },
  { id: 'cms', label: 'CMS' },
  { id: 'erp', label: 'ERP' },
  { id: 'settings', label: 'Settings' },
] as const;

export function MobileNav() {
  const { activeTab, setActiveTab, role } = useStore();
  const [moreOpen, setMoreOpen] = useState(false);

  const canAccess = (tabId: string) => isTabAllowed(role, tabId);

  const navigate = (tabId: string) => {
    if (!canAccess(tabId)) return;
    setActiveTab(tabId as Parameters<typeof setActiveTab>[0]);
    setMoreOpen(false);
  };

  const isMoreActive = MORE_TABS.some((t) => t.id === activeTab);

  return (
    <>
      <AnimatePresence>
        {moreOpen && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="md:hidden fixed inset-0 bg-black/60 z-40"
              onClick={() => setMoreOpen(false)}
            />
            <motion.div
              initial={{ y: '100%' }}
              animate={{ y: 0 }}
              exit={{ y: '100%' }}
              transition={{ type: 'spring', damping: 28, stiffness: 320 }}
              className="md:hidden fixed bottom-[4.5rem] left-4 right-4 z-50 bg-zinc-950 border border-zinc-805 rounded-2xl p-3 shadow-2xl"
            >
              <p className="text-[10px] font-black uppercase tracking-widest text-zinc-600 px-2 mb-2">
                More modules
              </p>
              <div className="grid grid-cols-2 gap-2">
                {MORE_TABS.filter((t) => canAccess(t.id)).map((tab) => (
                  <button
                    key={tab.id}
                    type="button"
                    onClick={() => navigate(tab.id)}
                    className={cn(
                      'px-4 py-3 rounded-xl text-xs font-bold text-left cursor-pointer transition-colors',
                      activeTab === tab.id
                        ? 'bg-brand-500/15 text-brand-400 border border-brand-500/25'
                        : 'bg-zinc-900 text-zinc-400 border border-zinc-805 hover:text-zinc-200'
                    )}
                  >
                    {tab.label}
                  </button>
                ))}
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>

      <nav className="md:hidden fixed bottom-0 left-0 right-0 z-50 bg-zinc-950/95 backdrop-blur-xl border-t border-zinc-805 safe-area-pb">
        <div className="flex items-stretch justify-around px-1 pt-1 pb-2">
          {PRIMARY_TABS.map((tab) => {
            const allowed = canAccess(tab.id);
            const active = activeTab === tab.id;
            return (
              <button
                key={tab.id}
                type="button"
                disabled={!allowed}
                onClick={() => navigate(tab.id)}
                className={cn(
                  'flex flex-col items-center justify-center gap-0.5 flex-1 py-2 rounded-xl min-w-0 cursor-pointer transition-colors',
                  !allowed && 'opacity-40 cursor-not-allowed',
                  active ? 'text-brand-400' : 'text-zinc-500'
                )}
              >
                <tab.icon className={cn('w-5 h-5', active && 'text-brand-500')} />
                <span className="text-[9px] font-bold truncate max-w-full px-1">{tab.label}</span>
              </button>
            );
          })}
          <button
            type="button"
            onClick={() => setMoreOpen((o) => !o)}
            className={cn(
              'flex flex-col items-center justify-center gap-0.5 flex-1 py-2 rounded-xl cursor-pointer transition-colors',
              isMoreActive || moreOpen ? 'text-brand-400' : 'text-zinc-500'
            )}
          >
            <MoreHorizontal className={cn('w-5 h-5', (isMoreActive || moreOpen) && 'text-brand-500')} />
            <span className="text-[9px] font-bold">More</span>
          </button>
        </div>
      </nav>
    </>
  );
}
