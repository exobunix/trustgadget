'use client';

import React, { useState, useEffect } from 'react';
import {
  MessageSquare,
  Send,
  User,
  Phone,
  Mail,
  CheckCircle2,
  Clock,
  RefreshCw,
  Search,
  Filter,
  ShieldCheck,
} from 'lucide-react';

export default function AdminSupportConsolePage() {
  const [tickets, setTickets] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeTicket, setActiveTicket] = useState<any>(null);
  const [messages, setMessages] = useState<any[]>([]);
  const [replyText, setReplyText] = useState('');
  const [sending, setSending] = useState(false);
  const [statusFilter, setStatusFilter] = useState('ALL');
  const [search, setSearch] = useState('');

  const fetchTickets = async () => {
    setLoading(true);
    try {
      const res = await fetch('/api/support/tickets');
      const data = await res.json();
      if (data.success) {
        setTickets(data.data);
        if (data.data.length > 0 && !activeTicket) {
          loadTicketMessages(data.data[0].id);
        }
      }
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  const loadTicketMessages = async (ticketId: string) => {
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

  useEffect(() => {
    fetchTickets();
  }, []);

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
          sender: 'AGENT',
          senderName: 'Senior Support Executive',
          message: replyText.trim(),
        }),
      });
      const data = await res.json();
      if (data.success) {
        setReplyText('');
        loadTicketMessages(activeTicket.id);
        fetchTickets();
      }
    } catch (e) {
      console.error(e);
    } finally {
      setSending(false);
    }
  };

  const handleUpdateStatus = async (status: string) => {
    if (!activeTicket) return;
    try {
      await fetch('/api/support/tickets', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id: activeTicket.id, status }),
      });
      setActiveTicket((prev: any) => ({ ...prev, status }));
      fetchTickets();
    } catch (e) {
      console.error(e);
    }
  };

  const filteredTickets = tickets.filter((t) => {
    const matchStatus = statusFilter === 'ALL' || t.status === statusFilter;
    const matchSearch =
      t.ticketNumber.toLowerCase().includes(search.toLowerCase()) ||
      t.customerName.toLowerCase().includes(search.toLowerCase()) ||
      t.customerPhone.includes(search) ||
      t.subject.toLowerCase().includes(search.toLowerCase());
    return matchStatus && matchSearch;
  });

  return (
    <div className="space-y-6 max-w-7xl mx-auto font-sans">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <span className="text-xs font-bold text-cyan-400 uppercase tracking-widest">
            Customer Relations
          </span>
          <h1 className="text-2xl sm:text-3xl font-black text-white mt-1">
            Support Tickets & Real-Time Chat
          </h1>
          <p className="text-xs text-slate-400 mt-1">
            Communicate directly with device sellers, handle order inquiries, and track resolution timelines.
          </p>
        </div>

        <button
          onClick={fetchTickets}
          className="p-2.5 rounded-xl bg-slate-900 hover:bg-slate-800 text-slate-300 border border-slate-800 flex items-center gap-2 text-xs self-start"
        >
          <RefreshCw className={`w-3.5 h-3.5 ${loading ? 'animate-spin text-cyan-400' : ''}`} />
          <span>Refresh Tickets</span>
        </button>
      </div>

      {/* 2-Column Chat Studio */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        {/* Left: Tickets List (5 cols) */}
        <div className="lg:col-span-5 bg-slate-900/80 border border-slate-800 rounded-3xl p-4 glass-panel space-y-4">
          {/* Filters & Search */}
          <div className="space-y-2">
            <div className="flex items-center gap-1">
              {['ALL', 'OPEN', 'IN_PROGRESS', 'RESOLVED'].map((st) => (
                <button
                  key={st}
                  onClick={() => setStatusFilter(st)}
                  className={`px-2.5 py-1 rounded-lg text-[11px] font-bold transition-all ${
                    statusFilter === st
                      ? 'bg-cyan-400 text-slate-950'
                      : 'bg-slate-950 text-slate-400 hover:text-white'
                  }`}
                >
                  {st}
                </button>
              ))}
            </div>

            <div className="relative">
              <Search className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                placeholder="Search ticket, customer, phone..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="w-full pl-8 pr-3 py-1.5 rounded-xl bg-slate-950 border border-slate-800 text-white text-xs placeholder:text-slate-500 focus:outline-none focus:border-cyan-500"
              />
            </div>
          </div>

          {/* Ticket items */}
          <div className="space-y-2 max-h-[600px] overflow-y-auto pr-1">
            {filteredTickets.length === 0 ? (
              <div className="py-12 text-center text-slate-500 text-xs">No tickets matching criteria.</div>
            ) : (
              filteredTickets.map((t) => {
                const isSelected = activeTicket?.id === t.id;
                return (
                  <button
                    key={t.id}
                    onClick={() => loadTicketMessages(t.id)}
                    className={`w-full p-3.5 rounded-2xl border text-left transition-all space-y-1.5 ${
                      isSelected
                        ? 'border-cyan-500 bg-cyan-950/40 ring-1 ring-cyan-500/40 shadow-sm'
                        : 'border-slate-800 bg-slate-950/60 hover:bg-slate-900'
                    }`}
                  >
                    <div className="flex items-center justify-between">
                      <span className="font-mono text-xs font-bold text-cyan-300">{t.ticketNumber}</span>
                      <span
                        className={`text-[9px] font-bold px-1.5 py-0.5 rounded ${
                          t.status === 'RESOLVED'
                            ? 'bg-emerald-950 text-emerald-400 border border-emerald-500/30'
                            : t.status === 'IN_PROGRESS'
                            ? 'bg-amber-950 text-amber-400 border border-amber-500/30'
                            : 'bg-cyan-950 text-cyan-400 border border-cyan-500/30'
                        }`}
                      >
                        {t.status}
                      </span>
                    </div>
                    <div className="text-xs font-bold text-white truncate">{t.subject}</div>
                    <div className="text-[11px] text-slate-400 flex items-center justify-between">
                      <span>{t.customerName}</span>
                      <span className="font-mono">+91 {t.customerPhone}</span>
                    </div>
                    {t.latestMessage && (
                      <p className="text-[10px] text-slate-500 truncate pt-1 border-t border-slate-900">
                        {t.latestMessage.sender === 'CUSTOMER' ? 'Customer: ' : 'Agent: '}
                        {t.latestMessage.message}
                      </p>
                    )}
                  </button>
                );
              })
            )}
          </div>
        </div>

        {/* Right: Active Ticket Conversation Console (7 cols) */}
        {activeTicket ? (
          <div className="lg:col-span-7 bg-slate-900/80 border border-slate-800 rounded-3xl p-6 glass-panel space-y-4">
            {/* Conversation Header */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-slate-800">
              <div>
                <div className="flex items-center gap-2">
                  <span className="font-mono text-xs font-bold text-cyan-300">{activeTicket.ticketNumber}</span>
                  {activeTicket.orderNumber && (
                    <span className="text-[10px] bg-slate-800 px-2 py-0.5 rounded text-slate-300 font-mono">
                      Order: {activeTicket.orderNumber}
                    </span>
                  )}
                </div>
                <h3 className="text-base font-bold text-white mt-0.5">{activeTicket.subject}</h3>
                <p className="text-xs text-slate-400">
                  {activeTicket.customerName} (+91 {activeTicket.customerPhone})
                </p>
              </div>

              {/* Status Switcher Buttons */}
              <div className="flex items-center gap-1.5 self-start sm:self-auto">
                <button
                  onClick={() => handleUpdateStatus('OPEN')}
                  className={`px-2.5 py-1 rounded-lg text-xs font-bold transition-all ${
                    activeTicket.status === 'OPEN' ? 'bg-cyan-400 text-slate-950' : 'bg-slate-800 text-slate-400'
                  }`}
                >
                  Open
                </button>
                <button
                  onClick={() => handleUpdateStatus('IN_PROGRESS')}
                  className={`px-2.5 py-1 rounded-lg text-xs font-bold transition-all ${
                    activeTicket.status === 'IN_PROGRESS' ? 'bg-amber-400 text-slate-950' : 'bg-slate-800 text-slate-400'
                  }`}
                >
                  In Progress
                </button>
                <button
                  onClick={() => handleUpdateStatus('RESOLVED')}
                  className={`px-2.5 py-1 rounded-lg text-xs font-bold transition-all ${
                    activeTicket.status === 'RESOLVED' ? 'bg-emerald-400 text-slate-950' : 'bg-slate-800 text-slate-400'
                  }`}
                >
                  Resolved
                </button>
              </div>
            </div>

            {/* Messages Thread */}
            <div className="h-96 overflow-y-auto p-4 rounded-2xl bg-slate-950 border border-slate-800/80 space-y-3">
              {messages.map((m) => {
                const isAgent = m.sender === 'AGENT';
                return (
                  <div
                    key={m.id}
                    className={`flex flex-col ${isAgent ? 'items-end' : 'items-start'}`}
                  >
                    <span className="text-[10px] text-slate-500 mb-0.5 px-1 font-semibold">
                      {m.senderName} ({new Date(m.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })})
                    </span>
                    <div
                      className={`max-w-md p-3 rounded-2xl text-xs leading-relaxed ${
                        isAgent
                          ? 'bg-purple-950 text-purple-100 border border-purple-500/30 rounded-br-none'
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
                placeholder="Type response to customer..."
                value={replyText}
                onChange={(e) => setReplyText(e.target.value)}
                className="flex-1 px-4 py-3 rounded-xl bg-slate-950 border border-slate-700 text-white text-xs focus:outline-none focus:border-cyan-500"
              />
              <button
                type="submit"
                disabled={sending || !replyText.trim()}
                className="px-6 py-3 rounded-xl bg-gradient-to-r from-purple-500 to-cyan-400 text-slate-950 font-bold text-xs shadow-md disabled:opacity-50 flex items-center gap-1.5"
              >
                <Send className="w-3.5 h-3.5" />
                <span>Reply</span>
              </button>
            </form>
          </div>
        ) : (
          <div className="lg:col-span-7 p-16 text-center text-slate-500 text-xs">
            Select a ticket from the left list to view conversation.
          </div>
        )}
      </div>
    </div>
  );
}
