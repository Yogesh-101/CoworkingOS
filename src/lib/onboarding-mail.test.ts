import { describe, expect, it } from 'vitest';
import type { Branch, ClientOnboarding, IntegrationSetting } from '@/types';
import {
  buildOnboardingEmail,
  dispatchOnboardingFormEmail,
  isSendGridConnected,
} from './onboarding-mail';

const onboarding: ClientOnboarding = {
  id: 'onb-1',
  clientName: 'Rohan Malhotra',
  companyName: 'Dhruva Tech',
  email: 'rohan@dhruva.in',
  branchId: 'b1',
  progress: 60,
  status: 'active',
  steps: [{ id: 'step-1', label: 'Sign lease', completed: true }],
};

const branch: Branch = {
  id: 'b1',
  name: 'HITEC City Hub',
  location: 'Hyderabad',
  capacity: 100,
  occupancyRate: 75,
  desks: [],
};

const integrationsConnected: IntegrationSetting[] = [
  {
    id: 'int-4',
    name: 'SendGrid',
    description: 'Email',
    category: 'Communication',
    icon: 'mail',
    connected: true,
  },
];

const integrationsOff: IntegrationSetting[] = [
  {
    id: 'int-4',
    name: 'SendGrid',
    description: 'Email',
    category: 'Communication',
    icon: 'mail',
    connected: false,
  },
];

describe('onboarding-mail', () => {
  it('detects SendGrid connection', () => {
    expect(isSendGridConnected(integrationsConnected)).toBe(true);
    expect(isSendGridConnected(integrationsOff)).toBe(false);
  });

  it('builds onboarding form email copy', () => {
    const { subject, preview } = buildOnboardingEmail(onboarding, 'form', branch.name);
    expect(subject).toContain('onboarding form');
    expect(preview).toContain('Rohan Malhotra');
  });

  it('dispatches form email when SendGrid is connected', () => {
    const result = dispatchOnboardingFormEmail(
      { integrations: integrationsConnected, onboardings: [onboarding], branches: [branch], emailLogs: [] },
      'onb-1'
    );
    expect(result).not.toBeNull();
    expect(result!.emailLogs).toHaveLength(1);
    expect(result!.emailLogs[0].template).toBe('onboarding-form');
    expect(result!.onboardings[0].onboardingFormSent).toBe(true);
  });

  it('skips form email when SendGrid is disconnected', () => {
    const result = dispatchOnboardingFormEmail(
      { integrations: integrationsOff, onboardings: [onboarding], branches: [branch], emailLogs: [] },
      'onb-1'
    );
    expect(result).toBeNull();
  });
});
