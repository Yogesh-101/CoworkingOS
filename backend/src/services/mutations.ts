import type Database from 'better-sqlite3';
import type { BootstrapPayload, MutationRequest } from '../types.js';
import { loadBootstrap } from './bootstrap.js';

function nowTime(): string {
  return new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
}

function nowDate(): string {
  return new Date().toLocaleDateString('en-US', { month: 'short', day: '2-digit', year: 'numeric' });
}

function insertNotification(
  db: Database.Database,
  n: { title: string; description: string; type: string }
): void {
  db.prepare(
    'INSERT INTO notifications (id, title, description, type, time, read) VALUES (?, ?, ?, ?, ?, 0)'
  ).run(`n-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`, n.title, n.description, n.type, 'Just now');
}

function recalcBranchOccupancy(db: Database.Database, branchId: string): void {
  const desks = db.prepare('SELECT status FROM desks WHERE branch_id = ?').all(branchId) as Array<{ status: string }>;
  const occupiedOrReserved = desks.filter((d) => d.status === 'occupied' || d.status === 'reserved').length;
  const rate = desks.length ? Math.round((occupiedOrReserved / desks.length) * 100) : 0;
  db.prepare('UPDATE branches SET occupancy_rate = ? WHERE id = ?').run(rate, branchId);
}

function deskActivityLabel(type: string): string {
  switch (type) {
    case 'meeting-room':
      return 'Meeting Space';
    case 'private-office':
      return 'Private Office Suite';
    case 'dedicated':
      return 'Dedicated Workstation';
    default:
      return 'Hot-desk Desk';
  }
}

export function runMutation(db: Database.Database, req: MutationRequest): BootstrapPayload {
  const { action, payload = {}, context = {} } = req;
  const activeBranchId = (context.activeBranchId as string) || 'b1';

  const tx = db.transaction(() => {
    switch (action) {
      case 'addVisitor': {
        const v = payload as Record<string, string>;
        const id = `v-${Date.now()}`;
        db.prepare(
          `INSERT INTO visitors (id, name, company, email, phone, host, branch_id, check_in_time, check_out_time, status)
           VALUES (?, ?, ?, ?, ?, ?, ?, ?, NULL, 'checked-in')`
        ).run(id, v.name, v.company, v.email, v.phone, v.host, v.branchId, nowTime());
        insertNotification(db, {
          title: 'Visitor Checked In',
          description: `${v.name} (${v.company}) reached Reception for host: ${v.host}.`,
          type: 'visitor',
        });
        break;
      }
      case 'checkOutVisitor': {
        db.prepare("UPDATE visitors SET status = 'completed', check_out_time = ? WHERE id = ?").run(
          nowTime(),
          payload.id
        );
        break;
      }
      case 'toggleOnboardingStep': {
        const row = db.prepare('SELECT * FROM onboardings WHERE id = ?').get(payload.onboardingId) as Record<string, unknown>;
        if (row) {
          const steps = JSON.parse(row.steps_json as string) as Array<{ id: string; completed: boolean }>;
          const updated = steps.map((s) =>
            s.id === payload.stepId ? { ...s, completed: !s.completed } : s
          );
          const completedCount = updated.filter((s) => s.completed).length;
          const progress = Math.round((completedCount / updated.length) * 100);
          const status = progress === 100 ? 'completed' : 'active';
          db.prepare('UPDATE onboardings SET steps_json = ?, progress = ?, status = ? WHERE id = ?').run(
            JSON.stringify(updated),
            progress,
            status,
            payload.onboardingId
          );
        }
        break;
      }
      case 'completeOnboarding': {
        const row = db.prepare('SELECT * FROM onboardings WHERE id = ?').get(payload.id) as Record<string, unknown>;
        if (row) {
          const steps = JSON.parse(row.steps_json as string).map((s: { id: string; label: string }) => ({
            ...s,
            completed: true,
          }));
          db.prepare('UPDATE onboardings SET steps_json = ?, progress = 100, status = ? WHERE id = ?').run(
            JSON.stringify(steps),
            'completed',
            payload.id
          );
          insertNotification(db, {
            title: 'Client Onboarding Completed',
            description: `Fully onboarded member ${row.client_name} (${row.company_name}) into CoworkingOS.`,
            type: 'system',
          });
        }
        break;
      }
      case 'addProposal': {
        const p = payload as Record<string, unknown>;
        const id = `prop-${Date.now()}`;
        db.prepare(
          'INSERT INTO proposals (id, lead_name, company, desk_type, monthly_fee, duration_months, status, date_created) VALUES (?, ?, ?, ?, ?, ?, ?, ?)'
        ).run(id, p.leadName, p.company, p.deskType, p.monthlyFee, p.durationMonths, 'sent', nowDate());
        insertNotification(db, {
          title: 'Proposal Contract Sent',
          description: `Quotation sent to ${p.leadName} (${p.company}) for a ${p.deskType} contract valued at ₹${p.monthlyFee.toLocaleString('en-IN')}/month.`,
          type: 'lead',
        });
        break;
      }
      case 'updateProposalStatus': {
        const prop = db.prepare('SELECT * FROM proposals WHERE id = ?').get(payload.id) as Record<string, unknown>;
        const status = payload.status as string;
        if (prop) {
          db.prepare('UPDATE proposals SET status = ? WHERE id = ?').run(status, payload.id);
          if (status === 'accepted') {
            db.prepare("UPDATE leads SET stage = 'won', last_contact = 'Just now' WHERE lower(name) = lower(?) OR lower(company) = lower(?)").run(
              prop.lead_name,
              prop.company
            );
            const newInvoiceId = `INV-${Math.floor(2050 + Math.random() * 2000)}`;
            db.prepare('INSERT INTO invoices (id, client_name, amount, status, due_date) VALUES (?, ?, ?, ?, ?)').run(
              newInvoiceId,
              prop.company || prop.lead_name,
              (prop.monthly_fee as number) * (prop.duration_months as number),
              'pending',
              nowDate()
            );
            const onbId = `onb-${Date.now()}`;
            const steps = [
              { id: 'step-1', label: 'Review & Sign Workspace Lease Agreement', completed: true },
              { id: 'step-2', label: 'Issue Kisi Mobile Smart Access Key', completed: false },
              { id: 'step-3', label: 'Collect Initial Month Deposit & Onboarding Fee', completed: false },
              { id: 'step-4', label: 'Introduce to Community Slack Workspace', completed: false },
              { id: 'step-5', label: 'Setup Custom Dedicated Desk Label & Ergonomic Check-in', completed: false },
            ];
            db.prepare(
              `INSERT INTO onboardings (id, client_name, company_name, email, branch_id, desk_id, progress, steps_json, status)
               VALUES (?, ?, ?, ?, ?, NULL, 20, ?, 'active')`
            ).run(
              onbId,
              prop.lead_name,
              prop.company,
              `${String(prop.lead_name).toLowerCase().replace(/\s+/g, '')}@${String(prop.company).toLowerCase().replace(/\s+/g, '') || 'member'}.io`,
              activeBranchId,
              JSON.stringify(steps)
            );
            db.prepare('UPDATE kpi SET active_members = active_members + 1 WHERE id = 1').run();
            insertNotification(db, {
              title: 'Onboarding Activated',
              description: `Onboarding process generated dynamically for ${prop.lead_name}.`,
              type: 'system',
            });
            insertNotification(db, {
              title: 'Invoice Issued',
              description: `Automated invoice ${newInvoiceId} generated for ${prop.company}.`,
              type: 'billing',
            });
          } else if (status === 'declined') {
            db.prepare("UPDATE leads SET stage = 'lost', last_contact = 'Just now' WHERE lower(name) = lower(?) OR lower(company) = lower(?)").run(
              prop.lead_name,
              prop.company
            );
          }
          insertNotification(db, {
            title: `Proposal Status: ${status.toUpperCase()}`,
            description: `${prop.lead_name} proposal was marked as ${status}.`,
            type: 'lead',
          });
        }
        break;
      }
      case 'addEmployee': {
        const e = payload as Record<string, string>;
        db.prepare('INSERT INTO employees (id, name, role, branch_id, email, status) VALUES (?, ?, ?, ?, ?, ?)').run(
          `emp-${Date.now()}`,
          e.name,
          e.role,
          e.branchId,
          e.email,
          e.status
        );
        break;
      }
      case 'updateEmployeeStatus': {
        db.prepare('UPDATE employees SET status = ? WHERE id = ?').run(payload.status, payload.id);
        break;
      }
      case 'addTicket': {
        const t = payload as Record<string, string>;
        db.prepare(
          `INSERT INTO tickets (id, title, description, category, priority, status, branch_id, member_name, assigned_to, date_created)
           VALUES (?, ?, ?, ?, ?, 'open', ?, ?, NULL, ?)`
        ).run(`t-${Date.now()}`, t.title, t.description, t.category, t.priority, t.branchId, t.memberName, nowDate());
        insertNotification(db, {
          title: 'New Service Ticket Logged',
          description: `Member ${t.memberName} opened ticket: "${t.title}" (${t.category}).`,
          type: 'ticket',
        });
        break;
      }
      case 'updateTicketStatus': {
        db.prepare('UPDATE tickets SET status = ? WHERE id = ?').run(payload.status, payload.id);
        insertNotification(db, {
          title: `Ticket Status: ${String(payload.status).toUpperCase()}`,
          description: `Ticket #${payload.id} is now ${payload.status}.`,
          type: 'ticket',
        });
        break;
      }
      case 'assignTicket': {
        db.prepare("UPDATE tickets SET assigned_to = ?, status = 'in-progress' WHERE id = ?").run(
          payload.employeeId,
          payload.id
        );
        break;
      }
      case 'addTask': {
        const t = payload as Record<string, string>;
        db.prepare(
          'INSERT INTO tasks (id, title, description, priority, status, assigned_to, due_date) VALUES (?, ?, ?, ?, ?, ?, ?)'
        ).run(`tsk-${Date.now()}`, t.title, t.description, t.priority, 'todo', t.assignedTo, t.dueDate);
        break;
      }
      case 'updateTaskStatus': {
        db.prepare('UPDATE tasks SET status = ? WHERE id = ?').run(payload.status, payload.id);
        break;
      }
      case 'addChatMessage': {
        const p = payload as Record<string, unknown>;
        db.prepare(
          'INSERT INTO chat_messages (id, channel, sender_name, sender_role, text, time, priority, pinned) VALUES (?, ?, ?, ?, ?, ?, ?, 0)'
        ).run(
          `msg-${Date.now()}`,
          p.channel,
          p.senderName,
          p.senderRole,
          p.text,
          nowTime(),
          p.priority ?? null
        );
        break;
      }
      case 'addSupportMessage': {
        db.prepare('INSERT INTO support_messages (id, role, text, time) VALUES (?, ?, ?, ?)').run(
          `sup-${Date.now()}`,
          payload.role,
          payload.text,
          nowTime()
        );
        break;
      }
      case 'updateCMSSettings': {
        const s = payload as Record<string, unknown>;
        const current = db.prepare('SELECT * FROM cms_settings WHERE id = 1').get() as Record<string, unknown>;
        db.prepare(
          `UPDATE cms_settings SET hero_title = ?, hero_sub = ?, branding_color = ?, brand_name = ?, show_pricing = ?, hot_desk_price = ?, dedicated_price = ?, meeting_price = ? WHERE id = 1`
        ).run(
          s.heroTitle ?? current.hero_title,
          s.heroSub ?? current.hero_sub,
          s.brandingColor ?? current.branding_color,
          s.brandName ?? current.brand_name,
          s.showPricing !== undefined ? (s.showPricing ? 1 : 0) : current.show_pricing,
          s.hotDeskPrice ?? current.hot_desk_price,
          s.dedicatedPrice ?? current.dedicated_price,
          s.meetingPrice ?? current.meeting_price
        );
        break;
      }
      case 'toggleIntegration': {
        const row = db.prepare('SELECT * FROM integrations WHERE id = ?').get(payload.id) as Record<string, unknown>;
        if (row) {
          const connected = !row.connected;
          db.prepare('UPDATE integrations SET connected = ?, webhook_url = ? WHERE id = ?').run(
            connected ? 1 : 0,
            connected ? row.webhook_url || `https://hooks.live-api.io/v1/${row.id}-${Math.floor(Math.random() * 1000)}` : null,
            payload.id
          );
          insertNotification(db, {
            title: `Integration ${connected ? 'Connected' : 'Disconnected'}`,
            description: `${row.name} service link was updated successfully.`,
            type: 'system',
          });
        }
        break;
      }
      case 'updateIntegrationWebhook': {
        db.prepare('UPDATE integrations SET webhook_url = ? WHERE id = ?').run(payload.url, payload.id);
        break;
      }
      case 'renewContract': {
        const ren = db.prepare('SELECT * FROM renewals WHERE id = ?').get(payload.id) as Record<string, unknown>;
        if (ren) {
          db.prepare("UPDATE renewals SET status = 'renewed' WHERE id = ?").run(payload.id);
          db.prepare('INSERT INTO invoices (id, client_name, amount, status, due_date) VALUES (?, ?, ?, ?, ?)').run(
            `INV-${Math.floor(4000 + Math.random() * 5000)}`,
            ren.company_name,
            ren.monthly_fee,
            'paid',
            nowDate()
          );
          insertNotification(db, {
            title: 'Workspace Lease Renewed',
            description: `Successfully extended lease for ${ren.client_name} (${ren.company_name}) for ₹${ren.monthly_fee.toLocaleString('en-IN')}/mo.`,
            type: 'billing',
          });
        }
        break;
      }
      case 'sendRenewalReminder': {
        const ren = db.prepare('SELECT * FROM renewals WHERE id = ?').get(payload.id) as Record<string, unknown>;
        if (ren) {
          insertNotification(db, {
            title: 'Renewal Notification Sent',
            description: `Dispatched automated checkout reminder to ${ren.client_name} (${ren.company_name}).`,
            type: 'billing',
          });
        }
        break;
      }
      case 'addLead': {
        const l = payload as Record<string, unknown>;
        db.prepare(
          'INSERT INTO leads (id, name, company, email, stage, value, last_contact) VALUES (?, ?, ?, ?, ?, ?, ?)'
        ).run(`l-${Date.now()}`, l.name, l.company, l.email, l.stage, l.value, 'Just now');
        insertNotification(db, {
          title: 'New Lead Created',
          description: `${l.name} from ${l.company} entered the ${l.stage} pipeline.`,
          type: 'lead',
        });
        break;
      }
      case 'updateLeadStage': {
        const lead = db.prepare('SELECT * FROM leads WHERE id = ?').get(payload.id) as Record<string, unknown>;
        if (lead) {
          db.prepare('UPDATE leads SET stage = ?, last_contact = ? WHERE id = ?').run(payload.stage, 'Just now', payload.id);
          insertNotification(db, {
            title: 'Lead Stage Transitioned',
            description: `${lead.name} (${lead.company}) was promoted to ${payload.stage} stage.`,
            type: 'lead',
          });
        }
        break;
      }
      case 'deleteLead': {
        db.prepare('DELETE FROM leads WHERE id = ?').run(payload.id);
        break;
      }
      case 'addInvoice': {
        const inv = payload as Record<string, unknown>;
        const id = `INV-${Math.floor(2045 + Math.random() * 1000)}`;
        db.prepare('INSERT INTO invoices (id, client_name, amount, status, due_date) VALUES (?, ?, ?, ?, ?)').run(
          id,
          inv.clientName,
          inv.amount,
          inv.status,
          inv.dueDate
        );
        insertNotification(db, {
          title: 'Invoice Issued',
          description: `Invoice ${id} generated for ${inv.clientName} (₹${inv.amount.toLocaleString('en-IN')}).`,
          type: 'billing',
        });
        break;
      }
      case 'updateInvoiceStatus': {
        const invoice = db.prepare('SELECT * FROM invoices WHERE id = ?').get(payload.id) as Record<string, unknown>;
        if (invoice && payload.status === 'paid' && invoice.status !== 'paid') {
          db.prepare('UPDATE kpi SET total_revenue = total_revenue + ? WHERE id = 1').run(invoice.amount);
        }
        db.prepare('UPDATE invoices SET status = ? WHERE id = ?').run(payload.status, payload.id);
        if (invoice) {
          insertNotification(db, {
            title: `Invoice marked as ${String(payload.status).toUpperCase()}`,
            description: `Invoice ${payload.id} for ${invoice.client_name} was updated to ${payload.status}.`,
            type: 'billing',
          });
        }
        break;
      }
      case 'bookDesk': {
        const { branchId, deskId, assigneeName } = payload as Record<string, string>;
        const desk = db.prepare('SELECT * FROM desks WHERE id = ? AND branch_id = ?').get(deskId, branchId) as Record<string, unknown>;
        const branch = db.prepare('SELECT * FROM branches WHERE id = ?').get(branchId) as Record<string, unknown>;
        if (desk && branch) {
          db.prepare("UPDATE desks SET status = 'occupied', assignee_name = ? WHERE id = ?").run(assigneeName, deskId);
          recalcBranchOccupancy(db, branchId);
          insertNotification(db, {
            title: 'Desk Allocated Live',
            description: `${deskActivityLabel(desk.type as string)} ${desk.name} in ${branch.name} is now leased by ${assigneeName}.`,
            type: 'system',
          });
          const steps = [
            { id: 'step-1', label: 'Review & Sign Workspace Lease Agreement', completed: false },
            { id: 'step-2', label: 'Issue Kisi Mobile Smart Access Key', completed: false },
            { id: 'step-3', label: 'Collect Initial Month Deposit & Onboarding Fee', completed: false },
            { id: 'step-4', label: 'Introduce to Community Slack Workspace', completed: false },
            { id: 'step-5', label: 'Setup Custom Dedicated Desk Label & Ergonomic Check-in', completed: false },
          ];
          db.prepare(
            `INSERT INTO onboardings (id, client_name, company_name, email, branch_id, desk_id, progress, steps_json, status)
             VALUES (?, ?, ?, ?, ?, ?, 0, ?, 'pending')`
          ).run(
            `onb-${Date.now()}`,
            assigneeName,
            assigneeName,
            `${assigneeName.toLowerCase().replace(/\s+/g, '')}@member.co.in`,
            branchId,
            deskId,
            JSON.stringify(steps)
          );
          db.prepare('UPDATE kpi SET active_members = active_members + 1, total_revenue = total_revenue + ? WHERE id = 1').run(
            desk.price_per_month
          );
        }
        break;
      }
      case 'reserveDesk': {
        const { branchId, deskId } = payload as Record<string, string>;
        const desk = db.prepare('SELECT * FROM desks WHERE id = ?').get(deskId) as Record<string, unknown>;
        const branch = db.prepare('SELECT * FROM branches WHERE id = ?').get(branchId) as Record<string, unknown>;
        if (desk && branch) {
          db.prepare("UPDATE desks SET status = 'reserved' WHERE id = ?").run(deskId);
          recalcBranchOccupancy(db, branchId);
          insertNotification(db, {
            title: 'Desk Reserved',
            description: `${desk.name} in ${branch.name} moved to Reserved status pending move-in.`,
            type: 'tour',
          });
        }
        break;
      }
      case 'releaseDesk': {
        const { branchId, deskId } = payload as Record<string, string>;
        const desk = db.prepare('SELECT * FROM desks WHERE id = ?').get(deskId) as Record<string, unknown>;
        const branch = db.prepare('SELECT * FROM branches WHERE id = ?').get(branchId) as Record<string, unknown>;
        if (desk && branch) {
          db.prepare("UPDATE desks SET status = 'available', assignee_name = NULL WHERE id = ?").run(deskId);
          recalcBranchOccupancy(db, branchId);
          insertNotification(db, {
            title: 'Space Released',
            description: `${desk.name} in ${branch.name} is now vacant and ready for booking.`,
            type: 'system',
          });
          db.prepare('UPDATE kpi SET active_members = CASE WHEN active_members > 0 THEN active_members - 1 ELSE 0 END WHERE id = 1').run();
        }
        break;
      }
      case 'toggleNotificationRead': {
        const row = db.prepare('SELECT read FROM notifications WHERE id = ?').get(payload.id) as { read: number };
        if (row) db.prepare('UPDATE notifications SET read = ? WHERE id = ?').run(row.read ? 0 : 1, payload.id);
        break;
      }
      case 'markAllNotificationsRead': {
        db.prepare('UPDATE notifications SET read = 1').run();
        break;
      }
      case 'deleteNotification': {
        db.prepare('DELETE FROM notifications WHERE id = ?').run(payload.id);
        break;
      }
      case 'updateUserSettings': {
        const s = payload as Record<string, unknown>;
        const cur = db.prepare('SELECT * FROM user_settings WHERE id = 1').get() as Record<string, unknown>;
        db.prepare(
          'UPDATE user_settings SET theme = ?, notifications_enabled = ?, email_digest = ?, privacy_mode = ? WHERE id = 1'
        ).run(
          s.theme ?? cur.theme,
          s.notificationsEnabled !== undefined ? (s.notificationsEnabled ? 1 : 0) : cur.notifications_enabled,
          s.emailDigest ?? cur.email_digest,
          s.privacyMode !== undefined ? (s.privacyMode ? 1 : 0) : cur.privacy_mode
        );
        break;
      }
      default:
        throw new Error(`Unknown action: ${action}`);
    }
  });

  tx();
  return loadBootstrap(db);
}
