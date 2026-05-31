import { useState, useRef, useEffect } from 'react';
import { useStore } from '@/store';
import { subDays, format } from 'date-fns';
import { AreaChart, Area, XAxis, YAxis, Tooltip, ResponsiveContainer } from 'recharts';
import { ArrowUpRight, ArrowDownRight, Users, Building, Activity, DollarSign, ChevronDown, Calendar, Check, Brain, Sparkles } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { computeBIInsights, computeOccupancyForecast } from '@/lib/intelligence';
import { formatINR, WORKSPACE_PRICING } from '@/lib/currency';

function KPICard({ title, value, change, isPositive, icon: Icon, delay }: any) {
  return (
    <motion.div 
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay, duration: 0.4 }}
      className="glass-panel p-6 rounded-3xl flex flex-col gap-4 relative overflow-hidden group border-zinc-800"
    >
      <div className="absolute top-0 right-0 p-4 opacity-5 transform translate-x-4 -translate-y-4 group-hover:scale-110 transition-transform duration-500">
        <Icon className="w-24 h-24 text-brand-500" />
      </div>

      <div className="flex justify-between items-start relative z-10">
        <span className="text-zinc-500 font-semibold text-sm uppercase tracking-wider">{title}</span>
        <div className="p-2.5 bg-brand-500/10 text-brand-500 rounded-xl">
          <Icon className="w-5 h-5" />
        </div>
      </div>
      <div className="relative z-10 mt-2">
        <h3 className="font-display text-4xl font-bold text-zinc-100 mb-2">{value}</h3>
        <div className="flex items-center gap-1.5 text-sm font-medium">
          {isPositive ? (
            <span className="flex items-center text-emerald-500 bg-emerald-500/10 px-2 py-0.5 rounded-md">
              <ArrowUpRight className="w-3.5 h-3.5 mr-1" />
              {change}%
            </span>
          ) : (
            <span className="flex items-center text-brand-500 bg-brand-500/10 px-2 py-0.5 rounded-md">
              <ArrowDownRight className="w-3.5 h-3.5 mr-1" />
              {change}%
            </span>
          )}
          <span className="text-zinc-500 ml-1">vs last month</span>
        </div>
      </div>
    </motion.div>
  );
}

export function DashboardOverview() {
  const { kpi, branches, activeBranchId, notifications, invoices, leads, visitors, tickets, renewals, setActiveTab } = useStore();
  const activeBranch = branches.find(b => b.id === activeBranchId);

  const biInsights = computeBIInsights({
    branch: activeBranch,
    leads,
    invoices,
    visitors,
    tickets,
    renewals,
  });
  const occupancyForecast = computeOccupancyForecast(activeBranch, 7);

  // Compute dynamic curve data in real-time based on activeBranchId and selected timeRange
  const getDynamicChartData = () => {
    const isHitecCity = activeBranchId === 'b1';
    const isGachibowli = activeBranchId === 'b2';
    const multiplier = isHitecCity ? 1.25 : isGachibowli ? 0.95 : 1.45;
    
    if (timeRange === 'Last 7 days') {
      return Array.from({ length: 7 }).map((_, i) => {
        const date = subDays(new Date(), 6 - i);
        // consistent deterministic mathematical sine curve with small variation
        const baseVal = Math.sin(i * 1.6 + (isHitecCity ? 0.8 : 2.1)) * 1400 + 17800;
        return {
          name: format(date, 'EEE'),
          revenue: Math.round(baseVal * multiplier),
          occupancy: Math.round((72 + Math.sin(i) * 11) * (multiplier > 1.2 ? 0.98 : 1.02)),
        };
      });
    } else {
      // Last 30 days
      return Array.from({ length: 30 }).map((_, i) => {
        const date = subDays(new Date(), 29 - i);
        const baseVal = Math.sin(i * 0.45 + (isHitecCity ? 0.5 : 1.5)) * 1900 + 17100 + (i * 165); // growth line
        return {
          name: format(date, 'MMM dd'),
          revenue: Math.round(baseVal * multiplier),
          occupancy: Math.round((70 + Math.sin(i * 0.35) * 13) * (multiplier > 1.2 ? 0.98 : 1.02)),
        };
      });
    }
  };

  const [timeRange, setTimeRange] = useState('Last 7 days');
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  // Compute live Revenue based on branch, paid invoices, occupied desks value, and won leads
  const dynamicRevenue = (() => {
    let base = 142500;
    if (activeBranchId === 'b1') base = 142500;
    else if (activeBranchId === 'b2') base = 88000;
    else if (activeBranchId === 'b3') base = 195000;

    const occupiedDesksCount = activeBranch?.desks.filter(d => d.status === 'occupied').length || 0;
    const deskRevenueContribution = occupiedDesksCount * WORKSPACE_PRICING.hotDesk;

    const paidInvoicesSum = invoices
      .filter(inv => inv.status === 'paid')
      .reduce((sum, inv) => sum + inv.amount, 0);

    const wonLeadsSum = leads
      .filter(l => l.stage === 'won' || l.stage === 'negotiation')
      .reduce((sum, l) => sum + l.value, 0);

    return base + deskRevenueContribution + paidInvoicesSum + wonLeadsSum;
  })();

  const dynamicRevenueGrowth = (() => {
    if (activeBranchId === 'b1') return 12.4;
    if (activeBranchId === 'b2') return 14.8;
    return 10.2;
  })();

  // Compute live Active Members matching current branch size + occupied desks + qualified leads
  const dynamicActiveMembers = (() => {
    let base = 1240;
    if (activeBranchId === 'b1') base = 1240;
    else if (activeBranchId === 'b2') base = 680;
    else if (activeBranchId === 'b3') base = 1850;

    const occupiedDesksCount = activeBranch?.desks.filter(d => d.status === 'occupied').length || 0;
    const prospectAdditionalCount = leads.filter(l => l.stage === 'qualified' || l.stage === 'won').length * 4;

    return base + occupiedDesksCount * 3 + prospectAdditionalCount;
  })();

  const dynamicMembersGrowth = (() => {
    if (activeBranchId === 'b1') return 4.2;
    if (activeBranchId === 'b2') return 6.7;
    return 3.1;
  })();

  // Compute live Churn Rate as a function of current occupancy (lower occupancy increases churn)
  const dynamicChurnRate = (() => {
    const occupancy = activeBranch?.occupancyRate || 75;
    const baseChurn = 2.5 - (occupancy / 100) * 1.5;
    return Math.max(0.4, Number(baseChurn.toFixed(2)));
  })();

  const dynamicChurnGrowth = (() => {
    if (activeBranchId === 'b1') return -0.5;
    if (activeBranchId === 'b2') return -0.9;
    return -0.2;
  })();

  // Compute live Recent Activity based on store's notifications history log
  const dynamicActivities = notifications.slice(0, 4).map((notif) => {
    return {
      time: notif.time,
      text: notif.description,
      title: notif.title,
      type: notif.type,
    };
  });

  const chartData = getDynamicChartData();

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-3xl font-display font-bold text-zinc-100 tracking-tight">Overview</h1>
        <p className="text-zinc-500 text-sm mt-1">Real-time metrics for {activeBranch?.name}</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <KPICard 
          title="Total Revenue" 
          value={formatINR(dynamicRevenue, { compact: true })} 
          change={dynamicRevenueGrowth} 
          isPositive={dynamicRevenueGrowth > 0} 
          icon={DollarSign}
          delay={0.1}
        />
        <KPICard 
          title="Occupancy Rate" 
          value={`${activeBranch?.occupancyRate || kpi.occupancyRate}%`} 
          change={kpi.occupancyGrowth} 
          isPositive={kpi.occupancyGrowth > 0} 
          icon={Building}
          delay={0.2}
        />
        <KPICard 
          title="Active Members" 
          value={dynamicActiveMembers} 
          change={dynamicMembersGrowth} 
          isPositive={dynamicMembersGrowth > 0} 
          icon={Users}
          delay={0.3}
        />
        <KPICard 
          title="Churn Rate" 
          value={`${dynamicChurnRate}%`} 
          change={dynamicChurnGrowth} 
          isPositive={dynamicChurnGrowth > 0} 
          icon={Activity}
          delay={0.4}
        />
      </div>

      <motion.div
        initial={{ opacity: 0, y: 16 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.45 }}
        className="glass-panel rounded-3xl p-6 md:p-8 border-zinc-800"
      >
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
          <div className="flex items-center gap-3">
            <div className="p-2.5 bg-brand-500/10 rounded-xl">
              <Brain className="w-5 h-5 text-brand-500" />
            </div>
            <div>
              <h2 className="text-xl font-display font-bold text-zinc-100">Real-time Business Intelligence</h2>
              <p className="text-xs text-zinc-500 flex items-center gap-1 mt-0.5">
                <Sparkles className="w-3 h-3 text-brand-500" /> Live AI insights · updates with workspace data
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={() => setActiveTab('intelligence')}
            className="text-xs font-bold px-4 py-2 rounded-xl bg-brand-500/10 text-brand-400 border border-brand-500/20 hover:bg-brand-500/20 transition-colors cursor-pointer self-start sm:self-auto"
          >
            Open Intelligence Hub →
          </button>
        </div>
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4">
          {biInsights.map((insight) => (
            <div key={insight.id} className="bg-zinc-900/60 border border-zinc-805 rounded-2xl p-4">
              <p className="text-[10px] font-bold uppercase tracking-wider text-zinc-500 mb-2">{insight.title}</p>
              <p className="text-xl font-display font-bold text-zinc-100">{insight.value}</p>
              <p className={`text-[10px] font-semibold mt-1.5 ${insight.positive ? 'text-emerald-400' : 'text-amber-400'}`}>
                {insight.delta}
              </p>
            </div>
          ))}
        </div>
        <div className="mt-6 pt-6 border-t border-zinc-805">
          <p className="text-xs font-bold text-zinc-400 mb-3">7-day occupancy forecast</p>
          <div className="flex items-end gap-1.5 h-16">
            {occupancyForecast.map((point) => (
              <div key={point.date} className="flex-1 flex flex-col items-center gap-1">
                <div
                  className="w-full bg-brand-500/80 rounded-t-md transition-all"
                  style={{ height: `${Math.max(12, point.predicted * 0.55)}%` }}
                  title={`${point.label}: ${point.predicted}%`}
                />
                <span className="text-[8px] text-zinc-600 font-mono truncate w-full text-center">{point.label.split(' ')[0]}</span>
              </div>
            ))}
          </div>
        </div>
      </motion.div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.5, duration: 0.4 }}
          className="lg:col-span-2 glass-panel rounded-3xl p-8 border-zinc-800"
        >
          <div className="flex justify-between items-center mb-8">
            <h2 className="text-xl font-display font-bold text-zinc-100">Revenue Overview</h2>
            
            {/* Elegant Custom Range Dropdown */}
            <div className="relative" ref={dropdownRef}>
              <button 
                onClick={() => setIsOpen(!isOpen)}
                className={`flex items-center gap-2 px-4 py-2 bg-zinc-900/95 hover:bg-zinc-850/90 border ${isOpen ? 'border-brand-500/50 shadow-[0_0_12px_rgba(255,10,22,0.15)] text-zinc-100' : 'border-zinc-800 text-zinc-400'} rounded-xl text-sm font-medium cursor-pointer transition-all duration-200`}
              >
                <Calendar className="w-4 h-4 text-brand-500/80" />
                <span>{timeRange}</span>
                <ChevronDown className={`w-3.5 h-3.5 text-zinc-500 transition-transform duration-350 ${isOpen ? 'rotate-180 text-brand-500' : 'rotate-0'}`} />
              </button>

              <AnimatePresence>
                {isOpen && (
                  <motion.div
                    initial={{ opacity: 0, y: 8, scale: 0.95 }}
                    animate={{ opacity: 1, y: 0, scale: 1 }}
                    exit={{ opacity: 0, y: 6, scale: 0.95 }}
                    transition={{ duration: 0.12, ease: 'easeOut' }}
                    className="absolute right-0 mt-2 w-48 rounded-xl border border-zinc-800/80 bg-zinc-950/95 backdrop-blur-xl shadow-xl p-1.5 z-40 space-y-0.5"
                  >
                    {[
                      { label: 'Last 7 days', description: 'Weekly aggregates' },
                      { label: 'Last 30 days', description: 'Monthly statement cycles' },
                    ].map((opt) => {
                      const isActive = timeRange === opt.label;
                      return (
                        <button
                          key={opt.label}
                          onClick={() => {
                            setTimeRange(opt.label);
                            setIsOpen(false);
                          }}
                          className={`w-full text-left rounded-lg px-3 py-2 transition-all duration-150 flex items-center justify-between group cursor-pointer ${isActive ? 'bg-brand-500/10 text-white font-bold' : 'hover:bg-zinc-900/60 text-zinc-400 hover:text-zinc-200'}`}
                        >
                          <div className="flex flex-col">
                            <span className="text-xs leading-none font-semibold">{opt.label}</span>
                            <span className="text-[9px] text-zinc-600 mt-1 font-medium group-hover:text-zinc-500">{opt.description}</span>
                          </div>
                          {isActive && <Check className="w-3.5 h-3.5 text-brand-500" />}
                        </button>
                      );
                    })}
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          </div>
          <div className="h-[320px] w-full">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={chartData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                <defs>
                  <linearGradient id="colorRevenue" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#ff0a16" stopOpacity={0.4}/>
                    <stop offset="95%" stopColor="#ff0a16" stopOpacity={0}/>
                  </linearGradient>
                </defs>
                <XAxis dataKey="name" stroke="#52525b" fontSize={12} tickLine={false} axisLine={false} dy={10} />
                <YAxis stroke="#52525b" fontSize={12} tickLine={false} axisLine={false} tickFormatter={(value: number) => formatINR(value, { compact: true })} />
                <Tooltip 
                  contentStyle={{ backgroundColor: '#18181b', border: '1px solid #27272a', borderRadius: '12px', boxShadow: '0 10px 15px -3px rgb(0 0 0 / 0.5)' }}
                  itemStyle={{ color: '#f4f4f5', fontWeight: 600 }}
                  labelStyle={{ color: '#a1a1aa' }}
                />
                <Area type="monotone" dataKey="revenue" stroke="#ff0a16" strokeWidth={4} fillOpacity={1} fill="url(#colorRevenue)" activeDot={{ r: 6, strokeWidth: 2, stroke: '#18181b' }} />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </motion.div>

        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.6, duration: 0.4 }}
          className="glass-panel rounded-3xl p-8 border-zinc-800"
        >
          <div className="flex justify-between items-center mb-8">
            <h2 className="text-xl font-display font-bold text-zinc-100">Recent Activity</h2>
          </div>
          <div className="space-y-6">
            {dynamicActivities.length === 0 ? (
              <div className="text-center py-12 text-zinc-650 font-medium">
                No recent activity events recorded.
              </div>
            ) : (
              dynamicActivities.map((activity, i) => {
                const getDotColor = (type?: string) => {
                  switch (type) {
                    case 'lead': return 'bg-emerald-500 shadow-[0_0_10px_rgba(16,185,129,0.5)]';
                    case 'billing': return 'bg-amber-500 shadow-[0_0_10px_rgba(245,158,11,0.5)]';
                    case 'tour': return 'bg-cyan-500 shadow-[0_0_10px_rgba(6,182,212,0.5)]';
                    default: return 'bg-brand-500 shadow-[0_0_10px_rgba(255,10,22,0.5)]';
                  }
                };
                return (
                  <div key={i} className="flex gap-4 relative">
                    <div className="flex flex-col items-center">
                      <div className={`w-3 h-3 rounded-full z-10 relative ${getDotColor(activity.type)}`} />
                      {i !== dynamicActivities.length - 1 && <div className="w-px h-full bg-zinc-850 absolute top-3" />}
                    </div>
                    <div className="pb-4">
                      <p className="text-sm font-medium text-zinc-300">{activity.text}</p>
                      <span className="text-xs text-zinc-500 font-medium">{activity.time}</span>
                    </div>
                  </div>
                );
              })
            )}
          </div>
        </motion.div>
      </div>
    </div>
  );
}
