import type { AppTab } from '@/lib/rbac';
import { MODULE_LABELS } from '@/lib/rbac';

const NAV_VERBS =
  /\b(go to|open|show me|show|navigate to|navigate|take me to|switch to|view|launch|bring up)\b/i;

const TAB_KEYWORDS: { tab: AppTab; keywords: string[] }[] = [
  { tab: 'dashboard', keywords: ['dashboard', 'home', 'overview'] },
  { tab: 'floor-map', keywords: ['floor map', 'floor-map', 'floor plan', 'desk map', 'desks'] },
  { tab: 'crm', keywords: ['crm', 'leads', 'sales pipeline', 'pipeline'] },
  { tab: 'visitors', keywords: ['guest arrivals', 'visitors', 'guests', 'arrivals', 'reception'] },
  { tab: 'helpdesk', keywords: ['helpdesk', 'tickets', 'support desk', 'ops'] },
  { tab: 'intelligence', keywords: ['intelligence hub', 'intelligence', 'ai hub', 'forecast'] },
  { tab: 'billing', keywords: ['finance', 'billing', 'invoices', 'renewals', 'payments'] },
  { tab: 'team-chat', keywords: ['team chat', 'chat', 'messages'] },
  { tab: 'cms', keywords: ['cms', 'website', 'public web', 'marketing site'] },
  { tab: 'erp', keywords: ['erp', 'admin panel', 'erp admin'] },
  { tab: 'settings', keywords: ['settings', 'preferences'] },
];

function matchesTab(q: string, keywords: string[]): boolean {
  return keywords.some((kw) => {
    if (q === kw || q.startsWith(`${kw} `) || q.endsWith(` ${kw}`)) return true;
    const re = new RegExp(`\\b${kw.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}\\b`, 'i');
    return re.test(q);
  });
}

export function parseAssistNavigation(query: string): AppTab | null {
  const q = query.trim().toLowerCase();
  if (!q) return null;

  const explicitNav = NAV_VERBS.test(q);
  const shortNav = q.split(/\s+/).length <= 4;

  for (const { tab, keywords } of TAB_KEYWORDS) {
    if (!matchesTab(q, keywords)) continue;
    if (explicitNav || shortNav) return tab;
  }

  return null;
}

export function navigationReply(tab: AppTab): string {
  if (tab === 'settings') {
    return 'Opening Settings — manage your profile and workspace preferences.';
  }
  const label = MODULE_LABELS[tab as keyof typeof MODULE_LABELS];
  return `Opening ${label}. You can ask me anything about that module while you're there.`;
}

export function wantsPlatformAccess(query: string): boolean {
  const q = query.toLowerCase();
  return (
    /\b(sign in|log in|login|enter platform|open platform|launch app|go to app|open demo|explore demo)\b/.test(
      q
    ) || q === 'demo' || q === 'app'
  );
}

export function platformAccessReply(): string {
  return 'Taking you to sign in — use demo credentials or your account to enter the CoworkingOS workspace.';
}
