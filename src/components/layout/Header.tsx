import React, { useState, useRef, useEffect } from 'react';
import { Bell, Search, MapPin, Check, Sparkles, Trash2, HelpCircle, Wifi, DollarSign, UserCheck, ChevronDown, X, Briefcase, Receipt } from 'lucide-react';
import { useStore } from '@/store';
import { motion, AnimatePresence } from 'motion/react';

interface Notification {
  id: string;
  title: string;
  description: string;
  type: 'lead' | 'system' | 'billing' | 'tour' | 'visitor' | 'ticket';
  time: string;
  read: boolean;
}

export function Header() {
  const { 
    branches, 
    activeBranchId, 
    setActiveBranchId, 
    notifications, 
    addNotification, 
    toggleNotificationRead, 
    markAllNotificationsRead, 
    deleteNotification,
    leads,
    invoices,
    setActiveTab
  } = useStore();
  
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);
  
  const [isBranchOpen, setIsBranchOpen] = useState(false);
  const branchDropdownRef = useRef<HTMLDivElement>(null);

  // High-fidelity search bar state & references
  const [searchQuery, setSearchQuery] = useState('');
  const [showSearchDropdown, setShowSearchDropdown] = useState(false);
  const searchContainerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
      if (branchDropdownRef.current && !branchDropdownRef.current.contains(event.target as Node)) {
        setIsBranchOpen(false);
      }
      if (searchContainerRef.current && !searchContainerRef.current.contains(event.target as Node)) {
        setShowSearchDropdown(false);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  const unreadCount = notifications.filter(n => !n.read).length;

  const handleMarkAllRead = () => {
    markAllNotificationsRead();
  };

  const handleToggleRead = (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    toggleNotificationRead(id);
  };

  const handleDelete = (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    deleteNotification(id);
  };

  const handleSimulateNotification = () => {
    const templates = [
      { title: 'High Occupancy Alert', description: 'Downtown Hub HQ has reached 88% capacity today.', type: 'system' as const },
      { title: 'New Space Booking', description: 'Regina Phalange reserved Desk D-12 for 1 month.', type: 'lead' as const },
      { title: 'Invoice Overdue Notification', description: 'Invoice INV-2043 daily reminder triggered.', type: 'billing' as const },
      { title: 'Site Tour Booked', description: 'A virtual tour was requested by Tech Investors Corp.', type: 'tour' as const },
    ];

    const randomTemplate = templates[Math.floor(Math.random() * templates.length)];
    addNotification(randomTemplate);
  };

  const getIcon = (type: Notification['type']) => {
    switch (type) {
      case 'lead': return <UserCheck className="w-4.5 h-4.5 text-emerald-400" />;
      case 'system': return <Wifi className="w-4.5 h-4.5 text-sky-400" />;
      case 'billing': return <DollarSign className="w-4.5 h-4.5 text-amber-400" />;
      case 'tour': return <Sparkles className="w-4.5 h-4.5 text-violet-400" />;
      case 'visitor': return <UserCheck className="w-4.5 h-4.5 text-emerald-500" />;
      case 'ticket': return <Briefcase className="w-4.5 h-4.5 text-purple-400" />;
      default: return <HelpCircle className="w-4.5 h-4.5 text-zinc-400" />;
    }
  };

  const activeBranch = branches.find(b => b.id === activeBranchId) || branches[0];

  // High-fidelity search calculation matching Leads, Invoices, and Desks
  const searchResults = (() => {
    if (!searchQuery.trim()) return { leads: [], invoices: [], desks: [] };
    const query = searchQuery.toLowerCase();

    // Match leads
    const matchedLeads = leads.filter(l => 
      l.name.toLowerCase().includes(query) || 
      l.company.toLowerCase().includes(query) || 
      l.email.toLowerCase().includes(query)
    ).slice(0, 3);

    // Match invoices
    const matchedInvoices = invoices.filter(inv => 
      inv.id.toLowerCase().includes(query) || 
      inv.clientName.toLowerCase().includes(query)
    ).slice(0, 3);

    // Match desks & offices across all branches
    const matchedDesks: Array<{ desk: any; branchName: string; branchId: string }> = [];
    branches.forEach(b => {
      b.desks.forEach(desk => {
        if (
          desk.name.toLowerCase().includes(query) ||
          (desk.assigneeName && desk.assigneeName.toLowerCase().includes(query))
        ) {
          if (matchedDesks.length < 3) {
            matchedDesks.push({ desk, branchName: b.name, branchId: b.id });
          }
        }
      });
    });

    return { leads: matchedLeads, invoices: matchedInvoices, desks: matchedDesks };
  })();

  const hasSearchResults = searchQuery.trim() !== '';
  const totalMatchesCount = searchResults.leads.length + searchResults.invoices.length + searchResults.desks.length;

  return (
    <header className="h-16 px-6 glass-panel border-x-0 border-t-0 flex items-center justify-between sticky top-0 z-20">
      <div className="flex items-center gap-4 flex-1">
        {/* Dynamic Interactive Search Bar Container */}
        <div className="relative w-80 hidden md:block group" ref={searchContainerRef}>
          <div className="relative">
            <Search className="w-4 h-4 text-zinc-500 absolute left-3.5 top-1/2 -translate-y-1/2 group-focus-within:text-brand-500 transition-colors" />
            <input 
              id="header-search-bar"
              type="text" 
              placeholder="Search members, spaces, invoices..." 
              value={searchQuery}
              onFocus={() => setShowSearchDropdown(true)}
              onChange={(e) => {
                setSearchQuery(e.target.value);
                setShowSearchDropdown(true);
              }}
              className="w-full bg-zinc-900/90 border border-zinc-800 rounded-full py-2 pr-10 pl-10 text-xs font-semibold text-zinc-150 placeholder:text-zinc-500 focus:outline-none focus:ring-2 focus:ring-brand-500/20 focus:border-brand-500 transition-all shadow-sm h-10"
            />
            {searchQuery && (
              <button 
                onClick={() => {
                  setSearchQuery('');
                  setShowSearchDropdown(false);
                }}
                className="absolute right-3.5 top-1/2 -translate-y-1/2 text-zinc-500 hover:text-zinc-300 p-0.5 rounded-full transition-colors cursor-pointer"
              >
                <X className="w-3.5 h-3.5" />
              </button>
            )}
          </div>

          <AnimatePresence>
            {showSearchDropdown && hasSearchResults && (
              <motion.div
                id="search-results-overlay-panel"
                initial={{ opacity: 0, y: 12, scale: 0.95 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                exit={{ opacity: 0, y: 8, scale: 0.95 }}
                transition={{ duration: 0.15 }}
                className="absolute left-0 mt-3 w-[450px] max-h-[420px] rounded-2xl border border-zinc-805 bg-zinc-950/95 backdrop-blur-xl shadow-2xl overflow-y-auto z-50 p-4 space-y-4"
              >
                <div className="flex items-center justify-between border-b border-zinc-900 pb-2 mb-1.5">
                  <span className="text-[10px] font-bold text-zinc-500 uppercase tracking-widest leading-none">Global Network Indexer</span>
                  <span className="text-[9px] font-mono font-bold px-2 py-0.5 rounded bg-zinc-900 text-brand-500 border border-brand-500/10">
                    {totalMatchesCount} matches
                  </span>
                </div>

                {totalMatchesCount === 0 ? (
                  <div className="text-center py-8 text-zinc-600">
                    <Search className="w-7 h-7 opacity-25 mb-2 mx-auto" />
                    <p className="text-xs font-medium">No records matching "{searchQuery}"</p>
                    <p className="text-[10px] text-zinc-650 mt-0.5">Check spelling or double-check criteria</p>
                  </div>
                ) : (
                  <div className="space-y-4">
                    {/* Leads Category matches */}
                    {searchResults.leads.length > 0 && (
                      <div className="space-y-1.5">
                        <span className="text-[9px] font-bold text-zinc-550 uppercase tracking-widest block px-1">Pipeline & CRM Members</span>
                        <div className="space-y-1">
                          {searchResults.leads.map(lead => (
                            <button
                              key={lead.id}
                              onClick={() => {
                                setActiveTab('crm');
                                setSearchQuery('');
                                setShowSearchDropdown(false);
                              }}
                              className="w-full text-left rounded-xl p-2.5 hover:bg-zinc-90 w bg-zinc-900/45 border border-transparent hover:border-zinc-800 transition-all flex items-center justify-between group cursor-pointer"
                            >
                              <div className="flex items-center gap-2.5 min-w-0">
                                <div className="w-6.5 h-6.5 rounded bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center shrink-0">
                                  <Briefcase className="w-3.5 h-3.5 text-emerald-400" />
                                </div>
                                <div className="min-w-0">
                                  <p className="text-xs font-bold text-zinc-250 truncate group-hover:text-white transition-colors">{lead.name}</p>
                                  <p className="text-[10px] text-zinc-500 truncate mt-0.5">{lead.company} • {lead.email}</p>
                                </div>
                              </div>
                              <span className="text-[9px] font-mono font-bold bg-zinc-900 px-2 py-0.5 border border-zinc-800 rounded text-zinc-400 capitalize whitespace-nowrap">
                                {lead.stage}
                              </span>
                            </button>
                          ))}
                        </div>
                      </div>
                    )}

                    {/* Invoices matches */}
                    {searchResults.invoices.length > 0 && (
                      <div className="space-y-1.5">
                        <span className="text-[9px] font-bold text-zinc-550 uppercase tracking-widest block px-1">Billing & Transactions</span>
                        <div className="space-y-1">
                          {searchResults.invoices.map(inv => (
                            <button
                              key={inv.id}
                              onClick={() => {
                                setActiveTab('billing');
                                setSearchQuery('');
                                setShowSearchDropdown(false);
                              }}
                              className="w-full text-left rounded-xl p-2.5 hover:bg-zinc-90 w bg-zinc-900/45 border border-transparent hover:border-zinc-800 transition-all flex items-center justify-between group cursor-pointer"
                            >
                              <div className="flex items-center gap-2.5 min-w-0">
                                <div className="w-6.5 h-6.5 rounded bg-amber-500/10 border border-amber-500/20 flex items-center justify-center shrink-0">
                                  <Receipt className="w-3.5 h-3.5 text-amber-500" />
                                </div>
                                <div className="min-w-0">
                                  <p className="text-xs font-bold text-zinc-250 truncate group-hover:text-white transition-colors">{inv.clientName}</p>
                                  <p className="text-[10px] text-zinc-500 truncate mt-0.5">{inv.id} • Due: {inv.dueDate}</p>
                                </div>
                              </div>
                              <span className="text-xs font-mono font-bold text-white whitespace-nowrap">
                                ${inv.amount.toLocaleString(undefined, { minimumFractionDigits: 2 })}
                              </span>
                            </button>
                          ))}
                        </div>
                      </div>
                    )}

                    {/* Workspace Units matches */}
                    {searchResults.desks.length > 0 && (
                      <div className="space-y-1.5">
                        <span className="text-[9px] font-bold text-zinc-550 uppercase tracking-widest block px-1">Workspace Sites & Desks</span>
                        <div className="space-y-1">
                          {searchResults.desks.map(({ desk, branchName, branchId }) => (
                            <button
                              key={desk.id}
                              onClick={() => {
                                setActiveBranchId(branchId);
                                setActiveTab('floor-map');
                                setSearchQuery('');
                                setShowSearchDropdown(false);
                              }}
                              className="w-full text-left rounded-xl p-2.5 hover:bg-zinc-90 w bg-zinc-900/45 border border-transparent hover:border-zinc-800 transition-all flex items-center justify-between group cursor-pointer"
                            >
                              <div className="flex items-center gap-2.5 min-w-0">
                                <div className="w-6.5 h-6.5 rounded bg-brand-500/10 border border-brand-500/20 flex items-center justify-center shrink-0">
                                  <MapPin className="w-3.5 h-3.5 text-brand-400" />
                                </div>
                                <div className="min-w-0">
                                  <p className="text-xs font-bold text-zinc-250 truncate group-hover:text-white transition-colors">{desk.name}</p>
                                  <p className="text-[10px] text-zinc-500 truncate mt-0.5">{branchName} • {desk.type === 'meeting-room' ? 'Room' : 'Hot Desk'}</p>
                                </div>
                              </div>
                              <div className="text-right whitespace-nowrap shrink-0">
                                <span className={`text-[9px] font-mono font-bold uppercase block ${
                                  desk.status === 'occupied' ? 'text-brand-500' :
                                  desk.status === 'available' ? 'text-zinc-500' : 'text-amber-550'
                                }`}>
                                  {desk.status === 'occupied' ? (desk.assigneeName || 'Occupied') : desk.status}
                                </span>
                              </div>
                            </button>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>
                )}
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>
      
      <div className="flex items-center gap-4">
        {/* Branch Selector Custom Dropdown */}
        <div className="relative" ref={branchDropdownRef}>
          <button 
            onClick={() => setIsBranchOpen(!isBranchOpen)}
            className={`flex items-center gap-2.5 px-4 py-2 bg-zinc-900/90 hover:bg-zinc-800/80 border ${isBranchOpen ? 'border-brand-500/50 shadow-[0_0_15px_rgba(255,10,22,0.1)] text-white' : 'border-zinc-800/80 text-zinc-300'} rounded-full transition-all duration-200 cursor-pointer text-sm font-medium pr-3.5 h-10`}
          >
            <MapPin className="w-4 h-4 text-brand-500 shrink-0" />
            <span className="font-semibold leading-none">{activeBranch.name}</span>
            <ChevronDown className={`w-3.5 h-3.5 text-zinc-500 transition-transform duration-300 ${isBranchOpen ? 'rotate-180 text-brand-500' : 'rotate-0'}`} />
          </button>

          <AnimatePresence>
            {isBranchOpen && (
              <motion.div
                initial={{ opacity: 0, y: 12, scale: 0.95 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                exit={{ opacity: 0, y: 8, scale: 0.95 }}
                transition={{ duration: 0.15, ease: 'easeOut' }}
                className="absolute right-0 md:left-0 mt-3 w-80 rounded-2xl border border-zinc-800/80 bg-zinc-950/95 backdrop-blur-xl shadow-2xl overflow-hidden z-50 p-2 space-y-0.5"
              >
                <div className="px-3 py-2 border-b border-zinc-800/40 mb-1.5 flex justify-between items-center">
                  <span className="text-[10px] font-bold text-zinc-500 uppercase tracking-widest leading-none">Select Workspace Location</span>
                  <span className="text-[9px] font-mono font-semibold px-2 py-0.5 rounded bg-zinc-900 text-brand-500 border border-brand-500/20">{branches.length} campuses</span>
                </div>
                {branches.map((b) => {
                  const isActive = b.id === activeBranchId;
                  return (
                    <button
                      key={b.id}
                      onClick={() => {
                        setActiveBranchId(b.id);
                        setIsBranchOpen(false);
                      }}
                      className={`w-full text-left rounded-xl px-3 py-2.5 transition-all duration-200 flex items-start gap-3 group relative cursor-pointer ${isActive ? 'bg-brand-500/10 border border-brand-500/25 text-white' : 'hover:bg-zinc-900/60 border border-transparent text-zinc-400 hover:text-zinc-200'}`}
                    >
                      {/* Left glowing indicator */}
                      {isActive && (
                        <div className="absolute left-0 top-1/2 -translate-y-1/2 w-1 h-6 rounded-r-full bg-brand-500/80" />
                      )}
                      
                      <div className={`mt-0.5 w-7 h-7 rounded-lg flex items-center justify-center shrink-0 border ${isActive ? 'bg-brand-500/20 border-brand-500/30 text-brand-400' : 'bg-zinc-900 border-zinc-800/85 text-zinc-500 group-hover:text-brand-400 group-hover:border-zinc-700/60'} transition-all`}>
                        <MapPin className="w-3.5 h-3.5" />
                      </div>

                      <div className="flex-1 min-w-0">
                        <div className="flex justify-between items-center gap-1.5">
                          <span className={`text-xs font-bold leading-none ${isActive ? 'text-white' : 'text-zinc-300'}`}>
                            {b.name}
                          </span>
                          {isActive && <Check className="w-3.5 h-3.5 text-brand-500 shrink-0" />}
                        </div>
                        <p className="text-[10px] text-zinc-500 mt-1 font-medium leading-none">
                          {b.location} • {b.capacity} spaces
                        </p>
                        <div className="flex items-center gap-1.5 mt-2">
                          <div className="flex-1 h-1 rounded-full bg-zinc-900 overflow-hidden">
                            <div className={`h-full rounded-full ${b.occupancyRate > 85 ? 'bg-emerald-500' : b.occupancyRate > 70 ? 'bg-brand-500' : 'bg-amber-500'}`} style={{ width: `${b.occupancyRate}%` }} />
                          </div>
                          <span className="text-[9px] font-mono font-bold text-zinc-500 shrink-0">{b.occupancyRate}% occupancy</span>
                        </div>
                      </div>
                    </button>
                  );
                })}
              </motion.div>
            )}
          </AnimatePresence>
        </div>
        
        {/* Notification Bell Container Custom Dropdown */}
        <div className="relative" ref={dropdownRef}>
          <button 
            onClick={() => setIsOpen(!isOpen)}
            className={`relative p-2.5 text-zinc-400 bg-zinc-900 border ${isOpen ? 'border-brand-500/50 text-zinc-100 shadow-[0_0_15px_rgba(255,10,22,0.15)] bg-zinc-900/90' : 'border-zinc-800 hover:text-zinc-100 hover:bg-zinc-800'} transition-all rounded-full shadow-sm cursor-pointer h-10 w-10 flex items-center justify-center`}
          >
            <Bell className="w-4 h-4" />
            {unreadCount > 0 && (
              <span className="absolute -top-0.5 -right-0.5 min-w-5 h-5 px-1.5 flex items-center justify-center rounded-full bg-brand-600 text-white font-sans text-[10px] font-bold border-2 border-zinc-950 shadow-md animate-pulse">
                {unreadCount}
              </span>
            )}
          </button>

          <AnimatePresence>
            {isOpen && (
              <motion.div
                initial={{ opacity: 0, y: 12, scale: 0.95 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                exit={{ opacity: 0, y: 8, scale: 0.95 }}
                transition={{ duration: 0.15, ease: 'easeOut' }}
                className="absolute right-0 mt-3 w-96 rounded-2xl border border-zinc-800/80 bg-zinc-950/95 backdrop-blur-xl shadow-2xl overflow-hidden z-50 mr-[-2px]"
              >
                {/* Header */}
                <div className="px-5 py-4 border-b border-zinc-800/60 flex items-center justify-between">
                  <div>
                    <h3 className="text-sm font-bold text-white tracking-tight">System Notifications</h3>
                    <p className="text-xs text-zinc-500 mt-0.5 font-medium">{unreadCount} active status logs</p>
                  </div>
                  <div className="flex items-center gap-2">
                    <button 
                      onClick={handleSimulateNotification}
                      className="text-xs font-bold px-2.5 py-1 rounded bg-brand-500/10 hover:bg-brand-500/20 text-brand-500 border border-brand-500/25 transition-all flex items-center gap-1 active:scale-95 cursor-pointer"
                      title="Inject high-fidelity test alert"
                    >
                      <Sparkles className="w-3 h-3" />
                      Test Alert
                    </button>
                    {unreadCount > 0 && (
                      <button 
                        onClick={handleMarkAllRead}
                        className="text-xs font-bold text-zinc-400 hover:text-white transition-colors cursor-pointer"
                      >
                        Clear
                      </button>
                    )}
                  </div>
                </div>

                {/* Notifications List */}
                <div className="max-h-[350px] overflow-y-auto divide-y divide-zinc-900/60">
                  {notifications.length === 0 ? (
                    <div className="py-12 px-6 text-center flex flex-col items-center justify-center">
                      <div className="w-10 h-10 rounded-full bg-zinc-900 flex items-center justify-center mb-3 text-zinc-600 border border-zinc-800/60">
                        <Check className="w-5 h-5" />
                      </div>
                      <p className="text-sm text-zinc-400 font-semibold">Workspace is pristine</p>
                      <p className="text-xs text-zinc-600 mt-1">All events acknowledged or cleared.</p>
                    </div>
                  ) : (
                    notifications.map((item) => (
                      <div 
                        key={item.id}
                        onClick={(e) => handleToggleRead(item.id, e)}
                        className={`group/notif px-5 py-4 flex gap-3.5 transition-all duration-200 cursor-pointer hover:bg-zinc-900/40 relative ${!item.read ? 'bg-brand-500/[0.02]' : 'opacity-65'}`}
                      >
                        {/* Red Dot Pulse Indicator for Unread */}
                        {!item.read && (
                          <div className="absolute left-2.5 top-1/2 -translate-y-1/2 flex h-2 w-2">
                            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-brand-400 opacity-75"></span>
                            <span className="relative inline-flex rounded-full h-2 w-2 bg-brand-500"></span>
                          </div>
                        )}
                        
                        {/* Styled Icon Panel */}
                        <div className="mt-0.5 w-8 h-8 rounded-lg bg-zinc-900 flex items-center justify-center shrink-0 border border-zinc-850">
                          {getIcon(item.type)}
                        </div>

                        {/* Text and Actions */}
                        <div className="flex-1 min-w-0">
                          <div className="flex justify-between items-start gap-2">
                            <span className={`text-xs font-bold leading-none ${!item.read ? 'text-zinc-100' : 'text-zinc-400'}`}>
                              {item.title}
                            </span>
                            <span className="text-[10px] text-zinc-650 font-mono font-medium shrink-0">
                              {item.time}
                            </span>
                          </div>
                          <p className="text-xs text-zinc-400 leading-relaxed mt-1 font-medium break-words">
                            {item.description}
                          </p>
                          
                          {/* Item Action Buttons */}
                          <div className="flex items-center gap-3 mt-2.5 opacity-0 group-hover/notif:opacity-100 transition-opacity">
                            <button 
                              onClick={(e) => handleToggleRead(item.id, e)}
                              className="text-[10px] font-bold text-zinc-500 hover:text-zinc-300 flex items-center gap-1 cursor-pointer"
                            >
                              <Check className="w-3 h-3" />
                              {item.read ? 'Mark Unread' : 'Acknowledge'}
                            </button>
                            <span className="text-zinc-800 text-[10px]">|</span>
                            <button 
                              onClick={(e) => handleDelete(item.id, e)}
                              className="text-[10px] font-bold text-zinc-500 hover:text-rose-400 flex items-center gap-1 cursor-pointer"
                            >
                              <Trash2 className="w-3 h-3" />
                              Dismiss
                            </button>
                          </div>
                        </div>
                      </div>
                    ))
                  )}
                </div>

                {/* Footer */}
                <div className="px-5 py-3.5 bg-zinc-900/40 border-t border-zinc-900 text-center flex justify-between items-center text-xs text-zinc-600 font-medium">
                  <span>Press <kbd className="bg-zinc-900 px-1.5 py-0.5 rounded border border-zinc-800 text-[10px] font-mono">Test Alert</kbd> to add events</span>
                  <span className="text-zinc-500">CoworkingOS Live Feed</span>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>
    </header>
  );
}
