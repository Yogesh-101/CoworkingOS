import React, { useState, useRef, useEffect } from 'react';
import { useStore } from '@/store';
import { cn } from '@/lib/utils';
import { 
  LayoutDashboard, Map, Users, FileText, Settings, UserCheck, Check, 
  ShieldAlert, Award, MessageSquare, ClipboardList, Laptop, ShieldCheck, Lock, Landmark 
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { BrandLogo } from '@/components/ui/BrandLogo';

const navItems = [
  { id: 'dashboard', label: 'Dashboard', icon: LayoutDashboard },
  { id: 'floor-map', label: 'Floor Map', icon: Map },
  { id: 'crm', label: 'CRM & Leads', icon: Users },
  { id: 'visitors', label: 'Guest Arrivals', icon: UserCheck },
  { id: 'helpdesk', label: 'Helpdesk & Ops', icon: ClipboardList },
  { id: 'billing', label: 'Finance & Billing', icon: FileText },
  { id: 'team-chat', label: 'Team Chat', icon: MessageSquare },
  { id: 'cms', label: 'Public Web CMS', icon: Laptop },
  { id: 'admin', label: 'ERP Admin & RBAC', icon: ShieldCheck },
] as const;

export function Sidebar() {
  const { activeTab, setActiveTab, role, setRole } = useStore();

  // Dynamic state for User Profile with local persistence setup
  const [adminName, setAdminName] = useState(() => localStorage.getItem('co_admin_name') || 'Admin User');
  const [isProfileOpen, setIsProfileOpen] = useState(false);
  const [editName, setEditName] = useState(adminName);
  const [editRole, setEditRole] = useState(role);

  const profilePopoverRef = useRef<HTMLDivElement>(null);

  // Sync edit state when global store role changes
  useEffect(() => {
    setEditRole(role);
  }, [role]);

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (profilePopoverRef.current && !profilePopoverRef.current.contains(event.target as Node)) {
        setIsProfileOpen(false);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  const handleSaveProfile = (e: React.FormEvent) => {
    e.preventDefault();
    if (editName.trim()) {
      setAdminName(editName);
      setRole(editRole);
      localStorage.setItem('co_admin_name', editName);
      setIsProfileOpen(false);
    }
  };

  // Check RBAC permission for each tab based on active role
  const isTabAllowed = (tabId: string) => {
    if (role === 'Super Admin') return true;
    if (role === 'Community Host') {
      return ['dashboard', 'floor-map', 'crm', 'visitors', 'helpdesk', 'team-chat'].includes(tabId);
    }
    if (role === 'Receptionist') {
      return ['dashboard', 'visitors', 'helpdesk'].includes(tabId);
    }
    return true;
  };

  return (
    <div className="w-64 border-r border-zinc-805 bg-zinc-950 flex flex-col z-20 shrink-0 h-screen overflow-hidden">
      
      {/* Branding Header */}
      <div className="h-16 flex items-center px-6 border-b border-zinc-900 shrink-0 select-none">
        <div className="flex items-center gap-2.5">
          <BrandLogo id="sidebar-logo" size="lg" />
          <span className="text-white font-black tracking-tight text-base font-sans">CoworkingOS</span>
        </div>
      </div>
      
      {/* Navigation list */}
      <div className="flex-1 py-5 px-3 flex flex-col gap-1 overflow-y-auto">
        <div className="px-3 mb-2.5 text-[9px] font-black text-zinc-550 uppercase tracking-widest leading-none">Modules</div>
        
        {navItems.map((item) => {
          const isAllowed = isTabAllowed(item.id);
          const isActive = activeTab === item.id;
          
          return (
            <button
              key={item.id}
              disabled={!isAllowed}
              onClick={() => isAllowed && setActiveTab(item.id as any)}
              className={cn(
                "relative w-full flex items-center justify-between px-3 py-2.5 rounded-xl text-xs font-bold transition-all duration-200 group overflow-hidden select-none",
                isActive 
                  ? "text-brand-400" 
                  : !isAllowed 
                    ? "text-zinc-700 cursor-not-allowed opacity-45" 
                    : "text-zinc-500 hover:text-zinc-200 hover:bg-zinc-900/40 cursor-pointer"
              )}
            >
              {isActive && (
                <motion.div 
                  layoutId="sidebar-active"
                  className="absolute inset-0 bg-brand-500/10 border border-brand-500/15 rounded-xl"
                  transition={{ type: "spring", stiffness: 350, damping: 28 }}
                />
              )}
              
              <div className="flex items-center gap-2.5 relative z-10 min-w-0">
                <item.icon className={cn("w-4.5 h-4.5 shrink-0", isActive ? "text-brand-500" : "text-zinc-650 group-hover:text-zinc-400")} />
                <span className="truncate">{item.label}</span>
              </div>

              {!isAllowed && (
                <span className="relative z-10 shrink-0" title="RBAC Restricted">
                  <Lock className="w-3.5 h-3.5 text-zinc-800" aria-hidden />
                </span>
              )}
            </button>
          );
        })}
      </div>
      
      {/* Sidebar Footer */}
      <div className="p-4 border-t border-zinc-900 relative shrink-0">
        <button 
          disabled={role !== 'Super Admin'}
          onClick={() => role === 'Super Admin' && setActiveTab('settings')}
          className={cn(
            "w-full flex items-center justify-between px-3 py-2.5 rounded-xl text-xs font-bold transition-all select-none leading-none",
            activeTab === 'settings' 
              ? "text-brand-400 bg-brand-500/10" 
              : role !== 'Super Admin' 
                ? "text-zinc-705 cursor-not-allowed opacity-40" 
                : "text-zinc-500 hover:text-zinc-200 hover:bg-zinc-900/40 cursor-pointer"
          )}
        >
          <div className="flex items-center gap-2.5">
            <Settings className="w-4.5 h-4.5 text-zinc-650 shrink-0" />
            <span>Settings</span>
          </div>
          {role !== 'Super Admin' && (
            <Lock className="w-3.5 h-3.5 text-zinc-800 shrink-0" />
          )}
        </button>
        
        {/* Profile Popover Editor */}
        <AnimatePresence>
          {isProfileOpen && (
            <motion.div
              id="admin-profile-config-menu"
              ref={profilePopoverRef}
              initial={{ opacity: 0, y: 15, scale: 0.95 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: 10, scale: 0.95 }}
              transition={{ duration: 0.18, ease: 'easeOut' }}
              className="absolute bottom-20 left-4 right-4 bg-zinc-950 border border-zinc-805 rounded-2xl p-4 shadow-2xl z-30 space-y-4 backdrop-blur-xl"
            >
              <div className="border-b border-zinc-900 pb-2 leading-none">
                <span className="text-[9px] font-black text-brand-500 uppercase tracking-wider block">Staff Identity Coordinates</span>
                <p className="text-[10px] text-zinc-600 mt-1 font-semibold leading-none">Reconfigure primary console session</p>
              </div>

              <form onSubmit={handleSaveProfile} className="space-y-3.5">
                <div className="space-y-1.5 leading-none">
                  <label className="text-[9px] font-bold text-zinc-500 uppercase tracking-widest block">Operator Fullname</label>
                  <input
                    id="admin-form-name-input"
                    type="text"
                    required
                    value={editName}
                    onChange={(e) => setEditName(e.target.value)}
                    placeholder="Enter name"
                    className="w-full bg-zinc-900 border border-zinc-801 rounded-xl py-2 px-3 text-xs font-bold text-zinc-200 placeholder:text-zinc-750 focus:outline-none"
                  />
                </div>

                <div className="space-y-1.5 leading-none">
                  <label className="text-[9px] font-bold text-zinc-500 uppercase tracking-widest block">Session Authority</label>
                  <div className="grid grid-cols-2 gap-1.5">
                    {['Super Admin', 'Community Host', 'Receptionist'].map((r) => {
                      const sel = editRole === r;
                      return (
                        <button
                          key={r}
                          id={`admin-role-opt-${r.replace(/\s+/g, '-').toLowerCase()}`}
                          type="button"
                          onClick={() => setEditRole(r as any)}
                          className={cn(
                            "py-2 px-1 rounded-lg text-[9px] font-bold border transition-all truncate leading-none cursor-pointer text-center",
                            sel ? "bg-brand-500/10 border-brand-500/30 text-brand-400" : "bg-transparent border-zinc-805 text-zinc-550 hover:text-zinc-300"
                          )}
                        >
                          {r}
                        </button>
                      );
                    })}
                  </div>
                </div>

                <div className="flex items-center gap-2 pt-1">
                  <button
                    id="admin-form-cancel-btn"
                    type="button"
                    onClick={() => {
                      setEditName(adminName);
                      setEditRole(role);
                      setIsProfileOpen(false);
                    }}
                    className="flex-1 py-2 rounded-xl text-[10px] font-bold bg-zinc-900 hover:bg-zinc-850 border border-zinc-800 text-zinc-400 transition-all cursor-pointer"
                  >
                    Cancel
                  </button>
                  <button
                    id="admin-form-save-btn"
                    type="submit"
                    className="flex-1 py-2 rounded-xl text-[10px] font-bold bg-brand-500 hover:bg-brand-600 text-white shadow-sm transition-all cursor-pointer"
                  >
                    Set Active
                  </button>
                </div>
              </form>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Selected target matching exactly CSS Selector 1 */}
        <div 
          onClick={() => {
            setEditName(adminName);
            setEditRole(role);
            setIsProfileOpen(!isProfileOpen);
          }}
          className={cn(
            "mt-4 flex items-center gap-3 px-3 py-2 bg-zinc-900 border rounded-xl shadow-sm transition-all cursor-pointer hover:bg-zinc-850/70 select-none leading-none",
            isProfileOpen ? "border-brand-500/60 text-zinc-100 bg-zinc-850" : "border-zinc-805 text-zinc-200"
          )}
        >
          <div className="w-8 h-8 rounded-full bg-zinc-800 border border-zinc-705 flex-shrink-0 flex justify-center items-center overflow-hidden relative">
             <img src={`https://ui-avatars.com/api/?name=${encodeURIComponent(adminName)}&background=ff0a16&color=ffffff`} alt="Avatar" className="w-full h-full object-cover" />
          </div>
          <div className="flex-1 min-w-0 flex flex-col leading-none py-0.5 justify-center">
            <span className="text-xs font-bold text-zinc-105 truncate leading-none">{adminName}</span>
            <span className="text-[10px] text-zinc-500 truncate font-semibold mt-1 leading-none">{role}</span>
          </div>
        </div>
      </div>
    </div>
  );
}
