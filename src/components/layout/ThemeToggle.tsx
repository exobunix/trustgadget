'use client';

import React, { useEffect, useState } from 'react';
import { Sun, Moon } from 'lucide-react';

export function ThemeToggle({ className = '' }: { className?: string }) {
  const [theme, setTheme] = useState<'light' | 'dark'>('light');
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
    // Read persisted theme or default to 'light'
    const savedTheme = localStorage.getItem('trustgadget-theme') as 'light' | 'dark' | null;
    const initialTheme = savedTheme || 'light';
    setTheme(initialTheme);
    applyTheme(initialTheme);
  }, []);

  const applyTheme = (targetTheme: 'light' | 'dark') => {
    const root = document.documentElement;
    if (targetTheme === 'dark') {
      root.classList.add('dark');
      root.setAttribute('data-theme', 'dark');
      root.style.colorScheme = 'dark';
    } else {
      root.classList.remove('dark');
      root.setAttribute('data-theme', 'light');
      root.style.colorScheme = 'light';
    }
    localStorage.setItem('trustgadget-theme', targetTheme);
  };

  const toggleTheme = () => {
    const nextTheme = theme === 'dark' ? 'light' : 'dark';
    setTheme(nextTheme);
    applyTheme(nextTheme);
  };

  if (!mounted) {
    return (
      <div className={`w-9 h-9 rounded-xl bg-slate-100 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700/60 flex items-center justify-center ${className}`}>
        <Sun className="w-4 h-4 text-amber-500 opacity-60" />
      </div>
    );
  }

  return (
    <button
      type="button"
      onClick={toggleTheme}
      aria-label={`Switch to ${theme === 'dark' ? 'light' : 'dark'} mode`}
      title={`Switch to ${theme === 'dark' ? 'light' : 'dark'} mode`}
      className={`relative group flex items-center justify-center w-9 h-9 rounded-xl transition-all duration-300 ${
        theme === 'dark'
          ? 'bg-slate-900/80 hover:bg-slate-800 text-cyan-400 border border-slate-700/60 hover:border-cyan-500/50 shadow-sm shadow-cyan-500/10'
          : 'bg-white hover:bg-slate-100 text-amber-600 border border-slate-200 hover:border-amber-300 shadow-sm shadow-slate-200/50'
      } ${className}`}
    >
      <div className="relative w-4 h-4 flex items-center justify-center transition-transform duration-500 group-hover:rotate-45">
        {theme === 'dark' ? (
          <Moon className="w-4 h-4 transition-all duration-300 text-cyan-400 drop-shadow-[0_0_8px_rgba(0,242,254,0.5)]" />
        ) : (
          <Sun className="w-4 h-4 transition-all duration-300 text-amber-500 drop-shadow-[0_0_8px_rgba(245,158,11,0.5)]" />
        )}
      </div>
    </button>
  );
}
