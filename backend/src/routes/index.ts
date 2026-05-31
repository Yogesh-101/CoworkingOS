import { Router } from 'express';
import type Database from 'better-sqlite3';
import { loadBootstrap } from '../services/bootstrap.js';
import { runMutation } from '../services/mutations.js';
import { persistBootstrap, resetDatabase } from '../services/persist.js';
import type { BootstrapPayload, MutationRequest } from '../types.js';

const GEMINI_MODEL = 'gemini-2.0-flash';
const API_BASE = 'https://generativelanguage.googleapis.com/v1beta';

export function createApiRouter(db: Database.Database): Router {
  const router = Router();

  router.get('/health', (_req, res) => {
    res.json({ ok: true, service: 'coworkingos-api', time: new Date().toISOString() });
  });

  router.get('/bootstrap', (_req, res) => {
    res.json(loadBootstrap(db));
  });

  router.post('/mutate', (req, res) => {
    try {
      const body = req.body as MutationRequest;
      if (!body?.action) {
        res.status(400).json({ error: 'action is required' });
        return;
      }
      const data = runMutation(db, body);
      res.json(data);
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Mutation failed';
      res.status(400).json({ error: message });
    }
  });

  router.post('/ai/generate', async (req, res) => {
    const apiKey = process.env.GEMINI_API_KEY?.trim();
    if (!apiKey) {
      res.status(503).json({ error: 'GEMINI_API_KEY is not configured on the server' });
      return;
    }

    const { systemInstruction, userMessage, history = [], maxOutputTokens = 512, temperature = 0.65 } =
      req.body ?? {};

    if (!systemInstruction || !userMessage) {
      res.status(400).json({ error: 'systemInstruction and userMessage are required' });
      return;
    }

    try {
      const response = await fetch(
        `${API_BASE}/models/${GEMINI_MODEL}:generateContent?key=${encodeURIComponent(apiKey)}`,
        {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            systemInstruction: { parts: [{ text: systemInstruction }] },
            contents: [...history, { role: 'user', parts: [{ text: userMessage }] }],
            generationConfig: { temperature, maxOutputTokens },
          }),
        }
      );

      if (!response.ok) {
        const detail = await response.text();
        res.status(response.status).json({ error: detail.slice(0, 300) });
        return;
      }

      const data = (await response.json()) as {
        candidates?: { content?: { parts?: { text?: string }[] } }[];
      };
      const text = data.candidates?.[0]?.content?.parts?.map((p) => p.text ?? '').join('').trim();
      if (!text) {
        res.status(502).json({ error: 'Gemini returned an empty response' });
        return;
      }
      res.json({ text });
    } catch (err) {
      const message = err instanceof Error ? err.message : 'AI request failed';
      res.status(500).json({ error: message });
    }
  });

  router.post('/sync', (req, res) => {
    try {
      persistBootstrap(db, req.body as BootstrapPayload);
      res.json(loadBootstrap(db));
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Sync failed';
      res.status(400).json({ error: message });
    }
  });

  router.post('/seed/reset', (_req, res) => {
    resetDatabase(db);
    res.json(loadBootstrap(db));
  });

  return router;
}
