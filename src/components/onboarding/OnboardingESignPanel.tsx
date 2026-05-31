import { useState } from 'react';
import { Download, Mail, FileSignature, ShieldCheck, CheckCircle2 } from 'lucide-react';
import { cn } from '@/lib/utils';
import { SignaturePad } from '@/components/ui/SignaturePad';
import { downloadOnboardingForm } from '@/lib/onboarding-form';
import type { Branch, ClientOnboarding, Desk } from '@/types';

interface OnboardingESignPanelProps {
  onboarding: ClientOnboarding;
  branch: Branch;
  desk?: Desk;
  onESign: (signedBy: string, signatureDataUrl: string, agreedAt: string) => void;
  onSendFormEmail: () => void;
  sendGridConnected: boolean;
}

export function OnboardingESignPanel({
  onboarding,
  branch,
  desk,
  onESign,
  onSendFormEmail,
  sendGridConnected,
}: OnboardingESignPanelProps) {
  const [signerName, setSignerName] = useState(onboarding.clientName);
  const [signature, setSignature] = useState<string | null>(onboarding.signatureDataUrl ?? null);
  const [agreed, setAgreed] = useState(!!onboarding.eSignAgreedAt);
  const [error, setError] = useState<string | null>(null);

  const isSigned = !!onboarding.leaseSignedAt && !!onboarding.signatureDataUrl;

  const handleDownload = () => {
    downloadOnboardingForm({ onboarding, branch, desk });
  };

  const handleApplyESign = () => {
    setError(null);
    if (!agreed) {
      setError('Please accept the digital agreement terms before signing.');
      return;
    }
    if (!signerName.trim()) {
      setError('Enter the signer full name.');
      return;
    }
    if (!signature) {
      setError('Draw your signature in the pad below.');
      return;
    }
    onESign(signerName.trim(), signature, new Date().toISOString());
  };

  return (
    <div className="rounded-2xl border border-zinc-850 bg-zinc-950/60 p-4 space-y-4">
      <div className="flex items-center justify-between gap-2 flex-wrap">
        <span className="text-[9px] font-black text-zinc-500 uppercase flex items-center gap-1.5">
          <FileSignature className="w-3.5 h-3.5 text-brand-500" />
          Digital e-sign & onboarding form
        </span>
        <div className="flex flex-wrap gap-1.5">
          {isSigned && (
            <span className="text-[8px] font-black uppercase px-2 py-0.5 rounded-md bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 flex items-center gap-1">
              <CheckCircle2 className="w-3 h-3" />
              E-signed
            </span>
          )}
          {onboarding.onboardingFormSent && (
            <span className="text-[8px] font-black uppercase px-2 py-0.5 rounded-md bg-blue-500/10 text-blue-400 border border-blue-500/20">
              Form emailed {onboarding.onboardingFormSentAt ? `· ${onboarding.onboardingFormSentAt}` : ''}
            </span>
          )}
        </div>
      </div>

      <p className="text-[11px] text-zinc-400 leading-relaxed font-medium">
        Complete the workspace onboarding agreement with a legally binding digital signature. Download the PDF
        anytime or email the signed form to the member.
      </p>

      {!isSigned && (
        <>
          <label className="flex items-start gap-2.5 cursor-pointer group">
            <input
              type="checkbox"
              checked={agreed}
              onChange={(e) => setAgreed(e.target.checked)}
              className="mt-0.5 rounded border-zinc-700 text-brand-500 focus:ring-brand-500/30"
            />
            <span className="text-[10px] text-zinc-400 font-semibold leading-relaxed group-hover:text-zinc-300">
              <ShieldCheck className="w-3.5 h-3.5 inline mr-1 text-brand-500" />
              I agree to CoworkingOS workspace terms, INR billing, Kisi access policies, and community guidelines
              for {branch.name}.
            </span>
          </label>

          <div className="space-y-1.5">
            <label className="text-[9px] font-bold text-zinc-500 uppercase tracking-widest block">
              Signer full name
            </label>
            <input
              type="text"
              value={signerName}
              onChange={(e) => setSignerName(e.target.value)}
              className="w-full bg-zinc-900 border border-zinc-805 rounded-xl py-2 px-3 text-xs text-zinc-200 font-semibold focus:outline-none focus:ring-1 focus:ring-brand-500/50"
            />
          </div>

          <SignaturePad onChange={setSignature} />
          {error && <p className="text-[10px] font-bold text-rose-400">{error}</p>}
          <button
            type="button"
            onClick={handleApplyESign}
            className="w-full py-2.5 rounded-xl bg-brand-500 hover:bg-brand-600 text-white text-[10px] font-black uppercase tracking-wide cursor-pointer shadow-md"
          >
            Apply digital e-sign
          </button>
        </>
      )}

      {isSigned && onboarding.signatureDataUrl && (
        <div className="space-y-2">
          <p className="text-[10px] text-zinc-500 font-bold">
            Signed by {onboarding.leaseSignedBy} · {onboarding.leaseSignedAt}
          </p>
          <img
            src={onboarding.signatureDataUrl}
            alt="Digital signature"
            className="h-14 object-contain bg-white rounded-lg px-3 border border-zinc-800"
          />
        </div>
      )}

      <div className="flex flex-wrap gap-2 pt-1 border-t border-zinc-850">
        <button
          type="button"
          onClick={handleDownload}
          className={cn(
            'flex items-center gap-1.5 px-3 py-2 rounded-xl text-[10px] font-black uppercase border cursor-pointer transition-all',
            'bg-zinc-900 text-zinc-300 border-zinc-805 hover:border-zinc-700 hover:text-white'
          )}
        >
          <Download className="w-3.5 h-3.5" />
          Download form (PDF)
        </button>
        <button
          type="button"
          onClick={onSendFormEmail}
          disabled={!sendGridConnected}
          title={sendGridConnected ? undefined : 'Connect SendGrid in ERP Admin'}
          className={cn(
            'flex items-center gap-1.5 px-3 py-2 rounded-xl text-[10px] font-black uppercase border cursor-pointer transition-all',
            'bg-blue-500/10 text-blue-400 border-blue-500/25 hover:bg-blue-500/20',
            !sendGridConnected && 'opacity-50 cursor-not-allowed'
          )}
        >
          <Mail className="w-3.5 h-3.5" />
          Email form to member
        </button>
      </div>
    </div>
  );
}
