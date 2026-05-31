import Database from 'better-sqlite3';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import { initSchema, isDatabaseEmpty } from './schema.js';
import { seedDatabase } from './seed.js';

const __dirname = path.dirname(fileURLToPath(import.meta.url));

export function openDatabase(dbPath?: string): Database.Database {
  const resolved =
    dbPath ||
    process.env.DATABASE_PATH ||
    path.join(__dirname, '..', '..', 'data', 'coworkingos.db');

  fs.mkdirSync(path.dirname(resolved), { recursive: true });
  const db = new Database(resolved);
  initSchema(db);

  if (isDatabaseEmpty(db)) {
    seedDatabase(db);
  }

  return db;
}
