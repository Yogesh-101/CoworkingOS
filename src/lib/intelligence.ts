import { addDays, format } from 'date-fns';
import type {
  Branch,
  Lead,
  WorkspaceRenewal,
  Employee,
  Visitor,
  Ticket,
  InternalTask,
  Invoice,
} from '@/types';
import {
  navigationReply,
  parseAssistNavigation,
  platformAccessReply,
  wantsPlatformAccess,
} from '@/lib/assist-navigation';

export interface LeadScore {
  leadId: string;
  score: number;
  tier: 'hot' | 'warm' | 'cold';
  factors: string[];
}

export interface OccupancyForecastPoint {
  date: string;
  label: string;
  predicted: number;
  lower: number;
  upper: number;
}

export interface RenewalPrediction {
  renewalId: string;
  clientName: string;
  probability: number;
  risk: 'low' | 'medium' | 'high';
  recommendation: string;
  daysUntilRenewal: number;
}

export interface EmployeeProductivity {
  employeeId: string;
  name: string;
  role: string;
  score: number;
  ticketsResolved: number;
  tasksDone: number;
  load: 'light' | 'balanced' | 'heavy';
}

export interface AttendanceInsight {
  id: string;
  label: string;
  value: string;
  detail: string;
  trend: 'up' | 'down' | 'stable';
}

export interface BIInsight {
  id: string;
  title: string;
  value: string;
  delta: string;
  positive: boolean;
}

const STAGE_SCORE: Record<Lead['stage'], number> = {
  new: 12,
  contacted: 28,
  qualified: 48,
  proposal: 62,
  negotiation: 78,
  won: 95,
  lost: 5,
};

function recencyBoost(lastContact: string): number {
  const lower = lastContact.toLowerCase();
  if (lower.includes('just now') || lower.includes('m ago') || lower.includes('min')) return 18;
  if (lower.includes('h ago') || lower.includes('hour')) return 14;
  if (lower.includes('1d') || lower.includes('1 d') || lower.includes('yesterday')) return 8;
  if (lower.includes('2d') || lower.includes('3d')) return 4;
  return 0;
}

export function computeLeadScores(leads: Lead[]): LeadScore[] {
  return leads
    .filter((l) => l.stage !== 'won' && l.stage !== 'lost')
    .map((lead) => {
      const valueBoost = Math.min(25, Math.round(Math.log10(Math.max(lead.value, 100)) * 8));
      const stageBase = STAGE_SCORE[lead.stage];
      const recency = recencyBoost(lead.lastContact);
      const score = Math.min(99, Math.round(stageBase + valueBoost + recency));
      const tier: LeadScore['tier'] = score >= 75 ? 'hot' : score >= 45 ? 'warm' : 'cold';
      const factors: string[] = [];
      if (stageBase >= 60) factors.push('Late-stage pipeline');
      if (valueBoost >= 15) factors.push('High contract value');
      if (recency >= 10) factors.push('Recent engagement');
      if (lead.stage === 'qualified') factors.push('Tour-ready signal');
      if (factors.length === 0) factors.push('Early discovery phase');
      return { leadId: lead.id, score, tier, factors };
    })
    .sort((a, b) => b.score - a.score);
}

export function getLeadScoreForId(leads: Lead[], leadId: string): LeadScore | undefined {
  return computeLeadScores(leads).find((s) => s.leadId === leadId);
}

export function computeOccupancyForecast(branch: Branch | undefined, days = 14): OccupancyForecastPoint[] {
  const base = branch?.occupancyRate ?? 75;
  const occupied = branch?.desks.filter((d) => d.status === 'occupied').length ?? 0;
  const reserved = branch?.desks.filter((d) => d.status === 'reserved').length ?? 0;
  const momentum = (occupied + reserved * 0.5) / Math.max(branch?.desks.length ?? 1, 1);

  return Array.from({ length: days }).map((_, i) => {
    const date = addDays(new Date(), i);
    const seasonal = Math.sin(i * 0.55 + momentum * 3) * 4.5;
    const growth = i * 0.35 * momentum;
    const predicted = Math.min(98, Math.max(42, Math.round(base + seasonal + growth)));
    const spread = 3 + Math.round(i * 0.2);
    return {
      date: format(date, 'yyyy-MM-dd'),
      label: i === 0 ? 'Today' : format(date, 'MMM d'),
      predicted,
      lower: Math.max(40, predicted - spread),
      upper: Math.min(99, predicted + spread),
    };
  });
}

function parseRenewalDays(dateStr: string): number {
  const parsed = new Date(dateStr);
  if (Number.isNaN(parsed.getTime())) return 30;
  return Math.max(0, Math.ceil((parsed.getTime() - Date.now()) / 86400000));
}

export function computeRenewalPredictions(
  renewals: WorkspaceRenewal[],
  invoices: Invoice[]
): RenewalPrediction[] {
  return renewals.map((r) => {
    const daysUntilRenewal = parseRenewalDays(r.renewalDate);
    const hasOverdue = invoices.some(
      (inv) =>
        inv.status === 'overdue' &&
        inv.clientName.toLowerCase().includes(r.companyName.toLowerCase().split(' ')[0])
    );

    let probability = 82;
    if (r.status === 'pending-review') probability -= 22;
    if (hasOverdue) probability -= 28;
    if (daysUntilRenewal <= 7) probability -= 12;
    if (r.monthlyFee > 10000) probability += 8;
    if (r.status === 'renewed') probability = 100;

    probability = Math.min(99, Math.max(8, probability));
    const risk = probability >= 70 ? 'low' : probability >= 45 ? 'medium' : 'high';

    let recommendation = 'Standard renewal outreach — contract healthy.';
    if (risk === 'high') recommendation = 'Escalate to account manager; offer retention incentive.';
    else if (risk === 'medium') recommendation = 'Schedule check-in call before renewal window closes.';
    else if (daysUntilRenewal <= 14) recommendation = 'Send proactive renewal confirmation this week.';

    return {
      renewalId: r.id,
      clientName: r.clientName,
      probability,
      risk,
      recommendation,
      daysUntilRenewal,
    };
  });
}

export function computeEmployeeProductivity(
  employees: Employee[],
  tickets: Ticket[],
  tasks: InternalTask[],
  branchId: string
): EmployeeProductivity[] {
  return employees
    .filter((e) => e.branchId === branchId || branchId === '')
    .map((emp) => {
      const ticketsResolved = tickets.filter(
        (t) => t.assignedTo === emp.id && t.status === 'resolved'
      ).length;
      const tasksDone = tasks.filter(
        (t) => t.assignedTo === emp.id && t.status === 'done'
      ).length;
      const inProgress =
        tickets.filter((t) => t.assignedTo === emp.id && t.status === 'in-progress').length +
        tasks.filter((t) => t.assignedTo === emp.id && t.status === 'in-progress').length;

      const score = Math.min(
        100,
        Math.round(
          (emp.status === 'active' ? 40 : 10) +
            ticketsResolved * 12 +
            tasksDone * 10 +
            inProgress * 4
        )
      );

      const load: EmployeeProductivity['load'] = inProgress >= 3 ? 'heavy' : inProgress >= 1 ? 'balanced' : 'light';

      return {
        employeeId: emp.id,
        name: emp.name,
        role: emp.role,
        score,
        ticketsResolved,
        tasksDone,
        load,
      };
    })
    .sort((a, b) => b.score - a.score);
}

export function computeAttendanceInsights(
  visitors: Visitor[],
  employees: Employee[],
  branchId: string
): AttendanceInsight[] {
  const branchVisitors = visitors.filter((v) => v.branchId === branchId);
  const checkedIn = branchVisitors.filter((v) => v.status === 'checked-in').length;
  const completedToday = branchVisitors.filter(
    (v) => v.status === 'completed' && !v.checkOutTime?.includes('Yesterday')
  ).length;
  const activeStaff = employees.filter((e) => e.status === 'active').length;
  const onLeave = employees.filter((e) => e.status === 'on-leave').length;
  const peakHour = checkedIn >= 2 ? '10:00–11:30 AM' : '2:00–4:00 PM';

  return [
    {
      id: 'visitors-now',
      label: 'Guests on-site',
      value: String(checkedIn),
      detail: `${completedToday} completed visits today`,
      trend: checkedIn >= 2 ? 'up' : 'stable',
    },
    {
      id: 'staff-active',
      label: 'Staff on duty',
      value: String(activeStaff),
      detail: `${onLeave} on leave across network`,
      trend: 'stable',
    },
    {
      id: 'peak-window',
      label: 'Predicted peak',
      value: peakHour,
      detail: 'Based on check-in velocity',
      trend: 'up',
    },
    {
      id: 'utilization',
      label: 'Front-desk load',
      value: checkedIn >= 3 ? 'High' : checkedIn >= 1 ? 'Moderate' : 'Low',
      detail: 'Auto-adjusted from live arrivals',
      trend: checkedIn >= 3 ? 'up' : 'down',
    },
  ];
}

export function computeBIInsights(input: {
  branch: Branch | undefined;
  leads: Lead[];
  invoices: Invoice[];
  visitors: Visitor[];
  tickets: Ticket[];
  renewals: WorkspaceRenewal[];
}): BIInsight[] {
  const { branch, leads, invoices, visitors, tickets, renewals } = input;
  const hotLeads = computeLeadScores(leads).filter((s) => s.tier === 'hot').length;
  const overdue = invoices.filter((i) => i.status === 'overdue').length;
  const openTickets = tickets.filter((t) => t.status !== 'resolved').length;
  const atRiskRenewals = computeRenewalPredictions(renewals, invoices).filter(
    (r) => r.risk !== 'low'
  ).length;
  const forecast = computeOccupancyForecast(branch, 7);
  const occupancyDelta = forecast[6].predicted - (branch?.occupancyRate ?? 75);

  return [
    {
      id: 'occ-forecast',
      title: '7-day occupancy outlook',
      value: `${forecast[6].predicted}%`,
      delta: `${occupancyDelta >= 0 ? '+' : ''}${occupancyDelta}% projected`,
      positive: occupancyDelta >= 0,
    },
    {
      id: 'hot-leads',
      title: 'Hot lead pipeline',
      value: String(hotLeads),
      delta: `${leads.filter((l) => l.stage === 'negotiation').length} in negotiation`,
      positive: hotLeads > 0,
    },
    {
      id: 'renewal-risk',
      title: 'Renewals at risk',
      value: String(atRiskRenewals),
      delta: `${renewals.filter((r) => r.status === 'pending-review').length} pending review`,
      positive: atRiskRenewals === 0,
    },
    {
      id: 'ops-health',
      title: 'Open service tickets',
      value: String(openTickets),
      delta: `${overdue} overdue invoices`,
      positive: openTickets < 3,
    },
    {
      id: 'guest-flow',
      title: 'Live guest arrivals',
      value: String(visitors.filter((v) => v.status === 'checked-in').length),
      delta: 'Updated in real time',
      positive: true,
    },
  ];
}

export function generateChatbotReply(
  query: string,
  ctx: {
    branchName: string;
    occupancy: number;
    hotLeads: number;
    openTickets: number;
    atRiskRenewals: number;
    checkedInVisitors: number;
    isPublic?: boolean;
  }
): string {
  const q = query.toLowerCase();

  if (!ctx.isPublic) {
    const navTab = parseAssistNavigation(query);
    if (navTab) return navigationReply(navTab);
  }

  if (ctx.isPublic && wantsPlatformAccess(query)) {
    return platformAccessReply();
  }

  if (ctx.isPublic) {
    if (q.includes('pricing') || q.includes('plan') || q.includes('cost')) {
      return 'CoworkingOS offers flexible workspace plans — hot desks from ₹7,999/mo, dedicated desks from ₹14,999/mo, and meeting rooms from ₹24,999/mo. Sign in to explore live pricing and branch availability across Hyderabad.';
    }
    if (q.includes('coworkingos') || q.includes('what is') || q.includes('platform')) {
      return 'CoworkingOS is an all-in-one PropTech platform for coworking operators — floor maps, CRM, billing, visitor management, AI forecasting, and team ops in one workspace.';
    }
    if (q.includes('sign in') || q.includes('login') || q.includes('demo') || q.includes('access')) {
      return 'Use Enter Platform or Explore Demo on this page to choose your role and launch the full workspace. Receptionist, Community Host, and Super Admin views are available.';
    }
  }

  if (q.includes('occupancy') || q.includes('forecast') || q.includes('capacity')) {
    const suffix = ctx.isPublic
      ? ' Sign in to open Intelligence Hub for the full forecast curve.'
      : ' Check Intelligence Hub → Occupancy Forecast for the full curve.';
    return `At ${ctx.branchName}, current occupancy is ${ctx.occupancy}%. Our AI model projects a slight uptick over the next 7 days.${suffix}`;
  }
  if (q.includes('lead') || q.includes('pipeline') || q.includes('crm')) {
    return `You have ${ctx.hotLeads} hot-scored leads right now. Prioritize negotiation-stage contacts first — scores refresh dynamically as stages and values change in CRM.`;
  }
  if (q.includes('renew') || q.includes('contract') || q.includes('billing')) {
    return `${ctx.atRiskRenewals} renewal(s) flagged at medium/high risk. I recommend sending reminders from Finance → Lease Renewals for accounts with overdue invoices.`;
  }
  if (q.includes('visitor') || q.includes('guest') || q.includes('arrival')) {
    return `${ctx.checkedInVisitors} guest(s) are currently checked in. Peak arrival window is typically mid-morning. Visit Guest Arrivals for badge printing and host alerts.`;
  }
  if (q.includes('ticket') || q.includes('helpdesk') || q.includes('support')) {
    return `${ctx.openTickets} open ticket(s) across the network. WiFi and facilities items resolve fastest when assigned to IT Support — see Helpdesk & Ops.`;
  }
  if (q.includes('staff') || q.includes('employee') || q.includes('productivity')) {
    return `Employee productivity scores combine resolved tickets and completed tasks per staff member. Open Intelligence Hub → Workforce for live rankings.`;
  }
  if (q.includes('hello') || q.includes('hi') || q.includes('help')) {
    if (ctx.isPublic) {
      return `Hi! I'm CoworkingOS Assist. Ask about our platform, pricing, or say "Enter platform" to sign in — type or use the mic to navigate.`;
    }
    return `Hi! I'm CoworkingOS Assist. Ask about occupancy, leads, renewals, or say "Open CRM" / "Go to billing" to navigate — type or tap the mic.`;
  }

  if (ctx.isPublic) {
    return `I can tell you about CoworkingOS features, pricing, and live occupancy at ${ctx.branchName} (${ctx.occupancy}%). Use Enter Platform to access the full dashboard.`;
  }

  return `I can help with occupancy forecasting, lead scoring, renewal predictions, visitor flow, and helpdesk status at ${ctx.branchName}. Try asking "What's our occupancy forecast?" or "Any renewals at risk?"`;
}
