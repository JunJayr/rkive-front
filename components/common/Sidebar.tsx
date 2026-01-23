'use client';

import React, { useEffect, useMemo, useState } from 'react';
import {
  FaPaperclip,
  FaClipboard,
  FaUsers,
  FaSignOutAlt,
  FaHome,
  FaChevronDown,
  FaLock,
  FaCheckCircle,
} from 'react-icons/fa';
import { HiMenu } from 'react-icons/hi';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { toast } from 'react-toastify';
import { useAppDispatch } from '@/redux/hooks';
import { useLogoutMutation } from '@/redux/features/authApiSlice';
import { logout as setLogout } from '@/redux/features/authSlice';
import Spinner from '@/components/common/Spinner';

type DefenseProgress = {
  conceptApproved: boolean;
  proposalApproved: boolean;
  finalApproved: boolean;
};

export default function Sidebar() {
  const [mobileOpen, setMobileOpen] = useState(false);
  const [collapsed, setCollapsed] = useState(true);
  const [defenseOpen, setDefenseOpen] = useState(false);
  const [loading, setLoading] = useState(false);

  const pathname = usePathname();
  const dispatch = useAppDispatch();
  const [logoutMutation] = useLogoutMutation();

  const isDefenseRoute = pathname.startsWith('/user/defense-application');

  const defenseProgress: DefenseProgress = {
    conceptApproved: true,
    proposalApproved: false,
    finalApproved: false,
  };

  /** 🔹 RESTORED STEPS (this was missing) */
  const steps = useMemo(
    () => [
      {
        key: 'concept',
        label: 'Concept Defense',
        href: '/user/defense-application/concept',
        approved: defenseProgress.conceptApproved,
        locked: false,
      },
      {
        key: 'proposal',
        label: 'Proposal Defense',
        href: '/user/defense-application/proposal',
        approved: defenseProgress.proposalApproved,
        locked: !defenseProgress.conceptApproved,
      },
      {
        key: 'final',
        label: 'Final Defense',
        href: '/user/defense-application/final',
        approved: defenseProgress.finalApproved,
        locked: !defenseProgress.proposalApproved,
      },
    ],
    [defenseProgress]
  );

  /** 🔹 Auto-open when visiting defense routes */
  useEffect(() => {
    if (isDefenseRoute) setDefenseOpen(true);
  }, [isDefenseRoute]);

  /** 🔹 Auto-close dropdown when sidebar collapses */
  useEffect(() => {
    if (collapsed) setDefenseOpen(false);
  }, [collapsed]);

  const menuItems = [
    { name: 'Dashboard', href: '/user', icon: <FaHome size={18} /> },
    { name: 'Panel Nomination', href: '/user/panel-nomination', icon: <FaUsers size={18} /> },
    { name: 'Submit Thesis', href: '/user/submit-study', icon: <FaPaperclip size={18} /> },
  ];

  const handleLogout = async () => {
    setLoading(true);
    try {
      await logoutMutation(undefined).unwrap();
      dispatch(setLogout());
      toast.success('Logged out');
    } catch {
      toast.error('Logout failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      {/* Mobile Top Bar */}
      <div className="md:hidden fixed top-0 left-0 right-0 h-14 bg-white border-b flex items-center px-4 z-40">
        <button onClick={() => setMobileOpen(true)}>
          <HiMenu size={22} />
        </button>
        <span className="ml-4 font-bold text-[#0A4D9C]">
          R<span className="text-[#FBBF24]">k</span>ive
        </span>
      </div>

      {/* Sidebar */}
      <aside
        onMouseEnter={() => setCollapsed(false)}
        onMouseLeave={() => setTimeout(() => setCollapsed(true), 120)}
        className={`
          fixed md:static top-0 left-0 h-screen z-50
          bg-[#1E293B] text-[#E5E7EB]
          transition-all duration-300 ease-in-out
          ${collapsed ? 'w-16' : 'w-72'}
          ${mobileOpen ? 'translate-x-0' : '-translate-x-full md:translate-x-0'}
        `}
      >
        {/* Logo */}
        <Link
          href="/user"
          className={`h-16 flex items-center border-b border-white/10 transition-all
            ${collapsed ? 'justify-center' : 'px-5 gap-3'}
          `}
        >
          <img src="/logo.png" className="h-7 w-7" />
          <span
            className={`text-lg font-semibold tracking-wide transition-all
              ${collapsed ? 'opacity-0 w-0 overflow-hidden' : 'opacity-100'}
            `}
          >
            R<span className="text-[#FBBF24]">k</span>ive
          </span>
        </Link>

        {/* Menu */}
        <nav className="mt-4">
          <ul className="space-y-1 px-2">
            {menuItems.map((item) => {
              const active = pathname === item.href;

              return (
                <li key={item.name}>
                  <Link
                    href={item.href}
                    className={`
                      h-11 w-full flex items-center rounded-md transition
                      ${collapsed ? 'justify-center' : 'px-4 gap-3'}
                      ${active
                        ? 'bg-[#0A4D9C] text-white'
                        : 'hover:bg-white/5 text-[#E5E7EB]'}
                    `}
                    title={collapsed ? item.name : undefined}
                  >
                    {item.icon}
                    {!collapsed && (
                      <span className="text-sm font-medium tracking-wide">
                        {item.name}
                      </span>
                    )}
                  </Link>
                </li>
              );
            })}

            {/* Defense Application */}
            <li className="pt-2 border-t border-white/10">
              <button
                onClick={() => !collapsed && setDefenseOpen(v => !v)}
                className={`
                  h-11 w-full flex items-center rounded-md transition
                  ${collapsed ? 'justify-center' : 'px-4 justify-between'}
                  ${isDefenseRoute
                    ? 'bg-[#0A4D9C] text-white'
                    : 'hover:bg-white/5'}
                `}
                title={collapsed ? 'Defense Application' : undefined}
              >
                <span className="flex items-center gap-3">
                  <FaClipboard size={16} />
                  {!collapsed && (
                    <span className="text-sm font-medium">
                      Defense Application
                    </span>
                  )}
                </span>

                {!collapsed && (
                  <FaChevronDown
                    className={`transition-transform text-xs ${
                      defenseOpen ? 'rotate-180' : ''
                    }`}
                  />
                )}
              </button>

              {!collapsed && defenseOpen && (
                <ul className="mt-1 ml-9 space-y-1 text-xs text-[#CBD5E1]">
                  {steps.map((s) =>
                    s.locked ? (
                      <li
                        key={s.key}
                        className="flex items-center justify-between px-3 py-2 opacity-50 cursor-not-allowed"
                      >
                        {s.label}
                        <FaLock size={12} />
                      </li>
                    ) : (
                      <Link
                        key={s.key}
                        href={s.href}
                        className="flex items-center justify-between px-3 py-2 rounded hover:bg-white/5 hover:text-white"
                      >
                        {s.label}
                        {s.approved && (
                          <FaCheckCircle className="text-green-400" size={12} />
                        )}
                      </Link>
                    )
                  )}
                </ul>
              )}
            </li>

            {/* Logout */}
            <li className="mt-6 pt-4 border-t border-white/10">
              <button
                onClick={handleLogout}
                className={`
                  h-11 w-full flex items-center rounded-md transition
                  ${collapsed ? 'justify-center' : 'px-4 gap-3'}
                  bg-[#7F1D1D] text-white hover:bg-[#991B1B]
                `}
                title={collapsed ? 'Logout' : undefined}
              >
                {loading ? <Spinner sm /> : <FaSignOutAlt size={16} />}
                {!collapsed && <span className="text-sm">Logout</span>}
              </button>
            </li>
          </ul>
        </nav>
      </aside>

      {/* Mobile overlay */}
      {mobileOpen && (
        <div
          className="fixed inset-0 bg-black/40 md:hidden z-40"
          onClick={() => setMobileOpen(false)}
        />
      )}
    </>
  );
}
