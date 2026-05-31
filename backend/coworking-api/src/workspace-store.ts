import { SereniBaseClient } from './serenibase.js';
import { loadManifest, saveManifest, type CoworkingManifest } from './manifest.js';
import { INITIAL_WORKSPACE_STATE } from './seed-data.js';

const WORKSPACE_TITLE = 'CoworkingOS';
const SNAPSHOT_TABLE = 'coworking_snapshot';

let manifest: CoworkingManifest | null = loadManifest();

export function getManifest() {
  return manifest;
}

function parseRecords(data: unknown): Array<Record<string, unknown>> {
  if (!data) return [];
  if (Array.isArray(data)) return data as Array<Record<string, unknown>>;
  const wrapped = data as { records?: Array<Record<string, unknown>> };
  return wrapped.records ?? [];
}

function extractPayload(record: Record<string, unknown>, columnKey: string): string | null {
  const val = record[columnKey] ?? record['payload'] ?? record['Payload'];
  if (typeof val === 'string') return val;
  if (val != null) return JSON.stringify(val);
  return null;
}

export async function ensureBootstrap(adminEmail: string, adminPassword: string): Promise<CoworkingManifest> {
  if (manifest) return manifest;

  const client = new SereniBaseClient();
  await waitForHealth(client);

  const login = await client.login(adminEmail, adminPassword);
  const authed = client.withToken(login.token.access_token);

  let workspaceId: string | undefined;
  const workspacesRaw = await authed.listWorkspaces();
  const workspaces = Array.isArray(workspacesRaw)
    ? workspacesRaw
    : (workspacesRaw as { workspaces?: Array<{ id: string; title: string }> }).workspaces ?? [];

  const existing = workspaces.find((w) => w.title === WORKSPACE_TITLE);
  if (existing) {
    workspaceId = existing.id;
  } else {
    const created = await authed.createWorkspace(WORKSPACE_TITLE, 'CoworkingOS multi-center operations');
    workspaceId = created.id;
  }

  const bases = await authed.request<{ bases?: Array<{ id: string }> } | Array<{ id: string }>>(
    'GET',
    `/workspace/${workspaceId}/bases`
  );
  const baseList = Array.isArray(bases) ? bases : (bases as { bases?: Array<{ id: string }> }).bases ?? [];
  let baseId = baseList[0]?.id;
  if (!baseId) {
    const base = await authed.createBase(workspaceId, 'Operations');
    baseId = base.id;
  }

  const table = await authed.createTable(workspaceId, baseId, SNAPSHOT_TABLE);
  const tableId = table.id || table.model?.id;
  if (!tableId) throw new Error('Failed to create snapshot table');

  const payloadColumnKey = 'payload';
  try {
    await authed.addColumn(tableId, 'payload', 'LongText');
  } catch {
    /* table may already include default columns */
  }

  const seedJson = JSON.stringify(INITIAL_WORKSPACE_STATE);
  const insertResult = await authed.createRows(tableId, [{ payload: seedJson }]);
  const inserted = (insertResult as { rows?: Array<{ record?: Record<string, unknown> }> })?.rows;
  const rowId =
    Number(inserted?.[0]?.record?.id ?? inserted?.[0]?.record?.row_id ?? 1) || 1;

  manifest = {
    workspaceId,
    baseId,
    snapshotTableId: tableId,
    snapshotRowId: rowId,
    payloadColumnKey,
  };
  saveManifest(manifest);
  return manifest;
}

async function waitForHealth(client: SereniBaseClient, attempts = 60) {
  for (let i = 0; i < attempts; i++) {
    try {
      await client.health();
      return;
    } catch {
      await new Promise((r) => setTimeout(r, 2000));
    }
  }
  throw new Error('SereniBase health check timed out');
}

export async function loadWorkspaceState(token: string): Promise<typeof INITIAL_WORKSPACE_STATE> {
  if (!manifest) throw new Error('Workspace not bootstrapped');
  const client = new SereniBaseClient(token);
  const data = await client.getRecords(manifest.snapshotTableId);
  const records = parseRecords(data);
  const row =
    records.find((r) => Number(r.id ?? r.row_id) === manifest!.snapshotRowId) ?? records[0];
  if (!row) return { ...INITIAL_WORKSPACE_STATE };

  const raw = extractPayload(row, manifest.payloadColumnKey);
  if (!raw) return { ...INITIAL_WORKSPACE_STATE };
  return JSON.parse(raw) as typeof INITIAL_WORKSPACE_STATE;
}

export async function saveWorkspaceState(token: string, state: typeof INITIAL_WORKSPACE_STATE) {
  if (!manifest) throw new Error('Workspace not bootstrapped');
  const client = new SereniBaseClient(token);
  await client.updateRow(manifest.snapshotTableId, manifest.snapshotRowId, {
    [manifest.payloadColumnKey]: JSON.stringify(state),
  });
}
