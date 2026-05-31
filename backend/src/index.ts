import 'dotenv/config';
import cors from 'cors';
import express from 'express';
import { openDatabase } from './db/index.js';
import { createApiRouter } from './routes/index.js';

const PORT = Number(process.env.PORT) || 4000;
const CORS_ORIGIN = process.env.CORS_ORIGIN || 'http://localhost:3000';

const db = openDatabase();
const app = express();

app.use(cors({ origin: CORS_ORIGIN }));
app.use(express.json({ limit: '1mb' }));

app.use('/api', createApiRouter(db));

app.listen(PORT, () => {
  console.log(`CoworkingOS API running on http://localhost:${PORT}`);
});
