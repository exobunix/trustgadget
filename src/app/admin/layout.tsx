'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import {
  LayoutDashboard,
  ShoppingBag,
  CheckCircle,
  Layers,
  FileCode,
  HelpCircle,
  Sliders,
  PlayCircle,
  FileText,
  Shield,
  Settings,
  ShieldCheck,
  ChevronDown,
  User,
  Users,
  LogOut,
  ExternalLink,
  Sparkles,
  Menu,
  X,
  Tag,
  MessageSquare,
  DollarSign,
} from 'lucide-react';

const ADMIN_ROLES = [
  { id: 'super_admin', name: 'Super Admin', badge: 'Full Access', desc: 'Vikram Singhania (Director)' },
  { id: 'operations_manager', name: 'Ops Manager', badge: 'Logistics Lead', desc: 'Deepak Rao' },
  { id: 'verification_agent', name: 'Field Inspector', badge: 'Verification', desc: 'Kiran Patel' },
  { id: 'content_manager', name: 'Content Manager', badge: 'CMS & Blog', desc: 'Aditi Sharma' },
];

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const router = useRouter();
  const [currentRole, setCurrentRole] = useState(ADMIN_ROLES[0]);
  const [roleDropdownOpen, setRoleDropdownOpen] = useState(false);
  const [mobileNavOpen, setMobileNavOpen] = useState(false);
  const [authenticated, setAuthenticated] = useState<boolean | null>(null);

  useEffect(() => {
    if (pathname === '/admin/login') {
      setAuthenticated(true);
      return;
    }
    // Check if session or localStorage exists
    const hasUser = typeof window !== 'undefined' && localStorage.getItem('tmg_admin_user');
    const hasCookie = typeof document !== 'undefined' && document.cookie.includes('tmg_admin_session');

    if (!hasUser && !hasCookie) {
      setAuthenticated(false);
      router.push('/admin/login');
    } else {
      setAuthenticated(true);
    }
  }, [pathname, router]);

  const handleLogout = async () => {
    try {
      await fetch('/api/admin/auth/logout', { method: 'POST' });
    } catch (e) {}
    localStorage.removeItem('tmg_admin_user');
    router.push('/admin/login');
  };

  // If on login page, render children directly without sidebar
  if (pathname === '/admin/login') {
    return <>{children}</>;
  }

  if (authenticated === false) {
    return (
      <div className="min-h-screen bg-[#050811] flex items-center justify-center text-slate-400 text-xs">
        Redirecting to Admin Login...
      </div>
    );
  }

  interface NavItem {
    label: string;
    href: string;
    icon: React.ComponentType<{ className?: string }>;
    badge?: string;
    highlight?: boolean;
  }

  const navSections: { title: string; items: NavItem[] }[] = [
    {
      title: 'OVERVIEW',
      items: [
        { label: 'Dashboard', href: '/admin', icon: LayoutDashboard },
        { label: 'All Orders', href: '/admin/orders', icon: ShoppingBag, badge: 'Live' },
        { label: 'Verification Studio', href: '/admin/verification', icon: CheckCircle },
      ],
    },
    {
      title: 'CATALOG & PRICING',
      items: [
        { label: 'Categories', href: '/admin/catalog/categories', icon: Layers },
        { label: 'Brands', href: '/admin/catalog/brands', icon: Layers },
        { label: 'Models & Specs', href: '/admin/catalog/models', icon: FileCode },
        { label: 'Pricing Engine', href: '/admin/valuation/pricing-engine', icon: DollarSign, highlight: true },
        { label: 'Dynamic Questions', href: '/admin/valuation/questions', icon: HelpCircle },
        { label: 'Valuation Rules', href: '/admin/valuation/rules', icon: Sliders },
        { label: 'Valuation Simulator', href: '/admin/valuation/simulator', icon: PlayCircle },
      ],
    },
    {
      title: 'OPERATIONS & PEOPLE',
      items: [
        { label: 'Customers & Users', href: '/admin/users', icon: Users },
        { label: 'Support Tickets', href: '/admin/support', icon: MessageSquare, badge: 'Chat' },
        { label: 'Coupons & Offers', href: '/admin/coupons', icon: Tag },
        { label: 'CMS & Banners', href: '/admin/cms', icon: FileText },
        { label: 'Audit Trail Logs', href: '/admin/audit-logs', icon: Shield },
        { label: 'Settings & Roles', href: '/admin/settings', icon: Settings },
      ],
    },
  ];

  return (
    <div className="min-h-screen bg-[#050811] text-slate-100 flex flex-col font-sans">
      {/* Top Admin Bar */}
      <header className="h-16 bg-slate-950 border-b border-slate-800/80 px-4 sm:px-6 flex items-center justify-between sticky top-0 z-30">
        <div className="flex items-center gap-3">
          <button
            onClick={() => setMobileNavOpen(!mobileNavOpen)}
            className="lg:hidden p-2 rounded-lg bg-slate-900 text-slate-400 hover:text-white"
          >
            {mobileNavOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
          </button>

          <Link href="/admin" className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-gradient-to-tr from-cyan-500 to-purple-600 p-0.5 shadow-md shadow-purple-500/20">
              <div className="w-full h-full bg-slate-950 rounded-[6px] flex items-center justify-center">
                <Sparkles className="w-4 h-4 text-cyan-400" />
              </div>
            </div>
            <div className="flex flex-col">
              <span className="text-sm font-black text-white tracking-tight">
                TrustMyGadget <span className="text-purple-400">ADMIN</span>
              </span>
              <span className="text-[9px] tracking-widest text-slate-400 uppercase font-semibold">
                Control Hub v3.0
              </span>
            </div>
          </Link>
        </div>

        {/* Right Admin Controls */}
        <div className="flex items-center gap-3">
          <Link
            href="/"
            target="_blank"
            className="hidden sm:flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-slate-900 hover:bg-slate-800 text-slate-300 hover:text-white text-xs font-semibold border border-slate-800 transition-all"
          >
            <span>Customer Site</span>
            <ExternalLink className="w-3 h-3 text-cyan-400" />
          </Link>

          {/* Fast Role Switcher */}
          <div className="relative">
            <button
              onClick={() => setRoleDropdownOpen(!roleDropdownOpen)}
              className="flex items-center gap-2 px-3 py-1.5 rounded-xl bg-slate-900 border border-purple-500/30 text-xs font-medium text-slate-200 hover:border-purple-500/60 transition-all"
            >
              <div className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
              <div className="text-left hidden sm:block">
                <div className="text-[10px] text-purple-300 font-bold uppercase">{currentRole.name}</div>
                <div className="text-xs text-slate-400 -mt-0.5">{currentRole.desc}</div>
              </div>
              <ChevronDown className="w-3.5 h-3.5 text-slate-400" />
            </button>

            {roleDropdownOpen && (
              <div className="absolute right-0 mt-2 w-56 bg-slate-900 border border-slate-700 rounded-2xl shadow-2xl p-2 z-50 animate-fadeIn">
                <div className="px-2 py-1.5 text-[10px] font-bold text-slate-400 uppercase">
                  Fast Switch Active Role:
                </div>
                {ADMIN_ROLES.map((role) => (
                  <button
                    key={role.id}
                    onClick={() => {
                      setCurrentRole(role);
                      setRoleDropdownOpen(false);
                    }}
                    className={`w-full text-left px-3 py-2 rounded-xl text-xs flex flex-col transition-all ${
                      currentRole.id === role.id
                        ? 'bg-purple-950/60 text-purple-300 border border-purple-500/30 font-bold'
                        : 'text-slate-300 hover:bg-slate-800'
                    }`}
                  >
                    <div className="flex items-center justify-between">
                      <span>{role.name}</span>
                      <span className="text-[9px] bg-slate-800 px-1.5 py-0.5 rounded text-slate-400">{role.badge}</span>
                    </div>
                    <span className="text-[10px] text-slate-400 font-normal">{role.desc}</span>
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Sign Out Button */}
          <button
            onClick={handleLogout}
            className="p-2 rounded-xl bg-slate-900 hover:bg-rose-950/80 text-slate-400 hover:text-rose-400 border border-slate-800 hover:border-rose-800 transition-all"
            title="Sign Out of Admin"
          >
            <LogOut className="w-4 h-4" />
          </button>
        </div>
      </header>

      {/* Main Admin Wrapper */}
      <div className="flex-1 flex overflow-hidden">
        {/* Left Sidebar */}
        <aside
          className={`w-64 bg-slate-950/90 border-r border-slate-800/80 flex flex-col justify-between p-4 shrink-0 transition-all overflow-y-auto ${
            mobileNavOpen ? 'fixed inset-y-0 left-0 z-40 block pt-20 bg-slate-950 w-72' : 'hidden lg:flex'
          }`}
        >
          <div className="space-y-6">
            {navSections.map((section, idx) => (
              <div key={idx} className="space-y-1">
                <div className="px-3 py-1 text-[10px] font-bold text-slate-500 uppercase tracking-wider">
                  {section.title}
                </div>
                {section.items.map((item) => {
                  const Icon = item.icon;
                  const isActive = pathname === item.href;
                  return (
                    <Link
                      key={item.href}
                      href={item.href}
                      onClick={() => setMobileNavOpen(false)}
                      className={`flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-xs font-semibold transition-all ${
                        isActive
                          ? 'bg-gradient-to-r from-cyan-950 to-purple-950 text-cyan-300 border border-cyan-500/30 shadow-sm shadow-cyan-500/10'
                          : item.highlight
                          ? 'text-emerald-400 hover:bg-slate-900 bg-emerald-950/20 border border-emerald-500/20'
                          : 'text-slate-400 hover:text-slate-200 hover:bg-slate-900 border border-transparent'
                      }`}
                    >
                      <Icon className={`w-4 h-4 ${isActive ? 'text-cyan-400' : item.highlight ? 'text-emerald-400' : 'text-slate-500'}`} />
                      <span>{item.label}</span>
                      {item.badge && (
                        <span className="ml-auto text-[9px] font-bold text-cyan-400 bg-cyan-950 px-1.5 py-0.5 rounded border border-cyan-500/30">
                          {item.badge}
                        </span>
                      )}
                    </Link>
                  );
                })}
              </div>
            ))}
          </div>

          {/* Operator Badge */}
          <div className="pt-4 border-t border-slate-800/80 px-2 flex items-center justify-between text-xs text-slate-400 mt-6">
            <div className="flex items-center gap-2">
              <div className="w-2 h-2 rounded-full bg-emerald-400" />
              <span className="text-[11px] font-semibold text-slate-300">{currentRole.name}</span>
            </div>
            <button onClick={handleLogout} className="text-[10px] text-rose-400 hover:underline">
              Log Out
            </button>
          </div>
        </aside>

        {/* Content Viewport */}
        <main className="flex-1 overflow-y-auto p-4 sm:p-6 lg:p-8 bg-[#050811]">
          {children}
        </main>
      </div>
    </div>
  );
}
