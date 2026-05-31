import fs from 'fs';
import path from 'path';

export interface CoworkingManifest {
  workspaceId: string;
  baseId: string;
  snapshotTableId: string;
  snapshotRowId: number;
  payloadColumnKey: string;
}

const MANIFEST_PATH =
  process.env.MANIFEST_PATH || path.join(process.cwd(), 'data', 'coworking-manifest.json');

export function loadManifest(): CoworkingManifest | null {
  try {
    if (!fs.existsSync(MANIFEST_PATH)) return null;
    return JSON.parse(fs.readFileSync(MANIFEST_PATH, 'utf-8')) as CoworkingManifest;
  } catch {
    return null;
  }
}

export function saveManifest(manifest: CoworkingManifest) {
  fs.mkdirSync(path.dirname(MANIFEST_PATH), { recursive: true });
  fs.writeFileSync(MANIFEST_PATH, JSON.stringify(manifest, null, 2));
}
