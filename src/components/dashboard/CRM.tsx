import React, { useState, useRef, useEffect } from 'react';
import { useStore } from '@/store';
import { motion, AnimatePresence } from 'motion/react';
import { 
  MoreHorizontal, Plus, Search, Trash2, ArrowRight, ArrowLeft, 
  Mail, Building2, User, DollarSign, X, ChevronDown, Check, 
  FileText, ClipboardList, CheckCircle2, UserCheck, BarChart2, Briefcase, FileSignature, HelpCircle 
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { Lead, ClientOnboarding, Proposal } from '@/types';
import { computeLeadScores, getLeadScoreForId } from '@/lib/intelligence';

const STAGES = ['new', 'contacted', 'qualified', 'proposal', 'negotiation', 'won', 'lost'] as const;

export function CRM() {
  const { 
    leads, addLead, updateLeadStage, deleteLead,
    onboardings, toggleOnboardingStep, completeOnboarding,
    proposals, addProposal, updateProposalStatus
  } = useStore();

  const [activeSubTab, setActiveSubTab] = useState<'pipeline' | 'onboarding' | 'proposals'>('pipeline');
  const [searchTerm, setSearchTerm] = useState('');
  const [isNewLeadOpen, setIsNewLeadOpen] = useState(false);
  const [isNewProposalOpen, setIsNewProposalOpen] = useState(false);
  
  // New Lead Form State
  const [name, setName] = useState('');
  const [company, setCompany] = useState('');
  const [email, setEmail] = useState('');
  const [value, setValue] = useState('5000');
  const [stage, setStage] = useState<Lead['stage']>('new');

  // New Proposal Form State
  const [propLeadName, setPropLeadName] = useState('');
  const [propCompany, setPropCompany] = useState('');
  const [propDeskType, setPropDeskType] = useState<'hot-desk' | 'dedicated' | 'private-office' | 'meeting-room'>('dedicated');
  const [propMonthlyFee, setPropMonthlyFee] = useState(399);
  const [propDuration, setPropDuration] = useState(6);

  // Custom premium dropdown open/close state
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsDropdownOpen(false);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  // Filter leads based on search term
  const filteredLeads = leads.filter(l => 
    l.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    l.company.toLowerCase().includes(searchTerm.toLowerCase()) ||
    l.email.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const groupedLeads = STAGES.reduce((acc, currentStage) => {
    acc[currentStage] = filteredLeads.filter(l => l.stage === currentStage);
    return acc;
  }, {} as Record<string, Lead[]>);

  // Calculate stats
  const totalPipelineVal = filteredLeads.reduce((acc, l) => acc + l.value, 0);
  const leadScores = computeLeadScores(leads);
  const hotLeadCount = leadScores.filter((s) => s.tier === 'hot').length;

  const handleSubmitLead = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name || !company || !email) return;
    
    addLead({
      name,
      company,
      email,
      value: Number(value) || 0,
      stage
    });

    // Reset Form
    setName('');
    setCompany('');
    setEmail('');
    setValue('5000');
    setStage('new');
    setIsNewLeadOpen(false);
  };

  const promoteLead = (id: string, currentStage: Lead['stage']) => {
    const currentIndex = STAGES.indexOf(currentStage);
    if (currentIndex < STAGES.length - 1) {
      updateLeadStage(id, STAGES[currentIndex + 1]);
    }
  };

  const demoteLead = (id: string, currentStage: Lead['stage']) => {
    const currentIndex = STAGES.indexOf(currentStage);
    if (currentIndex > 0) {
      updateLeadStage(id, STAGES[currentIndex - 1]);
    }
  };

  const handleCreateProposal = (e: React.FormEvent) => {
    e.preventDefault();
    if (!propLeadName || !propCompany) return;

    addProposal({
      leadName: propLeadName,
      company: propCompany,
      deskType: propDeskType,
      monthlyFee: Number(propMonthlyFee),
      durationMonths: Number(propDuration)
    });

    setPropLeadName('');
    setPropCompany('');
    setPropDeskType('dedicated');
    setPropMonthlyFee(399);
    setPropDuration(6);
    setIsNewProposalOpen(false);
  };

  return (
    <div className="flex flex-col h-full space-y-6 relative">
      
      {/* Tab Selectors & Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 shrink-0">
        <div>
          <h1 className="text-3xl font-display font-bold text-zinc-100 tracking-tight">CRM & Client Experience</h1>
          <p className="text-zinc-500 text-sm mt-1">Direct inquiries, automate leases, and guide checklists seamlessly.</p>
        </div>

        {/* Tab Selection Row */}
        <div className="flex bg-zinc-950/80 p-1 border border-zinc-805 rounded-2xl select-none leading-none items-center gap-1 shrink-0 font-sans">
          {[
            { id: 'pipeline', label: 'Lead Pipeline', icon: Briefcase },
            { id: 'onboarding', label: 'Client Onboarding', icon: ClipboardList },
            { id: 'proposals', label: 'Quotations & Proposals', icon: FileSignature },
          ].map((tab) => {
            const isActive = activeSubTab === tab.id;
            return (
              <button
                key={tab.id}
                onClick={() => setActiveSubTab(tab.id as any)}
                className={cn(
                  "px-4.5 py-2.5 rounded-xl text-xs font-black transition-all cursor-pointer leading-none flex items-center gap-2",
                  isActive 
                    ? "bg-zinc-850 text-white font-black shadow-inner" 
                    : "text-zinc-500 hover:text-zinc-400"
                )}
              >
                <tab.icon className="w-3.5 h-3.5" />
                <span>{tab.label}</span>
              </button>
            );
          })}
        </div>
      </div>

      {/* Active Inner Sub-Tab rendering block */}
      {activeSubTab === 'pipeline' && (
        <>
          {/* CRM Header Actions */}
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 shrink-0">
            <div>
              <div className="flex items-center gap-2">
                <h3 className="text-base font-extrabold text-zinc-100">Live Stage Board</h3>
                <span className="text-xs font-mono font-bold text-brand-500 bg-brand-500/10 px-2.5 py-0.5 rounded-full">
                  Total ARR Pip: ${totalPipelineVal.toLocaleString()}
                </span>
                {hotLeadCount > 0 && (
                  <span className="text-xs font-mono font-bold text-emerald-400 bg-emerald-500/10 px-2.5 py-0.5 rounded-full">
                    {hotLeadCount} AI hot lead{hotLeadCount !== 1 ? 's' : ''}
                  </span>
                )}
              </div>
            </div>

            <div className="flex items-center gap-3">
              <div className="relative w-full sm:w-64">
                <Search className="w-4 h-4 text-zinc-500 absolute left-3.5 top-1/2 -translate-y-1/2" />
                <input 
                  type="text" 
                  placeholder="Search leads, companies..." 
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full bg-zinc-900 border border-zinc-805 rounded-full py-2 pr-4 pl-10 text-xs font-semibold text-zinc-100 placeholder:text-zinc-500 focus:outline-none focus:ring-2 focus:ring-brand-500/20 focus:border-brand-500 transition-all shadow-sm"
                />
              </div>

              <button 
                onClick={() => setIsNewLeadOpen(true)}
                className="flex items-center gap-2 bg-brand-500 hover:bg-brand-600 shadow-md hover:shadow-brand-500/20 text-white px-5 py-2.5 rounded-full font-bold text-xs leading-none shrink-0 transition-all active:scale-95 cursor-pointer"
              >
                <Plus className="w-4 h-4" />
                Add Lead
              </button>
            </div>
          </div>

          {/* Board Columns Grid */}
          <div className="flex-1 overflow-x-auto min-h-0 pb-4 flex gap-6 scroll-smooth select-none">
            {STAGES.slice(0, 5).map((currentStage, i) => {
              const leadsInStage = groupedLeads[currentStage] || [];
              const stageTotal = leadsInStage.reduce((sum, l) => sum + l.value, 0);

              return (
                <div key={currentStage} className="flex flex-col min-w-[320px] max-w-[320px] h-full shrink-0">
                  <div className="flex items-center justify-between mb-4 px-2">
                    <div className="flex items-center gap-2">
                      <span className={cn(
                        "w-2.5 h-2.5 rounded-full shadow-[0_0_8px_rgba(255,255,255,0.1)]",
                        i === 0 ? "bg-zinc-500" : i === 1 ? "bg-blue-500" : i === 2 ? "bg-indigo-500" : i === 3 ? "bg-purple-500" : "bg-brand-500"
                      )} />
                      <h3 className="text-sm font-bold text-zinc-200 capitalize tracking-tight">
                        {currentStage}
                      </h3>
                      <span className="text-[10px] font-mono font-bold text-zinc-500 bg-zinc-900 px-2 py-0.5 rounded">
                        {leadsInStage.length}
                      </span>
                    </div>
                    <span className="text-[11px] font-mono font-bold text-zinc-550">${stageTotal.toLocaleString()}</span>
                  </div>
                  
                  <div className="flex-1 rounded-3xl p-3 bg-zinc-950/40 flex flex-col gap-3.5 overflow-y-auto border border-zinc-805 shadow-inner max-h-[calc(100vh-18rem)]">
                    {leadsInStage.length === 0 ? (
                      <div className="flex-1 flex flex-col items-center justify-center py-12 text-center text-zinc-700">
                        <Building2 className="w-8 h-8 opacity-40 mb-2" />
                        <span className="text-xs font-semibold">Column empty</span>
                      </div>
                    ) : (
                      leadsInStage.map((lead, idx) => {
                        const score = getLeadScoreForId(leads, lead.id);
                        return (
                        <motion.div
                          key={lead.id}
                          initial={{ opacity: 0, y: 12 }}
                          animate={{ opacity: 1, y: 0 }}
                          transition={{ delay: idx * 0.05 }}
                          whileHover={{ y: -2 }}
                          className="bg-zinc-900 border border-zinc-805 p-5 rounded-2xl shadow-sm group hover:border-brand-500/30 transition-all duration-200 relative"
                        >
                          <div className="flex justify-between items-start mb-1">
                            <h4 className="font-bold text-zinc-100 group-hover:text-white transition-colors text-sm">{lead.name}</h4>
                            <div className="flex items-center gap-1.5">
                              {score && lead.stage !== 'won' && lead.stage !== 'lost' && (
                                <span
                                  className={cn(
                                    'text-[9px] font-black uppercase px-2 py-0.5 rounded-md',
                                    score.tier === 'hot' && 'bg-brand-500/15 text-brand-400',
                                    score.tier === 'warm' && 'bg-amber-500/15 text-amber-400',
                                    score.tier === 'cold' && 'bg-zinc-800 text-zinc-500'
                                  )}
                                  title={score.factors.join(', ')}
                                >
                                  {score.score}
                                </span>
                              )}
                            <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                              <button 
                                onClick={() => deleteLead(lead.id)}
                                className="p-1 text-zinc-650 hover:text-brand-500 transition-colors rounded-lg bg-zinc-950/40 hover:bg-zinc-950"
                                title="Remove lead"
                              >
                                <Trash2 className="w-3.5 h-3.5" />
                              </button>
                            </div>
                            </div>
                          </div>
                          <p className="text-xs font-medium text-zinc-400 mb-2">{lead.company}</p>
                          
                          <div className="flex items-center gap-1.5 text-[11px] text-zinc-500 font-medium mb-4">
                            <Mail className="w-3 h-3 text-zinc-650 shrink-0" />
                            <span className="truncate">{lead.email}</span>
                          </div>

                          <div className="flex items-center justify-between border-t border-zinc-850 pt-3.5 mt-auto">
                            <span className="text-xs font-bold text-zinc-250 bg-zinc-950 border border-zinc-805 px-2.5 py-1 rounded-lg">
                              ${lead.value.toLocaleString()}
                            </span>

                            {/* Stage Controls */}
                            <div className="flex items-center gap-1">
                              {i > 0 && (
                                <button 
                                  onClick={() => demoteLead(lead.id, lead.stage)}
                                  className="p-1 bg-zinc-950/40 hover:bg-brand-500/10 hover:text-brand-400 text-zinc-500 border border-zinc-805 rounded-lg transition-colors cursor-pointer"
                                  title="Shift back"
                                >
                                  <ArrowLeft className="w-3.5 h-3.5" />
                                </button>
                              )}
                              {i < STAGES.length - 1 && (
                                <button 
                                  onClick={() => promoteLead(lead.id, lead.stage)}
                                  className="p-1 bg-zinc-950/40 hover:bg-brand-500/10 hover:text-brand-400 text-zinc-500 border border-zinc-805 rounded-lg transition-colors cursor-pointer"
                                  title="Advance state"
                                >
                                  <ArrowRight className="w-3.5 h-3.5" />
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
              );
            })}
          </div>
        </>
      )}

      {activeSubTab === 'onboarding' && (
        <div className="grid grid-cols-1 xl:grid-cols-3 gap-6 items-start">
          <div className="xl:col-span-2 bg-zinc-900 border border-zinc-805 rounded-3xl p-6 shadow-lg space-y-4">
            <div>
              <h3 className="font-extrabold text-zinc-150 text-sm">Lease Onboarding Workflows</h3>
              <p className="text-[11px] text-zinc-500">Ensure keys, welcome letters, and security checks are locked before desk move-in</p>
            </div>

            <div className="space-y-4">
              {onboardings.length === 0 ? (
                <div className="py-12 text-center text-zinc-600">
                  <UserCheck className="w-10 h-10 mx-auto opacity-30 mb-3" />
                  <p className="text-xs">No active welcome onboarding workflows running.</p>
                </div>
              ) : (
                onboardings.map((onb) => (
                  <div key={onb.id} className="p-5 bg-zinc-950/40 border border-zinc-850 rounded-2xl space-y-4 shadow-sm">
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-zinc-900 pb-3 leading-none">
                      <div>
                        <span className="text-[9px] font-mono font-bold text-zinc-500 uppercase">ONBOARDING ID: {onb.id}</span>
                        <h4 className="font-extrabold text-white text-sm py-1 capitalize">{onb.clientName}</h4>
                        <p className="text-[11px] text-zinc-400">{onb.companyName} • {onb.email}</p>
                      </div>

                      {/* Status indicator badge */}
                      <span className={cn(
                        "px-2.5 py-1 text-[9px] font-black uppercase rounded-lg border leading-none self-start sm:self-auto",
                        onb.status === 'completed' 
                          ? "bg-emerald-500/10 text-emerald-400 border-emerald-500/20" 
                          : "bg-amber-500/10 text-amber-400 border border-amber-500/20"
                      )}>
                        {onb.status}
                      </span>
                    </div>

                    {/* Stepper bar progress */}
                    <div className="space-y-1.5 leading-none">
                      <div className="flex justify-between text-[10px] font-bold">
                        <span className="text-zinc-500 text-[10px] tracking-wide">TASK COMPLETION STAGES</span>
                        <span className="text-brand-450 font-mono font-black">{onb.progress}% COMPLETED</span>
                      </div>
                      <div className="w-full bg-zinc-900 rounded-full h-2 overflow-hidden border border-zinc-850">
                        <div 
                          className="bg-brand-500 h-full rounded-full transition-all duration-500" 
                          style={{ width: `${onb.progress}%` }}
                        />
                      </div>
                    </div>

                    {/* Step lists with toggle controls */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-3.5 pt-1">
                      {onb.steps.map((step) => (
                        <div 
                          key={step.id} 
                          onClick={() => toggleOnboardingStep(onb.id, step.id)}
                          className={cn(
                            "flex items-start gap-2.5 p-3 rounded-xl border transition-all cursor-pointer",
                            step.completed 
                              ? "bg-zinc-950 border-zinc-850/40 opacity-60" 
                              : "bg-zinc-900 border-zinc-850 hover:bg-zinc-850 hover:border-zinc-705"
                          )}
                        >
                          <span className={cn(
                            "w-4.5 h-4.5 rounded-md border mt-0.5 shrink-0 flex items-center justify-center transition-all",
                            step.completed ? "bg-brand-500 border-brand-500 text-white" : "border-zinc-705"
                          )}>
                            {step.completed && <Check className="w-3 h-3" />}
                          </span>
                          <span className={cn(
                            "text-[10px] font-bold leading-normal",
                            step.completed ? "line-through text-zinc-500" : "text-zinc-300"
                          )}>
                            {step.label}
                          </span>
                        </div>
                      ))}
                    </div>

                    {/* Auto Complete action */}
                    {onb.status !== 'completed' && (
                      <div className="flex justify-end pt-1">
                        <button
                          onClick={() => completeOnboarding(onb.id)}
                          className="px-4 py-2 bg-brand-500 hover:bg-brand-600 text-white font-extrabold text-[10px] rounded-xl cursor-pointer uppercase tracking-tight shadow-md"
                        >
                          Auto-Complete All Steps
                        </button>
                      </div>
                    )}
                  </div>
                ))
              )}
            </div>
          </div>

          {/* Quick onboarding guidelines Card */}
          <div className="bg-zinc-900 border border-zinc-805 rounded-3xl p-6 shadow-lg space-y-4">
            <h4 className="font-extrabold text-zinc-200 text-sm">ERP Process Engine</h4>
            <p className="text-xs text-zinc-400 leading-relaxed font-sans font-medium">
              Every lease allocated via the interactive Floor Map dynamically generates an isolated Client Onboarding workflow. This binds smart entries, Slack logs, and Stripe leases within a unified customer path.
            </p>

            <div className="bg-zinc-950 p-4 rounded-xl border border-zinc-850 space-y-3 font-mono text-[10px] leading-relaxed text-zinc-500">
              <span className="text-[8px] font-black text-brand-550 block">CO-WORKING ENGINE TRIGGERS:</span>
              <div>1. Desk Booked → Onboarding Init</div>
              <div>2. Kisi Node Setup → Door Access log</div>
              <div>3. Deposit paid → First invoice generated</div>
            </div>
          </div>
        </div>
      )}

      {activeSubTab === 'proposals' && (
        <div className="grid grid-cols-1 xl:grid-cols-3 gap-6 items-start">
          
          {/* Proposals List table cols */}
          <div className="xl:col-span-2 bg-zinc-900 border border-zinc-805 rounded-3xl p-6 shadow-lg space-y-4">
            <div className="flex items-center justify-between border-b border-zinc-850 pb-4">
              <div>
                <h3 className="font-extrabold text-zinc-150 text-sm">Quotations & Active Proposals</h3>
                <p className="text-[11px] text-zinc-500">Track sent lease pricing contracts for major qualified leads</p>
              </div>

              <button
                onClick={() => setIsNewProposalOpen(true)}
                className="flex items-center gap-1.5 bg-brand-500 hover:bg-brand-600 text-white px-3.5 py-2 rounded-xl text-[10px] font-extrabold shrink-0 cursor-pointer shadow-md"
              >
                <Plus className="w-3.5 h-3.5" />
                Dispatch Proposal
              </button>
            </div>

            <div className="space-y-4 max-h-[480px] overflow-y-auto">
              {proposals.map((prop) => (
                <div key={prop.id} className="p-4.5 bg-zinc-950/45 border border-zinc-850 rounded-2xl flex flex-col sm:flex-row sm:items-center justify-between gap-4 shadow-sm text-xs leading-none">
                  <div className="space-y-2">
                    <div className="flex items-center gap-2">
                      <span className="text-[9px] font-mono font-bold text-zinc-550">PROPOSAL #{prop.id.toUpperCase()}</span>
                      <span className={cn(
                        "px-2 py-0.5 rounded text-[8px] font-extrabold uppercase border",
                        prop.status === 'accepted' ? "bg-emerald-500/10 text-emerald-400 border-emerald-500/20" :
                        prop.status === 'sent' ? "bg-blue-500/10 text-blue-400 border border-blue-500/10" :
                        "bg-zinc-800 text-zinc-500 border-zinc-750"
                      )}>
                        {prop.status}
                      </span>
                    </div>

                    <h4 className="font-extrabold text-zinc-100 text-sm capitalize">{prop.leadName}</h4>
                    <p className="text-[11px] text-zinc-400">{prop.company} • Created {prop.dateCreated}</p>
                  </div>

                  {/* Lease spec brief details */}
                  <div className="grid grid-cols-2 bg-zinc-950/70 p-3.5 rounded-xl border border-zinc-900/60 leading-normal text-left min-w-[170px] shrink-0">
                    <div>
                      <span className="text-[8px] text-zinc-500 font-extrabold block">WORKSPACE TYPE</span>
                      <span className="text-[10px] font-bold text-zinc-250 capitalize">{prop.deskType.replace('-',' ')}</span>
                    </div>
                    <div>
                      <span className="text-[8px] text-zinc-500 font-extrabold block">MONTHLY ARR / TERM</span>
                      <span className="text-[10px] font-bold text-zinc-250 font-mono">${prop.monthlyFee}/mo ({prop.durationMonths}m)</span>
                    </div>
                  </div>

                  {/* Accept/Decline status buttons */}
                  <div className="flex items-center gap-1.5 shrink-0 self-start sm:self-auto min-w-[120px] justify-end">
                    {prop.status === 'sent' && (
                      <>
                        <button
                          onClick={() => updateProposalStatus(prop.id, 'accepted')}
                          className="p-1 px-3 bg-emerald-500/15 hover:bg-emerald-500 text-emerald-400 hover:text-white border border-emerald-500/30 text-[9px] font-black uppercase rounded-lg cursor-pointer transition-all duration-200 active:scale-95 shadow-[0_0_12px_rgba(16,185,129,0.1)] hover:shadow-[0_0_15px_rgba(16,185,129,0.25)]"
                        >
                          Accept
                        </button>
                        <button
                          onClick={() => updateProposalStatus(prop.id, 'declined')}
                          className="p-1 px-3 bg-rose-500/10 hover:bg-rose-500 text-rose-400 hover:text-white border border-rose-500/20 text-[9px] font-black uppercase rounded-lg cursor-pointer transition-all duration-200 active:scale-95 shadow-[0_0_12px_rgba(239,68,68,0.05)] hover:shadow-[0_0_15px_rgba(239,68,68,0.2)]"
                        >
                          Decline
                        </button>
                      </>
                    )}
                    {prop.status === 'accepted' && (
                      <button
                        onClick={() => setActiveSubTab('onboarding')}
                        className="p-1 px-3 bg-brand-500/20 hover:bg-brand-500 text-brand-405 hover:text-white border border-brand-500/30 text-[9px] font-black uppercase rounded-lg cursor-pointer transition-all duration-200 active:scale-95 shadow-[0_0_12px_rgba(139,92,246,0.1)] hover:shadow-brand-500/20"
                      >
                        View Onboarding
                      </button>
                    )}
                    {prop.status === 'draft' && (
                      <button
                        onClick={() => updateProposalStatus(prop.id, 'sent')}
                        className="p-1 px-3 bg-blue-500/20 hover:bg-blue-500 text-blue-400 hover:text-white border border-blue-500/30 text-[9px] font-black uppercase rounded-lg cursor-pointer transition-all duration-200 active:scale-95 shadow-[0_0_12px_rgba(59,130,246,0.1)] hover:shadow-[0_0_15px_rgba(59,130,246,0.25)]"
                      >
                        Send Proposal
                      </button>
                    )}
                    {prop.status === 'declined' && (
                      <button
                        onClick={() => updateProposalStatus(prop.id, 'sent')}
                        className="p-1 px-3 bg-zinc-800/60 hover:bg-zinc-700 text-zinc-400 hover:text-white border border-zinc-750 text-[9px] font-black uppercase rounded-lg cursor-pointer transition-all duration-200 active:scale-95"
                      >
                        Retry Proposal
                      </button>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Quotations summary panel */}
          <div className="bg-zinc-900 border border-zinc-805 rounded-3xl p-6 shadow-lg space-y-4">
            <h4 className="font-extrabold text-zinc-200 text-sm">Contract Conversions</h4>
            <p className="text-xs text-zinc-400 leading-relaxed font-sans font-medium">
              Accepting a Quotation automatically initiates lease deposit setups, updates system pipelines to Won status, and dispatches dynamic onboarding keys to the client.
            </p>

            <div className="p-4 bg-zinc-950 rounded-2xl border border-zinc-850 space-y-3 leading-none font-mono text-[11px] text-zinc-500">
              <span className="text-[8px] font-bold text-zinc-400 block uppercase">Conversion Summary:</span>
              <div className="flex justify-between">
                <span>Sent proposals:</span>
                <span className="text-white font-bold">{proposals.length}</span>
              </div>
              <div className="flex justify-between">
                <span>Accepted ratios:</span>
                <span className="text-emerald-450 font-bold">72% conversion</span>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Slide-Up Overlay Modal for Adding Leads */}
      <AnimatePresence>
        {isNewLeadOpen && (
          <>
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 0.5 }}
              exit={{ opacity: 0 }}
              onClick={() => setIsNewLeadOpen(false)}
              className="absolute inset-0 bg-[#000] z-40 rounded-3xl"
            />
            
            <motion.div 
              initial={{ opacity: 0, y: 50, scale: 0.95 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: 30, scale: 0.95 }}
              transition={{ type: "spring", damping: 25, stiffness: 220 }}
              className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-full max-w-lg bg-zinc-950 border border-zinc-800 rounded-3xl p-8 z-50 shadow-2xl"
            >
              <div className="flex items-center justify-between mb-6">
                <div>
                  <h3 className="text-xl font-display font-bold text-white">Create Lead Journey</h3>
                  <p className="text-xs text-zinc-500">Initiate a qualified business pipeline node</p>
                </div>
                <button 
                  onClick={() => setIsNewLeadOpen(false)}
                  className="w-8 h-8 rounded-full bg-zinc-900 border border-zinc-800 text-zinc-400 hover:text-white flex items-center justify-center cursor-pointer transition-colors"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>

              <form onSubmit={handleSubmitLead} className="space-y-5">
                <div className="space-y-1.5">
                  <label className="text-[11px] font-bold text-zinc-404 uppercase tracking-widest flex items-center gap-1.5 font-sans">
                    <User className="w-3.5 h-3.5 text-brand-500/80" /> Lead Contact Name
                  </label>
                  <input 
                    type="text"
                    required
                    placeholder="e.g. Richard Hendricks"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    className="w-full bg-zinc-900/60 border border-zinc-800/80 rounded-xl py-3 px-4 text-xs text-zinc-150 placeholder:text-zinc-600 focus:outline-none focus:ring-2 focus:ring-brand-500/20 focus:border-brand-500 transition-all font-semibold"
                  />
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-5 text-sans text-xs">
                  <div className="space-y-1.5">
                    <label className="text-[11px] font-bold text-zinc-404 uppercase tracking-widest flex items-center gap-1.5">
                      <Building2 className="w-3.5 h-3.5 text-brand-500/80" /> Company / Corp
                    </label>
                    <input 
                      type="text"
                      required
                      placeholder="e.g. Pied Piper"
                      value={company}
                      onChange={(e) => setCompany(e.target.value)}
                      className="w-full bg-zinc-900/60 border border-zinc-800/80 rounded-xl py-2.5 px-3.5 text-xs text-zinc-150 placeholder:text-zinc-600 focus:outline-none focus:ring-1 focus:ring-brand-500/50 transition-all font-semibold"
                    />
                  </div>

                  <div className="space-y-1.5">
                    <label className="text-[11px] font-bold text-zinc-404 uppercase tracking-widest flex items-center gap-1.5">
                      <Mail className="w-3.5 h-3.5 text-brand-500/80" /> Email Address
                    </label>
                    <input 
                      type="email"
                      required
                      placeholder="e.g. richard@piedpiper.com"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      className="w-full bg-zinc-900/60 border border-zinc-800/80 rounded-xl py-2.5 px-3.5 text-xs text-zinc-150 placeholder:text-zinc-600 focus:outline-none focus:ring-1 focus:ring-brand-500/50 transition-all font-semibold"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-5 text-xs font-sans">
                  <div className="space-y-1.5 font-sans justify-center">
                    <label className="text-[11px] font-bold text-zinc-404 uppercase tracking-widest block font-sans">Expected ARR Value</label>
                    <input 
                      type="number"
                      placeholder="5000"
                      value={value}
                      onChange={(e) => setValue(e.target.value)}
                      className="w-full bg-zinc-900/60 border border-zinc-800/80 rounded-xl py-2.5 px-3.5 text-xs text-zinc-150 placeholder:text-zinc-600 focus:outline-none font-mono font-bold"
                    />
                  </div>

                  <div className="space-y-1.5" ref={dropdownRef}>
                    <label className="text-[11px] font-bold text-zinc-404 uppercase tracking-widest block font-sans">Initial Pipeline Phase</label>
                    <div className="relative">
                      <select
                        aria-label="Initial Pipeline Phase dropdown choice select list"
                        value={stage}
                        onChange={(e) => setStage(e.target.value as Lead['stage'])}
                        className="sr-only"
                        tabIndex={-1}
                      >
                        {STAGES.slice(0, 5).map((s) => (
                          <option key={s} value={s}>{s}</option>
                        ))}
                      </select>

                      <button
                        type="button"
                        onClick={() => setIsDropdownOpen(!isDropdownOpen)}
                        className={cn(
                          "w-full flex items-center justify-between bg-zinc-900 border rounded-xl py-3 pr-4 pl-9 text-xs font-bold text-zinc-200 transition-all capitalize cursor-pointer shadow-sm text-left outline-none",
                          isDropdownOpen ? "border-brand-500/80 ring-2 ring-brand-500/15" : "border-zinc-800"
                        )}
                      >
                        <span className="absolute left-3.5 top-1/2 -translate-y-1/2 flex items-center">
                          <span className={cn(
                            "w-2 h-2 rounded-full",
                            stage === 'new' && "bg-zinc-405",
                            stage === 'contacted' && "bg-blue-500",
                            stage === 'qualified' && "bg-indigo-500",
                            stage === 'proposal' && "bg-purple-500",
                            stage === 'negotiation' && "bg-brand-500"
                          )} />
                        </span>
                        <span className="truncate">{stage}</span>
                        <ChevronDown className={cn("w-4 h-4 text-zinc-550 transition-transform", isDropdownOpen ? "rotate-180" : "")} />
                      </button>

                      <AnimatePresence>
                        {isDropdownOpen && (
                          <motion.div
                            initial={{ opacity: 0, y: -4, scale: 0.98 }}
                            animate={{ opacity: 1, y: 0, scale: 1 }}
                            exit={{ opacity: 0, y: -4, scale: 0.98 }}
                            className="absolute left-0 right-0 z-50 mt-1 w-full bg-zinc-950 border border-zinc-800 rounded-xl py-1 shadow-2xl max-h-48 overflow-y-auto"
                          >
                            {STAGES.slice(0, 5).map((s) => {
                              const isSelected = stage === s;
                              return (
                                <button
                                  key={s}
                                  type="button"
                                  onClick={() => {
                                    setStage(s);
                                    setIsDropdownOpen(false);
                                  }}
                                  className={cn(
                                    "w-full flex items-center justify-between px-3 py-2 text-xs font-semibold rounded-lg capitalize text-left",
                                    isSelected ? "text-brand-400 bg-brand-500/10 font-bold" : "text-zinc-300 hover:bg-zinc-900"
                                  )}
                                >
                                  <span>{s}</span>
                                  {isSelected && <Check className="w-3.5 h-3.5 text-brand-400" />}
                                </button>
                              );
                            })}
                          </motion.div>
                        )}
                      </AnimatePresence>
                    </div>
                  </div>
                </div>

                <button 
                  type="submit"
                  className="w-full py-4 mt-2 bg-brand-500 hover:bg-brand-600 text-white rounded-xl font-bold justify-center flex items-center gap-2 transform active:scale-95 transition-all shadow-md cursor-pointer text-xs"
                >
                  <Plus className="w-4.5 h-4.5" /> Initialize Pipeline Node
                </button>
              </form>
            </motion.div>
          </>
        )}

        {isNewProposalOpen && (
          <>
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 0.5 }}
              exit={{ opacity: 0 }}
              onClick={() => setIsNewProposalOpen(false)}
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
                  <h3 className="text-xl font-display font-bold text-white">Issue Lease Proposal</h3>
                  <p className="text-xs text-zinc-500 mt-1 font-medium">Render dynamic pricing quote proposal coordinates</p>
                </div>
                <button 
                  onClick={() => setIsNewProposalOpen(false)}
                  className="w-8 h-8 rounded-full bg-zinc-900 border border-zinc-800 text-zinc-400 hover:text-white flex items-center justify-center cursor-pointer transition-colors"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>

              <form onSubmit={handleCreateProposal} className="space-y-4 font-sans text-xs">
                <div className="space-y-1.5">
                  <label className="text-[10px] font-bold text-zinc-400 uppercase tracking-widest block">Qualified Lead (Fullname)</label>
                  <input 
                    type="text" required
                    placeholder="e.g. Mike Ross"
                    value={propLeadName}
                    onChange={(e) => setPropLeadName(e.target.value)}
                    className="w-full bg-zinc-900 border border-zinc-800 rounded-xl py-2.5 px-3 px-3.5 text-xs text-zinc-200 font-semibold focus:outline-none focus:ring-1 focus:ring-brand-500/50"
                  />
                </div>

                <div className="space-y-1.5">
                  <label className="text-[10px] font-bold text-zinc-400 uppercase tracking-widest block">Client Corporate / Corp</label>
                  <input 
                    type="text" required
                    placeholder="e.g. Wayne Corp"
                    value={propCompany}
                    onChange={(e) => setPropCompany(e.target.value)}
                    className="w-full bg-zinc-900 border border-zinc-800 rounded-xl py-2.5 px-3 px-3.5 text-xs text-zinc-200 font-semibold focus:outline-none focus:ring-1 focus:ring-brand-500/50"
                  />
                </div>

                <div className="space-y-1.5">
                  <label className="text-[10px] font-bold text-zinc-400 uppercase tracking-widest block">Workspace Desk class</label>
                  <select 
                    value={propDeskType}
                    onChange={(e) => {
                      const type = e.target.value as any;
                      setPropDeskType(type);
                      setPropMonthlyFee(type === 'private-office' ? 3500 : type === 'meeting-room' ? 1200 : type === 'dedicated' ? 399 : 199);
                    }}
                    className="w-full bg-zinc-900 border border-zinc-800 rounded-xl py-2.5 px-3 text-xs text-zinc-300 cursor-pointer focus:outline-none font-semibold"
                  >
                    <option value="hot-desk">Hot Desk ($199/mo)</option>
                    <option value="dedicated">Dedicated Desk ($399/mo)</option>
                    <option value="meeting-room">Conference Meeting Suite ($1200/mo)</option>
                    <option value="private-office">Private Glass Suite ($3500/mo)</option>
                  </select>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-1.5">
                    <label className="text-[10px] font-bold text-zinc-450 uppercase tracking-widest block">Monthly Quote Fee ($)</label>
                    <input 
                      type="number"
                      value={propMonthlyFee}
                      onChange={(e) => setPropMonthlyFee(Number(e.target.value) || 0)}
                      className="w-full bg-zinc-900 border border-zinc-800 rounded-xl py-2.5 px-3 text-xs text-zinc-200 font-mono font-bold focus:outline-none"
                    />
                  </div>
                  <div className="space-y-1.5">
                    <label className="text-[10px] font-bold text-zinc-405 uppercase tracking-widest block">Term Duration (Months)</label>
                    <input 
                      type="number"
                      value={propDuration}
                      onChange={(e) => setPropDuration(Number(e.target.value) || 12)}
                      className="w-full bg-zinc-900 border border-zinc-800 rounded-xl py-2.5 px-3 text-xs text-zinc-200 font-mono font-bold focus:outline-none"
                    />
                  </div>
                </div>

                <div className="flex pt-4 gap-3">
                  <button
                    type="button"
                    onClick={() => setIsNewProposalOpen(false)}
                    className="flex-1 py-3 text-xs font-bold bg-zinc-900 text-zinc-450 border border-zinc-805 rounded-xl"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="flex-1 py-3 text-xs font-bold text-white bg-brand-500 hover:bg-brand-600 rounded-xl shadow-md cursor-pointer"
                  >
                    Send Proposal Contract
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
