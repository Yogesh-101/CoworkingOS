import type Database from 'better-sqlite3';
import type { BootstrapPayload } from '../types.js';

export function loadBootstrap(db: Database.Database): BootstrapPayload {
  const branches = db.prepare('SELECT * FROM branches ORDER BY id').all() as Array<{
    id: string;
    name: string;
    location: string;
    capacity: number;
    occupancy_rate: number;
  }>;

  const deskRows = db.prepare('SELECT * FROM desks ORDER BY branch_id, id').all() as Array<{
    id: string;
    branch_id: string;
    name: string;
    x: number;
    y: number;
    width: number;
    height: number;
    rotation: number | null;
    status: string;
    type: string;
    price_per_month: number;
    assignee_name: string | null;
  }>;

  const desksByBranch = new Map<string, typeof deskRows>();
  for (const d of deskRows) {
    const list = desksByBranch.get(d.branch_id) ?? [];
    list.push(d);
    desksByBranch.set(d.branch_id, list);
  }

  const leads = db.prepare('SELECT * FROM leads ORDER BY id').all() as Array<Record<string, unknown>>;
  const invoices = db.prepare('SELECT * FROM invoices ORDER BY id DESC').all() as Array<Record<string, unknown>>;
  const notifications = db.prepare('SELECT * FROM notifications ORDER BY rowid DESC').all() as Array<Record<string, unknown>>;
  const visitors = db.prepare('SELECT * FROM visitors ORDER BY rowid DESC').all() as Array<Record<string, unknown>>;
  const onboardings = db.prepare('SELECT * FROM onboardings ORDER BY id').all() as Array<Record<string, unknown>>;
  const proposals = db.prepare('SELECT * FROM proposals ORDER BY rowid DESC').all() as Array<Record<string, unknown>>;
  const employees = db.prepare('SELECT * FROM employees ORDER BY id').all() as Array<Record<string, unknown>>;
  const tickets = db.prepare('SELECT * FROM tickets ORDER BY rowid DESC').all() as Array<Record<string, unknown>>;
  const tasks = db.prepare('SELECT * FROM tasks ORDER BY id').all() as Array<Record<string, unknown>>;
  const chatMessages = db.prepare('SELECT * FROM chat_messages ORDER BY rowid ASC').all() as Array<Record<string, unknown>>;
  const supportMessages = db.prepare('SELECT * FROM support_messages ORDER BY rowid ASC').all() as Array<Record<string, unknown>>;
  const cms = db.prepare('SELECT * FROM cms_settings WHERE id = 1').get() as Record<string, unknown>;
  const integrations = db.prepare('SELECT * FROM integrations ORDER BY id').all() as Array<Record<string, unknown>>;
  const renewals = db.prepare('SELECT * FROM renewals ORDER BY id').all() as Array<Record<string, unknown>>;
  const userSettings = db.prepare('SELECT * FROM user_settings WHERE id = 1').get() as Record<string, unknown>;
  const kpi = db.prepare('SELECT * FROM kpi WHERE id = 1').get() as Record<string, unknown>;

  return {
    branches: branches.map((b) => ({
      id: b.id,
      name: b.name,
      location: b.location,
      capacity: b.capacity,
      occupancyRate: b.occupancy_rate,
      desks: (desksByBranch.get(b.id) ?? []).map((d) => ({
        id: d.id,
        x: d.x,
        y: d.y,
        width: d.width,
        height: d.height,
        rotation: d.rotation ?? undefined,
        status: d.status as BootstrapPayload['branches'][0]['desks'][0]['status'],
        type: d.type as BootstrapPayload['branches'][0]['desks'][0]['type'],
        name: d.name,
        pricePerMonth: d.price_per_month,
        assigneeName: d.assignee_name ?? undefined,
      })),
    })),
    leads: leads.map((l) => ({
      id: l.id as string,
      name: l.name as string,
      company: l.company as string,
      email: l.email as string,
      stage: l.stage as BootstrapPayload['leads'][0]['stage'],
      value: l.value as number,
      lastContact: l.last_contact as string,
    })),
    invoices: invoices.map((i) => ({
      id: i.id as string,
      clientName: i.client_name as string,
      amount: i.amount as number,
      status: i.status as BootstrapPayload['invoices'][0]['status'],
      dueDate: i.due_date as string,
    })),
    notifications: notifications.map((n) => ({
      id: n.id as string,
      title: n.title as string,
      description: n.description as string,
      type: n.type as BootstrapPayload['notifications'][0]['type'],
      time: n.time as string,
      read: Boolean(n.read),
    })),
    visitors: visitors.map((v) => ({
      id: v.id as string,
      name: v.name as string,
      company: v.company as string,
      email: v.email as string,
      phone: v.phone as string,
      host: v.host as string,
      branchId: v.branch_id as string,
      checkInTime: v.check_in_time as string,
      checkOutTime: (v.check_out_time as string) || undefined,
      status: v.status as BootstrapPayload['visitors'][0]['status'],
    })),
    onboardings: onboardings.map((o) => ({
      id: o.id as string,
      clientName: o.client_name as string,
      companyName: o.company_name as string,
      email: o.email as string,
      branchId: o.branch_id as string,
      deskId: (o.desk_id as string) || undefined,
      progress: o.progress as number,
      steps: JSON.parse(o.steps_json as string),
      status: o.status as BootstrapPayload['onboardings'][0]['status'],
    })),
    proposals: proposals.map((p) => ({
      id: p.id as string,
      leadName: p.lead_name as string,
      company: p.company as string,
      deskType: p.desk_type as BootstrapPayload['proposals'][0]['deskType'],
      monthlyFee: p.monthly_fee as number,
      durationMonths: p.duration_months as number,
      status: p.status as BootstrapPayload['proposals'][0]['status'],
      dateCreated: p.date_created as string,
    })),
    employees: employees.map((e) => ({
      id: e.id as string,
      name: e.name as string,
      role: e.role as BootstrapPayload['employees'][0]['role'],
      branchId: e.branch_id as string,
      email: e.email as string,
      status: e.status as BootstrapPayload['employees'][0]['status'],
    })),
    tickets: tickets.map((t) => ({
      id: t.id as string,
      title: t.title as string,
      description: t.description as string,
      category: t.category as BootstrapPayload['tickets'][0]['category'],
      priority: t.priority as BootstrapPayload['tickets'][0]['priority'],
      status: t.status as BootstrapPayload['tickets'][0]['status'],
      branchId: t.branch_id as string,
      memberName: t.member_name as string,
      assignedTo: (t.assigned_to as string) || undefined,
      dateCreated: t.date_created as string,
    })),
    tasks: tasks.map((t) => ({
      id: t.id as string,
      title: t.title as string,
      description: t.description as string,
      priority: t.priority as BootstrapPayload['tasks'][0]['priority'],
      status: t.status as BootstrapPayload['tasks'][0]['status'],
      assignedTo: t.assigned_to as string,
      dueDate: t.due_date as string,
    })),
    chatMessages: chatMessages.map((m) => ({
      id: m.id as string,
      channel: m.channel as string,
      senderName: m.sender_name as string,
      senderRole: m.sender_role as string,
      text: m.text as string,
      time: m.time as string,
      priority: (m.priority as 'normal' | 'urgent') || undefined,
      pinned: Boolean(m.pinned),
    })),
    supportMessages: supportMessages.map((m) => ({
      id: m.id as string,
      role: m.role as 'user' | 'assistant',
      text: m.text as string,
      time: m.time as string,
    })),
    cmsSettings: {
      heroTitle: cms.hero_title as string,
      heroSub: cms.hero_sub as string,
      brandingColor: cms.branding_color as BootstrapPayload['cmsSettings']['brandingColor'],
      brandName: cms.brand_name as string,
      showPricing: Boolean(cms.show_pricing),
      hotDeskPrice: cms.hot_desk_price as number,
      dedicatedPrice: cms.dedicated_price as number,
      meetingPrice: cms.meeting_price as number,
    },
    integrations: integrations.map((i) => ({
      id: i.id as string,
      name: i.name as string,
      description: i.description as string,
      category: i.category as BootstrapPayload['integrations'][0]['category'],
      icon: i.icon as string,
      connected: Boolean(i.connected),
      webhookUrl: (i.webhook_url as string) || undefined,
    })),
    renewals: renewals.map((r) => ({
      id: r.id as string,
      clientName: r.client_name as string,
      companyName: r.company_name as string,
      branchId: r.branch_id as string,
      deskName: r.desk_name as string,
      monthlyFee: r.monthly_fee as number,
      renewalDate: r.renewal_date as string,
      paymentCycle: r.payment_cycle as BootstrapPayload['renewals'][0]['paymentCycle'],
      status: r.status as BootstrapPayload['renewals'][0]['status'],
    })),
    userSettings: {
      theme: userSettings.theme as 'dark' | 'light',
      notificationsEnabled: Boolean(userSettings.notifications_enabled),
      emailDigest: userSettings.email_digest as BootstrapPayload['userSettings']['emailDigest'],
      privacyMode: Boolean(userSettings.privacy_mode),
    },
    kpi: {
      totalRevenue: kpi.total_revenue as number,
      revenueGrowth: kpi.revenue_growth as number,
      occupancyRate: kpi.occupancy_rate as number,
      occupancyGrowth: kpi.occupancy_growth as number,
      activeMembers: kpi.active_members as number,
      churnRate: kpi.churn_rate as number,
    },
  };
}
