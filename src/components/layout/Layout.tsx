import { ReactNode, useEffect, useRef } from 'react';
import { Sidebar } from './Sidebar';
import { Header } from './Header';
import { MobileNav } from './MobileNav';
import { motion } from 'motion/react';
import { useStore } from '@/store';
import { cn } from '@/lib/utils';

export function Layout({ children }: { children: ReactNode }) {
  const activeTab = useStore(state => state.activeTab);
  const mainRef = useRef<HTMLElement>(null);
  const isFullHeightModule = activeTab === 'team-chat' || activeTab === 'cms';

  useEffect(() => {
    mainRef.current?.scrollTo({ top: 0 });
  }, [activeTab]);

  return (
    <div className="flex h-screen w-full bg-[#050505] overflow-hidden relative text-zinc-200">
      {/* Dark Stranger Things Abstract Background Elements */}
      <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] rounded-full bg-brand-600/10 blur-[120px] pointer-events-none" />
      <div className="absolute bottom-[-10%] right-[-10%] w-[30%] h-[30%] rounded-full bg-red-900/10 blur-[100px] pointer-events-none" />
      <div className="absolute top-[40%] right-[-10%] w-[20%] h-[30%] rounded-full bg-brand-500/5 blur-[100px] pointer-events-none" />
      
      <div className="hidden md:flex shrink-0">
        <Sidebar />
      </div>
      <div className="flex-1 flex flex-col min-w-0 min-h-0 relative z-10">
        <Header />
        <main
          ref={mainRef}
          className={cn(
            'flex-1 min-h-0 p-4 md:p-6 lg:p-8 pb-20 md:pb-6 lg:pb-8',
            isFullHeightModule ? 'overflow-hidden' : 'overflow-y-auto'
          )}
        >
          <div className="max-w-7xl mx-auto h-full min-h-0 flex flex-col">
            <motion.div
              key={activeTab}
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 0.15, ease: 'easeOut' }}
              className="h-full min-h-0 flex flex-col"
            >
              {children}
            </motion.div>
          </div>
        </main>
      </div>
      <MobileNav />
    </div>
  );
}
