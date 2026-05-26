import React, { useState } from 'react';
import { useStore } from '@/store';
import { motion, AnimatePresence } from 'motion/react';
import { Users, UserPlus, Search, CheckCircle, Clock, Trash2, Smartphone, Printer, Building, UserCheck, Check, ClipboardList } from 'lucide-react';
import { cn } from '@/lib/utils';

export function Visitors() {
  const { visitors, addVisitor, checkOutVisitor, branches, activeBranchId } = useStore();
  const [searchTerm, setSearchTerm] = useState('');
  const [isNewVisitorOpen, setIsNewVisitorOpen] = useState(false);
  
  // Form state
  const [visitorName, setVisitorName] = useState('');
  const [company, setCompany] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [host, setHost] = useState('');
  
  // Selected visitor for Badge Preview
  const [selectedVisitorId, setSelectedVisitorId] = useState<string | null>(visitors[0]?.id || null);

  // Print & Notification Simulator state
  const [isPrinting, setIsPrinting] = useState(false);
  const [printProgress, setPrintProgress] = useState(0);
  const [printSuccess, setPrintSuccess] = useState(false);
  const [printStatusText, setPrintStatusText] = useState('Idle');
  
  const [isNotifying, setIsNotifying] = useState(false);
  const [notificationSuccess, setNotificationSuccess] = useState(false);

  const handlePrintBadge = () => {
    if (isPrinting) return;
    setIsPrinting(true);
    setPrintSuccess(false);
    setPrintProgress(0);
    setPrintStatusText('Queueing print job...');

    // Progress simulation steps
    const steps = [
      { progress: 15, status: 'Connected to Zebra LPT-1...' },
      { progress: 38, status: 'Drafting NFC layout blocks...' },
      { progress: 54, status: 'Encrypting secure access keys...' },
      { progress: 75, status: 'Applying pigment transfer layer...' },
      { progress: 91, status: 'Encoding dual magnetic strip track...' },
      { progress: 100, status: 'Finished! Card ejected safely.' }
    ];

    let currentStepIdx = 0;
    
    const interval = setInterval(() => {
      if (currentStepIdx < steps.length) {
        setPrintProgress(steps[currentStepIdx].progress);
        setPrintStatusText(steps[currentStepIdx].status);
        currentStepIdx++;
      } else {
        clearInterval(interval);
        setIsPrinting(false);
        setPrintSuccess(true);
      }
    }, 400);
  };

  const handleNotifyHost = () => {
    if (isNotifying) return;
    setIsNotifying(true);
    setNotificationSuccess(false);

    setTimeout(() => {
      setIsNotifying(false);
      setNotificationSuccess(true);
    }, 1200);
  };
  
  const currentBranch = branches.find(b => b.id === activeBranchId) || branches[0];
  
  // Filter visitors by selected branch and search query
  const filteredVisitors = visitors.filter(v => {
    const matchesBranch = v.branchId === activeBranchId;
    const matchesSearch = v.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                          v.company.toLowerCase().includes(searchTerm.toLowerCase()) ||
                          v.host.toLowerCase().includes(searchTerm.toLowerCase());
    return matchesBranch && matchesSearch;
  });

  const selectedVisitor = visitors.find(v => v.id === selectedVisitorId);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!visitorName || !host) return;

    addVisitor({
      name: visitorName,
      company: company || 'Independent visitor',
      email: email || 'visitor@guest.co',
      phone: phone || '+1 555-0100',
      host,
      branchId: activeBranchId
    });

    // Reset Form
    setVisitorName('');
    setCompany('');
    setEmail('');
    setPhone('');
    setHost('');
    setIsNewVisitorOpen(false);
  };

  return (
    <div className="flex flex-col h-full space-y-6">
      {/* Header section */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 shrink-0">
        <div>
          <h1 className="text-3xl font-display font-bold text-zinc-100 tracking-tight">Smart Visitor Log</h1>
          <p className="text-zinc-500 text-sm mt-1">
            Real-time lobby check-in, badges, and guest tracking for <span className="text-brand-400 font-bold">{currentBranch.name}</span>
          </p>
        </div>

        <div className="flex items-center gap-3">
          <div className="relative w-full sm:w-64">
            <Search className="w-4 h-4 text-zinc-500 absolute left-3.5 top-1/2 -translate-y-1/2" />
            <input 
              type="text" 
              placeholder="Search guests, hosts..." 
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full bg-zinc-900 border border-zinc-805 rounded-full py-2 pr-4 pl-10 text-xs font-semibold text-zinc-100 placeholder:text-zinc-550 focus:outline-none focus:ring-2 focus:ring-brand-500/20 focus:border-brand-500 transition-all shadow-sm"
            />
          </div>

          <button 
            onClick={() => setIsNewVisitorOpen(true)}
            className="flex items-center gap-2 bg-brand-500 hover:bg-brand-600 shadow-md hover:shadow-brand-500/10 text-white px-5 py-2.5 rounded-full font-bold text-xs leading-none shrink-0 transition-all active:scale-95 cursor-pointer"
          >
            <UserPlus className="w-4 h-4" />
            Check-In Guest
          </button>
        </div>
      </div>

      {/* Stats row */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {[
          { label: 'Active Guests', value: filteredVisitors.filter(v => v.status === 'checked-in').length, icon: Users, color: 'text-emerald-400 bg-emerald-500/10 border-emerald-500/20' },
          { label: 'Total Visits Today', value: filteredVisitors.length, icon: ClipboardList, color: 'text-brand-400 bg-brand-500/10 border-brand-500/20' },
          { label: 'Scheduled Tours', value: 2, icon: Clock, color: 'text-blue-400 bg-blue-500/10 border-blue-500/20' },
          { label: 'Lobby Status', value: 'Gate Online', icon: UserCheck, color: 'text-purple-400 bg-purple-500/10 border-purple-500/20' },
        ].map((stat, i) => (
          <div key={i} className="bg-zinc-900 border border-zinc-805 p-4 rounded-2xl flex items-center justify-between">
            <div className="space-y-1">
              <span className="text-[10px] font-bold text-zinc-500 uppercase tracking-wider">{stat.label}</span>
              <p className="text-xl font-bold text-zinc-100 font-mono">{stat.value}</p>
            </div>
            <div className={cn("p-2.5 rounded-xl border", stat.color)}>
              <stat.icon className="w-4 h-4" />
            </div>
          </div>
        ))}
      </div>

      {/* Main Grid: List left, Interactive Active Badge right */}
      <div className="grid grid-cols-1 xl:grid-cols-3 gap-6 items-start flex-1 min-h-0">
        
        {/* Visitor Logs List Table */}
        <div className="xl:col-span-2 bg-zinc-900 border border-zinc-805 rounded-3xl overflow-hidden flex flex-col h-full shadow-lg">
          <div className="p-5 border-b border-zinc-805/50 bg-zinc-900/60 flex justify-between items-center">
            <h3 className="font-bold text-zinc-250 text-sm">Lobby Guest Stream</h3>
            <span className="text-[11px] font-mono font-semibold text-zinc-500">{filteredVisitors.length} entries</span>
          </div>

          <div className="overflow-x-auto flex-1 max-h-[500px]">
            {filteredVisitors.length === 0 ? (
              <div className="flex flex-col items-center justify-center p-20 text-center text-zinc-650 h-full">
                <Users className="w-10 h-10 mb-3 opacity-30" />
                <h4 className="font-semibold text-sm text-zinc-400">No visitors found</h4>
                <p className="text-xs max-w-xs mt-1">Zero visitor checked-in logs recorded on this branch coordinate today.</p>
              </div>
            ) : (
              <table className="w-full text-left border-collapse table-auto">
                <thead className="bg-zinc-950/40 text-[9px] font-bold text-zinc-450 uppercase tracking-widest border-b border-zinc-805/40">
                  <tr>
                    <th className="py-4.5 px-6">Guest Identification</th>
                    <th className="py-4.5 px-4">Visitor Corp</th>
                    <th className="py-4.5 px-4">Workspace Host</th>
                    <th className="py-4.5 px-4">Time Check-In</th>
                    <th className="py-4.5 px-4 text-center">Status / Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-zinc-850/40">
                  {filteredVisitors.map((v) => {
                    const isSelected = v.id === selectedVisitorId;
                    return (
                      <tr 
                        key={v.id} 
                        onClick={() => setSelectedVisitorId(v.id)}
                        className={cn(
                          "group hover:bg-zinc-850/40 transition-colors cursor-pointer text-xs",
                          isSelected ? "bg-zinc-850/60" : ""
                        )}
                      >
                        <td className="py-4 px-6 font-semibold">
                          <div className="flex items-center gap-3">
                            <div className="w-7 h-7 rounded-lg bg-zinc-800 flex items-center justify-center text-[10px] font-mono text-zinc-400 border border-zinc-705 shrink-0">
                              {v.name.charAt(0)}
                            </div>
                            <div className="flex flex-col min-w-0">
                              <span className="text-zinc-200 font-bold group-hover:text-white truncate">{v.name}</span>
                              <span className="text-[10px] text-zinc-500 font-medium truncate mt-0.5">{v.phone}</span>
                            </div>
                          </div>
                        </td>
                        <td className="py-4 px-4 font-semibold text-zinc-400 capitalize">
                          {v.company}
                        </td>
                        <td className="py-4 px-4 font-semibold text-zinc-400">
                          <div className="flex items-center gap-1.5">
                            <span className="w-1.5 h-1.5 rounded-full bg-brand-400" />
                            {v.host}
                          </div>
                        </td>
                        <td className="py-4 px-4 font-mono font-semibold text-zinc-500">
                          <div className="flex flex-col">
                            <span>{v.checkInTime}</span>
                            {v.checkOutTime && <span className="text-[10px] text-rose-500 font-semibold mt-0.5">Out: {v.checkOutTime}</span>}
                          </div>
                        </td>
                        <td className="py-4 px-4 text-center" onClick={(e) => e.stopPropagation()}>
                          {v.status === 'checked-in' ? (
                            <button
                              onClick={() => checkOutVisitor(v.id)}
                              className="px-3 py-1.5 bg-rose-500/10 hover:bg-rose-500 hover:text-white border border-rose-500/20 text-rose-400 font-extrabold text-[10px] rounded-lg cursor-pointer transition-all uppercase leading-none"
                            >
                              Check Out
                            </button>
                          ) : (
                            <span className="inline-flex items-center gap-1.5 px-2.5 py-1 bg-zinc-800/60 border border-zinc-805 text-zinc-500 font-bold text-[10px] rounded-lg capitalize">
                              <Check className="w-3 h-3 text-zinc-500" /> Checked Out
                            </span>
                          )}
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            )}
          </div>
        </div>

        {/* Guest Smart Pass Badge Container */}
        <div className="bg-zinc-900 border border-zinc-805 rounded-3xl p-6 shadow-lg space-y-6 flex flex-col h-full justify-between">
          <div className="border-b border-zinc-805/50 pb-4">
            <h3 className="font-bold text-zinc-250 text-sm">Passcard Badge Terminal</h3>
            <p className="text-xs text-zinc-400 mt-0.5">Pre-visualize guest entrance credential keys</p>
          </div>

          {selectedVisitor ? (
            <div className="space-y-6">
              {/* Actual Visual Gate Key Badge */}
              <div className="relative overflow-hidden bg-gradient-to-b from-zinc-950 to-zinc-900 border-2 border-brand-500/40 rounded-2xl p-6 shadow-2xl flex flex-col items-center text-center space-y-4">
                <div className="absolute top-0 inset-x-0 h-1 bg-brand-500 shadow-lg shadow-brand-500/40" />
                
                {/* CoworkingOS branding */}
                <div className="flex items-center gap-1.5 pb-2 border-b border-zinc-850 w-full justify-center">
                  <div className="w-4.5 h-4.5 bg-brand-500 rounded-full shrink-0" />
                  <span className="text-[11px] font-bold uppercase tracking-wider text-white">CO-WORKING OS</span>
                </div>

                <div className="w-20 h-20 rounded-full border border-brand-500/20 flex items-center justify-center bg-zinc-900 p-1">
                  <img 
                    src={`https://api.qrserver.com/v1/create-qr-code/?size=150x150&data=${encodeURIComponent(JSON.stringify({id:selectedVisitor.id, name:selectedVisitor.name, host:selectedVisitor.host, checkpoint:'lobby-gate-1'}))}&color=ff0a16&bgcolor=18181b`} 
                    alt="Visitor QR Gate Code" 
                    className="w-full h-full object-contain filter grayscale select-none"
                    referrerPolicy="no-referrer"
                  />
                </div>

                <div className="space-y-1">
                  <span className={cn(
                    "text-[8px] font-extrabold px-2 py-0.5 rounded border uppercase",
                    selectedVisitor.status === 'checked-in' ? "bg-emerald-500/10 border-emerald-500/20 text-emerald-400" : "bg-zinc-800 border-zinc-705 text-zinc-500"
                  )}>
                    {selectedVisitor.status === 'checked-in' ? 'ACTIVE VISITOR' : 'VISITED PAST'}
                  </span>
                  <h4 className="text-base font-extrabold text-white pt-1">{selectedVisitor.name}</h4>
                  <p className="text-[11px] text-zinc-400 capitalize font-medium">{selectedVisitor.company}</p>
                </div>

                {/* Sub Metadata log info */}
                <div className="grid grid-cols-2 gap-4 w-full bg-zinc-950/60 rounded-xl p-3 border border-zinc-850/60 leading-none text-left">
                  <div className="space-y-1 border-r border-zinc-850 pr-2">
                    <span className="text-[8px] text-zinc-500 font-bold uppercase">HOST CLERK</span>
                    <p className="text-[10px] text-zinc-350 font-bold truncate capitalize">{selectedVisitor.host}</p>
                  </div>
                  <div className="space-y-1 pl-2">
                    <span className="text-[8px] text-zinc-500 font-bold uppercase">CHECK-IN</span>
                    <p className="text-[10px] text-zinc-350 font-bold font-mono">{selectedVisitor.checkInTime}</p>
                  </div>
                </div>

                <span className="text-[9px] font-mono text-zinc-650 tracking-widest">{selectedVisitor.id.toUpperCase()}</span>
              </div>

              {/* Badges operations */}
              <div className="space-y-3">
                <button
                  id="print-visitor-badge-btn"
                  onClick={handlePrintBadge}
                  disabled={isPrinting}
                  className={cn(
                    "w-full flex flex-col items-center justify-center gap-1.5 py-3 rounded-2xl text-xs font-bold shadow-lg transition-all border outline-none",
                    isPrinting 
                      ? "bg-brand-950/40 border-brand-500/50 text-brand-300 cursor-not-allowed" 
                      : printSuccess 
                        ? "bg-emerald-950/40 border-emerald-500/50 text-emerald-300 cursor-pointer"
                        : "bg-zinc-800 hover:bg-zinc-750 text-zinc-200 border-zinc-705/80 hover:text-white cursor-pointer active:scale-98"
                  )}
                >
                  <div className="flex items-center gap-2 justify-center">
                    {isPrinting ? (
                      <div className="w-3.5 h-3.5 border-2 border-brand-400 border-t-transparent rounded-full animate-spin" />
                    ) : printSuccess ? (
                      <CheckCircle className="w-4 h-4 text-emerald-400 animate-bounce" />
                    ) : (
                      <Printer className="w-4 h-4 text-zinc-400 group-hover:text-zinc-200 transition-colors" />
                    )}
                    <span>
                      {isPrinting 
                        ? `Printing Smart Card (${printProgress}%)` 
                        : printSuccess 
                          ? "Badge Encoded & Ejected" 
                          : "Print RFID Guest Pass Card"}
                    </span>
                  </div>
                  {isPrinting && (
                    <div className="w-11/12 bg-zinc-950/60 border border-zinc-850 h-1 rounded-full overflow-hidden mt-2 relative">
                      <div 
                        className="bg-brand-500 h-full rounded-full transition-all duration-300" 
                        style={{ width: `${printProgress}%` }}
                      />
                    </div>
                  )}
                </button>

                <div 
                  id="host-sms-notification-status"
                  onClick={handleNotifyHost}
                  className={cn(
                    "flex items-center gap-3 justify-center rounded-2xl p-3 border text-xs font-semibold leading-relaxed transition-all cursor-pointer shadow-md select-none",
                    isNotifying 
                      ? "bg-brand-950/20 border-brand-500/30 text-brand-350" 
                      : notificationSuccess 
                        ? "bg-emerald-950/15 border-emerald-500/30 text-emerald-350" 
                        : "bg-zinc-950/50 border-zinc-850 hover:bg-zinc-900 hover:border-zinc-750 text-zinc-400 hover:text-zinc-250"
                  )}
                  title="Click to trigger manual alert"
                >
                  <div className="relative shrink-0 flex items-center justify-center">
                    {isNotifying ? (
                      <div className="w-4 h-4 border-2 border-brand-400 border-t-transparent rounded-full animate-spin" />
                    ) : notificationSuccess ? (
                      <Check className="w-4 h-4 text-emerald-400 font-extrabold" />
                    ) : (
                      <Smartphone className={cn("w-4 h-4 text-zinc-500", selectedVisitor.status === 'checked-in' ? "animate-pulse text-brand-400" : "")} />
                    )}
                  </div>
                  <div className="text-left leading-normal flex-1">
                    <p className="font-bold text-[11px] uppercase tracking-wide">
                      {isNotifying 
                        ? "Broadcasting Notification..." 
                        : notificationSuccess 
                          ? "Host Alert Delivered" 
                          : "Host Smart Check-In Alert"}
                    </p>
                    <p className="text-[10px] text-zinc-500 font-medium">
                      {isNotifying 
                        ? `Despatching Kisi & SMS keys to ${selectedVisitor.host}...` 
                        : printStatusText !== 'Idle' && isPrinting
                          ? `Zebra Hub: ${printStatusText}`
                          : printSuccess
                            ? "Terminal print operation successfully finalized."
                            : notificationSuccess 
                              ? `Alert received by ${selectedVisitor.host}. Access node open.`
                              : `Ping dispatched automatically via SMS/Slack to ${selectedVisitor.host}.`}
                    </p>
                  </div>
                </div>
              </div>
            </div>
          ) : (
            <div className="flex-1 flex flex-col items-center justify-center p-12 text-center text-zinc-650">
              <ClipboardList className="w-12 h-12 mb-3 opacity-20" />
              <p className="text-xs">Click on any guest record on the left grid console to load active credentials.</p>
            </div>
          )}
        </div>
      </div>

      {/* Check In Guest New Modal */}
      <AnimatePresence>
        {isNewVisitorOpen && (
          <>
            {/* Backdrop Filter */}
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 0.5 }}
              exit={{ opacity: 0 }}
              onClick={() => setIsNewVisitorOpen(false)}
              className="absolute inset-0 bg-[#000] z-40 rounded-3xl"
            />
            
            <motion.div 
              initial={{ opacity: 0, scale: 0.95, y: 30 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 30 }}
              className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-full max-w-lg bg-zinc-950 border border-zinc-800 rounded-3xl p-8 z-50 shadow-2xl"
            >
              <div className="flex items-center justify-between mb-6">
                <div>
                  <h3 className="text-xl font-display font-bold text-white">Guest Check-In Key</h3>
                  <p className="text-xs text-zinc-500 mt-1">Register external visitors on this physical hub coordinate</p>
                </div>
                <button 
                  onClick={() => setIsNewVisitorOpen(false)}
                  className="w-8 h-8 rounded-full bg-zinc-900 border border-zinc-800 text-zinc-400 hover:text-white flex items-center justify-center cursor-pointer transition-colors"
                >
                  <XIcon className="w-4 h-4" />
                </button>
              </div>

              <form onSubmit={handleSubmit} className="space-y-4">
                <div className="space-y-1.5">
                  <label className="text-[10px] font-bold text-zinc-400 uppercase tracking-widest block">Guest Fullname</label>
                  <input 
                    type="text"
                    required
                    placeholder="e.g. Richard Hendricks"
                    value={visitorName}
                    onChange={(e) => setVisitorName(e.target.value)}
                    className="w-full bg-zinc-900 border border-zinc-800/80 rounded-xl py-2.5 px-3.5 text-xs text-zinc-200 placeholder:text-zinc-600 focus:outline-none focus:ring-1 focus:ring-brand-500/50 focus:border-brand-500 font-semibold"
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-1.5">
                    <label className="text-[10px] font-bold text-zinc-400 uppercase tracking-widest block">Visitor Corporate</label>
                    <input 
                      type="text"
                      placeholder="e.g. Pied Piper Corp"
                      value={company}
                      onChange={(e) => setCompany(e.target.value)}
                      className="w-full bg-zinc-900 border border-zinc-800/80 rounded-xl py-2.5 px-3.5 text-xs text-zinc-200 placeholder:text-zinc-600 focus:outline-none focus:ring-1 focus:ring-brand-500/50 focus:border-brand-500"
                    />
                  </div>
                  <div className="space-y-1.5">
                    <label className="text-[10px] font-bold text-zinc-400 uppercase tracking-widest block">Phone Number</label>
                    <input 
                      type="text"
                      placeholder="+1 555-1209"
                      value={phone}
                      onChange={(e) => setPhone(e.target.value)}
                      className="w-full bg-zinc-900 border border-zinc-800/80 rounded-xl py-2.5 px-3.5 text-xs text-zinc-200 placeholder:text-zinc-600 focus:outline-none focus:ring-1 focus:ring-brand-500/50 focus:border-brand-500"
                    />
                  </div>
                </div>

                <div className="space-y-1.5">
                  <label className="text-[10px] font-bold text-zinc-400 uppercase tracking-widest block">Email Coordinates (Guest)</label>
                  <input 
                    type="email"
                    placeholder="guest@domain.com"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="w-full bg-zinc-900 border border-zinc-800/80 rounded-xl py-2.5 px-3.5 text-xs text-zinc-200 placeholder:text-zinc-600 focus:outline-none focus:ring-1 focus:ring-brand-500/50 focus:border-brand-500"
                  />
                </div>

                <div className="space-y-1.5">
                  <label className="text-[10px] font-bold text-zinc-400 uppercase tracking-widest block">Workspace Host (Whom are they visiting?)</label>
                  <input 
                    type="text"
                    required
                    placeholder="e.g. Sarah Jenkins (Acme SaaS)"
                    value={host}
                    onChange={(e) => setHost(e.target.value)}
                    className="w-full bg-zinc-900 border border-zinc-800/80 rounded-xl py-2.5 px-3.5 text-xs text-zinc-200 placeholder:text-zinc-600 focus:outline-none focus:ring-1 focus:ring-brand-500/50 focus:border-brand-500 font-semibold"
                  />
                </div>

                <div className="flex items-center gap-2.5 pt-4">
                  <button
                    type="button"
                    onClick={() => setIsNewVisitorOpen(false)}
                    className="flex-1 py-3 text-xs font-bold text-zinc-450 bg-zinc-900 hover:bg-zinc-850 hover:text-white border border-zinc-800 rounded-xl transition-all cursor-pointer"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="flex-1 py-3 text-xs font-bold text-white bg-brand-500 hover:bg-brand-600 rounded-xl shadow-md transition-all cursor-pointer"
                  >
                    Check In Guest
                  </button>
                </div>
              </form>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </div>
  );
}

function XIcon(props: React.SVGProps<SVGSVGElement>) {
  return (
    <svg {...props} fill="none" viewBox="0 0 24 24" stroke="currentColor">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M6 18L18 6M6 6l12 12" />
    </svg>
  );
}
