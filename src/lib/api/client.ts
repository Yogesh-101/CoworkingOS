import { API_BASE_URL } from './config';
import type { UserRole } from '@/lib/rbac';

export interface AuthUser {
  id: string;
  email: string;
  name: string;
  role: UserRole;
}

export interface AuthTokens {
  access_token: string;
  refresh_token: string;
}

const TOKEN_KEY = 'co_access_token';
const REFRESH_KEY = 'co_refresh_token';
const USER_KEY = 'co_user';

export function getStoredToken(): string | null {
  return localStorage.getItem(TOKEN_KEY);
}

export function getStoredUser(): AuthUser | null {
  const raw = localStorage.getItem(USER_KEY);
  if (!raw) return null;
  try {
    return JSON.parse(raw) as AuthUser;
  } catch {
    return null;
  }
}

export function storeSession(user: AuthUser, token: AuthTokens) {
  localStorage.setItem(TOKEN_KEY, token.access_token);
  localStorage.setItem(REFRESH_KEY, token.refresh_token);
  localStorage.setItem(USER_KEY, JSON.stringify(user));
}

export function clearSession() {
  localStorage.removeItem(TOKEN_KEY);
  localStorage.removeItem(REFRESH_KEY);
  localStorage.removeItem(USER_KEY);
}

async function apiFetch<T>(path: string, options: RequestInit = {}): Promise<T> {
  const token = getStoredToken();
  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
    ...(options.headers as Record<string, string>),
  };
  if (token) headers.Authorization = `Bearer ${token}`;

  const res = await fetch(`${API_BASE_URL}${path}`, { ...options, headers });
  const json = await res.json();

  if (!res.ok || json.success === false) {
    throw new Error(json.message || `API error ${res.status}`);
  }

  return json.data as T;
}

export async function login(email: string, password: string) {
  const data = await apiFetch<{ user: AuthUser; token: AuthTokens }>('/api/v1/auth/login', {
    method: 'POST',
    body: JSON.stringify({ email, password }),
  });
  storeSession(data.user, data.token);
  return data;
}

export async function fetchWorkspaceState() {
  return apiFetch<Record<string, unknown>>('/api/v1/workspace');
}

export async function saveWorkspaceState(state: Record<string, unknown>) {
  const token = getStoredToken();
  const res = await fetch(`${API_BASE_URL}/api/v1/workspace`, {
    method: 'PUT',
    headers: {
      'Content-Type': 'application/json',
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
    },
    body: JSON.stringify(state),
  });
  const json = await res.json();
  if (!res.ok || json.success === false) {
    throw new Error(json.message || 'Failed to save workspace');
  }
}

export async function checkApiHealth(): Promise<boolean> {
  try {
    const res = await fetch(`${API_BASE_URL}/health`);
    const json = await res.json();
    return json.status === 'ok';
  } catch {
    return false;
  }
}
