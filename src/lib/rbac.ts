export type UserRole = 'Super Admin' | 'Community Host' | 'Receptionist';

export type AppTab =
  | 'dashboard'
  | 'floor-map'
  | 'crm'
  | 'visitors'
  | 'helpdesk'
  | 'billing'
  | 'team-chat'
  | 'cms'
  | 'erp'
  | 'intelligence'
  | 'settings';

export const MODULE_LABELS: Record<Exclude<AppTab, 'settings'>, string> = {
  dashboard: 'Dashboard',
  'floor-map': 'Floor Map',
  crm: 'CRM & Leads',
  visitors: 'Guest Arrivals',
  helpdesk: 'Helpdesk & Ops',
  billing: 'Finance & Billing',
  'team-chat': 'Team Chat',
  cms: 'Public Web CMS',
  erp: 'ERP Admin',
  intelligence: 'Intelligence Hub',
};

const ROLE_TAB_ACCESS: Record<UserRole, AppTab[]> = {
  'Super Admin': [
    'dashboard',
    'floor-map',
    'crm',
    'visitors',
    'helpdesk',
    'billing',
    'team-chat',
    'cms',
    'erp',
    'intelligence',
    'settings',
  ],
  'Community Host': [
    'dashboard',
    'floor-map',
    'crm',
    'visitors',
    'helpdesk',
    'team-chat',
    'intelligence',
  ],
  Receptionist: ['dashboard', 'visitors', 'helpdesk', 'intelligence'],
};

export function getAllowedTabs(role: UserRole): AppTab[] {
  return ROLE_TAB_ACCESS[role];
}

export function isTabAllowed(role: UserRole, tabId: string): boolean {
  return getAllowedTabs(role).includes(tabId as AppTab);
}

export function getModuleLabelsForRole(role: UserRole): string[] {
  return getAllowedTabs(role)
    .filter((t) => t !== 'settings')
    .map((t) => MODULE_LABELS[t as keyof typeof MODULE_LABELS]);
}

export const ROLE_OPTIONS: {
  id: UserRole;
  title: string;
  subtitle: string;
  accent: string;
}[] = [
  {
    id: 'Super Admin',
    title: 'Super Admin',
    subtitle: 'Full write access — all branches, billing, CMS & settings',
    accent: 'brand',
  },
  {
    id: 'Community Host',
    title: 'Community Host',
    subtitle: 'Operations hub — floor map, CRM, visitors, helpdesk & team chat',
    accent: 'purple',
  },
  {
    id: 'Receptionist',
    title: 'Receptionist',
    subtitle: 'Front desk — guest arrivals, helpdesk & dashboard overview',
    accent: 'emerald',
  },
];
