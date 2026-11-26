'use client';

import { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { toast } from 'react-toastify';
import { FiMenu, FiX, FiHome, FiClipboard, FiCalendar, FiBell, FiLogOut, FiShield } from 'react-icons/fi';

import { useAppDispatch, useAppSelector } from '@/redux/hooks';
import { useLogoutMutation } from '@/redux/features/authApiSlice';
import { logout as setLogout } from '@/redux/features/authSlice';

const menuItems = [
  { name: 'Overview', href: '/department-head', icon: FiHome },
  { name: 'Defense Applications', href: '/department-head#applications', icon: FiClipboard },
  { name: 'Schedules', href: '/department-head#schedules', icon: FiCalendar },
  { name: 'Notifications', href: '/department-head#notifications', icon: FiBell },
];

export default function DepartmentHeadSidebar() {
  const router = useRouter();
  const dispatch = useAppDispatch();
  const department = useAppSelector((state) => state.auth.department);
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

  return (
    <>
      <div className="fixed inset-x-0 top-0 z-40 flex h-16 items-center justify-between border-b border-slate-200 bg-white px-5 md:hidden">
        <span className="text-lg font-extrabold text-[#12186E]">RKIVE <span className="text-amber-600">Dept Head</span></span>
        <button type="button" onClick={() => setMobileOpen(true)} aria-label="Open menu" className="rounded-lg p-2 text-[#12186E]">
          <FiMenu size={24} />
        </button>
      </div>
      {mobileOpen && <div className="fixed inset-0 z-40 bg-slate-950/50 md:hidden" onClick={() => setMobileOpen(false)} aria-hidden="true" />}
      <aside className={`fixed inset-y-0 left-0 z-50 w-72 bg-[#12186E] text-white shadow-xl transition-transform md:static md:translate-x-0 ${mobileOpen ? 'translate-x-0' : '-translate-x-full'}`}>
        <div className="flex h-20 items-center justify-between border-b border-white/10 px-5">
          <div className="flex items-center gap-3">
            <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-[#F9B515] text-[#12186E]"><FiShield size={22} /></div>
            <div>
              <p className="text-lg font-extrabold">RKIVE</p>
              <p className="text-[10px] font-semibold uppercase tracking-widest text-blue-200">Department Head</p>
            </div>
          </div>
          <button type="button" onClick={() => setMobileOpen(false)} className="rounded-lg p-2 hover:bg-white/10 md:hidden" aria-label="Close menu"><FiX size={20} /></button>
        </div>
        {department && (
          <div className="border-b border-white/10 px-5 py-3">
            <p className="text-[10px] uppercase tracking-wider text-blue-300">Your department</p>
            <p className="truncate text-sm font-semibold text-white">{department}</p>
          </div>
        )}
        <nav className="flex-1 px-3 py-6">
          <ul className="space-y-2">
            {menuItems.map((item) => {
              const Icon = item.icon;
              return (
                <li key={item.name}>
                  <Link href={item.href} onClick={() => setMobileOpen(false)} className="flex items-center gap-3 rounded-xl px-3 py-3 text-sm font-medium text-blue-100 hover:bg-white/10">
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
