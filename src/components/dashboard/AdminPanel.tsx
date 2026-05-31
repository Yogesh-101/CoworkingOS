import React, { useState } from 'react';
import { useStore } from '@/store';
import { motion, AnimatePresence } from 'motion/react';
import { 
  ShieldCheck, Key, RefreshCw, 
  Slack, CreditCard, Mail, Plus, X, Users, 
  Terminal,
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { Employee, IntegrationSetting } from '@/types';
import { PersonProfilePanel } from '@/components/people/PersonProfilePanel';
import { avatarUrl } from '@/lib/people';

export function ErpPage() {
  const { 
    employees, addEmployee, updateEmployeeStatus,
    integrations, toggleIntegration, updateIntegrationWebhook,
    branches, activeBranchId,
    emailLogs,
  } = useStore();

  const [isNewEmployeeOpen, setIsNewEmployeeOpen] = useState(false);
  const [selectedEmployeeId, setSelectedEmployeeId] = useState<string | null>(null);
  const [empName, setEmpName] = useState('');
  const [empMail, setEmpMail] = useState('');
  const [empRole, setEmpRole] = useState<Employee['role']>('Community Host');
  
  // Terminal logs state for visual tech factor
  const [terminalLogs, setTerminalLogs] = useState<string[]>([
    "[SYSTEM-BOOT] Initiating CoworkingOS central multi-center console ledger...",
    "[KISI-GATEWAY] Kisi access controllers verified on HITEC City Hub (30/30 gates active).",
    "[SLACK-DISPATCH] Webhook authenticated for operations channels successfully.",
    "[SENDGRID-CRON] Checked 14 onboarding welcomes awaiting contract confirmations.",
    "[STRIPE-INTEG] Monthly recursive automated leases cycle scheduler synced."
  ]);

  const currentBranch = branches.find(b => b.id === activeBranchId) || branches[0];
  const selectedEmployee = employees.find((e) => e.id === selectedEmployeeId);

  const triggerTerminalSync = () => {
    const timestamp = new Date().toLocaleTimeString();
    const emailLine = emailLogs.length
      ? `[SENDGRID-LOG] ${emailLogs.length} onboarding emails on record — latest: "${emailLogs[0]?.subject}" → ${emailLogs[0]?.to}.`
      : '[SENDGRID-LOG] No onboarding emails logged yet.';
    const newLogs = [
      `[API-SYNC] (${timestamp}) Forcing master sync handshake...`,
      emailLine,
      `[KISI-LOG] Synchronized 84 RFID key accesses across HITEC City & Gachibowli coordinates.`,
      `[SLACK-DISPATCH] Dispatched daily occupancy index reports.`,
      ...terminalLogs.slice(0, 2)
    ];
    setTerminalLogs(newLogs);
  };

  const handleCreateEmployee = (e: React.FormEvent) => {
    e.preventDefault();
    if (!empName || !empMail) return;

    addEmployee({
      name: empName,
      role: empRole,
      branchId: activeBranchId,
      email: empMail,
      status: 'active'
    });

    setEmpName('');
    setEmpMail('');
    setEmpRole('Community Host');
    setIsNewEmployeeOpen(false);

    // Add log to terminal
    setTerminalLogs([
      `[STAFF-LEDGER] New employee nodes registered: ${empName} (${empRole}). Assigned: ${currentBranch.name}.`,
      ...terminalLogs
    ]);
  };

  // Select icon for integration card
  const getIntegIcon = (icon: string) => {
    switch (icon) {
      case 'key': return <Key className="w-5 h-5 text-amber-400" />;
      case 'message-square': return <Slack className="w-5 h-5 text-purple-400" />;
      case 'credit-card': return <CreditCard className="w-5 h-5 text-emerald-400" />;
      default: return <Mail className="w-5 h-5 text-blue-400" />;
    }
  };

  return (
    <div className="flex flex-col h-full space-y-6">
      <div>
        <h1 className="text-xl font-black text-white flex items-center gap-2">
          <ShieldCheck className="w-5 h-5 text-brand-500" />
          ERP Admin
        </h1>
        <p className="text-xs text-zinc-500 font-medium mt-1">
          Staff directory, API integrations, and system sync telemetry for enterprise operators.
        </p>
      </div>

      {/* Main Grid: Employees List left, Integrations & Terminal right */}
      <div className="grid grid-cols-1 xl:grid-cols-5 gap-6 items-start flex-1 min-h-0">
        
        {/* Employee Ledger List (3 cols) */}
        <div className="xl:col-span-3 bg-zinc-900 border border-zinc-805 rounded-3xl p-6 shadow-lg h-full flex flex-col space-y-4">
          <div className="flex items-center justify-between border-b border-zinc-805/50 pb-4">
            <div>
              <h3 className="font-extrabold text-zinc-100 text-sm flex items-center gap-2">
                <Users className="w-4 h-4 text-brand-500 hover:rotate-12 transition-transform" /> Staff Directory Coordinates
              </h3>
              <p className="text-[11px] text-zinc-500">Multidisciplinary handles allocated to active physical branches</p>
            </div>

            <button
              onClick={() => setIsNewEmployeeOpen(true)}
              className="flex items-center gap-1.5 bg-zinc-800 hover:bg-zinc-750 text-zinc-200 border border-zinc-705 px-3.5 py-2 rounded-xl text-[10px] font-extrabold shrink-0 cursor-pointer transitions-all"
            >
              <Plus className="w-3.5 h-3.5" />
              Add Staff Members
            </button>
          </div>

          <div className="overflow-x-auto flex-1">
            <table className="w-full text-left table-auto text-xs">
              <thead className="bg-zinc-950/45 text-[9px] font-bold text-zinc-450 uppercase tracking-widest border-b border-zinc-805">
                <tr>
                  <th className="py-3 px-4">Staff Member</th>
                  <th className="py-3 px-4">ERP Role Security</th>
                  <th className="py-3 px-4">Allocated Coordinate</th>
                  <th className="py-3 px-4 text-center">Duty Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-zinc-850/45">
                {employees.map((emp) => {
                  const allocatedBranch = branches.find(b => b.id === emp.branchId);
                  return (
                    <tr key={emp.id} className="hover:bg-zinc-850/35 transition-colors cursor-pointer" onClick={() => setSelectedEmployeeId(emp.id)}>
                      <td className="py-3.5 px-4">
                        <div className="flex items-center gap-3">
                          <img src={emp.avatarUrl ?? avatarUrl(emp.name)} alt="" className="w-8 h-8 rounded-full border border-zinc-801 object-cover" />
                          <div>
                            <span className="font-bold text-zinc-205 block">{emp.name}</span>
                            <span className="text-[10px] text-zinc-550 font-semibold">{emp.email}</span>
                          </div>
                        </div>
                      </td>
                      <td className="py-3.5 px-4 font-bold text-zinc-400 capitalize">
                        {emp.role}
                      </td>
                      <td className="py-3.5 px-4 font-semibold text-zinc-500">
                        {allocatedBranch ? allocatedBranch.name : 'Central Coord'}
                      </td>
                      <td className="py-3.5 px-4 text-center">
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            updateEmployeeStatus(emp.id, emp.status === 'active' ? 'on-leave' : 'active');
                          }}
                          className={cn(
                            "px-2.5 py-1 text-[9px] font-black uppercase rounded-lg cursor-pointer leading-none transition-all",
                            emp.status === 'active' 
                              ? "bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 shadow-inner" 
                              : "bg-amber-500/10 text-amber-400 border border-amber-500/20"
                          )}
                        >
                          {emp.status}
                        </button>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>

          {selectedEmployee && (
            <div className="border-t border-zinc-850 pt-4">
              <PersonProfilePanel
                profile={{
                  name: selectedEmployee.name,
                  subtitle: selectedEmployee.email,
                  email: selectedEmployee.email,
                  phone: selectedEmployee.phone,
                  role: selectedEmployee.role,
                  department: selectedEmployee.department,
                  location: branches.find((b) => b.id === selectedEmployee.branchId)?.name,
                  startDate: selectedEmployee.startDate,
                  bio: selectedEmployee.bio,
                  skills: selectedEmployee.skills,
                  presence: selectedEmployee.presence,
                  avatarUrl: selectedEmployee.avatarUrl,
                  badges: [selectedEmployee.status],
                }}
                onEdit={() => setSelectedEmployeeId(null)}
                editLabel="Close"
              />
            </div>
          )}
        </div>

        {/* Integrations Panel and Logs (2 cols) */}
        <div className="xl:col-span-2 space-y-6 flex flex-col h-full justify-between">
          
          {/* Integrations List cards */}
          <div className="bg-zinc-900 border border-zinc-805 rounded-3xl p-6 shadow-lg space-y-4">
            <div className="border-b border-zinc-850 pb-3">
              <h3 className="font-extrabold text-zinc-150 text-sm flex items-center gap-2">
                <Key className="w-4.5 h-4.5 text-amber-500" /> API Connections Hub
              </h3>
              <p className="text-[11px] text-zinc-505">Sync active physical doors, notifications & recurring payments</p>
            </div>

            <div className="grid grid-cols-1 gap-3.5">
              {integrations.map((integ) => (
                <div key={integ.id} className="p-3.5 bg-zinc-950/40 border border-zinc-850 rounded-2xl flex items-start justify-between gap-3">
                  <div className="flex gap-3 leading-none min-w-0">
                    <div className="w-8.5 h-8.5 bg-zinc-900 border border-zinc-801 rounded-xl flex items-center justify-center shrink-0">
                      {getIntegIcon(integ.icon)}
                    </div>
                    <div className="space-y-1 min-w-0">
                      <span className="text-[11px] font-black text-white truncate block">{integ.name}</span>
                      <p className="text-[10px] text-zinc-500 leading-normal font-sans tracking-wide">{integ.description}</p>
                      
                      {integ.connected && integ.webhookUrl && (
                        <input 
                          type="text"
                          value={integ.webhookUrl}
                          onChange={(e) => updateIntegrationWebhook(integ.id, e.target.value)}
                          className="mt-2 text-[9px] font-mono text-zinc-450 bg-zinc-900 border border-zinc-850 rounded px-2 py-0.5 focus:outline-none w-full"
                          title="Integration Webhook Coordinates"
                        />
                      )}
                    </div>
                  </div>

                  <button
                    onClick={() => toggleIntegration(integ.id)}
                    className={cn(
                      "px-2 py-1 bg-zinc-900 border rounded-lg text-[9px] font-extrabold uppercase transition-all shrink-0 cursor-pointer text-center",
                      integ.connected 
                        ? "text-rose-400 bg-rose-500/10 border-rose-500/20" 
                        : "text-zinc-450 border-zinc-805 hover:bg-zinc-850 hover:text-white"
                    )}
                  >
                    {integ.connected ? 'Disable' : 'Secure API'}
                  </button>
                </div>
              ))}
            </div>
          </div>

          {/* Simulated API Handshake telemetry terminal logs */}
          <div className="bg-zinc-950 border border-zinc-805 rounded-3xl p-5 shadow-inner flex flex-col justify-between space-y-3.5 h-[210px]">
            <div className="flex items-center justify-between border-b border-zinc-850 pb-2.5">
              <span className="text-[9px] font-mono font-extrabold text-brand-450 flex items-center gap-1.5 uppercase leading-none">
                <Terminal className="w-3.5 h-3.5" /> API Handshake Log
              </span>
              <button 
                onClick={triggerTerminalSync}
                className="text-[9px] text-zinc-550 hover:text-zinc-300 font-extrabold flex items-center gap-1 transition-colors cursor-pointer"
              >
                <RefreshCw className="w-3 h-3 text-zinc-650" /> Force Sync
              </button>
            </div>

            <div className="flex-1 overflow-y-auto font-mono text-[9px] text-emerald-400/95 space-y-1.5 select-none text-left bg-zinc-950 px-2 py-1 scrollbar-none leading-relaxed">
              {terminalLogs.map((log, index) => (
                <div key={index} className="truncate select-all">{log}</div>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Slide New Employee Modal Form */}
      <AnimatePresence>
        {isNewEmployeeOpen && (
          <>
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 0.5 }}
              exit={{ opacity: 0 }}
              onClick={() => setIsNewEmployeeOpen(false)}
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
                  <h3 className="text-xl font-display font-bold text-white">Create Staff node</h3>
                  <p className="text-xs text-zinc-500 mt-1">Allocate administrative on-duty capabilities</p>
                </div>
                <button 
                  onClick={() => setIsNewEmployeeOpen(false)}
                  className="w-8 h-8 rounded-full bg-zinc-900 border border-zinc-800 text-zinc-400 hover:text-white flex items-center justify-center cursor-pointer transition-colors"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>

              <form onSubmit={handleCreateEmployee} className="space-y-4 font-sans">
                <div className="space-y-1.5">
                  <label className="text-[10px] font-bold text-zinc-400 uppercase tracking-widest block block">Employee Fullname</label>
                  <input 
                    type="text" required
                    placeholder="e.g. Karthik Rao"
                    value={empName}
                    onChange={(e) => setEmpName(e.target.value)}
                    className="w-full bg-zinc-900 border border-zinc-800 rounded-xl py-2.5 px-3.5 text-xs text-zinc-200 font-semibold focus:outline-none focus:ring-1 focus:ring-brand-500/50"
                  />
                </div>

                <div className="space-y-1.5">
                  <label className="text-[10px] font-bold text-zinc-400 uppercase tracking-widest block block">Email Address (Corp)</label>
                  <input 
                    type="email" required
                    placeholder="gilf@co-working.os"
                    value={empMail}
                    onChange={(e) => setEmpMail(e.target.value)}
                    className="w-full bg-zinc-900 border border-zinc-800 rounded-xl py-2.5 px-3.5 text-xs text-zinc-200 font-semibold focus:outline-none focus:ring-1 focus:ring-brand-500/50"
                  />
                </div>

                <div className="space-y-1.5">
                  <label className="text-[10px] font-bold text-zinc-400 uppercase tracking-widest block block">Allocated Secure Role</label>
                  <select 
                    value={empRole}
                    onChange={(e) => setEmpRole(e.target.value as any)}
                    className="w-full bg-zinc-900 border border-zinc-800 rounded-xl py-2.5 px-3.5 text-xs text-zinc-300 font-semibold cursor-pointer focus:outline-none"
                  >
                    <option value="Branch Manager">Branch Manager</option>
                    <option value="Community Host">Community Host</option>
                    <option value="Receptionist">Receptionist</option>
                    <option value="IT Support">IT Support Specialist</option>
                  </select>
                </div>

                <div className="flex pt-4 gap-3">
                  <button
                    type="button"
                    onClick={() => setIsNewEmployeeOpen(false)}
                    className="flex-1 py-3 text-xs font-bold bg-zinc-900 text-zinc-450 border border-zinc-800 rounded-xl"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="flex-1 py-3 text-xs font-bold text-white bg-brand-500 hover:bg-brand-600 rounded-xl shadow-md cursor-pointer"
                  >
                    Onboard Staff Member
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
