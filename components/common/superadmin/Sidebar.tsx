'use client';

import { useState } from 'react';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { toast } from 'react-toastify';
import { FiMenu, FiX, FiHome, FiUsers, FiList, FiSettings, FiLogOut, FiBookOpen, FiChevronLeft, FiChevronRight, FiGrid } from 'react-icons/fi';
import { useAppDispatch } from '@/redux/hooks';
import { useLogoutMutation } from '@/redux/features/authApiSlice';
import { logout as setLogout } from '@/redux/features/authSlice';
import Spinner from '@/components/common/Spinner';

const menuItems = [
  { name: 'System Overview', href: '/superadmin', icon: FiHome },
  { name: 'Departments & Heads', href: '/superadmin/departments', icon: FiGrid },
  { name: 'Accounts & Privileged Access', href: '/superadmin/users', icon: FiUsers },
  { name: 'Audit Logs', href: '/superadmin/audit-logs', icon: FiList },
  { name: 'System Configuration', href: '/superadmin/system', icon: FiSettings },
];

export default function Sidebar() {
  const pathname = usePathname();
  const router = useRouter();
  const dispatch = useAppDispatch();
  const [logoutMutation] = useLogoutMutation();
  const [mobileOpen, setMobileOpen] = useState(false);
  const [collapsed, setCollapsed] = useState(false);
  const [loggingOut, setLoggingOut] = useState(false);
  const closeMobile = () => setMobileOpen(false);
  const isActive = (href: string) => (href === '/superadmin' ? pathname === '/superadmin' : pathname === href || pathname.startsWith(`${href}/`));
  const handleLogout = async () => {
    if (loggingOut) return;
    setLoggingOut(true);
    try {
      await logoutMutation(undefined).unwrap();
      dispatch(setLogout());
      toast.success('Signed out');
      closeMobile();
      router.replace('/auth/login');
    } catch {
      toast.error('Failed to sign out.');
    } finally {
      setLoggingOut(false);
    }
  };

  const nav = (showLabels: boolean) => (
    <nav className="flex-1 overflow-y-auto px-3 py-6">
      {showLabels && <p className="mb-4 px-3 text-[10px] font-bold uppercase tracking-[0.18em] text-blue-200/70">System Owner</p>}
      <ul className="space-y-2">
        {menuItems.map((item) => {
          const active = isActive(item.href);
          const Icon = item.icon;
          return (
            <li key={item.href}>
              <Link href={item.href} onClick={closeMobile} className={`flex min-h-12 items-center rounded-xl px-3 py-3 text-sm font-medium transition ${active ? 'bg-[#F9B515] font-bold text-[#12186E]' : 'text-blue-100 hover:bg-white/10 hover:text-white'} ${showLabels ? 'gap-3' : 'justify-center'}`} title={!showLabels ? item.name : undefined}>
                <Icon size={20} className="shrink-0" />
                {showLabels && <span>{item.name}</span>}
              </Link>
            </li>
          );
        })}
      </ul>
    </nav>
  );

  return (
    <>
      <div className="fixed inset-x-0 top-0 z-40 flex h-16 items-center justify-between border-b border-slate-200 bg-white px-5 md:hidden">
        <div className="flex items-center gap-2"><div className="flex h-9 w-9 items-center justify-center rounded-lg bg-[#12186E] text-[#F9B515]"><FiBookOpen size={18} /></div><span className="text-lg font-extrabold text-[#12186E]">RKIVE</span><span className="rounded-md bg-slate-900 px-2 py-1 text-[10px] font-bold text-white">SUPERADMIN</span></div>
        <button type="button" onClick={() => setMobileOpen(true)} className="rounded-lg p-2 text-[#12186E]"><FiMenu size={24} /></button>
      </div>
      {mobileOpen && <div className="fixed inset-0 z-40 bg-slate-950/50 md:hidden" onClick={closeMobile} />}
      <aside className={`fixed inset-y-0 left-0 z-50 w-72 bg-[#12186E] shadow-2xl transition-transform md:hidden ${mobileOpen ? 'translate-x-0' : '-translate-x-full'}`}>
        <button type="button" onClick={closeMobile} className="absolute right-3 top-5 rounded-lg p-2 text-white hover:bg-white/10"><FiX size={21} /></button>
        <div className="flex h-full flex-col"><div className="flex h-20 items-center gap-3 border-b border-white/10 px-5"><div className="flex h-11 w-11 items-center justify-center rounded-xl bg-[#F9B515] text-[#12186E]"><FiBookOpen size={22} /></div><div><h2 className="text-xl font-extrabold text-white">RKIVE</h2><p className="text-[10px] uppercase tracking-widest text-blue-200">Superadmin</p></div></div>{nav(true)}<div className="border-t border-white/10 p-3"><button type="button" onClick={handleLogout} disabled={loggingOut} className="flex min-h-12 w-full items-center gap-3 rounded-xl px-3 py-3 text-sm font-semibold text-blue-100 hover:bg-red-500/15"><FiLogOut size={20} />{loggingOut ? 'Signing out...' : 'Sign Out'}</button></div></div>
      </aside>
      <aside className={`relative hidden h-screen shrink-0 flex-col bg-[#12186E] transition-all md:sticky md:top-0 md:flex ${collapsed ? 'w-[76px]' : 'w-64'}`}>
        <div className={`flex h-20 items-center border-b border-white/10 ${collapsed ? 'justify-center px-3' : 'px-5'}`}>
          <Link href="/superadmin" className="flex items-center gap-3">
            <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-[#F9B515] text-[#12186E]"><FiBookOpen size={22} /></div>
            {!collapsed && <div><h1 className="text-xl font-extrabold text-white">RKIVE</h1><p className="text-[10px] font-semibold uppercase tracking-[0.16em] text-blue-200">System Owner</p></div>}
          </Link>
        </div>
        {nav(!collapsed)}
        <div className="border-t border-white/10 p-3"><button type="button" onClick={handleLogout} disabled={loggingOut} className={`flex min-h-12 w-full items-center rounded-xl px-3 py-3 text-sm font-semibold text-blue-100 hover:bg-red-500/15 ${collapsed ? 'justify-center' : 'gap-3'}`} title={collapsed ? 'Sign Out' : undefined}><FiLogOut size={20} />{!collapsed && (loggingOut ? 'Signing out...' : 'Sign Out')}</button></div>
        <button type="button" onClick={() => setCollapsed(!collapsed)} className="absolute -right-3 top-24 z-20 flex h-7 w-7 items-center justify-center rounded-full border border-slate-200 bg-white text-[#12186E] shadow-md">{collapsed ? <FiChevronRight size={16} /> : <FiChevronLeft size={16} />}</button>
      </aside>
      {loggingOut && <div className="fixed inset-0 z-[100] flex items-center justify-center bg-slate-950/50"><div className="flex flex-col items-center gap-4 rounded-2xl bg-white px-10 py-8"><Spinner /><p className="text-sm font-bold text-[#12186E]">Signing out...</p></div></div>}
    </>
  );
}
