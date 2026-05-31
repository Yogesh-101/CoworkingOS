import type {
  Branch,
  Lead,
  Invoice,
  KPIData,
  Visitor,
  ClientOnboarding,
  Proposal,
  Employee,
  Ticket,
  InternalTask,
  ChatMessage,
  CMSSettings,
  IntegrationSetting,
  WorkspaceRenewal,
  UserSettings,
  SupportMessage,
  EmailLog,
} from '@/types';
import type { Notification } from '@/store';

export interface BootstrapPayload {
  branches: Branch[];
  leads: Lead[];
  invoices: Invoice[];
  kpi: KPIData;
  notifications: Notification[];
  visitors: Visitor[];
  onboardings: ClientOnboarding[];
  proposals: Proposal[];
  employees: Employee[];
  tickets: Ticket[];
  tasks: InternalTask[];
  chatMessages: ChatMessage[];
  supportMessages: SupportMessage[];
  cmsSettings: CMSSettings;
  integrations: IntegrationSetting[];
  renewals: WorkspaceRenewal[];
  userSettings: UserSettings;
  emailLogs?: EmailLog[];
}

const API_BASE = import.meta.env.VITE_API_URL ?? '/api';

async function request<T>(path: string, init?: RequestInit): Promise<T> {
  const res = await fetch(`${API_BASE}${path}`, {
    headers: { 'Content-Type': 'application/json', ...(init?.headers ?? {}) },
    ...init,
  });
  if (!res.ok) {
    const err = (await res.json().catch(() => ({}))) as { error?: string };
    throw new Error(err.error ?? `API ${res.status}`);
  }
  return res.json() as Promise<T>;
}

export async function fetchBootstrap(): Promise<BootstrapPayload> {
  return request<BootstrapPayload>('/bootstrap');
}

export async function mutate(
  action: string,
  payload: Record<string, unknown> = {},
  context?: { activeBranchId?: string }
): Promise<BootstrapPayload> {
  return request<BootstrapPayload>('/mutate', {
    method: 'POST',
    body: JSON.stringify({ action, payload, context }),
  });
}

export async function generateAiText(body: {
  systemInstruction: string;
  userMessage: string;
  history?: { role: 'user' | 'model'; parts: { text: string }[] }[];
  maxOutputTokens?: number;
  temperature?: number;
}): Promise<string> {
  const res = await request<{ text: string }>('/ai/generate', {
    method: 'POST',
    body: JSON.stringify(body),
  });
  return res.text;
}

export async function syncBootstrap(data: BootstrapPayload): Promise<BootstrapPayload> {
  const res = await fetch(`${API_BASE}/sync`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(data),
  });
  if (!res.ok) {
    const err = (await res.json().catch(() => ({}))) as { error?: string };
    throw new Error(err.error ?? `API ${res.status}`);
  }
  return res.json() as Promise<BootstrapPayload>;
}

export async function checkApiHealth(): Promise<boolean> {
  try {
    const res = await fetch(`${API_BASE}/health`);
    return res.ok;
  } catch {
    return false;
  }
}

export function applyBootstrapData(
  data: BootstrapPayload
): Omit<BootstrapPayload, never> {
  return { ...data };
}
