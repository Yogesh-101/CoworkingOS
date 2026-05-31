import { useMemo, useState } from 'react';
import { useStore } from '@/store';
import { motion } from 'motion/react';
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  BarChart,
  Bar,
  Cell,
} from 'recharts';
import {
  Brain,
  TrendingUp,
  Target,
  RefreshCw,
  Users,
  UserCheck,
  Sparkles,
  ChevronRight,
} from 'lucide-react';
import { cn } from '@/lib/utils';
import {
  computeLeadScores,
  computeOccupancyForecast,
  computeRenewalPredictions,
  computeEmployeeProductivity,
  computeAttendanceInsights,
  computeBIInsights,
} from '@/lib/intelligence';
import { formatINR } from '@/lib/currency';

const SUB_TABS = [
  { id: 'overview', label: 'BI Dashboard', icon: Brain },
  { id: 'occupancy', label: 'Occupancy Forecast', icon: TrendingUp },
  { id: 'leads', label: 'Lead Scoring', icon: Target },
  { id: 'renewals', label: 'Renewal Predictions', icon: RefreshCw },
  { id: 'workforce', label: 'Productivity', icon: Users },
  { id: 'attendance', label: 'Attendance', icon: UserCheck },
] as const;

type SubTab = (typeof SUB_TABS)[number]['id'];

const TIER_COLORS = {
  hot: '#ff0a16',
  warm: '#f59e0b',
  cold: '#52525b',
};

export function IntelligenceHub() {
  const {
    branches,
    activeBranchId,
    leads,
    invoices,
    renewals,
    employees,
    tickets,
    tasks,
    visitors,
    setActiveTab,
  } = useStore();

  const [subTab, setSubTab] = useState<SubTab>('overview');
  const branch = branches.find((b) => b.id === activeBranchId) ?? branches[0];

  const leadScores = useMemo(() => computeLeadScores(leads), [leads]);
  const forecast = useMemo(() => computeOccupancyForecast(branch, 14), [branch]);
  const renewalPreds = useMemo(
    () => computeRenewalPredictions(renewals, invoices),
    [renewals, invoices]
  );
  const productivity = useMemo(
    () => computeEmployeeProductivity(employees, tickets, tasks, activeBranchId),
    [employees, tickets, tasks, activeBranchId]
  );
  const attendance = useMemo(
    () => computeAttendanceInsights(visitors, employees, activeBranchId),
    [visitors, employees, activeBranchId]
  );
  const biInsights = useMemo(
    () =>
      computeBIInsights({
        branch,
        leads,
        invoices,
        visitors,
        tickets,
        renewals,
      }),
    [branch, leads, invoices, visitors, tickets, renewals]
  );

  return (
    <div className="space-y-6 pb-8">
      <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <Sparkles className="w-5 h-5 text-brand-500" />
            <span className="text-[10px] font-black uppercase tracking-widest text-brand-500">
              AI Intelligence
            </span>
          </div>
          <h1 className="text-2xl md:text-3xl font-display font-bold text-zinc-100 tracking-tight">
            Intelligence Hub
          </h1>
          <p className="text-zinc-500 text-sm mt-1">
            Live AI insights for {branch.name} — updates as your workspace data changes
          </p>
        </div>
        <div className="text-xs font-mono text-zinc-600 bg-zinc-900 border border-zinc-805 px-3 py-2 rounded-xl">
          {new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })} · Live sync
        </div>
      </div>

      <div className="flex gap-2 overflow-x-auto pb-1 -mx-1 px-1 scrollbar-none">
        {SUB_TABS.map((tab) => (
          <button
            key={tab.id}
            type="button"
            onClick={() => setSubTab(tab.id)}
            className={cn(
              'flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs font-bold whitespace-nowrap shrink-0 transition-all cursor-pointer',
              subTab === tab.id
                ? 'bg-brand-500/15 text-brand-400 border border-brand-500/25'
                : 'bg-zinc-900 text-zinc-500 border border-zinc-805 hover:text-zinc-300'
            )}
          >
            <tab.icon className="w-4 h-4" />
            {tab.label}
          </button>
        ))}
      </div>

      {subTab === 'overview' && (
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-6">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5 gap-4">
            {biInsights.map((insight, i) => (
              <motion.div
                key={insight.id}
                initial={{ opacity: 0, y: 12 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.05 }}
                className="glass-panel rounded-2xl p-5 border-zinc-805"
              >
                <p className="text-[10px] font-bold uppercase tracking-wider text-zinc-500 mb-2">
                  {insight.title}
                </p>
                <p className="text-2xl font-display font-bold text-zinc-100">{insight.value}</p>
                <p
                  className={cn(
                    'text-xs font-semibold mt-2',
                    insight.positive ? 'text-emerald-400' : 'text-amber-400'
                  )}
                >
                  {insight.delta}
                </p>
              </motion.div>
            ))}
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <div className="glass-panel rounded-3xl p-6 border-zinc-805">
              <h3 className="font-bold text-zinc-100 mb-4">14-day occupancy projection</h3>
              <div className="h-56">
                <ResponsiveContainer width="100%" height="100%">
                  <AreaChart data={forecast}>
                    <defs>
                      <linearGradient id="forecastGrad" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="#ff0a16" stopOpacity={0.35} />
                        <stop offset="95%" stopColor="#ff0a16" stopOpacity={0} />
                      </linearGradient>
                    </defs>
                    <XAxis dataKey="label" stroke="#52525b" fontSize={10} tickLine={false} axisLine={false} />
                    <YAxis stroke="#52525b" fontSize={10} tickLine={false} axisLine={false} domain={[40, 100]} />
                    <Tooltip
                      contentStyle={{
                        backgroundColor: '#18181b',
                        border: '1px solid #27272a',
                        borderRadius: '12px',
                      }}
                      formatter={(v: number) => [`${v}%`, 'Predicted']}
                    />
                    <Area
                      type="monotone"
                      dataKey="predicted"
                      stroke="#ff0a16"
                      strokeWidth={2}
                      fill="url(#forecastGrad)"
                    />
                  </AreaChart>
                </ResponsiveContainer>
              </div>
            </div>

            <div className="glass-panel rounded-3xl p-6 border-zinc-805 space-y-3">
              <h3 className="font-bold text-zinc-100 mb-2">Quick actions</h3>
              {[
                { label: 'Review hot leads in CRM', tab: 'crm' as const, count: leadScores.filter((s) => s.tier === 'hot').length },
                { label: 'Renewals needing attention', tab: 'billing' as const, count: renewalPreds.filter((r) => r.risk !== 'low').length },
                { label: 'Open helpdesk tickets', tab: 'helpdesk' as const, count: tickets.filter((t) => t.status !== 'resolved').length },
              ].map((action) => (
                <button
                  key={action.label}
                  type="button"
                  onClick={() => setActiveTab(action.tab)}
                  className="w-full flex items-center justify-between p-4 bg-zinc-900/60 border border-zinc-805 rounded-xl hover:border-brand-500/30 transition-colors cursor-pointer group"
                >
                  <span className="text-sm font-semibold text-zinc-300 group-hover:text-white">
                    {action.label}
                  </span>
                  <span className="flex items-center gap-2 text-brand-400 font-bold text-sm">
                    {action.count}
                    <ChevronRight className="w-4 h-4" />
                  </span>
                </button>
              ))}
            </div>
          </div>
        </motion.div>
      )}

      {subTab === 'occupancy' && (
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-6">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <StatCard label="Current occupancy" value={`${branch.occupancyRate}%`} />
            <StatCard label="Occupied desks" value={String(branch.desks.filter((d) => d.status === 'occupied').length)} />
            <StatCard label="Reserved" value={String(branch.desks.filter((d) => d.status === 'reserved').length)} />
            <StatCard label="7-day outlook" value={`${forecast[6]?.predicted ?? branch.occupancyRate}%`} />
          </div>
          <div className="glass-panel rounded-3xl p-6 border-zinc-805">
            <h3 className="font-bold text-zinc-100 mb-1">AI occupancy forecast</h3>
            <p className="text-xs text-zinc-500 mb-6">
              Model factors desk momentum, seasonal patterns, and branch capacity
            </p>
            <div className="h-72">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={forecast}>
                  <defs>
                    <linearGradient id="bandGrad" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#6366f1" stopOpacity={0.2} />
                      <stop offset="95%" stopColor="#6366f1" stopOpacity={0} />
                    </linearGradient>
                  </defs>
                  <XAxis dataKey="label" stroke="#52525b" fontSize={11} tickLine={false} axisLine={false} />
                  <YAxis stroke="#52525b" fontSize={11} tickLine={false} axisLine={false} domain={[40, 100]} unit="%" />
                  <Tooltip
                    contentStyle={{ backgroundColor: '#18181b', border: '1px solid #27272a', borderRadius: '12px' }}
                    formatter={(v: number, name: string) => [`${v}%`, name === 'predicted' ? 'Predicted' : name]}
                  />
                  <Area type="monotone" dataKey="upper" stroke="none" fill="url(#bandGrad)" />
                  <Area type="monotone" dataKey="lower" stroke="none" fill="#050505" />
                  <Area type="monotone" dataKey="predicted" stroke="#ff0a16" strokeWidth={3} fill="none" />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          </div>
        </motion.div>
      )}

      {subTab === 'leads' && (
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-4">
          <div className="grid grid-cols-3 gap-4">
            {(['hot', 'warm', 'cold'] as const).map((tier) => (
              <StatCard
                key={tier}
                label={`${tier} leads`}
                value={String(leadScores.filter((s) => s.tier === tier).length)}
                accent={TIER_COLORS[tier]}
              />
            ))}
          </div>
          <div className="space-y-3">
            {leadScores.map((score, i) => {
              const lead = leads.find((l) => l.id === score.leadId);
              if (!lead) return null;
              return (
                <motion.div
                  key={score.leadId}
                  initial={{ opacity: 0, x: -8 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: i * 0.04 }}
                  className="flex flex-col sm:flex-row sm:items-center gap-4 p-4 bg-zinc-900 border border-zinc-805 rounded-2xl"
                >
                  <div className="flex items-center gap-4 flex-1 min-w-0">
                    <div
                      className="w-14 h-14 rounded-2xl flex items-center justify-center font-display font-bold text-lg shrink-0"
                      style={{
                        backgroundColor: `${TIER_COLORS[score.tier]}20`,
                        color: TIER_COLORS[score.tier],
                      }}
                    >
                      {score.score}
                    </div>
                    <div className="min-w-0">
                      <p className="font-bold text-zinc-100 truncate">{lead.name}</p>
                      <p className="text-xs text-zinc-500">{lead.company} · {formatINR(lead.value)}</p>
                      <p className="text-[10px] text-zinc-600 mt-1">{score.factors.join(' · ')}</p>
                    </div>
                  </div>
                  <span
                    className={cn(
                      'text-[10px] font-black uppercase px-3 py-1 rounded-lg shrink-0 self-start',
                      score.tier === 'hot' && 'bg-brand-500/15 text-brand-400',
                      score.tier === 'warm' && 'bg-amber-500/15 text-amber-400',
                      score.tier === 'cold' && 'bg-zinc-800 text-zinc-500'
                    )}
                  >
                    {score.tier}
                  </span>
                </motion.div>
              );
            })}
          </div>
        </motion.div>
      )}

      {subTab === 'renewals' && (
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-4">
          {renewalPreds.map((pred, i) => (
            <motion.div
              key={pred.renewalId}
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.05 }}
              className="p-5 bg-zinc-900 border border-zinc-805 rounded-2xl flex flex-col md:flex-row md:items-center gap-4"
            >
              <div className="flex-1">
                <p className="font-bold text-zinc-100">{pred.clientName}</p>
                <p className="text-xs text-zinc-500 mt-1">{pred.recommendation}</p>
              </div>
              <div className="flex items-center gap-6">
                <div className="text-center">
                  <p className="text-2xl font-display font-bold text-zinc-100">{pred.probability}%</p>
                  <p className="text-[9px] uppercase text-zinc-600 font-bold">Renewal likelihood</p>
                </div>
                <div className="text-center">
                  <p className="text-lg font-bold text-zinc-300">{pred.daysUntilRenewal}d</p>
                  <p className="text-[9px] uppercase text-zinc-600 font-bold">Until due</p>
                </div>
                <span
                  className={cn(
                    'text-[10px] font-black uppercase px-3 py-1.5 rounded-lg',
                    pred.risk === 'low' && 'bg-emerald-500/15 text-emerald-400',
                    pred.risk === 'medium' && 'bg-amber-500/15 text-amber-400',
                    pred.risk === 'high' && 'bg-brand-500/15 text-brand-400'
                  )}
                >
                  {pred.risk} risk
                </span>
              </div>
            </motion.div>
          ))}
        </motion.div>
      )}

      {subTab === 'workforce' && (
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-6">
          <div className="glass-panel rounded-3xl p-6 border-zinc-805">
            <h3 className="font-bold text-zinc-100 mb-4">Productivity scores</h3>
            <div className="h-64">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={productivity.slice(0, 8)} layout="vertical" margin={{ left: 8 }}>
                  <XAxis type="number" domain={[0, 100]} stroke="#52525b" fontSize={10} tickLine={false} axisLine={false} />
                  <YAxis type="category" dataKey="name" stroke="#52525b" fontSize={10} tickLine={false} axisLine={false} width={100} />
                  <Tooltip
                    contentStyle={{ backgroundColor: '#18181b', border: '1px solid #27272a', borderRadius: '12px' }}
                  />
                  <Bar dataKey="score" radius={[0, 6, 6, 0]}>
                    {productivity.slice(0, 8).map((entry) => (
                      <Cell
                        key={entry.employeeId}
                        fill={
                          entry.load === 'heavy'
                            ? '#ff0a16'
                            : entry.load === 'balanced'
                              ? '#f59e0b'
                              : '#10b981'
                        }
                      />
                    ))}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {productivity.map((emp) => (
              <div
                key={emp.employeeId}
                className="p-4 bg-zinc-900 border border-zinc-805 rounded-2xl flex items-center justify-between"
              >
                <div>
                  <p className="font-bold text-zinc-100">{emp.name}</p>
                  <p className="text-xs text-zinc-500">{emp.role}</p>
                </div>
                <div className="text-right">
                  <p className="text-xl font-bold text-zinc-100">{emp.score}</p>
                  <p className="text-[10px] text-zinc-600">
                    {emp.ticketsResolved} tickets · {emp.tasksDone} tasks · {emp.load} load
                  </p>
                </div>
              </div>
            ))}
          </div>
        </motion.div>
      )}

      {subTab === 'attendance' && (
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          {attendance.map((item, i) => (
            <motion.div
              key={item.id}
              initial={{ opacity: 0, scale: 0.98 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: i * 0.06 }}
              className="glass-panel rounded-2xl p-6 border-zinc-805"
            >
              <div className="flex items-start justify-between">
                <p className="text-[10px] font-bold uppercase tracking-wider text-zinc-500">{item.label}</p>
                <span
                  className={cn(
                    'text-[9px] font-bold uppercase px-2 py-0.5 rounded',
                    item.trend === 'up' && 'bg-emerald-500/15 text-emerald-400',
                    item.trend === 'down' && 'bg-brand-500/15 text-brand-400',
                    item.trend === 'stable' && 'bg-zinc-800 text-zinc-500'
                  )}
                >
                  {item.trend}
                </span>
              </div>
              <p className="text-3xl font-display font-bold text-zinc-100 mt-3">{item.value}</p>
              <p className="text-xs text-zinc-500 mt-2">{item.detail}</p>
            </motion.div>
          ))}
        </motion.div>
      )}
    </div>
  );
}

function StatCard({ label, value, accent }: { label: string; value: string; accent?: string }) {
  return (
    <div className="glass-panel rounded-2xl p-4 border-zinc-805">
      <p className="text-[10px] font-bold uppercase tracking-wider text-zinc-500">{label}</p>
      <p className="text-2xl font-display font-bold mt-2" style={accent ? { color: accent } : undefined}>
        {value}
      </p>
    </div>
  );
}
