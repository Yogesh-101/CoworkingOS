import type { Branch, Lead, Invoice, Visitor, Ticket, WorkspaceRenewal, ChatMessage } from '@/types';
import { computeLeadScores, computeRenewalPredictions, computeOccupancyForecast } from '@/lib/intelligence';

export interface WorkspaceSnapshot {
  branchName: string;
  occupancy: number;
  hotLeads: number;
  openTickets: number;
  atRiskRenewals: number;
  checkedInVisitors: number;
  isPublic?: boolean;
  leads?: Lead[];
  renewals?: WorkspaceRenewal[];
}

export function buildAssistSystemPrompt(ctx: WorkspaceSnapshot): string {
  const forecast = computeOccupancyForecast(
    { id: '', name: ctx.branchName, location: '', capacity: 0, occupancyRate: ctx.occupancy, desks: [] },
    7
  );
  const outlook = forecast[6]?.predicted ?? ctx.occupancy;

  const base = `You are CoworkingOS Assist, a concise AI copilot for coworking space operators.
Answer in 2-4 short sentences. Use plain text only (no markdown).
Be helpful, professional, and actionable. Reference live workspace data when relevant.

Current workspace (${ctx.branchName}):
- Occupancy: ${ctx.occupancy}% (7-day AI outlook: ~${outlook}%)
- Hot-scored leads: ${ctx.hotLeads}
- Open helpdesk tickets: ${ctx.openTickets}
- Renewals at medium/high risk: ${ctx.atRiskRenewals}
- Guests checked in now: ${ctx.checkedInVisitors}`;

  if (ctx.isPublic) {
    return `${base}

The user is on the public marketing site (not signed in). Explain CoworkingOS features, pricing (hot desk ~$399/mo, dedicated ~$790/mo, meeting rooms ~$1200/mo), and guide them to use "Enter Platform" or "Explore Demo" to sign in. You may cite the demo stats above as sample data.`;
  }

  return `${base}

The user is signed into the CoworkingOS app. Mention relevant modules: Intelligence Hub, CRM, Finance & Billing, Guest Arrivals, Helpdesk, Team Chat, Floor Map.`;
}

export function buildTeamChatSystemPrompt(
  channelLabel: string,
  channelDesc: string,
  personaName: string,
  personaRole: string,
  snapshot: WorkspaceSnapshot
): string {
  return `You are ${personaName}, ${personaRole} at a coworking space, replying in the Team Chat channel #${channelLabel}.
Channel purpose: ${channelDesc}

Write ONE brief in-character reply (1-3 sentences) to the latest team message. Sound natural, collaborative, and specific to the channel topic.
Do not use markdown. Do not prefix with your name.

Workspace context: ${snapshot.branchName} at ${snapshot.occupancy}% occupancy, ${snapshot.openTickets} open tickets, ${snapshot.checkedInVisitors} guests on-site, ${snapshot.hotLeads} hot leads.`;
}

export function pickTeamChatPersona(
  channelId: string,
  messageText: string
): { name: string; role: string } {
  const lower = messageText.toLowerCase();
  if (channelId === 'billing-urgent' || lower.includes('invoice') || lower.includes('billing')) {
    return { name: 'Gavin Belson', role: 'Branch Manager' };
  }
  if (
    channelId === 'facility-alerts' ||
    lower.includes('wifi') ||
    lower.includes('network') ||
    lower.includes('hvac')
  ) {
    return { name: 'Jared Dunn', role: 'IT Support' };
  }
  if (lower.includes('visitor') || lower.includes('guest') || lower.includes('tour')) {
    return { name: 'Monica Hall', role: 'Community Host' };
  }
  return { name: 'Monica Hall', role: 'Community Host' };
}

export function snapshotFromStore(input: {
  branch?: Branch;
  leads: Lead[];
  tickets: Ticket[];
  renewals: WorkspaceRenewal[];
  invoices: Invoice[];
  visitors: Visitor[];
  isPublic?: boolean;
}): WorkspaceSnapshot {
  const branch = input.branch;
  const hotLeads = computeLeadScores(input.leads).filter((s) => s.tier === 'hot').length;
  const atRiskRenewals = computeRenewalPredictions(input.renewals, input.invoices).filter(
    (r) => r.risk !== 'low'
  ).length;

  return {
    branchName: branch?.name ?? 'CoworkingOS Network',
    occupancy: branch?.occupancyRate ?? 75,
    hotLeads,
    openTickets: input.tickets.filter((t) => t.status !== 'resolved').length,
    atRiskRenewals,
    checkedInVisitors: input.visitors.filter((v) => v.status === 'checked-in').length,
    isPublic: input.isPublic,
    leads: input.leads,
    renewals: input.renewals,
  };
}

export function chatHistoryForGemini(
  messages: { role: 'user' | 'assistant'; text: string }[],
  limit = 8
): { role: 'user' | 'model'; parts: { text: string }[] }[] {
  return messages.slice(-limit).map((m) => ({
    role: m.role === 'user' ? 'user' : 'model',
    parts: [{ text: m.text }],
  }));
}

export function teamChannelHistoryForGemini(
  messages: ChatMessage[],
  adminName: string,
  limit = 6
): { role: 'user' | 'model'; parts: { text: string }[] }[] {
  return messages.slice(-limit).map((m) => ({
    role: m.senderName === adminName ? 'user' : 'model',
    parts: [{ text: `${m.senderName}: ${m.text}` }],
  }));
}
