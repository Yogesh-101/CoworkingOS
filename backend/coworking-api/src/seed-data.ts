/** Initial workspace seed — mirrors CoworkingOS demo data (deterministic desks). */

const desksB1 = [
  { id: 'desk-0', name: 'Meeting Room 1', x: 50, y: 50, width: 150, height: 120, status: 'available', type: 'meeting-room', pricePerMonth: 1200 },
  { id: 'desk-1', name: 'Meeting Room 2', x: 250, y: 50, width: 150, height: 120, status: 'occupied', type: 'meeting-room', pricePerMonth: 1200, assigneeName: 'Apex Labs Inc.' },
  { id: 'desk-2', name: 'Meeting Room 3', x: 450, y: 50, width: 150, height: 120, status: 'reserved', type: 'meeting-room', pricePerMonth: 1200 },
  { id: 'desk-3', name: 'Meeting Room 4', x: 650, y: 50, width: 150, height: 120, status: 'occupied', type: 'private-office', pricePerMonth: 3500, assigneeName: 'Stark Industries' },
  { id: 'desk-4', name: 'W-5', x: 100, y: 250, width: 80, height: 60, status: 'occupied', type: 'hot-desk', pricePerMonth: 399 },
  { id: 'desk-5', name: 'W-6', x: 220, y: 250, width: 80, height: 60, status: 'available', type: 'dedicated', pricePerMonth: 399 },
];

export const INITIAL_WORKSPACE_STATE = {
  activeBranchId: 'b1',
  branches: [
    { id: 'b1', name: 'Downtown Hub HQ', location: 'New York, NY', capacity: 250, occupancyRate: 84, desks: desksB1 },
    { id: 'b2', name: 'Westside Oasis', location: 'Austin, TX', capacity: 120, occupancyRate: 92, desks: desksB1.slice(0, 4) },
    { id: 'b3', name: 'Tech Park Center', location: 'London, UK', capacity: 400, occupancyRate: 65, desks: desksB1 },
  ],
  leads: [
    { id: 'l1', name: 'Sarah Jenkins', company: 'Acme SaaS', email: 'sarah@acme.io', stage: 'qualified', value: 4500, lastContact: '2h ago' },
    { id: 'l2', name: 'Mike Ross', company: 'Legal Tech Co', email: 'mike@legal.co', stage: 'proposal', value: 12000, lastContact: '1d ago' },
    { id: 'l3', name: 'David Chen', company: 'DataFlow Solutions', email: 'david@df.com', stage: 'new', value: 800, lastContact: 'Just now' },
    { id: 'l4', name: 'Elena Rodriguez', company: 'Apex Design Lab', email: 'elena@design.co', stage: 'negotiation', value: 6400, lastContact: '3d ago' },
  ],
  invoices: [
    { id: 'INV-2041', clientName: 'Stark Industries', amount: 8450, status: 'paid', dueDate: 'May 25, 2026' },
    { id: 'INV-2042', clientName: 'Wayne Enterprises', amount: 4200, status: 'pending', dueDate: 'May 31, 2026' },
    { id: 'INV-2043', clientName: 'Daily Planet', amount: 1250, status: 'overdue', dueDate: 'May 23, 2026' },
    { id: 'INV-2044', clientName: 'LexCorp Space', amount: 15400, status: 'pending', dueDate: 'May 31, 2026' },
  ],
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
      deskId: 'desk-5',
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
  ],
  proposals: [
    { id: 'prop-1', leadName: 'Elena Rodriguez', company: 'Apex Design Lab', deskType: 'private-office', monthlyFee: 2400, durationMonths: 6, status: 'sent', dateCreated: 'May 20, 2026' },
    { id: 'prop-2', leadName: 'Sarah Jenkins', company: 'Acme SaaS', deskType: 'dedicated', monthlyFee: 399, durationMonths: 12, status: 'accepted', dateCreated: 'May 24, 2026' },
  ],
  employees: [
    { id: 'emp-1', name: 'Gavin Belson', role: 'Branch Manager', branchId: 'b1', email: 'gavin@coworking.os', status: 'active' },
    { id: 'emp-2', name: 'Monica Hall', role: 'Community Host', branchId: 'b1', email: 'monica@coworking.os', status: 'active' },
    { id: 'emp-3', name: 'Jared Dunn', role: 'IT Support', branchId: 'b1', email: 'jared@coworking.os', status: 'active' },
  ],
  tickets: [
    { id: 't-1', title: 'WiFi Bandwidth Throttling', description: 'Latency above 120ms during peak hours.', category: 'WiFi/Network', priority: 'high', status: 'in-progress', branchId: 'b1', memberName: 'Sarah Jenkins', assignedTo: 'emp-3', dateCreated: 'May 24, 2026' },
    { id: 't-2', title: 'Main AC Unit Temperature Control', description: 'Conference Room 2 ventilation issue.', category: 'Facilities', priority: 'medium', status: 'open', branchId: 'b1', memberName: 'Julian Alvarez', dateCreated: 'May 25, 2026' },
  ],
  tasks: [
    { id: 'tsk-1', title: 'Complete onboarding desk labeling for Stellar Tech', description: 'Desk W-6 setup.', priority: 'medium', status: 'todo', assignedTo: 'emp-2', dueDate: 'May 28, 2026' },
  ],
  chatMessages: [
    { id: 'msg-1', channel: 'ops-downtown-hq', senderName: 'Monica Hall', senderRole: 'Community Host', text: 'Sarah from Acme SaaS wants Private Suite Room 4 next month.', time: '10:14 AM', pinned: true },
    { id: 'msg-2', channel: 'billing-urgent', senderName: 'Gavin Belson', senderRole: 'Branch Manager', text: 'INV-2043 (Daily Planet) is 8 days overdue.', time: '09:48 AM', priority: 'urgent' },
  ],
  cmsSettings: {
    heroTitle: 'The Enterprise Workspace Ecosystem',
    heroSub: 'Next-generation coworking suites for fast-growing ventures.',
    brandingColor: 'brand',
    brandName: 'CoworkingOS',
    showPricing: true,
    hotDeskPrice: 399,
    dedicatedPrice: 790,
    meetingPrice: 1200,
  },
  integrations: [
    { id: 'int-1', name: 'Kisi Smart Doors Control', description: 'Mobile-tap entries across all doors.', category: 'Access', icon: 'key', connected: true, webhookUrl: 'https://api.kisi.io/v1/webhooks/coworkingos' },
    { id: 'int-2', name: 'Slack Ops Syncer', description: 'Real-time visitor and ticket alerts.', category: 'Communication', icon: 'message-square', connected: true },
  ],
  renewals: [
    { id: 'ren-1', clientName: 'Stark Industries', companyName: 'Stark Labs', branchId: 'b1', deskName: 'Meeting Room 4', monthlyFee: 8450, renewalDate: 'Jun 15, 2026', paymentCycle: 'Monthly', status: 'active' },
    { id: 'ren-2', clientName: 'LexCorp Space', companyName: 'LexCorp Venture', branchId: 'b1', deskName: 'Dedicated Suite A7', monthlyFee: 15400, renewalDate: 'Jun 20, 2026', paymentCycle: 'Monthly', status: 'pending-review' },
  ],
  kpi: {
    totalRevenue: 142500,
    revenueGrowth: 12.4,
    occupancyRate: 80,
    occupancyGrowth: 3.2,
    activeMembers: 1240,
    churnRate: 1.2,
  },
  userSettings: {
    theme: 'dark',
    notificationsEnabled: true,
    emailDigest: 'daily',
    privacyMode: false,
  },
};
