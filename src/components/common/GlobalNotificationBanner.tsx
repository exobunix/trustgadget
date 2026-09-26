'use client';

import React, { useState, useEffect } from 'react';
import { Bell, CheckCircle2, AlertCircle, MessageSquare, X } from 'lucide-react';

interface ToastItem {
  id: string;
  title: string;
  body: string;
  soundType: string;
}

export function GlobalNotificationBanner() {
  const [toasts, setToasts] = useState<ToastItem[]>([]);

  useEffect(() => {
    const handleNotification = (e: any) => {
      const detail = e.detail;
      if (!detail) return;
      const id = `toast_${Date.now()}_${Math.random().toString(36).substring(2, 5)}`;
      const newToast: ToastItem = {
        id,
        title: detail.title,
        body: detail.body,
        soundType: detail.soundType || 'default',
      };

      setToasts((prev) => [newToast, ...prev.slice(0, 4)]);

      // Auto dismiss after 6 seconds
      setTimeout(() => {
        setToasts((prev) => prev.filter((t) => t.id !== id));
      }, 6000);
    };

    window.addEventListener('tmg_inapp_notification', handleNotification);
    return () => window.removeEventListener('tmg_inapp_notification', handleNotification);
  }, []);

  if (toasts.length === 0) return null;

  return (
    <div className="fixed top-5 right-5 z-[99999] flex flex-col gap-2.5 max-w-sm w-full pointer-events-none">
      {toasts.map((toast) => {
        const isOrder = toast.soundType === 'order';
        const isSupport = toast.soundType === 'support';
        const isStatus = toast.soundType === 'status';

        return (
          <div
            key={toast.id}
            className={`pointer-events-auto p-4 rounded-2xl shadow-2xl border backdrop-blur-xl animate-bounce-subtle flex items-start gap-3 transition-all ${
              isOrder
                ? 'bg-emerald-950/95 border-emerald-500/50 text-white shadow-emerald-950/50'
                : isSupport
                ? 'bg-cyan-950/95 border-cyan-500/50 text-white shadow-cyan-950/50'
                : isStatus
                ? 'bg-blue-950/95 border-blue-500/50 text-white shadow-blue-950/50'
                : 'bg-slate-900/95 border-slate-700 text-white shadow-slate-950/50'
            }`}
          >
            <div
              className={`w-9 h-9 rounded-xl flex items-center justify-center shrink-0 ${
                isOrder
                  ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30'
                  : isSupport
                  ? 'bg-cyan-500/20 text-cyan-400 border border-cyan-500/30'
                  : isStatus
                  ? 'bg-blue-500/20 text-blue-400 border border-blue-500/30'
                  : 'bg-slate-800 text-slate-300'
              }`}
            >
              {isOrder ? (
                <CheckCircle2 className="w-5 h-5" />
              ) : isSupport ? (
                <MessageSquare className="w-5 h-5" />
              ) : (
                <Bell className="w-5 h-5" />
              )}
            </div>

            <div className="flex-1 pr-2">
              <h5 className="font-bold text-xs text-white leading-tight">{toast.title}</h5>
              {toast.body && (
                <p className="text-[11px] text-slate-300 mt-1 leading-snug line-clamp-2">
                  {toast.body}
                </p>
              )}
            </div>

            <button
              onClick={() => setToasts((prev) => prev.filter((t) => t.id !== toast.id))}
              className="text-slate-400 hover:text-white p-1 rounded-lg hover:bg-white/10 transition-colors shrink-0"
              title="Close"
            >
              <X className="w-3.5 h-3.5" />
            </button>
          </div>
        );
      })}
    </div>
  );
}
