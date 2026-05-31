import type { BootstrapPayload, Desk, DeskStatus, DeskType } from '../types.js';

const DESK_STATUSES: DeskStatus[] = ['available', 'occupied', 'occupied', 'reserved', 'maintenance'];
const DESK_TYPES: DeskType[] = ['hot-desk', 'dedicated', 'meeting-room', 'private-office'];

/** Deterministic desk layout (stable across seeds). */
export function generateDesks(branchId: string, count: number): Omit<Desk, never>[] {
  const desks: Desk[] = [];
  for (let i = 0; i < count; i++) {
    const isRoom = i < 4;
    desks.push({
      id: `${branchId}-desk-${i}`,
      name: isRoom ? `Meeting Room ${i + 1}` : `W-${i + 1}`,
      x: isRoom ? 50 + i * 200 : 100 + (i % 6) * 120,
      y: isRoom ? 50 : 250 + Math.floor(i / 6) * 100,
      width: isRoom ? 150 : 80,
      height: isRoom ? 120 : 60,
      status: DESK_STATUSES[i % DESK_STATUSES.length],
      type: isRoom ? (i === 3 ? 'private-office' : 'meeting-room') : DESK_TYPES[i % 2],
      pricePerMonth: isRoom ? (i === 3 ? 3500 : 1200) : 399,
      assigneeName: i % 3 === 0 ? 'Apex Labs Inc.' : undefined,
    });
  }
  return desks;
}

export function getSeedData(): BootstrapPayload {
  const b1Desks = generateDesks('b1', 30);
  const b2Desks = generateDesks('b2', 20);
  const b3Desks = generateDesks('b3', 45);

  return {
    branches: [
      { id: 'b1', name: 'Downtown Hub HQ', location: 'New York, NY', capacity: 250, occupancyRate: 84, desks: b1Desks },
      { id: 'b2', name: 'Westside Oasis', location: 'Austin, TX', capacity: 120, occupancyRate: 92, desks: b2Desks },
      { id: 'b3', name: 'Tech Park Center', location: 'London, UK', capacity: 400, occupancyRate: 65, desks: b3Desks },
    ],
    leads: [
      { id: 'l1', name: 'Sarah Jenkins', company: 'Acme SaaS', email: 'sarah@acme.io', stage: 'qualified', value: 4500, lastContact: '2h ago' },
      { id: 'l2', name: 'Mike Ross', company: 'Legal Tech Co', email: 'mike@legal.co', stage: 'proposal', value: 12000, lastContact: '1d ago' },
      { id: 'l3', name: 'David Chen', company: 'DataFlow Solutions', email: 'david@df.com', stage: 'new', value: 800, lastContact: 'Just now' },
      { id: 'l4', name: 'Elena Rodriguez', company: 'Apex Design Lab', email: 'elena@design.co', stage: 'negotiation', value: 6400, lastContact: '3d ago' },
    ],
    invoices: [
      { id: 'INV-2041', clientName: 'Stark Industries', amount: 8450, status: 'paid', dueDate: 'May 25, 2026' },
      { id: 'INV-2042', clientName: 'Wayne Enterprises', amount: 4200, status: 'pending', dueDate: 'May 27, 2026' },
      { id: 'INV-2043', clientName: 'Daily Planet', amount: 1250, status: 'overdue', dueDate: 'May 19, 2026' },
      { id: 'INV-2044', clientName: 'LexCorp Space', amount: 15400, status: 'pending', dueDate: 'May 27, 2026' },
    ],
    kpi: {
      totalRevenue: 142500,
      revenueGrowth: 12.4,
      occupancyRate: 80,
      occupancyGrowth: 3.2,
      activeMembers: 1240,
      churnRate: 1.2,
    },
    notifications: [
      { id: 'n-1', title: 'New lead qualified', description: 'Sarah Jenkins (Acme SaaS) is listed as qualified.', type: 'lead', time: '10m ago', read: false },
      { id: 'n-2', title: 'Smart Access Gateway', description: 'Kisi API reports secondary gate successfully connected.', type: 'system', time: '1h ago', read: false },
      { id: 'n-3', title: 'Invoice Paid', description: 'Invoice INV-2041 for Stark Industries completed ($8,450.00).', type: 'billing', time: '2h ago', read: true },
      { id: 'n-4', title: 'Tour Requested', description: 'David Chen scheduled an in-person campus tour.', type: 'tour', time: '4h ago', read: false },
    ],
    visitors: [
      { id: 'v-1', name: 'Alice Cooper', company: 'Bandit Media', email: 'alice@bandit.co', phone: '+1 555-0192', host: 'Tech Corp Inc.', branchId: 'b1', checkInTime: '08:42 AM', status: 'checked-in' },
      { id: 'v-2', name: 'Robert Downey', company: 'Stark Industries', email: 'rdj@stark.com', phone: '+1 555-4801', host: 'Front Desk', branchId: 'b1', checkInTime: '09:12 AM', status: 'checked-in' },
      { id: 'v-3', name: 'John Peterson', company: 'Gartner Group', email: 'john@gartner.org', phone: '+1 555-8933', host: 'Sarah Jenkins', branchId: 'b2', checkInTime: 'Yesterday', checkOutTime: 'Yesterday, 4:00 PM', status: 'completed' },
    ],
    onboardings: [
      {
        id: 'onb-1',
        clientName: 'Julian Alvarez',
        companyName: 'Stellar Tech',
        email: 'julian@stellar.co',
        branchId: 'b1',
        deskId: 'b1-desk-6',
        progress: 60,
        steps: [
          { id: 'step-1', label: 'Review & Sign Workspace Lease Agreement', completed: true },
          { id: 'step-2', label: 'Issue Kisi Mobile Smart Access Key', completed: true },
          { id: 'step-3', label: 'Collect Initial Month Deposit & Onboarding Fee', completed: true },
          { id: 'step-4', label: 'Introduce to Community Slack Workspace', completed: false },
          { id: 'step-5', label: 'Setup Custom Dedicated Desk Label & Ergonomic Check-in', completed: false },
        ],
        status: 'active',
      },
      {
        id: 'onb-2',
        clientName: 'Emma Watson',
        companyName: 'Magical Media LLC',
        email: 'emma@magic.net',
        branchId: 'b2',
        progress: 20,
        steps: [
          { id: 'step-1', label: 'Review & Sign Workspace Lease Agreement', completed: true },
          { id: 'step-2', label: 'Issue Kisi Mobile Smart Access Key', completed: false },
          { id: 'step-3', label: 'Collect Initial Month Deposit & Onboarding Fee', completed: false },
          { id: 'step-4', label: 'Introduce to Community Slack Workspace', completed: false },
          { id: 'step-5', label: 'Setup Custom Dedicated Desk Label & Ergonomic Check-in', completed: false },
        ],
        status: 'pending',
      },
    ],
    proposals: [
      { id: 'prop-1', leadName: 'Elena Rodriguez', company: 'Apex Design Lab', deskType: 'private-office', monthlyFee: 2400, durationMonths: 6, status: 'sent', dateCreated: 'May 20, 2026' },
      { id: 'prop-2', leadName: 'Sarah Jenkins', company: 'Acme SaaS', deskType: 'dedicated', monthlyFee: 399, durationMonths: 12, status: 'accepted', dateCreated: 'May 24, 2026' },
      { id: 'prop-3', leadName: 'Mike Ross', company: 'Legal Tech Co', deskType: 'meeting-room', monthlyFee: 1200, durationMonths: 3, status: 'draft', dateCreated: 'May 25, 2026' },
    ],
    employees: [
      { id: 'emp-1', name: 'Gavin Belson', role: 'Branch Manager', branchId: 'b1', email: 'gavin@coworking.os', status: 'active' },
      { id: 'emp-2', name: 'Monica Hall', role: 'Community Host', branchId: 'b1', email: 'monica@coworking.os', status: 'active' },
      { id: 'emp-3', name: 'Jared Dunn', role: 'IT Support', branchId: 'b1', email: 'jared@coworking.os', status: 'active' },
      { id: 'emp-4', name: 'Gilfoyle Stone', role: 'IT Support', branchId: 'b2', email: 'gilf@coworking.os', status: 'active' },
      { id: 'emp-5', name: 'Dinesh Chugtai', role: 'Receptionist', branchId: 'b3', email: 'dinesh@coworking.os', status: 'on-leave' },
    ],
    tickets: [
      { id: 't-1', title: 'WiFi Bandwidth Throttling', description: 'Members on secondary deck reporting latency above 120ms during peak hours.', category: 'WiFi/Network', priority: 'high', status: 'in-progress', branchId: 'b1', memberName: 'Sarah Jenkins', assignedTo: 'emp-3', dateCreated: 'May 24, 2026' },
      { id: 't-2', title: 'Main AC Unit Temperature Control', description: 'Conference Room 2 main ventilation gets too cold relative to default thermostat.', category: 'Facilities', priority: 'medium', status: 'open', branchId: 'b1', memberName: 'Julian Alvarez', dateCreated: 'May 25, 2026' },
      { id: 't-3', title: 'Broken Coffee Pod Dispenser', description: 'Lobby level machine jams when dispensing decaf pods.', category: 'Cleaning', priority: 'low', status: 'resolved', branchId: 'b2', memberName: 'Emma Watson', assignedTo: 'emp-4', dateCreated: 'May 18, 2026' },
    ],
    tasks: [
      { id: 'tsk-1', title: 'Complete onboarding desk clean-labeling for Stellar Tech', description: 'Affix brand logo and connect terminal cables for desk W-6.', priority: 'medium', status: 'todo', assignedTo: 'emp-2', dueDate: 'May 28, 2026' },
      { id: 'tsk-2', title: 'Restore printer toner cartridge Level 3', description: 'Install high-yield black ink toner unit on Floor 3 north xerox module.', priority: 'high', status: 'in-progress', assignedTo: 'emp-3', dueDate: 'May 27, 2026' },
    ],
    chatMessages: [
      { id: 'msg-1', channel: 'ops-downtown-hq', senderName: 'Monica Hall', senderRole: 'Community Host', text: 'Sarah from Acme SaaS wants Private Suite Room 4 next month — proposal draft attached in CRM.', time: '10:14 AM', pinned: true },
      { id: 'msg-2', channel: 'ops-downtown-hq', senderName: 'Jared Dunn', senderRole: 'IT Support', text: 'Fiber port pre-config scheduled before move-in. ETA Thursday.', time: '10:22 AM' },
      { id: 'msg-3', channel: 'billing-urgent', senderName: 'Gavin Belson', senderRole: 'Branch Manager', text: 'INV-2043 (Daily Planet) is 8 days overdue — need outreach before noon.', time: '09:48 AM', priority: 'urgent' },
      { id: 'msg-4', channel: 'general', senderName: 'Monica Hall', senderRole: 'Community Host', text: 'Friday community breakfast at 9 AM in the lounge — all hosts welcome!', time: '09:00 AM' },
      { id: 'msg-5', channel: 'facility-alerts', senderName: 'System', senderRole: 'Automated', text: 'Conference Room 2 HVAC flagged — facilities ticket #t-2 linked.', time: '08:15 AM', priority: 'urgent' },
      { id: 'msg-6', channel: 'member-shoutouts', senderName: 'Monica Hall', senderRole: 'Community Host', text: 'Shoutout to Stellar Tech for hitting 100% onboarding checklist this week!', time: 'Yesterday' },
    ],
    supportMessages: [
      {
        id: 'sup-1',
        role: 'assistant',
        text: "Hi! I'm CoworkingOS Assist. Ask about occupancy forecasts, lead scores, renewals, visitors, tickets, or staff productivity — all answers use live workspace data.",
        time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      },
    ],
    cmsSettings: {
      heroTitle: 'The Enterprise Workspace Ecosystem',
      heroSub: 'Next-generation coworking suites offering pristine private offices, smart fiber-fast dedicated desks, and automated visitor-friendly campuses designed for fast-growing ventures.',
      brandingColor: 'brand',
      brandName: 'CoworkingOS',
      showPricing: true,
      hotDeskPrice: 399,
      dedicatedPrice: 790,
      meetingPrice: 1200,
    },
    integrations: [
      { id: 'int-1', name: 'Kisi Smart Doors Control', description: 'Enable secure, logs-monitored mobile-tap entries across all physical center glass layout doors dynamically.', category: 'Access', icon: 'key', connected: true, webhookUrl: 'https://api.kisi.io/v1/webhooks/coworkingos-1021' },
      { id: 'int-2', name: 'Slack Ops Syncer', description: 'Dispatch real-time critical visitor entries, check-ins, and emergency service tickets directly to workspace staff channels.', category: 'Communication', icon: 'message-square', connected: true, webhookUrl: 'https://hooks.slack.com/services/T00/B00/X729' },
      { id: 'int-3', name: 'Stripe Subscription Automator', description: 'Handle automated monthly workspace recurring leases charging and auto-generate clean itemized invoice receipts.', category: 'Billing', icon: 'credit-card', connected: false },
      { id: 'int-4', name: 'SendGrid Onboarding Dispatcher', description: 'Trigger beautifully-crafted welcome brochures, welcome pack guides, and WiFi connection details immediately on contract sign.', category: 'Marketing', icon: 'mail', connected: true },
    ],
    renewals: [
      { id: 'ren-1', clientName: 'Stark Industries', companyName: 'Stark Labs', branchId: 'b1', deskName: 'Meeting Room 4', monthlyFee: 8450, renewalDate: 'Jun 15, 2026', paymentCycle: 'Monthly', status: 'active' },
      { id: 'ren-2', clientName: 'LexCorp Space', companyName: 'LexCorp Venture', branchId: 'b1', deskName: 'Dedicated Suite A7', monthlyFee: 15400, renewalDate: 'Jun 20, 2026', paymentCycle: 'Monthly', status: 'pending-review' },
      { id: 'ren-3', clientName: 'Wayne Enterprises', companyName: 'Wayne Tech', branchId: 'b2', deskName: 'Director Office 1', monthlyFee: 4200, renewalDate: 'Jul 01, 2026', paymentCycle: 'Monthly', status: 'active' },
    ],
    userSettings: {
      theme: 'dark',
      notificationsEnabled: true,
      emailDigest: 'daily',
      privacyMode: false,
    },
  };
}
