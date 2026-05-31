import { fetchBootstrap, mutate, type BootstrapPayload } from './client';
import { USE_API } from './config';
import type { AppState } from '@/store';

let hydrating = false;
let persistTimer: ReturnType<typeof setTimeout> | null = null;

export function setHydrating(value: boolean): void {
  hydrating = value;
}

export function isHydrating(): boolean {
  return hydrating;
}

export function mapBootstrapToState(data: BootstrapPayload): Partial<AppState> {
  return {
    branches: data.branches,
    leads: data.leads,
    invoices: data.invoices,
    kpi: data.kpi,
    notifications: data.notifications,
    visitors: data.visitors,
    onboardings: data.onboardings,
    proposals: data.proposals,
    employees: data.employees,
    tickets: data.tickets,
    tasks: data.tasks,
    chatMessages: data.chatMessages,
    supportMessages: data.supportMessages,
    cmsSettings: data.cmsSettings,
    integrations: data.integrations,
    renewals: data.renewals,
    userSettings: data.userSettings,
  };
}

export function extractWorkspacePayload(state: AppState): BootstrapPayload {
  return {
    branches: state.branches,
    leads: state.leads,
    invoices: state.invoices,
    kpi: state.kpi,
    notifications: state.notifications,
    visitors: state.visitors,
    onboardings: state.onboardings,
    proposals: state.proposals,
    employees: state.employees,
    tickets: state.tickets,
    tasks: state.tasks,
    chatMessages: state.chatMessages,
    supportMessages: state.supportMessages,
    cmsSettings: state.cmsSettings,
    integrations: state.integrations,
    renewals: state.renewals,
    userSettings: state.userSettings,
  };
}

export async function hydrateFromApi(): Promise<Partial<AppState>> {
  const data = await fetchBootstrap();
  return mapBootstrapToState(data);
}

const API_BASE = import.meta.env.VITE_API_URL ?? '/api';

async function syncToApi(payload: BootstrapPayload): Promise<void> {
  const res = await fetch(`${API_BASE}/sync`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(payload),
  });
  if (!res.ok) {
    const err = (await res.json().catch(() => ({}))) as { error?: string };
    throw new Error(err.error ?? `Sync failed (${res.status})`);
  }
}

export function schedulePersist(getPayload: () => BootstrapPayload): void {
  if (!USE_API || hydrating) return;
  if (persistTimer) clearTimeout(persistTimer);
  persistTimer = setTimeout(() => {
    void syncToApi(getPayload()).catch((err) => {
      console.warn('[CoworkingOS API] persist failed:', err);
    });
  }, 400);
}

export { USE_API };

export async function runMutationViaApi(
  action: string,
  payload: Record<string, unknown>,
  context?: { activeBranchId?: string }
): Promise<Partial<AppState>> {
  const data = await mutate(action, payload, context);
  return mapBootstrapToState(data);
}
