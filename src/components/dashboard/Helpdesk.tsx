import React, { useState } from 'react';
import { useStore } from '@/store';
import { motion, AnimatePresence } from 'motion/react';
import { 
  Wrench, AlertTriangle, CheckCircle, Clock, Search, 
  Plus, MessageSquare, ClipboardCheck, ArrowUpRight, 
  Trash2, User, Landmark, ShieldAlert, Check, X, Calendar, Activity
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { Ticket, InternalTask } from '@/types';

export function Helpdesk() {
  const { 
    tickets, addTicket, updateTicketStatus, assignTicket,
    tasks, addTask, updateTaskStatus,
    employees, branches, activeBranchId 
  } = useStore();

  const [ticketSearch, setTicketSearch] = useState('');
  const [isNewTicketOpen, setIsNewTicketOpen] = useState(false);
  const [isNewTaskOpen, setIsNewTaskOpen] = useState(false);

  // New Ticket Form
  const [ticketTitle, setTicketTitle] = useState('');
  const [ticketDesc, setTicketDesc] = useState('');
  const [ticketCategory, setTicketCategory] = useState<Ticket['category']>('WiFi/Network');
  const [ticketPriority, setTicketPriority] = useState<Ticket['priority']>('medium');
  const [ticketMember, setTicketMember] = useState('');

  // New Task Form
  const [taskTitle, setTaskTitle] = useState('');
  const [taskDesc, setTaskDesc] = useState('');
  const [taskPriority, setTaskPriority] = useState<InternalTask['priority']>('medium');
  const [taskAssignee, setTaskAssignee] = useState('');
  const [taskDue, setTaskDue] = useState('May 30, 2026');

  const currentBranch = branches.find(b => b.id === activeBranchId) || branches[0];

  // Filter tickets by branch and search
  const filteredTickets = tickets.filter(t => {
    const matchesBranch = t.branchId === activeBranchId;
    const matchesSearch = t.title.toLowerCase().includes(ticketSearch.toLowerCase()) || 
                          t.description.toLowerCase().includes(ticketSearch.toLowerCase()) ||
                          t.memberName.toLowerCase().includes(ticketSearch.toLowerCase());
    return matchesBranch && matchesSearch;
  });

  const handleSubmitTicket = (e: React.FormEvent) => {
    e.preventDefault();
    if (!ticketTitle || !ticketMember) return;

    addTicket({
      title: ticketTitle,
      description: ticketDesc || 'No extended description provided.',
      category: ticketCategory,
      priority: ticketPriority,
      branchId: activeBranchId,
      memberName: ticketMember
    });

    // Reset Form
    setTicketTitle('');
    setTicketDesc('');
    setTicketCategory('WiFi/Network');
    setTicketPriority('medium');
    setTicketMember('');
    setIsNewTicketOpen(false);
  };

  const handleSubmitTask = (e: React.FormEvent) => {
    e.preventDefault();
    if (!taskTitle || !taskAssignee) return;

    addTask({
      title: taskTitle,
      description: taskDesc || 'No details.',
      uid: undefined, // internal store generation handles it
      assignedTo: taskAssignee,
      priority: taskPriority,
      dueDate: taskDue
    } as any);

    setTaskTitle('');
    setTaskDesc('');
    setTaskPriority('medium');
    setTaskAssignee('');
    setIsNewTaskOpen(false);
  };

  return (
    <div className="flex flex-col h-full space-y-6">
      
      {/* Header Panel */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 shrink-0">
        <div>
          <h1 className="text-3xl font-display font-bold text-zinc-100 tracking-tight">Helpdesk & Resolutions</h1>
          <p className="text-zinc-500 text-sm mt-1">
            Resolve member-filed facility incidents and coordinate internal maintenance jobs for <span className="text-brand-400 font-bold">{currentBranch.name}</span>
          </p>
        </div>

        <div className="flex items-center gap-2.5">
          <button 
            onClick={() => setIsNewTicketOpen(true)}
            className="flex items-center gap-2 bg-brand-500 hover:bg-brand-600 shadow-md hover:shadow-brand-500/10 text-white px-4 py-2.5 rounded-full font-bold text-xs shrink-0 transition-all active:scale-95 cursor-pointer leading-none"
          >
            <Plus className="w-3.5 h-3.5" />
            File Ticket
          </button>
          
          <button 
            onClick={() => setIsNewTaskOpen(true)}
            className="flex items-center gap-2 bg-zinc-800 hover:bg-zinc-750 text-zinc-200 border border-zinc-705 px-4 py-2.5 rounded-full font-bold text-xs shrink-0 transition-all active:scale-95 cursor-pointer leading-none"
          >
            <ClipboardCheck className="w-3.5 h-3.5 text-zinc-400" />
            Add Team Task
          </button>
        </div>
      </div>

      {/* Main Container Grid */}
      <div className="grid grid-cols-1 xl:grid-cols-3 gap-6 items-start flex-1 min-h-0">
        
        {/* Service Incident Tickets: 2cols */}
        <div className="xl:col-span-2 bg-zinc-900 border border-zinc-805 rounded-3xl p-6 shadow-lg h-full flex flex-col space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-zinc-805/50 pb-4">
            <div>
              <h3 className="font-extrabold text-zinc-100 text-sm flex items-center gap-2">
                <Wrench className="w-4 h-4 text-brand-500" /> Actionable Member Incidents
              </h3>
              <p className="text-[11px] text-zinc-500">Service levels tracked relative to active occupants</p>
            </div>

            <div className="relative w-full sm:w-56">
              <Search className="w-3.5 h-3.5 text-zinc-500 absolute left-3 top-1/2 -translate-y-1/2" />
              <input 
                type="text"
                placeholder="Search ticket logs..."
                value={ticketSearch}
                onChange={(e) => setTicketSearch(e.target.value)}
                className="w-full bg-zinc-950 border border-zinc-805 rounded-xl py-1.5 pr-3 pl-8 text-[11px] font-semibold text-zinc-250 placeholder:text-zinc-650 focus:outline-none focus:ring-1 focus:ring-brand-500/30"
              />
            </div>
          </div>

          <div className="space-y-4 overflow-y-auto max-h-[550px] pr-1">
            {filteredTickets.length === 0 ? (
              <div className="flex flex-col items-center justify-center p-16 text-center text-zinc-650">
                <AlertTriangle className="w-8 h-8 opacity-30 mb-2" />
                <span className="text-xs font-semibold">Clean registry</span>
                <p className="text-[11px] text-zinc-500 mt-1">No active facility incident logs logged on this branch.</p>
              </div>
            ) : (
              filteredTickets.map((t) => {
                const assignee = employees.find(e => e.id === t.assignedTo);
                return (
                  <motion.div 
                    key={t.id}
                    layoutId={`tick-${t.id}`}
                    className={cn(
                      "bg-zinc-950/50 border rounded-2xl p-4.5 hover:border-zinc-801 shadow-sm transition-all duration-300",
                      t.priority === 'critical' ? 'border-l-4 border-l-rose-500 border-zinc-805' : 
                      t.priority === 'high' ? 'border-l-4 border-l-orange-500 border-zinc-805' :
                      t.priority === 'medium' ? 'border-l-4 border-l-indigo-500 border-zinc-805' :
                      'border-l-4 border-l-zinc-500 border-zinc-805'
                    )}
                  >
                    <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-2.5 pb-2.5 border-b border-zinc-850/50">
                      <div>
                        <div className="flex items-center gap-2">
                          <span className={cn(
                            "px-2 py-0.5 rounded text-[9px] font-extrabold font-mono uppercase",
                            t.priority === 'critical' && "bg-rose-500/10 text-rose-400 border border-rose-500/20",
                            t.priority === 'high' && "bg-orange-500/10 text-orange-400 border border-orange-500/20",
                            t.priority === 'medium' && "bg-indigo-500/10 text-indigo-400 border border-indigo-505/20",
                            t.priority === 'low' && "bg-zinc-850 text-zinc-400 border border-zinc-705/50"
                          )}>
                            {t.priority} priority
                          </span>
                          <span className="text-[10px] text-zinc-500 font-semibold">{t.category}</span>
                        </div>
                        <h4 className="font-extrabold text-white text-sm mt-1">{t.title}</h4>
                      </div>

                      <div className="flex items-center gap-1.5 self-start sm:self-auto shrink-0 font-mono">
                        <span className={cn(
                          "w-2 h-2 rounded-full",
                          t.status === 'open' && "bg-blue-400 animate-pulse",
                          t.status === 'in-progress' && "bg-amber-400 animate-pulse",
                          t.status === 'resolved' && "bg-emerald-500"
                        )} />
                        <span className={cn(
                          "text-[10px] font-bold uppercase",
                          t.status === 'open' && "text-blue-400",
                          t.status === 'in-progress' && "text-amber-400",
                          t.status === 'resolved' && "text-emerald-500"
                        )}>
                          {t.status}
                        </span>
                      </div>
                    </div>

                    <p className="text-xs text-zinc-400 font-medium py-3 leading-relaxed">{t.description}</p>

                    <div className="flex flex-wrap items-center justify-between gap-3 bg-zinc-950/40 rounded-xl px-3 py-2.5 border border-zinc-900 leading-none">
                      <div className="text-[10px] text-zinc-500 font-semibold">
                        Log by <span className="text-zinc-300 font-bold capitalize">{t.memberName}</span> • {t.dateCreated}
                      </div>

                      <div className="flex items-center gap-2.5">
                        {/* Assign to support dropdown */}
                        {!t.assignedTo && t.status !== 'resolved' ? (
                          <div className="flex items-center gap-1.5">
                            <span className="text-[10px] text-zinc-550 font-bold uppercase">Assign Employee:</span>
                            <select 
                              onChange={(e) => assignTicket(t.id, e.target.value)}
                              className="bg-zinc-900 hover:bg-zinc-850 text-zinc-300 text-[10px] font-bold py-1 px-2 border border-zinc-800 rounded-lg focus:outline-none cursor-pointer"
                              defaultValue=""
                            >
                              <option value="" disabled>Select Staff</option>
                              {employees.filter(e => e.branchId === activeBranchId && e.status === 'active').map(e => (
                                <option key={e.id} value={e.id}>{e.name} ({e.role})</option>
                              ))}
                            </select>
                          </div>
                        ) : (
                          assignee && (
                            <span className="text-[10px] text-zinc-500 font-semibold flex items-center gap-1">
                              <User className="w-3 h-3 text-zinc-650" /> Handler: <b className="text-zinc-300 font-bold">{assignee.name}</b>
                            </span>
                          )
                        )}

                        {/* Complete control toggle */}
                        {t.status !== 'resolved' && (
                          <button
                            onClick={() => updateTicketStatus(t.id, 'resolved')}
                            className="px-2.5 py-1.5 bg-emerald-500/10 hover:bg-emerald-500 text-emerald-400 hover:text-white border border-emerald-500/20 rounded-md font-bold text-[9px] uppercase transition-all cursor-pointer"
                          >
                            Mark Resolved
                          </button>
                        )}
                      </div>
                    </div>
                  </motion.div>
                );
              })
            )}
          </div>
        </div>

        {/* Operational Task List: 1 col */}
        <div className="bg-zinc-900 border border-zinc-805 rounded-3xl p-6 shadow-lg h-full flex flex-col space-y-4">
          <div className="border-b border-zinc-805/50 pb-4 flex justify-between items-center">
            <div>
              <h3 className="font-extrabold text-zinc-100 text-sm flex items-center gap-2">
                <ClipboardCheck className="w-4 h-4 text-purple-400" /> Administrative Tasks
              </h3>
              <p className="text-[11px] text-zinc-500">Facility dispatch jobs assigned to on-duty staff</p>
            </div>
            <span className="text-[10px] font-mono font-bold text-zinc-500 bg-zinc-950 px-2 py-0.5 border border-zinc-850 rounded">
              {tasks.filter(t => t.status !== 'done').length} Pending
            </span>
          </div>

          <div className="space-y-3 overflow-y-auto max-h-[480px]">
            {tasks.map((task) => {
              const handler = employees.find(e => e.id === task.assignedTo);
              const isChecked = task.status === 'done';
              return (
                <div 
                  key={task.id}
                  className={cn(
                    "p-3.5 bg-zinc-950/40 border border-zinc-850/80 rounded-2xl flex items-start gap-3 transition-opacity",
                    isChecked ? "opacity-50" : "hover:border-zinc-800"
                  )}
                >
                  <button
                    onClick={() => updateTaskStatus(task.id, isChecked ? 'todo' : 'done')}
                    className={cn(
                      "w-4 h-4 rounded-md border mt-0.5 shrink-0 flex items-center justify-center transition-all cursor-pointer",
                      isChecked 
                        ? "bg-purple-500 border-purple-500 text-white" 
                        : "border-zinc-705 bg-transparent hover:border-zinc-500"
                    )}
                  >
                    {isChecked && <Check className="w-3 h-3" />}
                  </button>

                  <div className="space-y-1 min-w-0 flex-1 leading-none">
                    <h4 className={cn(
                      "text-xs font-bold text-zinc-200 truncate",
                      isChecked ? "line-through text-zinc-500" : ""
                    )}>
                      {task.title}
                    </h4>
                    {task.description && (
                      <p className="text-[11px] text-zinc-500 font-medium leading-normal">{task.description}</p>
                    )}

                    <div className="flex items-center gap-1.5 text-[10px] text-zinc-550 pt-2 font-semibold">
                      <span>Due: <b className="text-zinc-400">{task.dueDate}</b></span>
                      <span>•</span>
                      {handler && <span className="truncate">Assignee: <b className="text-zinc-400 capitalize">{handler.name}</b></span>}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>

      {/* Slide-Up Modals for Ticket & Task */}
      <AnimatePresence>
        {isNewTicketOpen && (
          <>
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 0.5 }}
              exit={{ opacity: 0 }}
              onClick={() => setIsNewTicketOpen(false)}
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
                  <h3 className="text-xl font-display font-bold text-white">Log Service Incident</h3>
                  <p className="text-xs text-zinc-500 mt-1 font-medium">Coordinate physical space issue remediation</p>
                </div>
                <button 
                  onClick={() => setIsNewTicketOpen(false)}
                  className="w-8 h-8 rounded-full bg-zinc-900 border border-zinc-800 text-zinc-400 hover:text-white flex items-center justify-center cursor-pointer transition-colors"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>

              <form onSubmit={handleSubmitTicket} className="space-y-4">
                <div className="space-y-1.5">
                  <label className="text-[10px] font-bold text-zinc-400 uppercase tracking-widest block">Issue Title / Summary</label>
                  <input 
                    type="text" required
                    placeholder="e.g. Printer offline on Floor 2 North"
                    value={ticketTitle}
                    onChange={(e) => setTicketTitle(e.target.value)}
                    className="w-full bg-zinc-900 border border-zinc-800 rounded-xl py-2.5 px-3 text-xs text-zinc-200 font-semibold focus:outline-none focus:ring-1 focus:ring-brand-500/50"
                  />
                </div>

                <div className="space-y-1.5">
                  <label className="text-[10px] font-bold text-zinc-400 uppercase tracking-widest block">Filing Member Name</label>
                  <input 
                    type="text" required
                    placeholder="e.g. Sarah Jenkins"
                    value={ticketMember}
                    onChange={(e) => setTicketMember(e.target.value)}
                    className="w-full bg-zinc-900 border border-zinc-800 rounded-xl py-2.5 px-3 text-xs text-zinc-200 font-semibold focus:outline-none focus:ring-1 focus:ring-brand-500/50"
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-1.5">
                    <label className="text-[10px] font-bold text-zinc-400 uppercase tracking-widest block">Category</label>
                    <select 
                      value={ticketCategory}
                      onChange={(e) => setTicketCategory(e.target.value as any)}
                      className="w-full bg-zinc-900 border border-zinc-800 rounded-xl py-2.5 px-3 text-xs text-zinc-300 font-semibold focus:outline-none cursor-pointer"
                    >
                      <option value="WiFi/Network">WiFi / Network</option>
                      <option value="Facilities">Facilities & HVAC</option>
                      <option value="Cleaning">Cleaning & Restrooms</option>
                      <option value="Access Control">Access & Doors Kisi</option>
                      <option value="Other">Other Inquiries</option>
                    </select>
                  </div>

                  <div className="space-y-1.5">
                    <label className="text-[10px] font-bold text-zinc-400 uppercase tracking-widest block">Priority Tier</label>
                    <select 
                      value={ticketPriority}
                      onChange={(e) => setTicketPriority(e.target.value as any)}
                      className="w-full bg-zinc-900 border border-zinc-800 rounded-xl py-2.5 px-3 text-xs text-zinc-350 font-semibold focus:outline-none cursor-pointer"
                    >
                      <option value="low">Low Priority</option>
                      <option value="medium">Medium Priority</option>
                      <option value="high">High priority</option>
                      <option value="critical">Critical / Outage</option>
                    </select>
                  </div>
                </div>

                <div className="space-y-1.5">
                  <label className="text-[10px] font-bold text-zinc-400 uppercase tracking-widest block">Detailed Incident Description</label>
                  <textarea 
                    rows={3}
                    placeholder="Input detailed telemetry or occupant complaints..."
                    value={ticketDesc}
                    onChange={(e) => setTicketDesc(e.target.value)}
                    className="w-full bg-zinc-900 border border-zinc-800 rounded-xl py-2.5 px-3 text-xs text-zinc-200 focus:outline-none focus:ring-1 focus:ring-brand-500/50"
                  />
                </div>

                <div className="flex pt-4 gap-3">
                  <button
                    type="button"
                    onClick={() => setIsNewTicketOpen(false)}
                    className="flex-1 py-3 text-xs font-bold bg-zinc-900 text-zinc-450 border border-zinc-800 rounded-xl font-sans"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="flex-1 py-3 text-xs font-bold text-white bg-brand-500 hover:bg-brand-600 rounded-xl shadow-md cursor-pointer"
                  >
                    Log Incident Node
                  </button>
                </div>
              </form>
            </motion.div>
          </>
        )}

        {isNewTaskOpen && (
          <>
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 0.5 }}
              exit={{ opacity: 0 }}
              onClick={() => setIsNewTaskOpen(false)}
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
                  <h3 className="text-xl font-display font-bold text-white">Create Operational Dispatch</h3>
                  <p className="text-xs text-zinc-500 mt-1 font-medium">Assign a critical cleaning, IT support, or layout task</p>
                </div>
                <button 
                  onClick={() => setIsNewTaskOpen(false)}
                  className="w-8 h-8 rounded-full bg-zinc-900 border border-zinc-800 text-zinc-400 hover:text-white flex items-center justify-center cursor-pointer transition-colors"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>

              <form onSubmit={handleSubmitTask} className="space-y-4">
                <div className="space-y-1.5">
                  <label className="text-[10px] font-bold text-zinc-400 uppercase tracking-widest block font-sans">Task Name / Job</label>
                  <input 
                    type="text" required
                    placeholder="e.g. Complete floor scrubbing Level 1"
                    value={taskTitle}
                    onChange={(e) => setTaskTitle(e.target.value)}
                    className="w-full bg-zinc-900 border border-zinc-800 rounded-xl py-2.5 px-3 text-xs text-zinc-200 font-semibold focus:outline-none focus:ring-1 focus:ring-brand-500/50"
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-1.5">
                    <label className="text-[10px] font-bold text-zinc-400 uppercase tracking-widest block font-sans">Assign Handler (Staff)</label>
                    <select 
                      required
                      value={taskAssignee}
                      onChange={(e) => setTaskAssignee(e.target.value)}
                      className="w-full bg-zinc-900 border border-zinc-800 rounded-xl py-2.5 px-3 text-xs text-zinc-300 font-semibold focus:outline-none cursor-pointer"
                    >
                      <option value="" disabled>Select Employee</option>
                      {employees.filter(e => e.branchId === activeBranchId).map(e => (
                        <option key={e.id} value={e.id}>{e.name} ({e.role})</option>
                      ))}
                    </select>
                  </div>

                  <div className="space-y-1.5">
                    <label className="text-[10px] font-bold text-zinc-400 uppercase tracking-widest block font-sans">Due Coordinate</label>
                    <input 
                      type="text"
                      placeholder="e.g. May 30, 2026"
                      value={taskDue}
                      onChange={(e) => setTaskDue(e.target.value)}
                      className="w-full bg-zinc-900 border border-zinc-800 rounded-xl py-2.5 px-3 text-xs text-zinc-200 focus:outline-none focus:ring-1 focus:ring-brand-500/50"
                    />
                  </div>
                </div>

                <div className="space-y-1.5">
                  <label className="text-[10px] font-bold text-zinc-400 uppercase tracking-widest block font-sans">Short Instruction details</label>
                  <textarea 
                    rows={2}
                    placeholder="Short coordinates or specifications..."
                    value={taskDesc}
                    onChange={(e) => setTaskDesc(e.target.value)}
                    className="w-full bg-zinc-900 border border-zinc-800 rounded-xl py-2.5 px-3 text-xs text-zinc-200 focus:outline-none focus:ring-1 focus:ring-brand-500/50"
                  />
                </div>

                <div className="flex pt-4 gap-3">
                  <button
                    type="button"
                    onClick={() => setIsNewTaskOpen(false)}
                    className="flex-1 py-3 text-xs font-bold bg-zinc-900 text-zinc-450 border border-zinc-800 rounded-xl font-sans"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="flex-1 py-3 text-xs font-bold text-white bg-purple-500 hover:bg-purple-600 rounded-xl shadow-md cursor-pointer"
                  >
                    Dispatch job Node
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
