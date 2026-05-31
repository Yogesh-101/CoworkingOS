import type Database from 'better-sqlite3';
import { getSeedData } from '../db/seedData.js';

export function seedDatabase(db: Database.Database): void {
  const data = getSeedData();

  const tx = db.transaction(() => {
    db.prepare('DELETE FROM support_messages').run();
    db.prepare('DELETE FROM chat_messages').run();
    db.prepare('DELETE FROM tasks').run();
    db.prepare('DELETE FROM tickets').run();
    db.prepare('DELETE FROM employees').run();
    db.prepare('DELETE FROM proposals').run();
    db.prepare('DELETE FROM onboardings').run();
    db.prepare('DELETE FROM visitors').run();
    db.prepare('DELETE FROM notifications').run();
    db.prepare('DELETE FROM invoices').run();
    db.prepare('DELETE FROM leads').run();
    db.prepare('DELETE FROM desks').run();
    db.prepare('DELETE FROM branches').run();
    db.prepare('DELETE FROM integrations').run();
    db.prepare('DELETE FROM renewals').run();
    db.prepare('DELETE FROM cms_settings').run();
    db.prepare('DELETE FROM user_settings').run();
    db.prepare('DELETE FROM kpi').run();

    const insertBranch = db.prepare(
      'INSERT INTO branches (id, name, location, capacity, occupancy_rate) VALUES (?, ?, ?, ?, ?)'
    );
    const insertDesk = db.prepare(
      `INSERT INTO desks (id, branch_id, name, x, y, width, height, rotation, status, type, price_per_month, assignee_name)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`
    );

    for (const branch of data.branches) {
      insertBranch.run(branch.id, branch.name, branch.location, branch.capacity, branch.occupancyRate);
      for (const desk of branch.desks) {
        insertDesk.run(
          desk.id,
          branch.id,
          desk.name,
          desk.x,
          desk.y,
          desk.width,
          desk.height,
          desk.rotation ?? null,
          desk.status,
          desk.type,
          desk.pricePerMonth,
          desk.assigneeName ?? null
        );
      }
    }

    const insertLead = db.prepare(
      'INSERT INTO leads (id, name, company, email, stage, value, last_contact) VALUES (?, ?, ?, ?, ?, ?, ?)'
    );
    for (const l of data.leads) {
      insertLead.run(l.id, l.name, l.company, l.email, l.stage, l.value, l.lastContact);
    }

    const insertInvoice = db.prepare(
      'INSERT INTO invoices (id, client_name, amount, status, due_date) VALUES (?, ?, ?, ?, ?)'
    );
    for (const i of data.invoices) {
      insertInvoice.run(i.id, i.clientName, i.amount, i.status, i.dueDate);
    }

    const insertNotif = db.prepare(
      'INSERT INTO notifications (id, title, description, type, time, read) VALUES (?, ?, ?, ?, ?, ?)'
    );
    for (const n of data.notifications) {
      insertNotif.run(n.id, n.title, n.description, n.type, n.time, n.read ? 1 : 0);
    }

    const insertVisitor = db.prepare(
      `INSERT INTO visitors (id, name, company, email, phone, host, branch_id, check_in_time, check_out_time, status)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`
    );
    for (const v of data.visitors) {
      insertVisitor.run(v.id, v.name, v.company, v.email, v.phone, v.host, v.branchId, v.checkInTime, v.checkOutTime ?? null, v.status);
    }

    const insertOnb = db.prepare(
      `INSERT INTO onboardings (id, client_name, company_name, email, branch_id, desk_id, progress, steps_json, status)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)`
    );
    for (const o of data.onboardings) {
      insertOnb.run(o.id, o.clientName, o.companyName, o.email, o.branchId, o.deskId ?? null, o.progress, JSON.stringify(o.steps), o.status);
    }

    const insertProp = db.prepare(
      'INSERT INTO proposals (id, lead_name, company, desk_type, monthly_fee, duration_months, status, date_created) VALUES (?, ?, ?, ?, ?, ?, ?, ?)'
    );
    for (const p of data.proposals) {
      insertProp.run(p.id, p.leadName, p.company, p.deskType, p.monthlyFee, p.durationMonths, p.status, p.dateCreated);
    }

    const insertEmp = db.prepare(
      'INSERT INTO employees (id, name, role, branch_id, email, status) VALUES (?, ?, ?, ?, ?, ?)'
    );
    for (const e of data.employees) {
      insertEmp.run(e.id, e.name, e.role, e.branchId, e.email, e.status);
    }

    const insertTicket = db.prepare(
      `INSERT INTO tickets (id, title, description, category, priority, status, branch_id, member_name, assigned_to, date_created)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`
    );
    for (const t of data.tickets) {
      insertTicket.run(t.id, t.title, t.description, t.category, t.priority, t.status, t.branchId, t.memberName, t.assignedTo ?? null, t.dateCreated);
    }

    const insertTask = db.prepare(
      'INSERT INTO tasks (id, title, description, priority, status, assigned_to, due_date) VALUES (?, ?, ?, ?, ?, ?, ?)'
    );
    for (const t of data.tasks) {
      insertTask.run(t.id, t.title, t.description, t.priority, t.status, t.assignedTo, t.dueDate);
    }

    const insertChat = db.prepare(
      'INSERT INTO chat_messages (id, channel, sender_name, sender_role, text, time, priority, pinned) VALUES (?, ?, ?, ?, ?, ?, ?, ?)'
    );
    for (const m of data.chatMessages) {
      insertChat.run(m.id, m.channel, m.senderName, m.senderRole, m.text, m.time, m.priority ?? null, m.pinned ? 1 : 0);
    }

    const insertSupport = db.prepare('INSERT INTO support_messages (id, role, text, time) VALUES (?, ?, ?, ?)');
    for (const m of data.supportMessages) {
      insertSupport.run(m.id, m.role, m.text, m.time);
    }

    const cms = data.cmsSettings;
    db.prepare(
      `INSERT INTO cms_settings (id, hero_title, hero_sub, branding_color, brand_name, show_pricing, hot_desk_price, dedicated_price, meeting_price)
       VALUES (1, ?, ?, ?, ?, ?, ?, ?, ?)`
    ).run(cms.heroTitle, cms.heroSub, cms.brandingColor, cms.brandName, cms.showPricing ? 1 : 0, cms.hotDeskPrice, cms.dedicatedPrice, cms.meetingPrice);

    const insertInt = db.prepare(
      'INSERT INTO integrations (id, name, description, category, icon, connected, webhook_url) VALUES (?, ?, ?, ?, ?, ?, ?)'
    );
    for (const i of data.integrations) {
      insertInt.run(i.id, i.name, i.description, i.category, i.icon, i.connected ? 1 : 0, i.webhookUrl ?? null);
    }

    const insertRen = db.prepare(
      'INSERT INTO renewals (id, client_name, company_name, branch_id, desk_name, monthly_fee, renewal_date, payment_cycle, status) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)'
    );
    for (const r of data.renewals) {
      insertRen.run(r.id, r.clientName, r.companyName, r.branchId, r.deskName, r.monthlyFee, r.renewalDate, r.paymentCycle, r.status);
    }

    const us = data.userSettings;
    db.prepare(
      'INSERT INTO user_settings (id, theme, notifications_enabled, email_digest, privacy_mode) VALUES (1, ?, ?, ?, ?)'
    ).run(us.theme, us.notificationsEnabled ? 1 : 0, us.emailDigest, us.privacyMode ? 1 : 0);

    const k = data.kpi;
    db.prepare(
      'INSERT INTO kpi (id, total_revenue, revenue_growth, occupancy_rate, occupancy_growth, active_members, churn_rate) VALUES (1, ?, ?, ?, ?, ?, ?)'
    ).run(k.totalRevenue, k.revenueGrowth, k.occupancyRate, k.occupancyGrowth, k.activeMembers, k.churnRate);
  });

  tx();
}
