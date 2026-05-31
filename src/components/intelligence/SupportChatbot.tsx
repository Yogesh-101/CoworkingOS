import { useState, useRef, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Bot, X, Send, Minimize2, Mic, MicOff } from 'lucide-react';
import { useStore } from '@/store';
import { cn } from '@/lib/utils';
import { generateChatbotReply, computeLeadScores, computeRenewalPredictions } from '@/lib/intelligence';
import { generateGeminiText, isGeminiConfigured } from '@/lib/gemini';
import { buildAssistSystemPrompt, chatHistoryForGemini, snapshotFromStore } from '@/lib/ai-context';
import {
  navigationReply,
  parseAssistNavigation,
  platformAccessReply,
  wantsPlatformAccess,
} from '@/lib/assist-navigation';
import { isTabAllowed } from '@/lib/rbac';
import { useAssistSpeech } from '@/hooks/useAssistSpeech';

export function SupportChatbot() {
  const {
    view,
    role,
    branches,
    activeBranchId,
    leads,
    tickets,
    renewals,
    invoices,
    visitors,
    supportMessages,
    addSupportMessage,
    setActiveTab,
    requestPlatformAccess,
  } = useStore();

  const [open, setOpen] = useState(false);
  const [input, setInput] = useState('');
  const [typing, setTyping] = useState(false);
  const endRef = useRef<HTMLDivElement>(null);
  const geminiEnabled = isGeminiConfigured();

  const branch = branches.find((b) => b.id === activeBranchId) ?? branches[0];
  const hotLeads = computeLeadScores(leads).filter((s) => s.tier === 'hot').length;
  const atRiskRenewals = computeRenewalPredictions(renewals, invoices).filter(
    (r) => r.risk !== 'low'
  ).length;
  const openTickets = tickets.filter((t) => t.status !== 'resolved').length;
  const checkedInVisitors = visitors.filter((v) => v.status === 'checked-in').length;

  useEffect(() => {
    if (open) endRef.current?.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
  }, [supportMessages, open, typing]);

  const send = useCallback(
    async (text: string) => {
      if (!text.trim() || !branch) return;
      const trimmed = text.trim();
      addSupportMessage('user', trimmed);
      setInput('');
      setTyping(true);

      const fallbackCtx = {
        branchName: branch.name,
        occupancy: branch.occupancyRate,
        hotLeads,
        openTickets,
        atRiskRenewals,
        checkedInVisitors,
        isPublic: view !== 'app',
      };

      let reply = generateChatbotReply(trimmed, fallbackCtx);
      let handledNav = false;

      if (view !== 'app' && wantsPlatformAccess(trimmed)) {
        requestPlatformAccess();
        reply = platformAccessReply();
        handledNav = true;
      } else if (view === 'app' && role) {
        const navTab = parseAssistNavigation(trimmed);
        if (navTab && isTabAllowed(role, navTab)) {
          setActiveTab(navTab);
          reply = navigationReply(navTab);
          handledNav = true;
        }
      }

      if (!handledNav && geminiEnabled) {
        try {
          const snapshot = snapshotFromStore({
            branch,
            leads,
            tickets,
            renewals,
            invoices,
            visitors,
            isPublic: view !== 'app',
          });
          const history = chatHistoryForGemini(
            supportMessages.map((m) => ({ role: m.role, text: m.text }))
          );
          reply = await generateGeminiText({
            systemInstruction: buildAssistSystemPrompt(snapshot),
            userMessage: trimmed,
            history,
          });
        } catch {
          // Keep rule-based fallback on API errors
        }
      }

      addSupportMessage('assistant', reply);
      setTyping(false);
    },
    [
      branch,
      addSupportMessage,
      hotLeads,
      openTickets,
      atRiskRenewals,
      checkedInVisitors,
      view,
      role,
      requestPlatformAccess,
      setActiveTab,
      geminiEnabled,
      leads,
      tickets,
      renewals,
      invoices,
      visitors,
      supportMessages,
    ]
  );

  const { listening, supported, toggle: toggleMic } = useAssistSpeech((transcript) => {
    setInput(transcript);
    void send(transcript);
  });

  const quickPrompts =
    view === 'app'
      ? ['Open CRM', 'Go to Floor Map', 'Occupancy forecast?', 'Renewals at risk?']
      : ['What is CoworkingOS?', 'Pricing plans?', 'Enter platform', 'Occupancy forecast?'];

  const anchorClass = view === 'app' ? 'bottom-20 md:bottom-6' : 'bottom-6';

  return (
    <>
      <AnimatePresence>
        {open && (
          <motion.div
            initial={{ opacity: 0, y: 20, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 16, scale: 0.95 }}
            className={cn(
              'fixed right-4 z-50 w-[min(100vw-2rem,380px)] h-[min(70vh,520px)] bg-zinc-950 border border-zinc-805 rounded-3xl shadow-2xl flex flex-col overflow-hidden',
              anchorClass
            )}
          >
            <div className="flex items-center justify-between px-4 py-3 border-b border-zinc-850 bg-zinc-900/80 shrink-0">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-xl bg-brand-500/15 flex items-center justify-center">
                  <Bot className="w-4 h-4 text-brand-500" />
                </div>
                <span className="text-xs font-black text-white">CoworkingOS Assist</span>
              </div>
              <div className="flex items-center gap-1">
                <button
                  type="button"
                  onClick={() => setOpen(false)}
                  className="p-1.5 text-zinc-500 hover:text-zinc-200 cursor-pointer"
                  aria-label="Minimize"
                >
                  <Minimize2 className="w-4 h-4" />
                </button>
                <button
                  type="button"
                  onClick={() => setOpen(false)}
                  className="p-1.5 text-zinc-500 hover:text-zinc-200 cursor-pointer"
                  aria-label="Close"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>
            </div>

            <div className="flex-1 min-h-0 overflow-y-auto p-4 space-y-3">
              {supportMessages.map((msg) => (
                <div
                  key={msg.id}
                  className={cn(
                    'max-w-[90%] rounded-2xl px-3.5 py-2.5 text-xs font-semibold leading-relaxed',
                    msg.role === 'user'
                      ? 'ml-auto bg-brand-500 text-white rounded-tr-sm'
                      : 'mr-auto bg-zinc-900 text-zinc-200 border border-zinc-805 rounded-tl-sm'
                  )}
                >
                  {msg.text}
                </div>
              ))}
              {typing && (
                <div className="mr-auto bg-zinc-900 border border-zinc-805 rounded-2xl px-4 py-3 text-zinc-500 text-xs">
                  Thinking…
                </div>
              )}
              <div ref={endRef} />
            </div>

            <div className="p-3 border-t border-zinc-850 shrink-0 space-y-2">
              <div className="flex flex-wrap gap-1.5">
                {quickPrompts.map((p) => (
                  <button
                    key={p}
                    type="button"
                    onClick={() => void send(p)}
                    disabled={typing}
                    className="text-[9px] font-bold px-2 py-1 rounded-lg bg-zinc-900 border border-zinc-805 text-zinc-400 hover:text-brand-400 cursor-pointer disabled:opacity-50"
                  >
                    {p}
                  </button>
                ))}
              </div>
              <form
                onSubmit={(e) => {
                  e.preventDefault();
                  void send(input);
                }}
                className="flex gap-2"
              >
                <input
                  value={input}
                  onChange={(e) => setInput(e.target.value)}
                  placeholder={
                    supported
                      ? 'Ask or say "Open CRM", "Go to billing"…'
                      : 'Ask about ops, leads, renewals…'
                  }
                  disabled={typing || listening}
                  className="flex-1 bg-zinc-900 border border-zinc-805 rounded-full px-4 py-2 text-xs text-zinc-200 focus:outline-none min-w-0 disabled:opacity-60"
                />
                {supported && (
                  <button
                    type="button"
                    onClick={toggleMic}
                    disabled={typing}
                    aria-label={listening ? 'Stop listening' : 'Voice input'}
                    className={cn(
                      'w-9 h-9 rounded-full flex items-center justify-center shrink-0 cursor-pointer disabled:opacity-50 transition-colors',
                      listening
                        ? 'bg-red-500/20 text-red-400 border border-red-500/40 animate-pulse'
                        : 'bg-zinc-900 border border-zinc-805 text-zinc-400 hover:text-brand-400'
                    )}
                  >
                    {listening ? <MicOff className="w-4 h-4" /> : <Mic className="w-4 h-4" />}
                  </button>
                )}
                <button
                  type="submit"
                  disabled={typing || listening || !input.trim()}
                  className="w-9 h-9 rounded-full bg-brand-500 text-white flex items-center justify-center shrink-0 cursor-pointer disabled:opacity-50"
                >
                  <Send className="w-4 h-4" />
                </button>
              </form>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {!open && (
        <motion.button
          type="button"
          initial={{ scale: 0 }}
          animate={{ scale: 1 }}
          onClick={() => setOpen(true)}
          className={cn(
            'fixed right-4 z-50 w-14 h-14 rounded-full bg-brand-500 hover:bg-brand-600 text-white shadow-lg shadow-brand-500/30 flex items-center justify-center cursor-pointer',
            anchorClass
          )}
          aria-label="Open AI support chat"
        >
          <Bot className="w-6 h-6" />
        </motion.button>
      )}
    </>
  );
}
