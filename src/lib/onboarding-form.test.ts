import { describe, expect, it } from 'vitest';
import type { Branch, ClientOnboarding } from '@/types';
import {
  generateOnboardingFormPdf,
  getOnboardingFormBlob,
  onboardingFormFilename,
} from './onboarding-form';

const branch: Branch = {
  id: 'b1',
  name: 'HITEC City Hub',
  location: 'Madhapur, Hyderabad',
  capacity: 120,
  occupancyRate: 80,
  desks: [
    {
      id: 'desk-1',
      x: 0,
      y: 0,
      width: 1,
      height: 1,
      status: 'occupied',
      type: 'dedicated',
      name: 'Desk A-12',
      pricePerMonth: 14999,
    },
  ],
};

const onboarding: ClientOnboarding = {
  id: 'onb-test',
  clientName: 'Priya Sharma',
  companyName: 'Nuvista Technologies',
  email: 'priya@nuvista.in',
  branchId: 'b1',
  deskId: 'desk-1',
  progress: 40,
  status: 'active',
  steps: [
    { id: 'step-1', label: 'Sign lease', completed: true },
    { id: 'step-2', label: 'Access key', completed: false },
  ],
  leaseSignedBy: 'Priya Sharma',
  leaseSignedAt: 'May 31, 2026',
};

describe('onboarding-form', () => {
  it('builds a stable PDF filename', () => {
    expect(onboardingFormFilename(onboarding)).toBe(
      'CoworkingOS-Onboarding-nuvista-technologies-onb-test.pdf'
    );
  });

  it('generates a PDF document without throwing', () => {
    const doc = generateOnboardingFormPdf({ onboarding, branch, desk: branch.desks[0] });
    expect(doc.getNumberOfPages()).toBeGreaterThanOrEqual(1);
    const pdfBytes = doc.output('arraybuffer') as ArrayBuffer;
    expect(pdfBytes.byteLength).toBeGreaterThan(500);
  });

  it('exports a non-empty blob for download/email', () => {
    const blob = getOnboardingFormBlob({ onboarding, branch });
    expect(blob.size).toBeGreaterThan(500);
    expect(blob.type).toBe('application/pdf');
  });
});
