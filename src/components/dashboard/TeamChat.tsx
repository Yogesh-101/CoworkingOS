import React, { useState, useRef, useEffect, useMemo } from 'react';
import { useStore } from '@/store';
import { motion, AnimatePresence } from 'motion/react';
import {
  MessageSquare,
  Send,
  Hash,
  Megaphone,
  AlertTriangle,
  Sparkles,
  Pin,
  Zap,
  Users,
  Bell,
  Coffee,
  Wifi,
  CreditCard,
  PartyPopper,
  Building2,
  CircleDot,
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { generateGeminiText, isGeminiConfigured } from '@/lib/gemini';
import {
  buildTeamChatSystemPrompt,
  pickTeamChatPersona,
  snapshotFromStore,
  teamChannelHistoryForGemini,
} from '@/lib/ai-context';

type ChannelId =
  | 'ops-downtown-hq'
  | 'billing-urgent'
  | 'general'
  | 'facility-alerts'
  | 'member-shoutouts'
  | 'branch-westside';

const CHANNELS = [
  {
    id: 'ops-downtown-hq' as const,
    label: 'ops-downtown-hq',
    desc: 'Visitor arrivals, tours & daily ops handoffs',
    icon: Building2,
    unread: 0,
    accent: 'brand',
  },
  {
    id: 'billing-urgent' as const,
    label: 'billing-urgent',
    desc: 'Overdue invoices, renewals & payment escalations',
    icon: CreditCard,
    unread: 2,
    accent: 'amber',
  },
  {
    id: 'facility-alerts' as const,
    label: 'facility-alerts',
    desc: 'HVAC, WiFi outages & automated ticket pings',
    icon: Wifi,
    unread: 1,
    accent: 'rose',
  },
  {
    id: 'general' as const,
    label: 'general-discussions',
    desc: 'Announcements, huddles & community culture',
    icon: Megaphone,
    unread: 0,
    accent: 'purple',
  },
  {
    id: 'member-shoutouts' as const,
    label: 'member-shoutouts',
    desc: 'Celebrate wins & member milestones',
    icon: PartyPopper,
    unread: 0,
    accent: 'emerald',
  },
  {
    id: 'branch-westside' as const,
    label: 'westside-oasis',
    desc: 'Austin campus — local staff coordination only',
    icon: Coffee,
    unread: 0,
    accent: 'zinc',
  },
];

const QUICK_TEMPLATES = [
  { label: 'Visitor arriving', text: 'Guest arriving in 10 min — please prep reception and notify host.', icon: Users },
  { label: 'Invoice follow-up', text: 'Following up on overdue invoice — can billing confirm status?', icon: CreditCard },
  { label: 'Room ready', text: 'Private suite is cleaned and access keys are staged at front desk.', icon: Sparkles },
  { label: 'WiFi incident', text: 'Network latency spike reported on Floor 2 — IT investigating.', icon: Wifi, priority: 'urgent' as const },
  { label: 'Team huddle', text: 'Quick 15-min standup in the lounge at :30 — all hosts welcome.', icon: Coffee },
];

const ONLINE_STAFF = [
  { name: 'Monica Hall', role: 'Community Host', status: 'online' },
  { name: 'Jared Dunn', role: 'IT Support', status: 'busy' },
  { name: 'Gavin Belson', role: 'Branch Manager', status: 'online' },
  { name: 'Gilfoyle Stone', role: 'IT Support', status: 'away' },
];

function buildFallbackTeamReplyAuthor(channelId: string, text: string) {
  return pickTeamChatPersona(channelId, text);
}

function buildFallbackTeamReply(channelId: string, text: string): string {
  const lower = text.toLowerCase();
  if (channelId === 'billing-urgent' || lower.includes('invoice')) {
    return 'Finance desk is on it. I will update the AR ledger within the hour.';
  }
  if (lower.includes('wifi') || lower.includes('network') || channelId === 'facility-alerts') {
    return 'Running diagnostics on the gateway now. Will post ETA in this channel.';
  }
  if (lower.includes('visitor') || lower.includes('guest')) {
    return 'Reception is briefed. Hot coffee and name badge are ready.';
  }
  return `Copied — logged for the ${channelId} thread.`;
}

export function TeamChat() {
  const {
    chatMessages,
    addChatMessage,
    role,
    employees,
    branches,
    activeBranchId,
    leads,
    tickets,
    renewals,
    invoices,
    visitors,
  } = useStore();
  const [activeChannel, setActiveChannel] = useState<ChannelId>('ops-downtown-hq');
  const [inputText, setInputText] = useState('');
  const [markUrgent, setMarkUrgent] = useState(false);
  const [showTemplates, setShowTemplates] = useState(true);
  const [aiReplying, setAiReplying] = useState(false);
  const messagesScrollRef = useRef<HTMLDivElement>(null);
  const shouldStickToBottomRef = useRef(true);
  const geminiEnabled = isGeminiConfigured();

  const adminName = useMemo(
    () => (typeof localStorage !== 'undefined' ? localStorage.getItem('co_admin_name') : null) || 'Admin User',
    []
  );

  const filteredMessages = chatMessages.filter((m) => m.channel === activeChannel);
  const pinnedMessage = filteredMessages.find((m) => m.pinned);
  const threadMessages = filteredMessages.filter((m) => !m.pinned);
  const activeChannelMeta = CHANNELS.find((c) => c.id === activeChannel)!;

  useEffect(() => {
    shouldStickToBottomRef.current = true;
  }, [activeChannel]);

  // Scroll only inside the message list — never the page (scrollIntoView jumps the main layout).
  useEffect(() => {
    const el = messagesScrollRef.current;
    if (!el || !shouldStickToBottomRef.current) return;
    el.scrollTop = el.scrollHeight;
  }, [chatMessages, activeChannel]);

  const handleMessagesScroll = () => {
    const el = messagesScrollRef.current;
    if (!el) return;
    const distanceFromBottom = el.scrollHeight - el.scrollTop - el.clientHeight;
    shouldStickToBottomRef.current = distanceFromBottom < 80;
  };

  const sendMessage = async (text: string, urgent = false) => {
    if (!text.trim()) return;
    shouldStickToBottomRef.current = true;
    addChatMessage(activeChannel, text.trim(), adminName, role, {
      priority: urgent ? 'urgent' : 'normal',
    });
    setInputText('');
    setMarkUrgent(false);

    const fallbackAuthor = buildFallbackTeamReplyAuthor(activeChannel, text);
    let replyAuthor = fallbackAuthor.name;
    let replyRole = fallbackAuthor.role;
    let replyMsg = buildFallbackTeamReply(activeChannel, text);

    if (geminiEnabled) {
      setAiReplying(true);
      try {
        const branch = branches.find((b) => b.id === activeBranchId) ?? branches[0];
        const snapshot = snapshotFromStore({
          branch,
          leads,
          tickets,
          renewals,
          invoices,
          visitors,
        });
        const history = teamChannelHistoryForGemini(
          chatMessages.filter((m) => m.channel === activeChannel),
          adminName
        );
        replyMsg = await generateGeminiText({
          systemInstruction: buildTeamChatSystemPrompt(
            activeChannelMeta.label,
            activeChannelMeta.desc,
            fallbackAuthor.name,
            fallbackAuthor.role,
            snapshot
          ),
          userMessage: text.trim(),
          history,
          maxOutputTokens: 180,
        });
      } catch {
        // Keep rule-based fallback
      } finally {
        setAiReplying(false);
      }
    } else {
      await new Promise((r) => setTimeout(r, 900));
    }

    addChatMessage(activeChannel, replyMsg, replyAuthor, replyRole);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    void sendMessage(inputText, markUrgent);
  };

  return (
    <div className="flex flex-col h-full min-h-0 space-y-4">
      <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-3 shrink-0">
        <div>
          <h1 className="text-xl font-black text-white flex items-center gap-2">
            <MessageSquare className="w-5 h-5 text-brand-500" />
            Team Chat
          </h1>
          <p className="text-xs text-zinc-500 font-medium mt-1">
            ERP comms hub — channels, quick actions, and live staff presence
          </p>
        </div>
        <div className="flex items-center gap-2 text-[10px] font-bold uppercase tracking-wider text-zinc-500">
          <span className="flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
            <CircleDot className="w-2 h-2 fill-emerald-400 text-emerald-400" /> Slack sync live
          </span>
          <span className="px-2.5 py-1 rounded-full bg-zinc-900 border border-zinc-805 text-zinc-450">
            {employees.filter((e) => e.status === 'active').length} staff active
          </span>
        </div>
      </div>

      <div className="flex flex-1 min-h-0 max-h-full border border-zinc-805 bg-zinc-900 rounded-3xl overflow-hidden shadow-lg">
        {/* Channels */}
        <div className="w-full max-w-[300px] border-r border-zinc-805 bg-zinc-950/50 p-4 flex flex-col gap-3 shrink-0 hidden md:flex">
          <div className="flex items-center justify-between">
            <span className="text-[9px] font-black text-zinc-550 uppercase tracking-widest">Channels</span>
            <Bell className="w-3.5 h-3.5 text-zinc-600" />
          </div>

          <div className="flex-1 overflow-y-auto space-y-1.5 pr-0.5">
            {CHANNELS.map((chan) => {
              const isActive = chan.id === activeChannel;
              const Icon = chan.icon;
              return (
                <button
                  key={chan.id}
                  type="button"
                  onClick={() => setActiveChannel(chan.id)}
                  className={cn(
                    'w-full p-3 rounded-2xl flex flex-col text-left transition-all border leading-none cursor-pointer',
                    isActive
                      ? 'bg-zinc-850 border-zinc-750 shadow-inner'
                      : 'border-transparent hover:bg-zinc-900/70'
                  )}
                >
                  <div className="flex items-center justify-between w-full gap-2">
                    <span
                      className={cn(
                        'font-extrabold text-xs flex items-center gap-1.5 min-w-0',
                        isActive ? 'text-brand-400' : 'text-zinc-400'
                      )}
                    >
                      <Icon className="w-3.5 h-3.5 shrink-0" />
                      <span className="truncate">#{chan.label}</span>
                    </span>
                    {chan.unread > 0 && !isActive && (
                      <span className="text-[9px] font-black bg-brand-500 text-white px-1.5 py-0.5 rounded-full shrink-0">
                        {chan.unread}
                      </span>
                    )}
                  </div>
                  <p className="text-[10px] text-zinc-550 mt-1.5 font-semibold leading-snug line-clamp-2">
                    {chan.desc}
                  </p>
                </button>
              );
            })}
          </div>

          <div className="border-t border-zinc-850 pt-3 space-y-2">
            <span className="text-[8px] font-extrabold text-zinc-550 uppercase tracking-widest block">
              On duty now
            </span>
            {ONLINE_STAFF.map((s) => (
              <div key={s.name} className="flex items-center gap-2 text-[10px]">
                <span
                  className={cn(
                    'w-1.5 h-1.5 rounded-full shrink-0',
                    s.status === 'online' && 'bg-emerald-400',
                    s.status === 'busy' && 'bg-amber-400',
                    s.status === 'away' && 'bg-zinc-600'
                  )}
                />
                <span className="font-bold text-zinc-300 truncate">{s.name}</span>
                <span className="text-zinc-600 truncate ml-auto">{s.status}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Main thread */}
        <div className="flex-1 flex flex-col min-w-0">
          <div className="p-4 border-b border-zinc-805 bg-zinc-900/80 flex items-center justify-between gap-3">
            <div className="min-w-0">
              <span className="text-sm font-bold text-white flex items-center gap-1.5">
                <Hash className="w-4 h-4 text-zinc-600 shrink-0" />
                {activeChannelMeta.label}
              </span>
              <p className="text-[10px] text-zinc-500 font-medium mt-0.5 truncate">
                {activeChannelMeta.desc}
              </p>
            </div>
            <button
              type="button"
              onClick={() => setShowTemplates((v) => !v)}
              className="text-[10px] font-bold text-brand-400 hover:text-brand-300 flex items-center gap-1 shrink-0 cursor-pointer"
            >
              <Zap className="w-3.5 h-3.5" />
              {showTemplates ? 'Hide' : 'Show'} quick actions
            </button>
          </div>

          {/* Mobile channel picker */}
          <div className="md:hidden flex gap-1.5 p-2 overflow-x-auto border-b border-zinc-850 scrollbar-none">
            {CHANNELS.map((chan) => (
              <button
                key={chan.id}
                type="button"
                onClick={() => setActiveChannel(chan.id)}
                className={cn(
                  'px-2.5 py-1 rounded-lg text-[10px] font-bold whitespace-nowrap shrink-0 cursor-pointer',
                  activeChannel === chan.id
                    ? 'bg-brand-500/15 text-brand-400 border border-brand-500/25'
                    : 'bg-zinc-950 text-zinc-500 border border-zinc-850'
                )}
              >
                #{chan.label.split('-')[0]}
              </button>
            ))}
          </div>

          <AnimatePresence>
            {showTemplates && (
              <motion.div
                initial={{ height: 0, opacity: 0 }}
                animate={{ height: 'auto', opacity: 1 }}
                exit={{ height: 0, opacity: 0 }}
                className="overflow-hidden border-b border-zinc-850/80"
              >
                <div className="p-3 flex flex-wrap gap-2 bg-zinc-950/40">
                  {QUICK_TEMPLATES.map((tpl) => {
                    const TplIcon = tpl.icon;
                    return (
                      <button
                        key={tpl.label}
                        type="button"
                        onClick={() => void sendMessage(tpl.text, tpl.priority === 'urgent')}
                        className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-zinc-900 border border-zinc-805 hover:border-brand-500/30 hover:text-brand-300 text-[10px] font-bold text-zinc-400 transition-all cursor-pointer"
                      >
                        <TplIcon className="w-3 h-3 shrink-0" />
                        {tpl.label}
                      </button>
                    );
                  })}
                </div>
              </motion.div>
            )}
          </AnimatePresence>

          {pinnedMessage && (
            <div className="mx-4 mt-3 p-3 rounded-2xl bg-brand-500/5 border border-brand-500/20 flex gap-2">
              <Pin className="w-4 h-4 text-brand-500 shrink-0 mt-0.5" />
              <div className="min-w-0">
                <span className="text-[9px] font-black text-brand-400 uppercase tracking-wider">
                  Pinned
                </span>
                <p className="text-xs text-zinc-200 font-semibold mt-0.5 leading-relaxed">
                  {pinnedMessage.text}
                </p>
                <span className="text-[9px] text-zinc-550 mt-1 block">
                  {pinnedMessage.senderName} · {pinnedMessage.time}
                </span>
              </div>
            </div>
          )}

          <div
            ref={messagesScrollRef}
            onScroll={handleMessagesScroll}
            className="flex-1 overflow-y-auto overflow-x-hidden p-4 space-y-3 min-h-0"
          >
            {threadMessages.length === 0 && !pinnedMessage && (
              <div className="flex flex-col items-center justify-center h-full text-center py-12 text-zinc-600">
                <MessageSquare className="w-10 h-10 mb-3 opacity-40" />
                <p className="text-sm font-bold">No messages yet</p>
                <p className="text-xs mt-1 max-w-xs">Use quick actions above or type below to start the thread.</p>
              </div>
            )}
            {threadMessages.map((msg) => {
              const isMe = msg.senderName === adminName;
              const isUrgent = msg.priority === 'urgent';
              return (
                <div
                  key={msg.id}
                  className={cn('flex flex-col max-w-[88%]', isMe ? 'ml-auto items-end' : 'mr-auto items-start')}
                >
                  <span className="text-[9px] text-zinc-550 font-bold mb-1 flex items-center gap-1.5">
                    {isUrgent && (
                      <AlertTriangle className="w-3 h-3 text-amber-500" aria-label="Urgent" />
                    )}
                    {msg.senderName} ({msg.senderRole}) · {msg.time}
                  </span>
                  <div
                    className={cn(
                      'rounded-2xl p-3.5 text-xs font-semibold leading-relaxed border shadow-sm',
                      isMe
                        ? 'bg-brand-500 text-white border-brand-400/20 rounded-tr-sm'
                        : 'bg-zinc-950 text-zinc-200 border-zinc-805/60 rounded-tl-sm',
                      isUrgent && !isMe && 'border-amber-500/30 bg-amber-500/5'
                    )}
                  >
                    {msg.text}
                  </div>
                </div>
              );
            })}
            {aiReplying && (
              <div className="mr-auto max-w-[88%] rounded-2xl p-3.5 text-xs font-semibold text-zinc-500 bg-zinc-950 border border-zinc-805/60">
                Gemini is drafting a team reply…
              </div>
            )}
          </div>

          <form
            onSubmit={handleSubmit}
            className="p-4 border-t border-zinc-850/80 bg-zinc-950/40 space-y-2 shrink-0"
          >
            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={() => setMarkUrgent((v) => !v)}
                disabled={aiReplying}
                className={cn(
                  'px-2.5 py-1 rounded-lg text-[9px] font-black uppercase border transition-all cursor-pointer shrink-0',
                  markUrgent
                    ? 'bg-amber-500/15 text-amber-400 border-amber-500/30'
                    : 'bg-zinc-900 text-zinc-550 border-zinc-805 hover:text-zinc-300',
                  aiReplying && 'opacity-50 cursor-not-allowed'
                )}
              >
                Urgent
              </button>
              <input
                type="text"
                placeholder={`Message #${activeChannelMeta.label}…`}
                value={inputText}
                onChange={(e) => setInputText(e.target.value)}
                disabled={aiReplying}
                className="flex-1 bg-zinc-950 border border-zinc-805 rounded-full py-2.5 px-5 text-xs text-zinc-200 placeholder:text-zinc-600 focus:outline-none focus:ring-1 focus:ring-brand-500/30 font-semibold min-w-0 disabled:opacity-60"
              />
              <button
                type="submit"
                disabled={aiReplying || !inputText.trim()}
                className="w-10 h-10 rounded-full bg-brand-500 hover:bg-brand-600 text-white flex items-center justify-center cursor-pointer shadow-md active:scale-95 transition-all shrink-0 disabled:opacity-50"
              >
                <Send className="w-4 h-4" />
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}
