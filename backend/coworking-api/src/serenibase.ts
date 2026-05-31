const SERENIBASE_URL = (process.env.SERENIBASE_URL || 'http://localhost:8080').replace(/\/$/, '');

export interface SereniSuccess<T = unknown> {
  success: boolean;
  message?: string;
  data?: T;
}

export class SereniBaseClient {
  constructor(private accessToken?: string) {}

  withToken(token: string) {
    return new SereniBaseClient(token);
  }

  async request<T>(
    method: string,
    path: string,
    body?: unknown
  ): Promise<T> {
    const headers: Record<string, string> = {
      'Content-Type': 'application/json',
    };
    if (this.accessToken) {
      headers.Authorization = `Bearer ${this.accessToken}`;
    }

    const res = await fetch(`${SERENIBASE_URL}/api/v1${path}`, {
      method,
      headers,
      body: body !== undefined ? JSON.stringify(body) : undefined,
    });

    const json = (await res.json()) as SereniSuccess<T> & { error?: { message?: string } };

    if (!res.ok || json.success === false) {
      const msg = json.message || json.error?.message || res.statusText;
      throw new Error(`SereniBase ${method} ${path}: ${msg}`);
    }

    return json.data as T;
  }

  async health(): Promise<unknown> {
    const res = await fetch(`${SERENIBASE_URL}/api/v1/health`);
    return res.json();
  }

  async login(email: string, password: string) {
    return this.request<{
      user: { id: string; email: string; first_name?: string; last_name?: string; roles?: string };
      token: { access_token: string; refresh_token: string };
    }>('POST', '/auth/login', { email, password });
  }

  async listWorkspaces() {
    return this.request<{ workspaces?: Array<{ id: string; title: string }> } | Array<{ id: string; title: string }>>(
      'GET',
      '/workspace/'
    );
  }

  async createWorkspace(title: string, description: string) {
    return this.request<{ id: string; title: string }>('POST', '/workspace/create', {
      title,
      description,
    });
  }

  async createBase(workspaceId: string, title: string) {
    return this.request<{ id: string; title: string }>('POST', '/base/create', {
      workspace_id: workspaceId,
      title,
      description: 'CoworkingOS operational data',
    });
  }

  async createTable(workspaceId: string, baseId: string, title: string) {
    return this.request<{ id: string; model?: { id: string }; columns?: Array<{ id: string; title: string; column_name?: string }> }>(
      'POST',
      '/table/create',
      {
        workspace_id: workspaceId,
        base_id: baseId,
        title,
        description: `CoworkingOS ${title}`,
      }
    );
  }

  async addColumn(tableId: string, title: string, uidt: string) {
    return this.request('POST', `/table/${tableId}/columns`, {
      model_id: tableId,
      title,
      uidt,
      dt: 'varchar',
    });
  }

  async getRecords(tableId: string) {
    return this.request<{ records?: Array<Record<string, unknown>> }>(
      'GET',
      `/table/${tableId}/records`
    );
  }

  async createRows(tableId: string, rows: Array<Record<string, unknown>>) {
    return this.request('POST', '/row/create', {
      model_id: tableId,
      rows,
    });
  }

  async updateRow(tableId: string, rowId: number, values: Record<string, unknown>) {
    return this.request('PATCH', '/row/update', {
      model_id: tableId,
      row_id: rowId,
      values,
    });
  }
}

export function getSereniBaseUrl() {
  return SERENIBASE_URL;
}
