'use client';

// Web Audio API Sound Synthesizer (Zero external dependencies, 100% offline & cross-platform)
export function playNotificationSound(type: 'order' | 'status' | 'support' | 'default' = 'default') {
  if (typeof window === 'undefined') return;

  try {
    const AudioContextClass = window.AudioContext || (window as any).webkitAudioContext;
    if (!AudioContextClass) return;

    const ctx = new AudioContextClass();

    if (type === 'order') {
      // Pleasant 3-tone ascending chime for new orders: C5 (523Hz) -> E5 (659Hz) -> G5 (784Hz)
      const freqs = [523.25, 659.25, 783.99];
      freqs.forEach((freq, idx) => {
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();
        osc.type = 'sine';
        osc.frequency.setValueAtTime(freq, ctx.currentTime + idx * 0.12);

        gain.gain.setValueAtTime(0, ctx.currentTime + idx * 0.12);
        gain.gain.linearRampToValueAtTime(0.25, ctx.currentTime + idx * 0.12 + 0.02);
        gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + idx * 0.12 + 0.35);

        osc.connect(gain);
        gain.connect(ctx.destination);

        osc.start(ctx.currentTime + idx * 0.12);
        osc.stop(ctx.currentTime + idx * 0.12 + 0.4);
      });
    } else if (type === 'status') {
      // 2-tone melodic notification for status change: A4 (440Hz) -> D5 (587Hz)
      const freqs = [440, 587.33];
      freqs.forEach((freq, idx) => {
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();
        osc.type = 'triangle';
        osc.frequency.setValueAtTime(freq, ctx.currentTime + idx * 0.14);

        gain.gain.setValueAtTime(0, ctx.currentTime + idx * 0.14);
        gain.gain.linearRampToValueAtTime(0.22, ctx.currentTime + idx * 0.14 + 0.02);
        gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + idx * 0.14 + 0.3);

        osc.connect(gain);
        gain.connect(ctx.destination);

        osc.start(ctx.currentTime + idx * 0.14);
        osc.stop(ctx.currentTime + idx * 0.14 + 0.35);
      });
    } else if (type === 'support') {
      // Friendly dual-pip for support chat / tickets
      const freqs = [659.25, 880];
      freqs.forEach((freq, idx) => {
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();
        osc.type = 'sine';
        osc.frequency.setValueAtTime(freq, ctx.currentTime + idx * 0.1);

        gain.gain.setValueAtTime(0, ctx.currentTime + idx * 0.1);
        gain.gain.linearRampToValueAtTime(0.2, ctx.currentTime + idx * 0.1 + 0.02);
        gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + idx * 0.1 + 0.25);

        osc.connect(gain);
        gain.connect(ctx.destination);

        osc.start(ctx.currentTime + idx * 0.1);
        osc.stop(ctx.currentTime + idx * 0.1 + 0.3);
      });
    } else {
      // Generic notification beep
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.type = 'sine';
      osc.frequency.setValueAtTime(600, ctx.currentTime);
      gain.gain.setValueAtTime(0.2, ctx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.25);
      osc.connect(gain);
      gain.connect(ctx.destination);
      osc.start(ctx.currentTime);
      osc.stop(ctx.currentTime + 0.3);
    }
  } catch (err) {
    console.warn('AudioContext playback error (user interaction may be required):', err);
  }
}

// Request Notification Permission
export async function requestNotificationPermission(): Promise<boolean> {
  if (typeof window === 'undefined' || !('Notification' in window)) return false;
  try {
    if (Notification.permission === 'granted') return true;
    if (Notification.permission !== 'denied') {
      const permission = await Notification.requestPermission();
      return permission === 'granted';
    }
  } catch (err) {
    console.warn('Notification permission request error:', err);
  }
  return false;
}

// Dispatch Web Notification + Sound + In-App Custom Toast
export async function triggerWebNotification(
  title: string,
  options?: {
    body?: string;
    icon?: string;
    soundType?: 'order' | 'status' | 'support' | 'default';
    tag?: string;
  }
) {
  if (typeof window === 'undefined') return;

  const soundType = options?.soundType || 'default';

  // 1. Play synthesized beep sound
  playNotificationSound(soundType);

  // 2. Browser native Web Notification
  if ('Notification' in window) {
    if (Notification.permission === 'granted') {
      try {
        new Notification(title, {
          body: options?.body || '',
          icon: options?.icon || '/favicon.ico',
          tag: options?.tag || `notif_${Date.now()}`,
        });
      } catch (e) {
        console.warn('Native notification failed:', e);
      }
    } else if (Notification.permission !== 'denied') {
      requestNotificationPermission().then((granted) => {
        if (granted) {
          try {
            new Notification(title, {
              body: options?.body || '',
              icon: options?.icon || '/favicon.ico',
            });
          } catch (e) {
            // ignore
          }
        }
      });
    }
  }

  // 3. Dispatch an in-app DOM custom event for floating UI alert banner
  try {
    window.dispatchEvent(
      new CustomEvent('tmg_inapp_notification', {
        detail: {
          title,
          body: options?.body || '',
          soundType,
          timestamp: Date.now(),
        },
      })
    );
  } catch (e) {
    // ignore
  }
}
