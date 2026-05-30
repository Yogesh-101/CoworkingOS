import { create } from 'zustand';
import { 
  Branch, Desk, Lead, Invoice, KPIData, 
  Visitor, ClientOnboarding, Proposal, Employee, 
  Ticket, InternalTask, ChatMessage, CMSSettings, 
  IntegrationSetting, WorkspaceRenewal, UserSettings, SupportMessage 
} from './types';
import { subDays, format } from 'date-fns';
import type { AppTab, UserRole } from './lib/rbac';

export interface Notification {
  id: string;
  title: string;
  description: string;
  type: 'lead' | 'system' | 'billing' | 'tour' | 'visitor' | 'ticket';
  time: string;
  read: boolean;
}

interface AppState {
  view: 'landing' | 'role-select' | 'app';
  setView: (view: AppState['view']) => void;
  requestPlatformAccess: () => void;
  enterAppWithRole: (role: UserRole) => void;
  openRoleSelect: () => void;
  
  activeTab: AppTab;
  setActiveTab: (tab: AppTab) => void;
  
  activeBranchId: string;
  setActiveBranchId: (id: string) => void;
  
  role: UserRole;
  setRole: (role: UserRole) => void;
  
  branches: Branch[];
  leads: Lead[];
  invoices: Invoice[];
  kpi: KPIData;
  notifications: Notification[];
  
  // Smart Visitor Management
  visitors: Visitor[];
  addVisitor: (visitor: Omit<Visitor, 'id' | 'checkInTime' | 'status'>) => void;
  checkOutVisitor: (id: string) => void;
  
  // Client Onboarding Workflow
  onboardings: ClientOnboarding[];
  toggleOnboardingStep: (onboardingId: string, stepId: string) => void;
  completeOnboarding: (id: string) => void;
  
  // Quotation & Proposal Management
  proposals: Proposal[];
  addProposal: (proposal: Omit<Proposal, 'id' | 'dateCreated' | 'status'>) => void;
  updateProposalStatus: (id: string, status: Proposal['status']) => void;
  
  // Employee & Team Management
  employees: Employee[];
  addEmployee: (employee: Omit<Employee, 'id'>) => void;
  updateEmployeeStatus: (id: string, status: Employee['status']) => void;
  
  // Ticket & Resolution Management
  tickets: Ticket[];
  addTicket: (ticket: Omit<Ticket, 'id' | 'status' | 'dateCreated'>) => void;
  updateTicketStatus: (id: string, status: Ticket['status']) => void;
  assignTicket: (id: string, employeeId: string) => void;
  
  // Internal Task Management
  tasks: InternalTask[];
  addTask: (task: Omit<InternalTask, 'id' | 'status'>) => void;
  updateTaskStatus: (id: string, status: InternalTask['status']) => void;
  
  chatMessages: ChatMessage[];
  addChatMessage: (
    channel: string,
    text: string,
    senderName: string,
    senderRole: string,
    options?: { priority?: ChatMessage['priority'] }
  ) => void;

  supportMessages: SupportMessage[];
  addSupportMessage: (role: SupportMessage['role'], text: string) => void;
  
  // Website CMS Settings
  cmsSettings: CMSSettings;
  updateCMSSettings: (settings: Partial<CMSSettings>) => void;
  
  // Integrations Layer
  integrations: IntegrationSetting[];
  toggleIntegration: (id: string) => void;
  updateIntegrationWebhook: (id: string, url: string) => void;
  
  // Renewals Tracker
  renewals: WorkspaceRenewal[];
  renewContract: (id: string) => void;
  sendRenewalReminder: (id: string) => void;

  // User Settings
  userSettings: UserSettings;
  updateUserSettings: (settings: Partial<UserSettings>) => void;
  
  // Actions
  addLead: (lead: Omit<Lead, 'id' | 'lastContact'>) => void;
  updateLeadStage: (id: string, stage: Lead['stage']) => void;
  deleteLead: (id: string) => void;
  
  addInvoice: (invoice: Omit<Invoice, 'id'>) => void;
  updateInvoiceStatus: (id: string, status: Invoice['status']) => void;
  
  bookDesk: (branchId: string, deskId: string, assigneeName: string) => void;
  reserveDesk: (branchId: string, deskId: string) => void;
  releaseDesk: (branchId: string, deskId: string) => void;
  
  addNotification: (notification: Omit<Notification, 'id' | 'time' | 'read'>) => void;
  toggleNotificationRead: (id: string) => void;
  markAllNotificationsRead: () => void;
  deleteNotification: (id: string) => void;
}

// Generate some mock desks for a floor plan
const generateDesks = (count: number): Desk[] => {
  const desks: Desk[] = [];
  const statuses: Desk['status'][] = ['available', 'occupied', 'occupied', 'reserved', 'maintenance'];
  const types: Desk['type'][] = ['hot-desk', 'dedicated', 'meeting-room', 'private-office'];
  
  for (let i = 0; i < count; i++) {
    const isRoom = i < 4;
    desks.push({
      id: `desk-${i}`,
      name: isRoom ? `Meeting Room ${i+1}` : `W-${i + 1}`,
      x: isRoom ? 50 + (i * 200) : 100 + (i % 6) * 120,
      y: isRoom ? 50 : 250 + Math.floor(i / 6) * 100,
      width: isRoom ? 150 : 80,
      height: isRoom ? 120 : 60,
      status: statuses[Math.floor(Math.random() * statuses.length)],
      type: isRoom ? (i === 3 ? 'private-office' : 'meeting-room') : types[Math.floor(Math.random() * 2)],
      pricePerMonth: isRoom ? (i === 3 ? 3500 : 1200) : 399,
      assigneeName: Math.random() > 0.4 ? 'Apex Labs Inc.' : undefined,
    });
  }
  return desks;
};

const mockBranches: Branch[] = [
  { id: 'b1', name: 'Downtown Hub HQ', location: 'New York, NY', capacity: 250, occupancyRate: 84, desks: generateDesks(30) },
  { id: 'b2', name: 'Westside Oasis', location: 'Austin, TX', capacity: 120, occupancyRate: 92, desks: generateDesks(20) },
  { id: 'b3', name: 'Tech Park Center', location: 'London, UK', capacity: 400, occupancyRate: 65, desks: generateDesks(45) },
];

const mockLeads: Lead[] = [
  { id: 'l1', name: 'Sarah Jenkins', company: 'Acme SaaS', email: 'sarah@acme.io', stage: 'qualified', value: 4500, lastContact: '2h ago' },
  { id: 'l2', name: 'Mike Ross', company: 'Legal Tech Co', email: 'mike@legal.co', stage: 'proposal', value: 12000, lastContact: '1d ago' },
  { id: 'l3', name: 'David Chen', company: 'DataFlow Solutions', email: 'david@df.com', stage: 'new', value: 800, lastContact: 'Just now' },
  { id: 'l4', name: 'Elena Rodriguez', company: 'Apex Design Lab', email: 'elena@design.co', stage: 'negotiation', value: 6400, lastContact: '3d ago' },
];

const mockInvoices: Invoice[] = [
  { id: 'INV-2041', clientName: 'Stark Industries', amount: 8450.00, status: 'paid', dueDate: format(subDays(new Date(), 2), 'MMM dd, yyyy') },
  { id: 'INV-2042', clientName: 'Wayne Enterprises', amount: 4200.00, status: 'pending', dueDate: format(new Date(), 'MMM dd, yyyy') },
  { id: 'INV-2043', clientName: 'Daily Planet', amount: 1250.00, status: 'overdue', dueDate: format(subDays(new Date(), 8), 'MMM dd, yyyy') },
  { id: 'INV-2044', clientName: 'LexCorp Space', amount: 15400.00, status: 'pending', dueDate: format(new Date(), 'MMM dd, yyyy') },
];

const mockNotifications: Notification[] = [
  { id: 'n-1', title: 'New lead qualified', description: 'Sarah Jenkins (Acme SaaS) is listed as qualified.', type: 'lead', time: '10m ago', read: false },
  { id: 'n-2', title: 'Smart Access Gateway', description: 'Kisi API reports secondary gate successfully connected.', type: 'system', time: '1h ago', read: false },
  { id: 'n-3', title: 'Invoice Paid', description: 'Invoice INV-2041 for Stark Industries completed ($8,450.00).', type: 'billing', time: '2h ago', read: true },
  { id: 'n-4', title: 'Tour Requested', description: 'David Chen scheduled an in-person campus tour.', type: 'tour', time: '4h ago', read: false },
];

// Mock Visitors
const mockVisitors: Visitor[] = [
  { id: 'v-1', name: 'Alice Cooper', company: 'Bandit Media', email: 'alice@bandit.co', phone: '+1 555-0192', host: 'Tech Corp Inc.', branchId: 'b1', checkInTime: '08:42 AM', status: 'checked-in' },
  { id: 'v-2', name: 'Robert Downey', company: 'Stark Industries', email: 'rdj@stark.com', phone: '+1 555-4801', host: 'Front Desk', branchId: 'b1', checkInTime: '09:12 AM', status: 'checked-in' },
  { id: 'v-3', name: 'John Peterson', company: 'Gartner Group', email: 'john@gartner.org', phone: '+1 555-8933', host: 'Sarah Jenkins', branchId: 'b2', checkInTime: 'Yesterday', checkOutTime: 'Yesterday, 4:00 PM', status: 'completed' },
];

// Mock Onboarding processes (Client Onboarding Workflow)
const mockOnboarding: ClientOnboarding[] = [
  {
    id: 'onb-1',
    clientName: 'Julian Alvarez',
    companyName: 'Stellar Tech',
    email: 'julian@stellar.co',
    branchId: 'b1',
    deskId: 'desk-6',
    progress: 60,
    steps: [
      { id: 'step-1', label: 'Review & Sign Workspace Lease Agreement', completed: true },
      { id: 'step-2', label: 'Issue Kisi Mobile Smart Access Key', completed: true },
      { id: 'step-3', label: 'Collect Initial Month Deposit & Onboarding Fee', completed: true },
      { id: 'step-4', label: 'Introduce to Community Slack Workspace', completed: false },
      { id: 'step-5', label: 'Setup Custom Dedicated Desk Label & Ergonomic Check-in', completed: false }
    ],
    status: 'active'
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
      { id: 'step-5', label: 'Setup Custom Dedicated Desk Label & Ergonomic Check-in', completed: false }
    ],
    status: 'pending'
  }
];

// Mock Quotations & Proposals
const mockProposals: Proposal[] = [
  { id: 'prop-1', leadName: 'Elena Rodriguez', company: 'Apex Design Lab', deskType: 'private-office', monthlyFee: 2400, durationMonths: 6, status: 'sent', dateCreated: 'May 20, 2026' },
  { id: 'prop-2', leadName: 'Sarah Jenkins', company: 'Acme SaaS', deskType: 'dedicated', monthlyFee: 399, durationMonths: 12, status: 'accepted', dateCreated: 'May 24, 2026' },
  { id: 'prop-3', leadName: 'Mike Ross', company: 'Legal Tech Co', deskType: 'meeting-room', monthlyFee: 1200, durationMonths: 3, status: 'draft', dateCreated: 'May 25, 2026' },
];

// Mock Employees
const mockEmployees: Employee[] = [
  { id: 'emp-1', name: 'Gavin Belson', role: 'Branch Manager', branchId: 'b1', email: 'gavin@coworking.os', status: 'active' },
  { id: 'emp-2', name: 'Monica Hall', role: 'Community Host', branchId: 'b1', email: 'monica@coworking.os', status: 'active' },
  { id: 'emp-3', name: 'Jared Dunn', role: 'IT Support', branchId: 'b1', email: 'jared@coworking.os', status: 'active' },
  { id: 'emp-4', name: 'Gilfoyle Stone', role: 'IT Support', branchId: 'b2', email: 'gilf@coworking.os', status: 'active' },
  { id: 'emp-5', name: 'Dinesh Chugtai', role: 'Receptionist', branchId: 'b3', email: 'dinesh@coworking.os', status: 'on-leave' },
];

// Mock Service Tickets
const mockTickets: Ticket[] = [
  { id: 't-1', title: 'WiFi Bandwidth Throttling', description: 'Members on secondary deck reporting latency above 120ms during peak hours.', category: 'WiFi/Network', priority: 'high', status: 'in-progress', branchId: 'b1', memberName: 'Sarah Jenkins', assignedTo: 'emp-3', dateCreated: 'May 24, 2026' },
  { id: 't-2', title: 'Main AC Unit Temperature Control', description: 'Conference Room 2 main ventilation gets too gold relative to default thermostat.', category: 'Facilities', priority: 'medium', status: 'open', branchId: 'b1', memberName: 'Julian Alvarez', dateCreated: 'May 25, 2026' },
  { id: 't-3', title: 'Broken Coffee Pod Dispenser', description: 'Lobby level machine jams when dispensing decaf pods.', category: 'Cleaning', priority: 'low', status: 'resolved', branchId: 'b2', memberName: 'Emma Watson', assignedTo: 'emp-4', dateCreated: 'May 18, 2026' },
];

// Mock Internal Operational Tasks
const mockTasks: InternalTask[] = [
  { id: 'tsk-1', title: 'Complete onboarding desk clean-labeling for Stellar Tech', description: 'Affix brand logo and connect terminal cables for desk W-6.', priority: 'medium', status: 'todo', assignedTo: 'emp-2', dueDate: 'May 28, 2026' },
  { id: 'tsk-2', title: 'Restore printer toner cartridge Level 3', description: 'Install high-yield black ink toner unit on Floor 3 north xerox module.', priority: 'high', status: 'in-progress', assignedTo: 'emp-3', dueDate: 'May 27, 2026' },
];

const mockChatMessages: ChatMessage[] = [
  { id: 'msg-1', channel: 'ops-downtown-hq', senderName: 'Monica Hall', senderRole: 'Community Host', text: 'Sarah from Acme SaaS wants Private Suite Room 4 next month — proposal draft attached in CRM.', time: '10:14 AM', pinned: true },
  { id: 'msg-2', channel: 'ops-downtown-hq', senderName: 'Jared Dunn', senderRole: 'IT Support', text: 'Fiber port pre-config scheduled before move-in. ETA Thursday.', time: '10:22 AM' },
  { id: 'msg-3', channel: 'billing-urgent', senderName: 'Gavin Belson', senderRole: 'Branch Manager', text: 'INV-2043 (Daily Planet) is 8 days overdue — need outreach before noon.', time: '09:48 AM', priority: 'urgent' },
  { id: 'msg-4', channel: 'general', senderName: 'Monica Hall', senderRole: 'Community Host', text: 'Friday community breakfast at 9 AM in the lounge — all hosts welcome!', time: '09:00 AM' },
  { id: 'msg-5', channel: 'facility-alerts', senderName: 'System', senderRole: 'Automated', text: 'Conference Room 2 HVAC flagged — facilities ticket #t-2 linked.', time: '08:15 AM', priority: 'urgent' },
  { id: 'msg-6', channel: 'member-shoutouts', senderName: 'Monica Hall', senderRole: 'Community Host', text: 'Shoutout to Stellar Tech for hitting 100% onboarding checklist this week!', time: 'Yesterday' },
];

const mockSupportMessages: SupportMessage[] = [
  {
    id: 'sup-1',
    role: 'assistant',
    text: "Hi! I'm CoworkingOS Assist. Ask about occupancy forecasts, lead scores, renewals, visitors, tickets, or staff productivity — all answers use live workspace data.",
    time: format(new Date(), 'hh:mm a'),
  },
];

// CMS Live Customizable State
const initialCMS: CMSSettings = {
  heroTitle: 'The Enterprise Workspace Ecosystem',
  heroSub: 'Next-generation coworking suites offering pristine private offices, smart fiber-fast dedicated desks, and automated visitor-friendly campuses designed for fast-growing ventures.',
  brandingColor: 'brand',
  brandName: 'CoworkingOS',
  showPricing: true,
  hotDeskPrice: 399,
  dedicatedPrice: 790,
  meetingPrice: 1200,
};

// Integrations Setting
const mockIntegrations: IntegrationSetting[] = [
  { id: 'int-1', name: 'Kisi Smart Doors Control', description: 'Enable secure, logs-monitored mobile-tap entries across all physical center glass layout doors dynamically.', category: 'Access', icon: 'key', connected: true, webhookUrl: 'https://api.kisi.io/v1/webhooks/coworkingos-1021' },
  { id: 'int-2', name: 'Slack Ops Syncer', description: 'Dispatch real-time critical visitor entries, check-ins, and emergency service tickets directly to workspace staff channels.', category: 'Communication', icon: 'message-square', connected: true, webhookUrl: 'https://hooks.slack.com/services/T00/B00/X729' },
  { id: 'int-3', name: 'Stripe Subscription Automator', description: 'Handle automated monthly workspace recurring leases charging and auto-generate clean itemized invoice receipts.', category: 'Billing', icon: 'credit-card', connected: false },
  { id: 'int-4', name: 'SendGrid Onboarding Dispatcher', description: 'Trigger beautifully-crafted welcome brochures, welcome pack guides, and WiFi connection details immediately on contract sign.', category: 'Marketing', icon: 'mail', connected: true },
];

// Renewals Contracts
const mockRenewals: WorkspaceRenewal[] = [
  { id: 'ren-1', clientName: 'Stark Industries', companyName: 'Stark Labs', branchId: 'b1', deskName: 'Meeting Room 4', monthlyFee: 8450, renewalDate: 'Jun 15, 2026', paymentCycle: 'Monthly', status: 'active' },
  { id: 'ren-2', clientName: 'LexCorp Space', companyName: 'LexCorp Venture', branchId: 'b1', deskName: 'Dedicated Suite A7', monthlyFee: 15400, renewalDate: 'Jun 20, 2026', paymentCycle: 'Monthly', status: 'pending-review' },
  { id: 'ren-3', clientName: 'Wayne Enterprises', companyName: 'Wayne Tech', branchId: 'b2', deskName: 'Director Office 1', monthlyFee: 4200, renewalDate: 'Jul 01, 2026', paymentCycle: 'Monthly', status: 'active' }
];

export const useStore = create<AppState>((set) => ({
  view: 'landing',
  setView: (view) => set({ view }),
  requestPlatformAccess: () => set({ view: 'role-select' }),
  enterAppWithRole: (role) => {
    localStorage.setItem('co_admin_role', role);
    set({ role, view: 'app', activeTab: 'dashboard' });
  },
  openRoleSelect: () => set({ view: 'role-select' }),
  
  activeTab: 'dashboard',
  setActiveTab: (tab) => set({ activeTab: tab }),
  
  activeBranchId: mockBranches[0].id,
  setActiveBranchId: (id) => set({ activeBranchId: id }),
  
  role: 'Super Admin',
  setRole: (role) => {
    localStorage.setItem('co_admin_role', role);
    set({ role });
  },
  
  branches: mockBranches,
  leads: mockLeads,
  invoices: mockInvoices,
  notifications: mockNotifications,
  
  // Custom states
  visitors: mockVisitors,
  onboardings: mockOnboarding,
  proposals: mockProposals,
  employees: mockEmployees,
  tickets: mockTickets,
  tasks: mockTasks,
  chatMessages: mockChatMessages,
  supportMessages: mockSupportMessages,
  cmsSettings: initialCMS,
  integrations: mockIntegrations,
  renewals: mockRenewals,
  userSettings: { theme: 'dark', notificationsEnabled: true, emailDigest: 'daily', privacyMode: false },

  
  kpi: {
    totalRevenue: 142500,
    revenueGrowth: 12.4,
    occupancyRate: 80,
    occupancyGrowth: 3.2,
    activeMembers: 1240,
    churnRate: 1.2,
  },
  
  // Smart Visitor Management Actions
  addVisitor: (v) => set((state) => {
    const newV: Visitor = {
      ...v,
      id: `v-${Date.now()}`,
      checkInTime: format(new Date(), 'hh:mm a'),
      status: 'checked-in'
    };
    
    // Add corresponding notification log
    const updatedNotifications: Notification[] = [
      {
        id: `n-${Date.now()}`,
        title: 'Visitor Checked In',
        description: `${v.name} (${v.company}) reached Reception for host: ${v.host}.`,
        type: 'visitor',
        time: 'Just now',
        read: false
      },
      ...state.notifications
    ];
    
    return {
      visitors: [newV, ...state.visitors],
      notifications: updatedNotifications
    };
  }),
  
  checkOutVisitor: (id) => set((state) => ({
    visitors: state.visitors.map(v => 
      v.id === id 
        ? { ...v, status: 'completed' as const, checkOutTime: format(new Date(), 'hh:mm a') } 
        : v
    )
  })),
  
  // Client Onboarding Workflow Actions
  toggleOnboardingStep: (onboardingId, stepId) => set((state) => {
    const onboarding = state.onboardings.find(o => o.id === onboardingId);
    if (!onboarding) return {};
    
    const updatedSteps = onboarding.steps.map(step => 
      step.id === stepId ? { ...step, completed: !step.completed } : step
    );
    
    const completedCount = updatedSteps.filter(s => s.completed).length;
    const computedProgress = Math.round((completedCount / updatedSteps.length) * 100);
    const status = computedProgress === 100 ? 'completed' as const : 'active' as const;
    
    return {
      onboardings: state.onboardings.map(o => 
        o.id === onboardingId 
          ? { ...o, steps: updatedSteps, progress: computedProgress, status } 
          : o
      )
    };
  }),
  
  completeOnboarding: (id) => set((state) => {
    const onboarding = state.onboardings.find(o => o.id === id);
    if (!onboarding) return {};
    
    const updatedSteps = onboarding.steps.map(step => ({ ...step, completed: true }));
    
    const updatedNotifications: Notification[] = [
      {
        id: `n-${Date.now()}`,
        title: 'Client Onboarding Completed',
        description: `Fully onboarded member ${onboarding.clientName} (${onboarding.companyName}) into CoworkingOS.`,
        type: 'system',
        time: 'Just now',
        read: false
      },
      ...state.notifications
    ];
    
    return {
      onboardings: state.onboardings.map(o => 
        o.id === id 
          ? { ...o, steps: updatedSteps, progress: 100, status: 'completed' as const } 
          : o
      ),
      notifications: updatedNotifications
    };
  }),
  
  // Quotation & Proposal Actions
  addProposal: (p) => set((state) => {
    const newProposal: Proposal = {
      ...p,
      id: `prop-${Date.now()}`,
      status: 'sent',
      dateCreated: format(new Date(), 'MMM dd, yyyy')
    };
    
    const updatedNotifications: Notification[] = [
      {
        id: `n-${Date.now()}`,
        title: 'Proposal Contract Sent',
        description: `Quotation sent to ${p.leadName} (${p.company}) for a ${p.deskType} contract valued at $${p.monthlyFee}/month.`,
        type: 'lead',
        time: 'Just now',
        read: false
      },
      ...state.notifications
    ];
    
    return {
      proposals: [newProposal, ...state.proposals],
      notifications: updatedNotifications
    };
  }),
  
  updateProposalStatus: (id, status) => set((state) => {
    const prop = state.proposals.find(p => p.id === id);
    if (!prop) return {};
    
    let additionalNotifications: Notification[] = [];
    let updatedLeads = [...state.leads];
    let updatedOnboardings = [...state.onboardings];
    let updatedInvoices = [...state.invoices];
    let updatedKpi = { ...state.kpi };

    if (status === 'accepted') {
      // 1. Promote corresponding lead to 'won' status in our pipeline
      updatedLeads = state.leads.map(l => {
        if (l.name.toLowerCase() === prop.leadName.toLowerCase() || l.company.toLowerCase() === prop.company.toLowerCase()) {
          return { ...l, stage: 'won' as const, lastContact: 'Just now' };
        }
        return l;
      });

      // 2. Generate a fresh Invoice automatic contract setup
      const newInvoiceId = `INV-${Math.floor(2050 + Math.random() * 2000)}`;
      const newInvoice: Invoice = {
        id: newInvoiceId,
        clientName: prop.company || prop.leadName,
        amount: prop.monthlyFee * prop.durationMonths, // contract value total
        status: 'pending',
        dueDate: format(new Date(), 'MMM dd, yyyy')
      };
      updatedInvoices = [newInvoice, ...state.invoices];

      // 3. Dispatch dynamic onboardings workflow process for the contract
      const newOnboarding: ClientOnboarding = {
        id: `onb-${Date.now()}`,
        clientName: prop.leadName,
        companyName: prop.company,
        email: `${prop.leadName.toLowerCase().replace(/\s+/g, '')}@${prop.company.toLowerCase().replace(/\s+/g, '') || 'member'}.io`,
        branchId: state.activeBranchId,
        progress: 20,
        steps: [
          { id: 'step-1', label: 'Review & Sign Workspace Lease Agreement', completed: true },
          { id: 'step-2', label: 'Issue Kisi Mobile Smart Access Key', completed: false },
          { id: 'step-3', label: 'Collect Initial Month Deposit & Onboarding Fee', completed: false },
          { id: 'step-4', label: 'Introduce to Community Slack Workspace', completed: false },
          { id: 'step-5', label: 'Setup Custom Dedicated Desk Label & Ergonomic Check-in', completed: false }
        ],
        status: 'active'
      };
      updatedOnboardings = [newOnboarding, ...state.onboardings];

      // 4. Update KPI metrics dynamically
      updatedKpi.activeMembers = state.kpi.activeMembers + 1;

      // Add success log notifications
      additionalNotifications = [
        {
          id: `n-${Date.now()}-onb`,
          title: 'Onboarding Activated',
          description: `Onboarding process generated dynamically for ${prop.leadName}.`,
          type: 'system',
          time: 'Just now',
          read: false
        },
        {
          id: `n-${Date.now()}-inv`,
          title: 'Invoice Issued',
          description: `Automated invoice ${newInvoiceId} generated for ${prop.company} ($${newInvoice.amount.toLocaleString()}).`,
          type: 'billing',
          time: 'Just now',
          read: false
        }
      ];
    } else if (status === 'declined') {
      // Set matching lead to 'lost'
      updatedLeads = state.leads.map(l => {
        if (l.name.toLowerCase() === prop.leadName.toLowerCase() || l.company.toLowerCase() === prop.company.toLowerCase()) {
          return { ...l, stage: 'lost' as const, lastContact: 'Just now' };
        }
        return l;
      });
    }

    const updatedNotifications: Notification[] = [
      {
        id: `n-${Date.now()}`,
        title: `Proposal Status: ${status.toUpperCase()}`,
        description: `${prop.leadName} proposal was marked as ${status}.`,
        type: 'lead',
        time: 'Just now',
        read: false
      },
      ...additionalNotifications,
      ...state.notifications
    ];
    
    return {
      proposals: state.proposals.map(p => p.id === id ? { ...p, status } : p),
      leads: updatedLeads,
      onboardings: updatedOnboardings,
      invoices: updatedInvoices,
      kpi: updatedKpi,
      notifications: updatedNotifications
    };
  }),
  
  // Employee & Team Actions
  addEmployee: (e) => set((state) => ({
    employees: [...state.employees, { ...e, id: `emp-${Date.now()}` }]
  })),
  
  updateEmployeeStatus: (id, status) => set((state) => ({
    employees: state.employees.map(e => e.id === id ? { ...e, status } : e)
  })),
  
  // Ticket Actions
  addTicket: (t) => set((state) => {
    const newTicket: Ticket = {
      ...t,
      id: `t-${Date.now()}`,
      status: 'open',
      dateCreated: format(new Date(), 'MMM dd, yyyy')
    };
    
    const updatedNotifications: Notification[] = [
      {
        id: `n-${Date.now()}`,
        title: 'New Service Ticket Logged',
        description: `Member ${t.memberName} opened ticket: "${t.title}" (${t.category}).`,
        type: 'ticket',
        time: 'Just now',
        read: false
      },
      ...state.notifications
    ];
    
    return {
      tickets: [newTicket, ...state.tickets],
      notifications: updatedNotifications
    };
  }),
  
  updateTicketStatus: (id, status) => set((state) => {
    const ticket = state.tickets.find(t => t.id === id);
    if (!ticket) return {};
    
    const updatedNotifications: Notification[] = [
      {
        id: `n-${Date.now()}`,
        title: `Ticket Status: ${status.toUpperCase()}`,
        description: `Ticket #${id} is now ${status}.`,
        type: 'ticket',
        time: 'Just now',
        read: false
      },
      ...state.notifications
    ];
    
    return {
      tickets: state.tickets.map(t => t.id === id ? { ...t, status } : t),
      notifications: updatedNotifications
    };
  }),
  
  assignTicket: (id, employeeId) => set((state) => ({
    tickets: state.tickets.map(t => t.id === id ? { ...t, assignedTo: employeeId, status: 'in-progress' as const } : t)
  })),
  
  // Task Actions
  addTask: (t) => set((state) => ({
    tasks: [...state.tasks, { ...t, id: `tsk-${Date.now()}`, status: 'todo' }]
  })),
  
  updateTaskStatus: (id, status) => set((state) => ({
    tasks: state.tasks.map(t => t.id === id ? { ...t, status } : t)
  })),
  
  addChatMessage: (channel, text, senderName, senderRole, options) => set((state) => ({
    chatMessages: [
      ...state.chatMessages,
      {
        id: `msg-${Date.now()}`,
        channel,
        senderName,
        senderRole,
        text,
        time: format(new Date(), 'hh:mm a'),
        priority: options?.priority ?? 'normal',
      },
    ],
  })),

  addSupportMessage: (role, text) => set((state) => ({
    supportMessages: [
      ...state.supportMessages,
      {
        id: `sup-${Date.now()}`,
        role,
        text,
        time: format(new Date(), 'hh:mm a'),
      },
    ],
  })),

  // CMS Updater
  updateCMSSettings: (settings) => set((state) => ({
    cmsSettings: { ...state.cmsSettings, ...settings }
  })),
  
  // Integrations actions
  toggleIntegration: (id) => set((state) => {
    const integration = state.integrations.find(i => i.id === id);
    if (!integration) return {};
    const newConn = !integration.connected;
    
    const updatedNotifications: Notification[] = [
      {
        id: `n-${Date.now()}`,
        title: `Integration ${newConn ? 'Connected' : 'Disconnected'}`,
        description: `${integration.name} service link was updated successfully.`,
        type: 'system',
        time: 'Just now',
        read: false
      },
      ...state.notifications
    ];
    
    return {
      integrations: state.integrations.map(i => i.id === id ? { ...i, connected: newConn, webhookUrl: newConn ? (i.webhookUrl || `https://hooks.live-api.io/v1/${i.id}-${Math.floor(Math.random()*1000)}`) : undefined } : i),
      notifications: updatedNotifications
    };
  }),
  
  updateIntegrationWebhook: (id, url) => set((state) => ({
    integrations: state.integrations.map(i => i.id === id ? { ...i, webhookUrl: url } : i)
  })),
  
  // renewals
  renewContract: (id) => set((state) => {
    const ren = state.renewals.find(r => r.id === id);
    if (!ren) return {};
    
    const updatedNotifications: Notification[] = [
      {
        id: `n-${Date.now()}`,
        title: 'Workspace Lease Renewed',
        description: `Successfully extended lease for ${ren.clientName} (${ren.companyName}) for $${ren.monthlyFee}/mo.`,
        type: 'billing',
        time: 'Just now',
        read: false
      },
      ...state.notifications
    ];
    
    return {
      renewals: state.renewals.map(r => r.id === id ? { ...r, status: 'renewed' as const } : r),
      notifications: updatedNotifications,
      // Create automatic mock paid invoice!
      invoices: [
        {
          id: `INV-${Math.floor(4000 + Math.random() * 5000)}`,
          clientName: ren.companyName,
          amount: ren.monthlyFee,
          status: 'paid',
          dueDate: format(new Date(), 'MMM dd, yyyy')
        },
        ...state.invoices
      ]
    };
  }),
  
  sendRenewalReminder: (id) => set((state) => {
    const ren = state.renewals.find(r => r.id === id);
    if (!ren) return {};
    
    return {
      notifications: [
        {
          id: `n-${Date.now()}`,
          title: 'Renewal Notification Sent',
          description: `Dispatched automated checkout reminder to ${ren.clientName} (${ren.companyName}).`,
          type: 'billing',
          time: 'Just now',
          read: false
        },
        ...state.notifications
      ]
    };
  }),
  
  // Traditional Actions
  addLead: (lead) => set((state) => {
    const newLead: Lead = {
      ...lead,
      id: `l-${Date.now()}`,
      lastContact: 'Just now'
    };
    
    const updatedNotifications: Notification[] = [
      {
        id: `n-${Date.now()}`,
        title: 'New Lead Created',
        description: `${lead.name} from ${lead.company} entered the ${lead.stage} pipeline.`,
        type: 'lead',
        time: 'Just now',
        read: false
      },
      ...state.notifications
    ];

    return {
      leads: [newLead, ...state.leads],
      notifications: updatedNotifications
    };
  }),

  updateLeadStage: (id, stage) => set((state) => {
    const lead = state.leads.find(l => l.id === id);
    if (!lead) return {};
    
    const updatedNotifications: Notification[] = [
      {
        id: `n-${Date.now()}`,
        title: 'Lead Stage Transitioned',
        description: `${lead.name} (${lead.company}) was promoted to ${stage} stage.`,
        type: 'lead',
        time: 'Just now',
        read: false
      },
      ...state.notifications
    ];

    return {
      leads: state.leads.map(l => l.id === id ? { ...l, stage, lastContact: 'Just now' } : l),
      notifications: updatedNotifications
    };
  }),

  deleteLead: (id) => set((state) => ({
    leads: state.leads.filter(l => l.id !== id)
  })),

  addInvoice: (invoice) => set((state) => {
    const newInvoice: Invoice = {
      ...invoice,
      id: `INV-${Math.floor(2045 + Math.random() * 1000)}`
    };

    const updatedNotifications: Notification[] = [
      {
        id: `n-${Date.now()}`,
        title: 'Invoice Issued',
        description: `Invoice ${newInvoice.id} generated for ${invoice.clientName} ($${invoice.amount.toLocaleString()}).`,
        type: 'billing',
        time: 'Just now',
        read: false
      },
      ...state.notifications
    ];

    return {
      invoices: [newInvoice, ...state.invoices],
      notifications: updatedNotifications
    };
  }),

  updateInvoiceStatus: (id, status) => set((state) => {
    const invoice = state.invoices.find(i => i.id === id);
    if (!invoice) return {};

    const updatedNotifications: Notification[] = [
      {
        id: `n-${Date.now()}`,
        title: `Invoice marked as ${status.toUpperCase()}`,
        description: `Invoice ${id} for ${invoice.clientName} was updated to ${status}.`,
        type: 'billing',
        time: 'Just now',
        read: false
      },
      ...state.notifications
    ];

    const revenueDiff = status === 'paid' && invoice.status !== 'paid' ? invoice.amount : 0;

    return {
      invoices: state.invoices.map(i => i.id === id ? { ...i, status } : i),
      notifications: updatedNotifications,
      kpi: {
        ...state.kpi,
        totalRevenue: state.kpi.totalRevenue + revenueDiff
      }
    };
  }),

  bookDesk: (branchId, deskId, assigneeName) => set((state) => {
    const branch = state.branches.find(b => b.id === branchId);
    const desk = branch?.desks.find(d => d.id === deskId);
    if (!branch || !desk) return {};

    const updatedBranches = state.branches.map(b => {
      if (b.id !== branchId) return b;
      const updatedDesks = b.desks.map(d => {
        if (d.id !== deskId) return d;
        return { ...d, status: 'occupied' as const, assigneeName };
      });

      const occupiedOrReservedCount = updatedDesks.filter(d => d.status === 'occupied' || d.status === 'reserved').length;
      const calculatedOccupancy = Math.round((occupiedOrReservedCount / b.desks.length) * 100);

      return {
        ...b,
        desks: updatedDesks,
        occupancyRate: calculatedOccupancy
      };
    });

    const updatedNotifications: Notification[] = [
      {
        id: `n-${Date.now()}`,
        title: 'Desk Allocated Live',
        description: `${selectedActivityLogText(desk.type)} ${desk.name} in ${branch.name} is now leased by ${assigneeName}.`,
        type: 'system',
        time: 'Just now',
        read: false
      },
      ...state.notifications
    ];

    // Auto trigger automated onboarding!
    const updatedOnboardings = [
      {
        id: `onb-${Date.now()}`,
        clientName: assigneeName,
        companyName: assigneeName,
        email: `${assigneeName.toLowerCase().replace(/\s+/g,'')}@apex-member.co`,
        branchId,
        deskId,
        progress: 0,
        steps: [
          { id: 'step-1', label: 'Review & Sign Workspace Lease Agreement', completed: false },
          { id: 'step-2', label: 'Issue Kisi Mobile Smart Access Key', completed: false },
          { id: 'step-3', label: 'Collect Initial Month Deposit & Onboarding Fee', completed: false },
          { id: 'step-4', label: 'Introduce to Community Slack Workspace', completed: false },
          { id: 'step-5', label: 'Setup Custom Dedicated Desk Label & Ergonomic Check-in', completed: false }
        ],
        status: 'pending' as const
      },
      ...state.onboardings
    ];

    return {
      branches: updatedBranches,
      notifications: updatedNotifications,
      onboardings: updatedOnboardings,
      kpi: {
        ...state.kpi,
        activeMembers: state.kpi.activeMembers + 1,
        totalRevenue: state.kpi.totalRevenue + desk.pricePerMonth
      }
    };
  }),

  reserveDesk: (branchId, deskId) => set((state) => {
    const branch = state.branches.find(b => b.id === branchId);
    const desk = branch?.desks.find(d => d.id === deskId);
    if (!branch || !desk) return {};

    const updatedBranches = state.branches.map(b => {
      if (b.id !== branchId) return b;
      const updatedDesks = b.desks.map(d => {
        if (d.id !== deskId) return d;
        return { ...d, status: 'reserved' as const };
      });

      const occupiedOrReservedCount = updatedDesks.filter(d => d.status === 'occupied' || d.status === 'reserved').length;
      const calculatedOccupancy = Math.round((occupiedOrReservedCount / b.desks.length) * 100);

      return {
        ...b,
        desks: updatedDesks,
        occupancyRate: calculatedOccupancy
      };
    });

    const updatedNotifications: Notification[] = [
      {
        id: `n-${Date.now()}`,
        title: 'Desk Reserved',
        description: `${desk.name} in ${branch.name} moved to Reserved status pending move-in.`,
        type: 'tour',
        time: 'Just now',
        read: false
      },
      ...state.notifications
    ];

    return {
      branches: updatedBranches,
      notifications: updatedNotifications
    };
  }),

  releaseDesk: (branchId, deskId) => set((state) => {
    const branch = state.branches.find(b => b.id === branchId);
    const desk = branch?.desks.find(d => d.id === deskId);
    if (!branch || !desk) return {};

    const updatedBranches = state.branches.map(b => {
      if (b.id !== branchId) return b;
      const updatedDesks = b.desks.map(d => {
        if (d.id !== deskId) return d;
        return { ...d, status: 'available' as const, assigneeName: undefined };
      });

      const occupiedOrReservedCount = updatedDesks.filter(d => d.status === 'occupied' || d.status === 'reserved').length;
      const calculatedOccupancy = Math.round((occupiedOrReservedCount / b.desks.length) * 100);

      return {
        ...b,
        desks: updatedDesks,
        occupancyRate: calculatedOccupancy
      };
    });

    const updatedNotifications: Notification[] = [
      {
        id: `n-${Date.now()}`,
        title: 'Space Released',
        description: `${desk.name} in ${branch.name} is now vacant and ready for booking.`,
        type: 'system',
        time: 'Just now',
        read: false
      },
      ...state.notifications
    ];

    return {
      branches: updatedBranches,
      notifications: updatedNotifications,
      kpi: {
        ...state.kpi,
        activeMembers: Math.max(0, state.kpi.activeMembers - 1)
      }
    };
  }),

  addNotification: (notification) => set((state) => {
    const newNotif: Notification = {
      ...notification,
      id: `n-${Date.now()}`,
      time: 'Just now',
      read: false
    };
    return {
      notifications: [newNotif, ...state.notifications]
    };
  }),

  toggleNotificationRead: (id) => set((state) => ({
    notifications: state.notifications.map(n => n.id === id ? { ...n, read: !n.read } : n)
  })),

  markAllNotificationsRead: () => set((state) => ({
    notifications: state.notifications.map(n => ({ ...n, read: true }))
  })),

  deleteNotification: (id) => set((state) => ({
    notifications: state.notifications.filter(n => n.id !== id)
  })),

  updateUserSettings: (settings) => set((state) => ({
    userSettings: { ...state.userSettings, ...settings }
  })),
}));

function selectedActivityLogText(type: Desk['type']) {
  switch (type) {
    case 'meeting-room': return 'Meeting Space';
    case 'private-office': return 'Private Office Suite';
    case 'dedicated': return 'Dedicated Workstation';
    default: return 'Hot-desk Desk';
  }
}
