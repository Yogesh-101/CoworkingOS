import { ReactNode } from 'react';
import { Sidebar } from './Sidebar';
import { Header } from './Header';
import { motion, AnimatePresence } from 'motion/react';
import { useStore } from '@/store';

export function Layout({ children }: { children: ReactNode }) {
  const activeTab = useStore(state => state.activeTab);
  
  return (
    <div className="flex h-screen w-full bg-[#050505] overflow-hidden relative text-zinc-200">
      {/* Dark Stranger Things Abstract Background Elements */}
      <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] rounded-full bg-brand-600/10 blur-[120px] pointer-events-none" />
      <div className="absolute bottom-[-10%] right-[-10%] w-[30%] h-[30%] rounded-full bg-red-900/10 blur-[100px] pointer-events-none" />
      <div className="absolute top-[40%] right-[-10%] w-[20%] h-[30%] rounded-full bg-brand-500/5 blur-[100px] pointer-events-none" />
      
      <Sidebar />
      <div className="flex-1 flex flex-col min-w-0 relative z-10">
        <Header />
        <main className="flex-1 overflow-y-auto p-6 lg:p-8">
          <div className="max-w-7xl mx-auto h-full">
            <AnimatePresence mode="wait">
               <motion.div
                 key={activeTab}
                 initial={{ opacity: 0, y: 10 }}
                 animate={{ opacity: 1, y: 0 }}
                 exit={{ opacity: 0, y: -10 }}
                 transition={{ duration: 0.2, ease: "easeOut" }}
                 className="h-full"
               >
                 {children}
               </motion.div>
            </AnimatePresence>
          </div>
        </main>
      </div>
    </div>
  );
}
