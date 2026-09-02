'use client';

import React, { useState, useEffect } from 'react';
import {
  MessageSquare,
  Send,
  HelpCircle,
  Phone,
  Mail,
  CheckCircle2,
  Clock,
  User,
  ShieldCheck,
  Search,
  ChevronRight,
  ArrowLeft,
} from 'lucide-react';

export default function CustomerSupportPage() {
  const [phoneQuery, setPhoneQuery] = useState('');
  const [myTickets, setMyTickets] = useState<any[]>([]);
  const [activeTicket, setActiveTicket] = useState<any>(null);
  const [messages, setMessages] = useState<any[]>([]);
  const [replyText, setReplyText] = useState('');
  const [sending, setSending] = useState(false);

  // New ticket form
  const [showNewTicketModal, setShowNewTicketModal] = useState(false);
  const [name, setName] = useState('');
  const [phone, setPhone] = useState('');
  const [email, setEmail] = useState('');
  const [orderNumber, setOrderNumber] = useState('');
  const [subject, setSubject] = useState('');
  const [initialMessage, setInitialMessage] = useState('');
  const [creatingTicket, setCreatingTicket] = useState(false);

  // Load ticket conversation
  const loadTicketConversation = async (ticketId: string) => {
    try {
      const res = await fetch(`/api/support/messages?ticketId=${ticketId}`);
      const data = await res.json();
      if (data.success) {
        setActiveTicket(data.data.ticket);
        setMessages(data.data.messages);
      }
    } catch (e) {
      console.error(e);
    }
  };

  const handleSearchTickets = async () => {
    if (!phoneQuery.trim()) return;
    try {
      const res = await fetch(`/api/support/tickets?phone=${encodeURIComponent(phoneQuery.trim())}`);
      const data = await res.json();
      if (data.success) {
        setMyTickets(data.data);
        if (data.data.length > 0) {
          loadTicketConversation(data.data[0].id);
        }
      }
    } catch (e) {
      console.error(e);
    }
  };

  const handleSendReply = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!replyText.trim() || !activeTicket) return;

    setSending(true);
    try {
      const res = await fetch('/api/support/messages', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ticketId: activeTicket.id,
          sender: 'CUSTOMER',
          senderName: activeTicket.customerName,
          message: replyText.trim(),
        }),
      });
      const data = await res.json();
      if (data.success) {
        setReplyText('');
        loadTicketConversation(activeTicket.id);
      }
    } catch (e) {
      console.error(e);
    } finally {
      setSending(false);
    }
  };

  const handleCreateTicket = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name || !phone || !subject || !initialMessage) return;

    setCreatingTicket(true);
    try {
      const res = await fetch('/api/support/tickets', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          customerName: name,
          customerPhone: phone,
          customerEmail: email,
          orderNumber,
          subject,
          message: initialMessage,
        }),
      });
      const data = await res.json();
      if (data.success) {
        setShowNewTicketModal(false);
        setPhoneQuery(phone);
        loadTicketConversation(data.data.id);
        setMyTickets((prev) => [
          {
            id: data.data.id,
            ticketNumber: data.data.ticketNumber,
            subject,
            status: 'OPEN',
            customerName: name,
            customerPhone: phone,
          },
          ...prev,
        ]);
      }
    } catch (e) {
      console.error(e);
    } finally {
      setCreatingTicket(false);
    }
  };

  return (
    <div className="min-h-screen py-12 px-4 sm:px-6 lg:px-8 max-w-6xl mx-auto space-y-10">
      {/* Top Banner */}
      <div className="text-center max-w-2xl mx-auto space-y-2">
        <span className="text-xs font-bold text-cyan-400 uppercase tracking-widest">
          Help & Customer Care
        </span>
        <h1 className="text-3xl sm:text-4xl font-extrabold text-white">
          TrustMyGadget Support Center
        </h1>
        <p className="text-xs sm:text-sm text-slate-300">
          Chat with our trade-in specialists, track your support tickets, or resolve pickup and payment inquiries.
        </p>
      </div>

      {/* 3 Action Help Tiles */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
        <div className="p-6 rounded-3xl bg-slate-900/80 border border-slate-800 glass-panel flex flex-col justify-between">
          <div className="space-y-2">
            <div className="w-10 h-10 rounded-xl bg-cyan-950 text-cyan-400 flex items-center justify-center border border-cyan-500/30">
              <MessageSquare className="w-5 h-5" />
            </div>
            <h3 className="font-bold text-white text-sm">Raise a Support Ticket</h3>
            <p className="text-xs text-slate-400 leading-relaxed">
              Facing an issue with your pickup slot, device valuation or payment? Open a direct ticket.
            </p>
          </div>
          <button
            onClick={() => setShowNewTicketModal(true)}
            className="mt-4 px-4 py-2.5 rounded-xl bg-gradient-to-r from-cyan-400 to-emerald-400 text-slate-950 font-bold text-xs shadow-md shadow-cyan-500/20"
          >
            Start New Ticket
          </button>
        </div>

        <div className="p-6 rounded-3xl bg-slate-900/80 border border-slate-800 glass-panel flex flex-col justify-between">
          <div className="space-y-2">
            <div className="w-10 h-10 rounded-xl bg-emerald-950 text-emerald-400 flex items-center justify-center border border-emerald-500/30">
              <Phone className="w-5 h-5" />
            </div>
            <h3 className="font-bold text-white text-sm">Toll-Free Helpline</h3>
            <p className="text-xs text-slate-400 leading-relaxed">
              Available 7 Days a week (9:00 AM – 8:00 PM IST) across 19,000+ Indian pincodes.
            </p>
          </div>
          <div className="mt-4 font-mono font-bold text-sm text-emerald-400">
            1800 209 8899
          </div>
        </div>

        <div className="p-6 rounded-3xl bg-slate-900/80 border border-slate-800 glass-panel flex flex-col justify-between">
          <div className="space-y-2">
            <div className="w-10 h-10 rounded-xl bg-purple-950 text-purple-400 flex items-center justify-center border border-purple-500/30">
              <HelpCircle className="w-5 h-5" />
            </div>
            <h3 className="font-bold text-white text-sm">Knowledge Base & FAQs</h3>
            <p className="text-xs text-slate-400 leading-relaxed">
              Learn about DoD certified data erasure, valuation algorithms, and doorstep inspection.
            </p>
          </div>
          <a
            href="/faqs"
            className="mt-4 text-xs font-bold text-purple-400 hover:text-purple-300 flex items-center gap-1"
          >
            <span>Explore FAQs</span>
            <ChevronRight className="w-3.5 h-3.5" />
          </a>
        </div>
      </div>

      {/* Ticket Lookup & Live Chat Arena */}
      <div className="p-6 sm:p-8 rounded-3xl bg-slate-900/80 border border-slate-800 glass-panel space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-slate-800">
          <div>
            <h3 className="text-base font-bold text-white">Lookup Your Active Tickets & Live Chat</h3>
            <p className="text-xs text-slate-400">Enter your 10-digit registered mobile number to resume conversation.</p>
          </div>

          <div className="flex items-center gap-2 max-w-sm w-full sm:w-auto">
            <input
              type="tel"
              placeholder="Your 10-digit mobile number..."
              value={phoneQuery}
              onChange={(e) => setPhoneQuery(e.target.value)}
              className="px-3.5 py-2 rounded-xl bg-slate-950 border border-slate-700 text-white text-xs flex-1 focus:outline-none focus:border-cyan-500"
            />
            <button
              onClick={handleSearchTickets}
              className="px-4 py-2 rounded-xl bg-cyan-400 text-slate-950 font-bold text-xs"
            >
              Search
            </button>
          </div>
        </div>

        {/* Live Conversation Window */}
        {activeTicket ? (
          <div className="space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-slate-800/80 text-xs">
              <div>
                <span className="font-mono text-cyan-400 font-bold">{activeTicket.ticketNumber}</span>
                <span className="text-slate-400 ml-2 font-semibold">Subject: {activeTicket.subject}</span>
              </div>
              <span className="px-2.5 py-0.5 rounded text-[10px] font-bold bg-cyan-950 text-cyan-300 border border-cyan-500/30">
                {activeTicket.status}
              </span>
            </div>

            {/* Chat message bubbles */}
            <div className="h-80 overflow-y-auto p-4 rounded-2xl bg-slate-950 border border-slate-800/80 space-y-3">
              {messages.map((m) => {
                const isCustomer = m.sender === 'CUSTOMER';
                return (
                  <div
                    key={m.id}
                    className={`flex flex-col ${isCustomer ? 'items-end' : 'items-start'}`}
                  >
                    <span className="text-[10px] text-slate-500 mb-0.5 px-1 font-semibold">
                      {m.senderName} ({new Date(m.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })})
                    </span>
                    <div
                      className={`max-w-md p-3 rounded-2xl text-xs leading-relaxed ${
                        isCustomer
                          ? 'bg-cyan-950 text-cyan-100 border border-cyan-500/30 rounded-br-none'
                          : 'bg-slate-900 text-slate-200 border border-slate-700 rounded-bl-none'
                      }`}
                    >
                      {m.message}
                    </div>
                  </div>
                );
              })}
            </div>

            {/* Reply Input Bar */}
            <form onSubmit={handleSendReply} className="flex items-center gap-2">
              <input
                type="text"
                placeholder="Type your message to support..."
                value={replyText}
                onChange={(e) => setReplyText(e.target.value)}
                className="flex-1 px-4 py-3 rounded-xl bg-slate-950 border border-slate-700 text-white text-xs focus:outline-none focus:border-cyan-500"
              />
              <button
                type="submit"
                disabled={sending || !replyText.trim()}
                className="px-6 py-3 rounded-xl bg-gradient-to-r from-cyan-400 to-emerald-400 text-slate-950 font-bold text-xs shadow-md disabled:opacity-50 flex items-center gap-1.5"
              >
                <Send className="w-3.5 h-3.5" />
                <span>Send</span>
              </button>
            </form>
          </div>
        ) : (
          <div className="py-12 text-center text-slate-500 text-xs">
            Enter your mobile number above to view existing chats, or click "Start New Ticket" above.
          </div>
        )}
      </div>

      {/* New Ticket Modal */}
      {showNewTicketModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm">
          <form
            onSubmit={handleCreateTicket}
            className="w-full max-w-lg bg-slate-900 border border-slate-700 rounded-3xl p-6 sm:p-8 glass-panel space-y-4 shadow-2xl"
          >
            <div className="flex items-center justify-between pb-3 border-b border-slate-800">
              <h3 className="text-base font-bold text-white">Create Support Ticket</h3>
              <button
                type="button"
                onClick={() => setShowNewTicketModal(false)}
                className="text-slate-400 hover:text-white text-xs"
              >
                ✕ Close
              </button>
            </div>

            <div className="space-y-3 text-xs">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-slate-300 font-semibold mb-1">Your Name *</label>
                  <input
                    type="text"
                    required
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl bg-slate-950 border border-slate-700 text-white"
                  />
                </div>
                <div>
                  <label className="block text-slate-300 font-semibold mb-1">Mobile Number *</label>
                  <input
                    type="tel"
                    required
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl bg-slate-950 border border-slate-700 text-white"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-slate-300 font-semibold mb-1">Email Address</label>
                  <input
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl bg-slate-950 border border-slate-700 text-white"
                  />
                </div>
                <div>
                  <label className="block text-slate-300 font-semibold mb-1">Order ID (If applicable)</label>
                  <input
                    type="text"
                    placeholder="e.g. TMG-191403"
                    value={orderNumber}
                    onChange={(e) => setOrderNumber(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl bg-slate-950 border border-slate-700 text-white font-mono"
                  />
                </div>
              </div>

              <div>
                <label className="block text-slate-300 font-semibold mb-1">Subject / Issue Summary *</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Reschedule pickup slot or Valuation question"
                  value={subject}
                  onChange={(e) => setSubject(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl bg-slate-950 border border-slate-700 text-white"
                />
              </div>

              <div>
                <label className="block text-slate-300 font-semibold mb-1">Detailed Message *</label>
                <textarea
                  required
                  rows={3}
                  value={initialMessage}
                  onChange={(e) => setInitialMessage(e.target.value)}
                  placeholder="Describe your question or issue in detail..."
                  className="w-full px-3 py-2 rounded-xl bg-slate-950 border border-slate-700 text-white placeholder:text-slate-500"
                />
              </div>
            </div>

            <div className="pt-3 flex justify-end gap-3 border-t border-slate-800">
              <button
                type="button"
                onClick={() => setShowNewTicketModal(false)}
                className="px-4 py-2 rounded-xl bg-slate-800 text-slate-300 text-xs font-semibold"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={creatingTicket}
                className="px-6 py-2 rounded-xl bg-cyan-400 text-slate-950 text-xs font-bold shadow-md disabled:opacity-50"
              >
                {creatingTicket ? 'Submitting...' : 'Open Ticket'}
              </button>
            </div>
          </form>
        </div>
      )}
    </div>
  );
}
