import 'dotenv/config';
import compression from 'compression';
import cors from 'cors';
import express from 'express';
import helmet from 'helmet';
import { SereniBaseClient, getSereniBaseUrl } from './serenibase.js';
import {
  ensureBootstrap,
  getManifest,
  loadWorkspaceState,
  saveWorkspaceState,
} from './workspace-store.js';
import { INITIAL_WORKSPACE_STATE } from './seed-data.js';

const PORT = Number(process.env.PORT || 3001);
const ADMIN_EMAIL = process.env.OWNER_EMAIL || 'admin@example.com';
const ADMIN_PASSWORD = process.env.OWNER_PASSWORD || 'Admin@123';

const app = express();
app.use(helmet({ contentSecurityPolicy: false }));
app.use(compression());
app.use(
  cors({
    origin: process.env.CORS_ORIGIN?.split(',') ?? ['http://localhost:3000', 'http://127.0.0.1:3000'],
    credentials: true,
  })
);
app.use(express.json({ limit: '10mb' }));

function mapRole(sereniRoles?: string): 'Super Admin' | 'Community Host' | 'Receptionist' {
  const r = (sereniRoles ?? '').toLowerCase();
  if (r.includes('owner') || r.includes('admin')) return 'Super Admin';
  if (r.includes('host') || r.includes('manager')) return 'Community Host';
  return 'Receptionist';
}

function getBearer(req: express.Request): string | null {
  const h = req.headers.authorization;
  if (!h?.startsWith('Bearer ')) return null;
  return h.slice(7);
}

app.get('/health', async (_req, res) => {
  let sereni = 'unknown';
  try {
    await new SereniBaseClient().health();
    sereni = 'ok';
  } catch {
    sereni = 'down';
  }
  res.json({
    status: 'ok',
    serenibase: sereni,
    serenibaseUrl: getSereniBaseUrl(),
    bootstrapped: Boolean(getManifest()),
  });
});

app.post('/api/v1/auth/login', async (req, res) => {
  try {
    const { email, password } = req.body as { email?: string; password?: string };
    if (!email || !password) {
      res.status(400).json({ success: false, message: 'Email and password required' });
      return;
    }

    await ensureBootstrap(ADMIN_EMAIL, ADMIN_PASSWORD);
    const client = new SereniBaseClient();
    const data = await client.login(email, password);
    const user = data.user as {
      id: string;
      email: string;
      first_name?: string;
      last_name?: string;
      roles?: string;
    };

    res.json({
      success: true,
      data: {
        user: {
          id: user.id,
          email: user.email,
          name: [user.first_name, user.last_name].filter(Boolean).join(' ') || user.email,
          role: mapRole(user.roles),
        },
        token: data.token,
      },
    });
  } catch (err) {
    res.status(401).json({
      success: false,
      message: err instanceof Error ? err.message : 'Login failed',
    });
  }
});

app.get('/api/v1/workspace', async (req, res) => {
  try {
    const token = getBearer(req);
    if (!token) {
      res.status(401).json({ success: false, message: 'Unauthorized' });
      return;
    }
    await ensureBootstrap(ADMIN_EMAIL, ADMIN_PASSWORD);
    const state = await loadWorkspaceState(token);
    res.json({ success: true, data: state });
  } catch (err) {
    res.status(500).json({
      success: false,
      message: err instanceof Error ? err.message : 'Failed to load workspace',
    });
  }
});

app.put('/api/v1/workspace', async (req, res) => {
  try {
    const token = getBearer(req);
    if (!token) {
      res.status(401).json({ success: false, message: 'Unauthorized' });
      return;
    }
    await ensureBootstrap(ADMIN_EMAIL, ADMIN_PASSWORD);
    const body = req.body as typeof INITIAL_WORKSPACE_STATE;
    await saveWorkspaceState(token, body);
    res.json({ success: true, message: 'Workspace saved' });
  } catch (err) {
    res.status(500).json({
      success: false,
      message: err instanceof Error ? err.message : 'Failed to save workspace',
    });
  }
});

async function start() {
  console.log('Waiting for SereniBase and bootstrapping workspace…');
  try {
    await ensureBootstrap(ADMIN_EMAIL, ADMIN_PASSWORD);
    console.log('CoworkingOS workspace ready on SereniBase');
  } catch (err) {
    console.warn('Bootstrap deferred (SereniBase may still be starting):', err);
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`Coworking API listening on http://0.0.0.0:${PORT}`);
    console.log(`SereniBase: ${getSereniBaseUrl()}`);
  });
}

start();
