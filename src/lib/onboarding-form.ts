import { jsPDF } from 'jspdf';
import { format } from 'date-fns';
import type { Branch, ClientOnboarding, Desk } from '@/types';

export interface OnboardingFormContext {
  onboarding: ClientOnboarding;
  branch: Branch;
  desk?: Desk;
}

export function onboardingFormFilename(onboarding: ClientOnboarding): string {
  const slug = onboarding.companyName.replace(/\s+/g, '-').toLowerCase();
  return `CoworkingOS-Onboarding-${slug}-${onboarding.id}.pdf`;
}

export function generateOnboardingFormPdf(ctx: OnboardingFormContext): jsPDF {
  const { onboarding, branch, desk } = ctx;
  const doc = new jsPDF({ unit: 'pt', format: 'a4' });
  const margin = 48;
  let y = margin;

  const line = (text: string, size = 10, bold = false) => {
    doc.setFont('helvetica', bold ? 'bold' : 'normal');
    doc.setFontSize(size);
    doc.setTextColor(30, 30, 30);
    const lines = doc.splitTextToSize(text, 520);
    doc.text(lines, margin, y);
    y += lines.length * (size + 4) + 4;
  };

  doc.setFillColor(255, 10, 22);
  doc.rect(0, 0, 595, 56, 'F');
  doc.setTextColor(255, 255, 255);
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(16);
  doc.text('CoworkingOS — Member Onboarding Form', margin, 36);
  y = 72;

  line(`Document ID: ${onboarding.id}`, 9);
  line(`Generated: ${format(new Date(), 'MMMM dd, yyyy · hh:mm a')}`, 9);
  y += 8;

  line('Member details', 12, true);
  line(`Name: ${onboarding.clientName}`);
  line(`Company: ${onboarding.companyName}`);
  line(`Email: ${onboarding.email}`);
  if (onboarding.phone) line(`Phone: ${onboarding.phone}`);
  line(`Branch: ${branch.name} — ${branch.location}`);
  if (desk) line(`Workspace: ${desk.name} (${desk.type.replace('-', ' ')})`);
  line(`Onboarding progress: ${onboarding.progress}%`);
  y += 8;

  line('Onboarding checklist', 12, true);
  onboarding.steps.forEach((step, i) => {
    const mark = step.completed ? '[x]' : '[ ]';
    line(`${i + 1}. ${mark} ${step.label}`, 10);
  });
  y += 12;

  line('Workspace lease agreement', 12, true);
  line(
    'By signing below, the member agrees to CoworkingOS workspace terms: acceptable use, access control (Kisi), billing cycles in INR, and community guidelines for the assigned Hyderabad campus.'
  );
  y += 8;

  if (onboarding.leaseSignedBy && onboarding.leaseSignedAt) {
    line(`E-signed by: ${onboarding.leaseSignedBy}`, 10, true);
    line(`Date: ${onboarding.leaseSignedAt}`);
    if (onboarding.eSignAgreedAt) line(`Consent recorded: ${onboarding.eSignAgreedAt}`);
  } else {
    line('Signature: _________________________________', 10);
    line('Date: _________________________________', 10);
  }

  if (onboarding.signatureDataUrl) {
    try {
      const imgW = 180;
      const imgH = 60;
      if (y + imgH > 780) doc.addPage();
      doc.addImage(onboarding.signatureDataUrl, 'PNG', margin, y, imgW, imgH);
      y += imgH + 12;
    } catch {
      line('(Digital signature on file)');
    }
  }

  y += 8;
  doc.setDrawColor(200, 200, 200);
  doc.line(margin, y, 547, y);
  y += 14;
  line('CoworkingOS · Hyderabad campuses · coworking.os', 8);
  line('This is a system-generated onboarding record. Retain for compliance and billing.', 8);

  return doc;
}

export function downloadOnboardingForm(ctx: OnboardingFormContext): void {
  const doc = generateOnboardingFormPdf(ctx);
  doc.save(onboardingFormFilename(ctx.onboarding));
}

export function getOnboardingFormBlob(ctx: OnboardingFormContext): Blob {
  const doc = generateOnboardingFormPdf(ctx);
  return doc.output('blob');
}
