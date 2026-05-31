import type Database from 'better-sqlite3';

export function initSchema(db: Database.Database): void {
  db.pragma('journal_mode = WAL');
  db.pragma('foreign_keys = ON');

  db.exec(`
    CREATE TABLE IF NOT EXISTS branches (
      id TEXT PRIMARY KEY,
      name TEXT NOT NULL,
      location TEXT NOT NULL,
      capacity INTEGER NOT NULL,
      occupancy_rate INTEGER NOT NULL
    );

    CREATE TABLE IF NOT EXISTS desks (
      id TEXT PRIMARY KEY,
      branch_id TEXT NOT NULL REFERENCES branches(id) ON DELETE CASCADE,
      name TEXT NOT NULL,
      x REAL NOT NULL,
      y REAL NOT NULL,
      width REAL NOT NULL,
      height REAL NOT NULL,
      rotation REAL,
      status TEXT NOT NULL,
      type TEXT NOT NULL,
      price_per_month REAL NOT NULL,
      assignee_name TEXT
    );

    CREATE TABLE IF NOT EXISTS leads (
      id TEXT PRIMARY KEY,
      name TEXT NOT NULL,
      company TEXT NOT NULL,
      email TEXT NOT NULL,
      stage TEXT NOT NULL,
      value REAL NOT NULL,
      last_contact TEXT NOT NULL
    );

    CREATE TABLE IF NOT EXISTS invoices (
      id TEXT PRIMARY KEY,
      client_name TEXT NOT NULL,
      amount REAL NOT NULL,
      status TEXT NOT NULL,
      due_date TEXT NOT NULL
    );

    CREATE TABLE IF NOT EXISTS notifications (
      id TEXT PRIMARY KEY,
      title TEXT NOT NULL,
      description TEXT NOT NULL,
      type TEXT NOT NULL,
      time TEXT NOT NULL,
      read INTEGER NOT NULL DEFAULT 0
    );

    CREATE TABLE IF NOT EXISTS visitors (
      id TEXT PRIMARY KEY,
      name TEXT NOT NULL,
      company TEXT NOT NULL,
      email TEXT NOT NULL,
      phone TEXT NOT NULL,
      host TEXT NOT NULL,
      branch_id TEXT NOT NULL,
      check_in_time TEXT NOT NULL,
      check_out_time TEXT,
      status TEXT NOT NULL
    );

    CREATE TABLE IF NOT EXISTS onboardings (
      id TEXT PRIMARY KEY,
      client_name TEXT NOT NULL,
      company_name TEXT NOT NULL,
      email TEXT NOT NULL,
      branch_id TEXT NOT NULL,
      desk_id TEXT,
      progress INTEGER NOT NULL,
      steps_json TEXT NOT NULL,
      status TEXT NOT NULL
    );

    CREATE TABLE IF NOT EXISTS proposals (
      id TEXT PRIMARY KEY,
      lead_name TEXT NOT NULL,
      company TEXT NOT NULL,
      desk_type TEXT NOT NULL,
      monthly_fee REAL NOT NULL,
      duration_months INTEGER NOT NULL,
      status TEXT NOT NULL,
      date_created TEXT NOT NULL
    );

    CREATE TABLE IF NOT EXISTS employees (
      id TEXT PRIMARY KEY,
      name TEXT NOT NULL,
      role TEXT NOT NULL,
      branch_id TEXT NOT NULL,
      email TEXT NOT NULL,
      status TEXT NOT NULL
    );

    CREATE TABLE IF NOT EXISTS tickets (
      id TEXT PRIMARY KEY,
      title TEXT NOT NULL,
      description TEXT NOT NULL,
      category TEXT NOT NULL,
      priority TEXT NOT NULL,
      status TEXT NOT NULL,
      branch_id TEXT NOT NULL,
      member_name TEXT NOT NULL,
      assigned_to TEXT,
      date_created TEXT NOT NULL
    );

    CREATE TABLE IF NOT EXISTS tasks (
      id TEXT PRIMARY KEY,
      title TEXT NOT NULL,
      description TEXT NOT NULL,
      priority TEXT NOT NULL,
      status TEXT NOT NULL,
      assigned_to TEXT NOT NULL,
      due_date TEXT NOT NULL
    );

    CREATE TABLE IF NOT EXISTS chat_messages (
      id TEXT PRIMARY KEY,
      channel TEXT NOT NULL,
      sender_name TEXT NOT NULL,
      sender_role TEXT NOT NULL,
      text TEXT NOT NULL,
      time TEXT NOT NULL,
      priority TEXT,
      pinned INTEGER DEFAULT 0
    );

    CREATE TABLE IF NOT EXISTS support_messages (
      id TEXT PRIMARY KEY,
      role TEXT NOT NULL,
      text TEXT NOT NULL,
      time TEXT NOT NULL
    );

    CREATE TABLE IF NOT EXISTS cms_settings (
      id INTEGER PRIMARY KEY CHECK (id = 1),
      hero_title TEXT NOT NULL,
      hero_sub TEXT NOT NULL,
      branding_color TEXT NOT NULL,
      brand_name TEXT NOT NULL,
      show_pricing INTEGER NOT NULL,
      hot_desk_price REAL NOT NULL,
      dedicated_price REAL NOT NULL,
      meeting_price REAL NOT NULL
    );

    CREATE TABLE IF NOT EXISTS integrations (
      id TEXT PRIMARY KEY,
      name TEXT NOT NULL,
      description TEXT NOT NULL,
      category TEXT NOT NULL,
      icon TEXT NOT NULL,
      connected INTEGER NOT NULL,
      webhook_url TEXT
    );

    CREATE TABLE IF NOT EXISTS renewals (
      id TEXT PRIMARY KEY,
      client_name TEXT NOT NULL,
      company_name TEXT NOT NULL,
      branch_id TEXT NOT NULL,
      desk_name TEXT NOT NULL,
      monthly_fee REAL NOT NULL,
      renewal_date TEXT NOT NULL,
      payment_cycle TEXT NOT NULL,
      status TEXT NOT NULL
    );

    CREATE TABLE IF NOT EXISTS user_settings (
      id INTEGER PRIMARY KEY CHECK (id = 1),
      theme TEXT NOT NULL,
      notifications_enabled INTEGER NOT NULL,
      email_digest TEXT NOT NULL,
      privacy_mode INTEGER NOT NULL
    );

    CREATE TABLE IF NOT EXISTS kpi (
      id INTEGER PRIMARY KEY CHECK (id = 1),
      total_revenue REAL NOT NULL,
      revenue_growth REAL NOT NULL,
      occupancy_rate REAL NOT NULL,
      occupancy_growth REAL NOT NULL,
      active_members INTEGER NOT NULL,
      churn_rate REAL NOT NULL
    );
  `);
}

export function isDatabaseEmpty(db: Database.Database): boolean {
  const row = db.prepare('SELECT COUNT(*) as count FROM branches').get() as { count: number };
  return row.count === 0;
}
