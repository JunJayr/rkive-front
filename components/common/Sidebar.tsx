'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import {
  FiHome,
  FiSearch,
  FiBookmark,
  FiUsers,
  FiUploadCloud,
  FiClipboard,
  FiLogOut,
  FiChevronDown,
  FiCheckCircle,
  FiCircle,
  FiMenu,
  FiX,
  FiBookOpen,
} from 'react-icons/fi';
import { toast } from 'react-toastify';

import { useAppDispatch } from '@/redux/hooks';
import { useLogoutMutation } from '@/redux/features/authApiSlice';
import { logout as setLogout } from '@/redux/features/authSlice';
import Spinner from '@/components/common/Spinner';

const menuItems = [
  { name: 'Dashboard', href: '/user', icon: FiHome },
  { name: 'Browse Research', href: '/user/search', icon: FiSearch },
  { name: 'My Collection', href: '/user/bookmarks', icon: FiBookmark },
  { name: 'Panel Nomination', href: '/user/panel-nomination', icon: FiUsers },
  { name: 'Submit Manuscript', href: '/user/submit-study', icon: FiUploadCloud },
];

const defenseSteps = [
  { key: 'concept', label: 'Concept Defense', href: '/user/defense-application/concept' },
  { key: 'proposal', label: 'Proposal Defense', href: '/user/defense-application/proposal' },
  { key: 'final', label: 'Final Defense', href: '/user/defense-application/final' },
];

export default function Sidebar() {
  const pathname = usePathname();
  const router = useRouter();
  const dispatch = useAppDispatch();
  const [logoutMutation] = useLogoutMutation();

  const [mobileOpen, setMobileOpen] = useState(false);
  const [collapsed, setCollapsed] = useState(true);
  const [defenseOpen, setDefenseOpen] = useState(false);
  const [loading, setLoading] = useState(false);

  const expanded = mobileOpen || !collapsed;
  const isDefenseRoute = pathname.startsWith('/user/defense-application');

  useEffect(() => { setMobileOpen(false); }, [pathname]);
  useEffect(() => { if (isDefenseRoute) setDefenseOpen(true); }, [isDefenseRoute]);

  const handleLogout = async () => {
    if (loading) return;
    setLoading(true);
    try {
      await logoutMutation(undefined).unwrap();
      dispatch(setLogout());
      toast.success('Signed out');
      router.replace('/auth/login');
    } catch {
      toast.error('Failed to sign out.');
    } finally {
      setLoading(false);
    }
  };

  const handleDefenseToggle = () => {
    if (!expanded) {
      setCollapsed(false);
      setDefenseOpen(true);
      return;
    }
    setDefenseOpen((p) => !p);
  };

  const NavLink = ({ item }: { item: (typeof menuItems)[number] }) => {
    const Icon = item.icon;
    const active = pathname === item.href || (item.href !== '/user' && pathname.startsWith(`${item.href}/`));
    return (
      <Link
        href={item.href}
        title={!expanded ? item.name : undefined}
        aria-current={active ? 'page' : undefined}
        className={`group flex h-11 items-center rounded-xl transition-all duration-200 ${
          expanded ? 'gap-3 px-3.5' : 'justify-center'
        } ${active ? 'bg-[#FBBF24] text-[#103F78] shadow-sm' : 'text-blue-100/90 hover:bg-white/10 hover:text-white'}`}
      >
        <Icon size={19} className="shrink-0" />
        {expanded && <span className={`text-[13px] ${active ? 'font-bold' : 'font-semibold'}`}>{item.name}</span>}
      </Link>
    );
  };

  return (
    <>
      <div className="fixed inset-x-0 top-0 z-40 flex h-16 items-center justify-between border-b border-slate-200/80 bg-white/95 px-4 backdrop-blur md:hidden">
        <Link href="/user" className="flex items-center gap-2">
          <span className="flex h-9 w-9 items-center justify-center rounded-xl bg-[#103F78] text-[#FBBF24]"><FiBookOpen size={18} /></span>
          <span className="text-lg font-extrabold tracking-tight text-[#103F78]">RKIVE</span>
        </Link>
        <button type="button" onClick={() => setMobileOpen(true)} aria-label="Open navigation" className="rounded-xl p-2.5 text-[#103F78] hover:bg-slate-100">
          <FiMenu size={22} />
        </button>
      </div>

      {mobileOpen && (
        <button type="button" aria-label="Close navigation" onClick={() => setMobileOpen(false)} className="fixed inset-0 z-40 bg-slate-950/55 md:hidden" />
      )}

      <aside
        onMouseEnter={() => { if (window.innerWidth >= 768) setCollapsed(false); }}
        onMouseLeave={() => { if (window.innerWidth >= 768) setCollapsed(true); }}
        className={`fixed left-0 top-0 z-50 flex h-screen flex-col bg-[#103F78] text-white shadow-2xl shadow-blue-950/20 transition-[width,transform] duration-300 md:sticky md:top-0 md:shrink-0 ${
          expanded ? 'w-[272px]' : 'w-[272px] md:w-[78px]'
        } ${mobileOpen ? 'translate-x-0' : '-translate-x-full md:translate-x-0'}`}
      >
        <div className="flex h-[72px] shrink-0 items-center border-b border-white/10 px-3.5">
          <Link href="/user" className="flex min-w-0 flex-1 items-center gap-3">
            <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-[#FBBF24] text-[#103F78] shadow-sm">
              <FiBookOpen size={20} />
            </span>
            <div className={`min-w-0 overflow-hidden transition-opacity duration-200 ${expanded ? 'opacity-100' : 'opacity-0 md:opacity-0'}`}>
              <p className="text-lg font-extrabold tracking-tight">RKIVE</p>
              <p className="truncate text-[10px] font-semibold uppercase tracking-[0.16em] text-blue-200/80">Student Workspace</p>
            </div>
          </Link>
          {mobileOpen && (
            <button type="button" onClick={() => setMobileOpen(false)} aria-label="Close sidebar" className="rounded-lg p-2 hover:bg-white/10 md:hidden">
              <FiX size={20} />
            </button>
          )}
        </div>

        <nav aria-label="Student navigation" className="flex-1 overflow-y-auto overflow-x-hidden px-3 py-5">
          <p className={`mb-3 whitespace-nowrap px-3 text-[10px] font-bold uppercase tracking-[0.2em] text-blue-200/60 transition-opacity ${expanded ? 'opacity-100' : 'opacity-0'}`}>
            Workspace
          </p>
          <ul className="space-y-1">
            {menuItems.map((item) => (
              <li key={item.name}><NavLink item={item} /></li>
            ))}
          </ul>

          <div className="my-5 border-t border-white/10" />
          {expanded && (
            <p className="mb-3 px-3 text-[10px] font-bold uppercase tracking-[0.2em] text-blue-200/60">Research Workflow</p>
          )}
          <button
            type="button"
            onClick={handleDefenseToggle}
            aria-expanded={expanded && defenseOpen}
            title={!expanded ? 'Defense Application' : undefined}
            className={`flex h-11 w-full items-center rounded-xl transition-all ${
              expanded ? 'justify-between px-3.5' : 'justify-center'
            } ${isDefenseRoute ? 'bg-white/12 text-white' : 'text-blue-100/90 hover:bg-white/10 hover:text-white'}`}
          >
            <span className="flex items-center gap-3">
              <FiClipboard size={19} />
              {expanded && <span className="text-[13px] font-semibold">Defense Application</span>}
            </span>
            {expanded && <FiChevronDown size={14} className={`text-blue-200/70 transition-transform ${defenseOpen ? 'rotate-180' : ''}`} />}
          </button>

          {expanded && defenseOpen && (
            <ul className="ml-4 mt-2 space-y-1 border-l border-white/15 pl-3">
              {defenseSteps.map((step) => {
                const active = pathname === step.href;
                return (
                  <li key={step.key}>
                    <Link
                      href={step.href}
                      aria-current={active ? 'page' : undefined}
                      className={`flex min-h-10 items-center justify-between gap-2 rounded-lg px-3 py-2 transition-colors ${
                        active ? 'bg-[#FBBF24] font-bold text-[#103F78]' : 'text-blue-100/85 hover:bg-white/10 hover:text-white'
                      }`}
                    >
                      <span className="text-xs font-medium">{step.label}</span>
                      {active ? <FiCheckCircle size={13} /> : <FiCircle size={12} className="text-blue-200/40" />}
                    </Link>
                  </li>
                );
              })}
            </ul>
          )}
        </nav>

        <div className="shrink-0 border-t border-white/10 p-3">
          <button
            type="button"
            onClick={handleLogout}
            disabled={loading}
            title={!expanded ? 'Sign out' : undefined}
            className={`flex h-11 w-full items-center rounded-xl text-blue-100/85 transition-colors hover:bg-red-500/15 hover:text-red-100 disabled:opacity-50 ${
              expanded ? 'gap-3 px-3.5' : 'justify-center'
            }`}
          >
            {loading ? <Spinner sm /> : <FiLogOut size={19} />}
            {expanded && <span className="text-[13px] font-semibold">Sign out</span>}
          </button>
        </div>
      </aside>
    </>
  );
}
