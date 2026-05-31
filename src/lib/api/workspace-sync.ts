import { USE_SERENIBASE } from './config';
import { fetchWorkspaceState, saveWorkspaceState } from './client';

export { USE_SERENIBASE };

let persistTimer: ReturnType<typeof setTimeout> | null = null;
let isHydrating = false;

export type WorkspacePayload = Record<string, unknown>;

const PERSIST_KEYS = [
  'activeBranchId',
  'branches',
  'leads',
  'invoices',
  'notifications',
  'visitors',
  'onboardings',
  'proposals',
  'employees',
  'tickets',
  'tasks',
  'chatMessages',
  'cmsSettings',
  'integrations',
  'renewals',
  'kpi',
  'userSettings',
] as const;

export function extractWorkspacePayload(state: WorkspacePayload): WorkspacePayload {
  const payload: WorkspacePayload = {};
  for (const key of PERSIST_KEYS) {
    if (key in state) payload[key] = state[key];
  }
  return payload;
}

export function setHydrating(value: boolean) {
  isHydrating = value;
}

export async function hydrateFromApi(): Promise<WorkspacePayload> {
  isHydrating = true;
  try {
    return await fetchWorkspaceState();
  } finally {
    isHydrating = false;
  }
}

export function schedulePersist(getState: () => WorkspacePayload) {
  if (!USE_SERENIBASE || isHydrating) return;
  if (persistTimer) clearTimeout(persistTimer);
  persistTimer = setTimeout(async () => {
    try {
      await saveWorkspaceState(extractWorkspacePayload(getState()));
    } catch (err) {
      console.error('Workspace persist failed:', err);
    }
  }, 600);
}
