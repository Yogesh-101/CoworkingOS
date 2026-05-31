import 'dotenv/config';
import { ensureBootstrap } from './workspace-store.js';

const email = process.env.OWNER_EMAIL || 'admin@example.com';
const password = process.env.OWNER_PASSWORD || 'Admin@123';

ensureBootstrap(email, password)
  .then((m) => {
    console.log('Bootstrap complete:', m);
    process.exit(0);
  })
  .catch((err) => {
    console.error('Bootstrap failed:', err);
    process.exit(1);
  });
