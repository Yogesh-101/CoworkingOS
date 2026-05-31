export type DeskStatus = 'available' | 'occupied' | 'reserved' | 'maintenance';
export type DeskType = 'hot-desk' | 'dedicated' | 'private-office' | 'meeting-room';

export interface Desk {
  id: string;
  x: number;
  y: number;
  width: number;
  height: number;
  rotation?: number;
  status: DeskStatus;
  type: DeskType;
  name: string;
  pricePerMonth: number;
  assigneeName?: string;
}

export interface Branch {
  id: string;
  name: string;
  location: string;
  capacity: number;
  occupancyRate: number;
  desks: Desk[];
}

export interface Lead {
  id: string;
  name: string;
  company: string;
  email: string;
  stage: 'new' | 'contacted' | 'qualified' | 'proposal' | 'negotiation' | 'won' | 'lost';
  value: number;
  lastContact: string;
  phone?: string;
  bio?: string;
  notes?: string;
  linkedIn?: string;
}

export interface Invoice {
  id: string;
  clientName: string;
  amount: number;
  status: 'paid' | 'pending' | 'overdue';
  dueDate: string;
}

export interface KPIData {
  totalRevenue: number;
  revenueGrowth: number;
  occupancyRate: number;
  occupancyGrowth: number;
  activeMembers: number;
  churnRate: number;
}

// Smart Visitor Management
export interface Visitor {
  id: string;
  name: string;
  company: string;
  email: string;
  phone: string;
  host: string;
  branchId: string;
  checkInTime: string;
  checkOutTime?: string;
  status: 'checked-in' | 'completed' | 'scheduled';
}

// Client Onboarding Workflow
export interface OnboardingStep {
  id: string;
  label: string;
  completed: boolean;
}

export interface ClientOnboarding {
  id: string;
  clientName: string;
  companyName: string;
  email: string;
  branchId: string;
  deskId?: string;
  progress: number; // 0 to 100
  steps: OnboardingStep[];
  status: 'pending' | 'active' | 'completed';
  phone?: string;
  bio?: string;
  welcomeEmailSent?: boolean;
  welcomeEmailSentAt?: string;
  leaseSignedAt?: string;
  leaseSignedBy?: string;
  signatureDataUrl?: string;
  eSignAgreedAt?: string;
  onboardingFormSent?: boolean;
  onboardingFormSentAt?: string;
}

// Quotation & Proposal Management
export interface Proposal {
  id: string;
  leadName: string;
  company: string;
  deskType: DeskType;
  monthlyFee: number;
  durationMonths: number;
  status: 'draft' | 'sent' | 'accepted' | 'declined';
  dateCreated: string;
  signatureStatus?: 'pending' | 'signed' | 'declined';
  signedAt?: string;
  signedBy?: string;
  signatureDataUrl?: string;
}

// Employee & Team Management
export interface Employee {
  id: string;
  name: string;
  role: 'Branch Manager' | 'Community Host' | 'Receptionist' | 'IT Support';
  branchId: string;
  email: string;
  status: 'active' | 'on-leave' | 'inactive';
  phone?: string;
  bio?: string;
  department?: string;
  startDate?: string;
  skills?: string[];
  presence?: 'online' | 'busy' | 'away' | 'offline';
  avatarUrl?: string;
  linkedIn?: string;
}

// Ticket & Resolution Management
export interface Ticket {
  id: string;
  title: string;
  description: string;
  category: 'WiFi/Network' | 'Facilities' | 'Cleaning' | 'Access Control' | 'Other';
  priority: 'low' | 'medium' | 'high' | 'critical';
  status: 'open' | 'in-progress' | 'resolved';
  branchId: string;
  memberName: string;
  assignedTo?: string; // Employee ID
  dateCreated: string;
}

// Internal Task Management
export interface InternalTask {
  id: string;
  title: string;
  description: string;
  priority: 'low' | 'medium' | 'high';
  status: 'todo' | 'in-progress' | 'done';
  assignedTo: string; // Employee ID
  dueDate: string;
}

// Team Chat
export interface ChatMessage {
  id: string;
  channel: string;
  senderName: string;
  senderRole: string;
  text: string;
  time: string;
  priority?: 'normal' | 'urgent';
  pinned?: boolean;
  senderId?: string;
}

// Website CMS settings
export interface CMSSettings {
  heroTitle: string;
  heroSub: string;
  brandingColor: 'brand' | 'indigo' | 'blue' | 'purple' | 'emerald';
  brandName: string;
  showPricing: boolean;
  hotDeskPrice: number;
  dedicatedPrice: number;
  meetingPrice: number;
}

// Integrations Layer
export interface IntegrationSetting {
  id: string;
  name: string;
  description: string;
  category: 'Access' | 'Billing' | 'Communication' | 'Marketing';
  icon: string;
  connected: boolean;
  webhookUrl?: string;
}

// Client Contract Renewals (Billing extension)
export interface WorkspaceRenewal {
  id: string;
  clientName: string;
  companyName: string;
  branchId: string;
  deskName: string;
  monthlyFee: number;
  renewalDate: string;
  paymentCycle: 'Monthly' | 'Quarterly' | 'Yearly';
  status: 'active' | 'pending-review' | 'renewed';
}

export interface UserSettings {
  theme: 'dark' | 'light';
  notificationsEnabled: boolean;
  emailDigest: 'daily' | 'weekly' | 'none';
  privacyMode: boolean;
  displayName?: string;
  email?: string;
  phone?: string;
  bio?: string;
  avatarUrl?: string;
  department?: string;
  linkedEmployeeId?: string;
}

export interface EmailLog {
  id: string;
  to: string;
  subject: string;
  template: 'onboarding-welcome' | 'onboarding-completion' | 'onboarding-reminder' | 'onboarding-form' | 'proposal-sent';
  relatedId?: string;
  sentAt: string;
  status: 'sent' | 'queued' | 'failed';
}

export interface SupportMessage {
  id: string;
  role: 'user' | 'assistant';
  text: string;
  time: string;
}
