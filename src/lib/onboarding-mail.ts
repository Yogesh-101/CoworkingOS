import { format } from 'date-fns';
import type { Branch, ClientOnboarding, EmailLog, IntegrationSetting } from '@/types';

export const SENDGRID_INTEGRATION_ID = 'int-4';

export interface EmailNotification {
  id: string;
  title: string;
  description: string;
  type: 'lead' | 'system' | 'billing' | 'tour' | 'visitor' | 'ticket';
  time: string;
  read: boolean;
}

export function isSendGridConnected(integrations: IntegrationSetting[]): boolean {
  return integrations.some((i) => i.id === SENDGRID_INTEGRATION_ID && i.connected);
}

export function buildOnboardingEmail(
  onboarding: ClientOnboarding,
  template: 'welcome' | 'completion' | 'reminder' | 'form',
  branchName: string
): { subject: string; preview: string } {
  const base = onboarding.clientName;
  switch (template) {
    case 'welcome':
      return {
        subject: `Welcome to CoworkingOS — ${onboarding.companyName}`,
        preview: `Hi ${base}, your workspace at ${branchName} is ready. Complete your onboarding checklist, sign the lease, and collect your access key.`,
      };
    case 'completion':
      return {
        subject: `You're fully onboarded at CoworkingOS`,
        preview: `Hi ${base}, all onboarding steps for ${onboarding.companyName} are complete. Your desk is active and your team has been notified.`,
      };
    case 'reminder':
      return {
        subject: `Reminder: finish your CoworkingOS onboarding`,
        preview: `Hi ${base}, you are ${onboarding.progress}% through onboarding at ${branchName}. Log in to complete remaining steps.`,
      };
    case 'form':
      return {
        subject: `Your CoworkingOS onboarding form — ${onboarding.companyName}`,
        preview: `Hi ${base}, attached is your signed onboarding form (PDF) for ${branchName}. Download and retain for your records.`,
      };
  }
}

export function createEmailLog(
  to: string,
  subject: string,
  template: EmailLog['template'],
  relatedId?: string
): EmailLog {
  return {
    id: `eml-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`,
    to,
    subject,
    template,
    relatedId,
    sentAt: format(new Date(), 'MMM dd, yyyy · hh:mm a'),
    status: 'sent',
  };
}

export function dispatchOnboardingFormEmail(
  ctx: {
    integrations: IntegrationSetting[];
    onboardings: ClientOnboarding[];
    branches: Branch[];
    emailLogs: EmailLog[];
  },
  onboardingId: string
): {
  emailLogs: EmailLog[];
  onboardings: ClientOnboarding[];
  notification: EmailNotification;
} | null {
  if (!isSendGridConnected(ctx.integrations)) return null;

  const onboarding = ctx.onboardings.find((o) => o.id === onboardingId);
  if (!onboarding) return null;

  const branch = ctx.branches.find((b) => b.id === onboarding.branchId) ?? ctx.branches[0];
  const { subject, preview } = buildOnboardingEmail(onboarding, 'form', branch?.name ?? 'Hyderabad');
  const attachmentName = `CoworkingOS-Onboarding-${onboarding.companyName.replace(/\s+/g, '-')}.pdf`;

  const log = createEmailLog(onboarding.email, subject, 'onboarding-form', onboardingId);

  const updatedOnboarding: ClientOnboarding = {
    ...onboarding,
    onboardingFormSent: true,
    onboardingFormSentAt: format(new Date(), 'MMM dd, yyyy · hh:mm a'),
  };

  return {
    emailLogs: [log, ...ctx.emailLogs],
    onboardings: ctx.onboardings.map((o) => (o.id === onboardingId ? updatedOnboarding : o)),
    notification: {
      id: `n-${Date.now()}`,
      title: 'Onboarding form emailed',
      description: `SendGrid delivered "${subject}" with attachment ${attachmentName} to ${onboarding.email}. ${preview}`,
      type: 'system',
      time: 'Just now',
      read: false,
    },
  };
}

export function dispatchOnboardingEmail(
  ctx: {
    integrations: IntegrationSetting[];
    onboardings: ClientOnboarding[];
    branches: Branch[];
    activeBranchId: string;
    emailLogs: EmailLog[];
  },
  onboardingId: string,
  template: 'welcome' | 'completion' | 'reminder'
): {
  emailLogs: EmailLog[];
  onboardings: ClientOnboarding[];
  notification: EmailNotification;
} | null {
  if (!isSendGridConnected(ctx.integrations)) return null;

  const onboarding = ctx.onboardings.find((o) => o.id === onboardingId);
  if (!onboarding) return null;
  if (template === 'welcome' && onboarding.welcomeEmailSent) return null;

  const branch = ctx.branches.find((b) => b.id === onboarding.branchId) ?? ctx.branches[0];
  const { subject, preview } = buildOnboardingEmail(onboarding, template, branch?.name ?? 'Hyderabad');

  const log = createEmailLog(
    onboarding.email,
    subject,
    template === 'welcome'
      ? 'onboarding-welcome'
      : template === 'completion'
        ? 'onboarding-completion'
        : 'onboarding-reminder',
    onboardingId
  );

  const updatedOnboarding: ClientOnboarding = {
    ...onboarding,
    welcomeEmailSent: template === 'welcome' ? true : onboarding.welcomeEmailSent,
    welcomeEmailSentAt:
      template === 'welcome' ? format(new Date(), 'MMM dd, yyyy · hh:mm a') : onboarding.welcomeEmailSentAt,
  };

  return {
    emailLogs: [log, ...ctx.emailLogs],
    onboardings: ctx.onboardings.map((o) => (o.id === onboardingId ? updatedOnboarding : o)),
    notification: {
      id: `n-${Date.now()}`,
      title: 'Onboarding email sent',
      description: `SendGrid delivered "${subject}" to ${onboarding.email}. ${preview}`,
      type: 'system',
      time: 'Just now',
      read: false,
    },
  };
}
