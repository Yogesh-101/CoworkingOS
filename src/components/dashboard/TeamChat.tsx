import React, { useState, useRef, useEffect } from 'react';
import { useStore } from '@/store';
import { motion, AnimatePresence } from 'motion/react';
import { MessageSquare, Send, Users, AlertCircle, Sparkles, Hash, CircleDot } from 'lucide-react';
import { cn } from '@/lib/utils';

export function TeamChat() {
  const { chatMessages, addChatMessage, role } = useStore();
  const [activeChannel, setActiveChannel] = useState('ops-downtown-hq');
  const [inputText, setInputText] = useState('');
  
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const channels = [
    { id: 'ops-downtown-hq', label: 'ops-downtown-hq', desc: 'Main operations coord & visitor arrivals alerts', unread: 0 },
    { id: 'billing-urgent', label: 'billing-urgent', desc: 'Overdue leases audits & payment reminders log', unread: 2 },
    { id: 'general', label: 'general-discussions', desc: 'Community announcements & weekly team huddles', unread: 0 },
  ];

  const filteredMessages = chatMessages.filter(m => m.channel === activeChannel);

  // Auto scroll to bottom
  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [chatMessages, activeChannel]);

  const handleSendMessage = (e: React.FormEvent) => {
    e.preventDefault();
    if (!inputText.trim()) return;

    // Add user message
    addChatMessage(activeChannel, inputText, 'Admin User', role);
    const sentText = inputText;
    setInputText('');

    // Trigger highly realistic delayed coworker reply
    setTimeout(() => {
      let replyAuthor = 'Monica Hall';
      let replyRole = 'Community Host';
      let replyMsg = `Got it. Let's record this and solve it on our daily sync!`;

      const lowerText = sentText.toLowerCase();

      if (activeChannel === 'billing-urgent') {
        replyAuthor = 'Gavin Belson';
        replyRole = 'Branch Manager';
        replyMsg = `I am reviewing the pending invoices ledger now. Perry promised to resolve daily planet payment by noon.`;
      } else if (lowerText.includes('wifi') || lowerText.includes('internet') || lowerText.includes('network')) {
        replyAuthor = 'Jared Dunn';
        replyRole = 'IT Support';
        replyMsg = `On it! I will run packet diagnostic checks on the primary fiber gateway immediately.`;
      } else if (lowerText.includes('visitor') || lowerText.includes('guest') || lowerText.includes('tour')) {
        replyAuthor = 'Monica Hall';
        replyRole = 'Community Host';
        replyMsg = `Awesome, I'll welcome them at the reception desk myself. Making sure hot coffee is fresh.`;
      } else {
        replyAuthor = 'Monica Hall';
        replyRole = 'Community Host';
        replyMsg = `Roger that. Communicated to Gavin and Jared as well to keep focus.`;
      }

      addChatMessage(activeChannel, replyMsg, replyAuthor, replyRole);
    }, 1200);
  };

  return (
    <div className="flex h-full border border-zinc-805 bg-zinc-900 rounded-3xl overflow-hidden shadow-lg">
      
      {/* Channels Sidebar List left (1/4 width) */}
      <div className="w-1/3 max-w-[280px] border-r border-zinc-805 bg-zinc-950/40 p-5 flex flex-col space-y-4 shrink-0">
        <div className="flex items-center gap-2 border-b border-zinc-805/55 pb-3.5">
          <MessageSquare className="w-4 h-4 text-brand-500" />
          <h3 className="font-extrabold text-white text-sm">ERP Team Comms</h3>
        </div>

        <div className="flex-1 flex flex-col gap-2.5 overflow-y-auto">
          {channels.map((chan) => {
            const isActive = chan.id === activeChannel;
            return (
              <button
                key={chan.id}
                onClick={() => setActiveChannel(chan.id)}
                className={cn(
                  "p-3 rounded-2xl flex flex-col text-left transition-all relative border border-transparent leading-none cursor-pointer",
                  isActive 
                    ? "bg-zinc-850 hover:bg-zinc-800 border-zinc-800 shadow-inner" 
                    : "hover:bg-zinc-900/60"
                )}
              >
                <div className="flex items-center justify-between w-full">
                  <span className={cn(
                    "font-extrabold text-xs flex items-center gap-1.5",
                    isActive ? "text-brand-400" : "text-zinc-400 group-hover:text-zinc-200"
                  )}>
                    <Hash className={cn("w-3.5 h-3.5", isActive ? "text-brand-500" : "text-zinc-650")} /> 
                    {chan.label}
                  </span>

                  {chan.unread > 0 && !isActive && (
                    <span className="w-2 h-2 rounded-full bg-brand-505 shrink-0" />
                  )}
                </div>
                <p className="text-[10px] text-zinc-550 mt-1.5 font-semibold leading-normal">{chan.desc}</p>
              </button>
            );
          })}
        </div>

        <div className="bg-zinc-950 px-3.5 py-3 rounded-2xl border border-zinc-850 leading-none">
          <span className="text-[8px] font-extrabold text-zinc-550 uppercase">CHATTING COORD AS</span>
          <p className="text-xs text-brand-350 font-extrabold truncate mt-1 capitalize leading-none font-sans flex items-center gap-1.5">
            <span className="w-1.5 h-1.5 rounded-full bg-brand-400" /> {role}
          </p>
        </div>
      </div>

      {/* Main Chat Stream right (3/4 width) */}
      <div className="flex-1 flex flex-col justify-between bg-zinc-900/40 min-w-0">
        
        {/* Channel Active Header */}
        <div className="p-4.5 border-b border-zinc-805 bg-zinc-900/70 flex items-center justify-between">
          <div>
            <span className="text-xs font-bold text-white flex items-center gap-1.5 leading-none">
              <Hash className="w-4 h-4 text-zinc-650" /> {activeChannel}
            </span>
            <p className="text-[10px] text-zinc-500 font-semibold mt-1">
              Active coordinate group link for on-site managers
            </p>
          </div>

          <span className="text-[10px] font-mono text-zinc-500 bg-zinc-950 px-2.5 py-1 border border-zinc-850 rounded-full font-bold">
            Live Link
          </span>
        </div>

        {/* Message logs */}
        <div className="flex-1 overflow-y-auto p-5 space-y-4">
          {filteredMessages.map((msg) => {
            const isMe = msg.senderName === 'Admin User';
            return (
              <div 
                key={msg.id}
                className={cn(
                  "flex flex-col max-w-[85%]",
                  isMe ? "ml-auto items-end" : "mr-auto items-start"
                )}
              >
                {/* Meta details */}
                <span className="text-[9px] text-zinc-550 font-bold tracking-tight mb-1 font-sans">
                  {msg.senderName} ({msg.senderRole}) • <span className="font-mono">{msg.time}</span>
                </span>

                {/* Message bubble */}
                <div className={cn(
                  "rounded-2xl p-3.5 text-xs font-semibold leading-relaxed border shadow-sm",
                  isMe 
                    ? "bg-brand-500 text-white border-brand-400/20 rounded-tr-none" 
                    : "bg-zinc-950 text-zinc-200 border-zinc-805/60 rounded-tl-none"
                )}>
                  {msg.text}
                </div>
              </div>
            );
          })}
          <div ref={messagesEndRef} />
        </div>

        {/* Input panel Form */}
        <form onSubmit={handleSendMessage} className="p-4 border-t border-zinc-850/80 bg-zinc-950/30 flex gap-3 items-center shrink-0">
          <input 
            type="text"
            placeholder={`Message #${activeChannel}...`}
            value={inputText}
            onChange={(e) => setInputText(e.target.value)}
            className="flex-1 bg-zinc-950 border border-zinc-805 rounded-full py-2.5 px-5 text-xs text-zinc-200 placeholder:text-zinc-600 focus:outline-none focus:ring-1 focus:ring-brand-500/30 font-semibold"
          />

          <button
            type="submit"
            className="w-10 h-10 rounded-full bg-brand-500 hover:bg-brand-600 text-white flex items-center justify-center cursor-pointer shadow-md shadow-brand-500/10 active:scale-95 transition-all shrink-0"
          >
            <Send className="w-4 h-4" />
          </button>
        </form>

      </div>

    </div>
  );
}
