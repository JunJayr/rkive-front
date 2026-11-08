'use client';

import { useState } from 'react';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { toast } from 'react-toastify';
import { FiMenu, FiX, FiHome, FiCheckSquare, FiBookOpen, FiLogOut, FiShield } from 'react-icons/fi';

import { useAppDispatch } from '@/redux/hooks';
import { useLogoutMutation } from '@/redux/features/authApiSlice';
import { logout as setLogout } from '@/redux/features/authSlice';

const menuItems = [
  { name: 'Dashboard', href: '/panel', icon: FiHome },
  { name: 'Review Queue', href: '/panel', icon: FiCheckSquare },
  { name: 'Repository', href: '/user/search', icon: FiBookOpen },
];

export default function PanelSidebar() {
  const pathname = usePathname();
  const router = useRouter();
  const dispatch = useAppDispatch();
  const [logoutMutation] = useLogoutMutation();
  const [mobileOpen, setMobileOpen] = useState(false);
  const [loggingOut, setLoggingOut] = useState(false);

  const handleLogout = async () => {
    if (loggingOut) return;
    setLoggingOut(true);
    try {
      await logoutMutation(undefined).unwrap();
      dispatch(setLogout());
      toast.success('Logged out');
      router.replace('/auth/login');
    } catch {
      toast.error('Logout failed.');
    } finally {
      setLoggingOut(false);
    }
  };

  const isActive = (href: string) => (href === '/panel' ? pathname === '/panel' : pathname.startsWith(href));

  return (
    <>
      <div className="fixed inset-x-0 top-0 z-40 flex h-16 items-center justify-between border-b border-slate-200 bg-white px-5 md:hidden">
        <span className="text-lg font-extrabold text-[#103F78]">RKIVE <span className="text-amber-600">Panel</span></span>
        <button type="button" onClick={() => setMobileOpen(true)} aria-label="Open menu" className="rounded-lg p-2 text-[#103F78]">
          <FiMenu size={24} />
        </button>
      </div>
      {mobileOpen && <div className="fixed inset-0 z-40 bg-slate-950/50 md:hidden" onClick={() => setMobileOpen(false)} aria-hidden="true" />}
      <aside className={`fixed inset-y-0 left-0 z-50 w-72 bg-[#103F78] text-white shadow-xl transition-transform md:static md:translate-x-0 ${mobileOpen ? 'translate-x-0' : '-translate-x-full'}`}>
        <div className="flex h-20 items-center justify-between border-b border-white/10 px-5">
          <div className="flex items-center gap-3">
            <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-[#FBBF24] text-[#103F78]"><FiShield size={22} /></div>
            <div>
              <p className="text-lg font-extrabold">RKIVE</p>
              <p className="text-[10px] font-semibold uppercase tracking-widest text-blue-200">Panel Portal</p>
            </div>
          </div>
          <button type="button" onClick={() => setMobileOpen(false)} className="rounded-lg p-2 hover:bg-white/10 md:hidden" aria-label="Close menu"><FiX size={20} /></button>
        </div>
        <nav className="flex-1 px-3 py-6">
          <ul className="space-y-2">
            {menuItems.map((item) => {
              const Icon = item.icon;
              const active = isActive(item.href);
              return (
                <li key={item.name}>
                  <Link href={item.href} onClick={() => setMobileOpen(false)} className={`flex items-center gap-3 rounded-xl px-3 py-3 text-sm font-medium transition ${active ? 'bg-[#FBBF24] font-bold text-[#103F78]' : 'text-blue-100 hover:bg-white/10'}`}>
                    <Icon size={19} /> {item.name}
                  </Link>
                </li>
              );
            })}
          </ul>
        </nav>
        <div className="border-t border-white/10 p-3">
          <button type="button" onClick={handleLogout} disabled={loggingOut} className="flex w-full items-center gap-3 rounded-xl px-3 py-3 text-sm font-semibold text-blue-100 hover:bg-red-500/15 hover:text-red-200 disabled:opacity-50">
            <FiLogOut size={19} /> {loggingOut ? 'Signing out…' : 'Sign out'}
          </button>
        </div>
      </aside>
    </>
  );
}
