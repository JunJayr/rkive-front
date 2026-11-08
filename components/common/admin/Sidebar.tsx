
'use client';

import { useState } from 'react';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { toast } from 'react-toastify';

import {
  FiMenu,
  FiX,
  FiHome,
  FiFileText,
  FiBookOpen,
  FiClipboard,
  FiUsers,
  FiLogOut,
  FiChevronLeft,
  FiChevronRight,
  FiShield,
} from 'react-icons/fi';

import { useAppDispatch } from '@/redux/hooks';
import { useLogoutMutation } from '@/redux/features/authApiSlice';
import { logout as setLogout } from '@/redux/features/authSlice';
import Spinner from '@/components/common/Spinner';

const menuItems = [
  {
    name: 'Dashboard',
    href: '/admin',
    icon: FiHome,
  },
  {
    name: 'Manuscript',
    href: '/admin/manuscript',
    icon: FiBookOpen,
  },
  {
    name: 'ISO Application Form',
    href: '/admin/forms/application',
    icon: FiClipboard,
  },
  {
    name: 'ISO Panel Nomination',
    href: '/admin/forms/nomination',
    icon: FiUsers,
  },
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

  const handleLogout = async () => {
    if (loggingOut) return;

    setLoggingOut(true);

    try {
      await logoutMutation(undefined).unwrap();

      dispatch(setLogout());

      toast.success('Successfully logged out');

      closeMobile();
      router.replace('/auth/login');
    } catch (error) {
      console.error('Logout failed:', error);
      toast.error('Failed to log out. Please try again.');
    } finally {
      setLoggingOut(false);
    }
  };

  const isActive = (href: string) => {
    if (href === '/admin') {
      return pathname === '/admin';
    }

    return (
      pathname === href ||
      pathname.startsWith(`${href}/`)
    );
  };

  const navigation = (
    <div className="flex h-full flex-col">

      {/* BRAND HEADER */}
      <div
        className={`
          flex h-20 shrink-0 items-center
          border-b border-white/10
          ${collapsed ? 'justify-center px-3' : 'px-5'}
        `}
      >
        <Link
          href="/admin"
          onClick={closeMobile}
          className="flex min-w-0 items-center gap-3"
        >
          <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-[#FBBF24] text-[#103F78] shadow-sm">
            <FiBookOpen size={22} />
          </div>

          {!collapsed && (
            <div className="min-w-0">
              <h1 className="text-xl font-extrabold tracking-wide text-white">
                RKIVE
              </h1>

              <p className="text-[10px] font-semibold uppercase tracking-[0.16em] text-blue-200">
                Admin Portal
              </p>
            </div>
          )}
        </Link>
      </div>

      {/* NAVIGATION */}
      <div className="flex-1 overflow-y-auto px-3 py-6">
        {!collapsed && (
          <p className="mb-4 px-3 text-[10px] font-bold uppercase tracking-[0.18em] text-blue-200/70">
            Workspace
          </p>
        )}

        <nav aria-label="Admin navigation">
          <ul className="space-y-2">
            {menuItems.map((item) => {
              const active = isActive(item.href);
              const Icon = item.icon;

              return (
                <li key={item.href}>
                  <Link
                    href={item.href}
                    onClick={closeMobile}
                    title={collapsed ? item.name : undefined}
                    aria-current={active ? 'page' : undefined}
                    className={`
                      group flex min-h-12 items-center
                      rounded-xl px-3 py-3
                      text-sm font-medium
                      transition-all duration-200
                      ${
                        active
                          ? 'bg-[#FBBF24] font-bold text-[#103F78] shadow-sm'
                          : 'text-blue-100 hover:bg-white/10 hover:text-white'
                      }
                      ${collapsed ? 'justify-center' : 'gap-3'}
                    `}
                  >
                    <Icon
                      size={20}
                      className="shrink-0"
                    />

                    {!collapsed && (
                      <span className="min-w-0 flex-1">
                        {item.name}
                      </span>
                    )}

                    {active && !collapsed && (
                      <span className="h-2 w-2 shrink-0 rounded-full bg-[#103F78]" />
                    )}
                  </Link>
                </li>
              );
            })}
          </ul>
        </nav>
      </div>

      {/* ADMIN ACCOUNT */}
      <div className="shrink-0 border-t border-white/10 p-3">
        {!collapsed && (
          <div className="mb-3 flex items-center gap-3 rounded-xl bg-white/10 px-3 py-3">
            <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-[#FBBF24] text-[#103F78]">
              <FiShield size={19} />
            </div>

            <div className="min-w-0">
              <p className="text-sm font-semibold text-white">
                Administrator
              </p>

              <p className="text-xs text-blue-200">
                RKIVE Management
              </p>
            </div>
          </div>
        )}

        <button
          type="button"
          onClick={handleLogout}
          disabled={loggingOut}
          title={collapsed ? 'Sign Out' : undefined}
          className={`
            flex w-full min-h-12 items-center
            rounded-xl px-3 py-3
            text-sm font-semibold text-blue-100
            transition hover:bg-red-500/15
            hover:text-red-200
            disabled:cursor-not-allowed
            disabled:opacity-50
            ${collapsed ? 'justify-center' : 'gap-3'}
          `}
        >
          <FiLogOut size={20} className="shrink-0" />

          {!collapsed && (
            <span>
              {loggingOut ? 'Signing out...' : 'Sign Out'}
            </span>
          )}
        </button>
      </div>
    </div>
  );

  return (
    <>
      {/* MOBILE TOP BAR */}
      <div className="fixed inset-x-0 top-0 z-40 flex h-16 items-center justify-between border-b border-slate-200 bg-white px-5 shadow-sm md:hidden">
        <div className="flex items-center gap-2">
          <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-[#103F78] text-[#FBBF24]">
            <FiBookOpen size={18} />
          </div>

          <span className="text-lg font-extrabold tracking-wide text-[#103F78]">
            RKIVE
          </span>

          <span className="rounded-md bg-amber-100 px-2 py-1 text-[10px] font-bold text-amber-800">
            ADMIN
          </span>
        </div>

        <button
          type="button"
          onClick={() => setMobileOpen(true)}
          aria-label="Open admin menu"
          className="rounded-lg p-2 text-[#103F78] hover:bg-slate-100"
        >
          <FiMenu size={24} />
        </button>
      </div>

      {/* MOBILE OVERLAY */}
      {mobileOpen && (
        <div
          className="fixed inset-0 z-40 bg-slate-950/50 backdrop-blur-[2px] md:hidden"
          onClick={closeMobile}
          aria-hidden="true"
        />
      )}

      {/* MOBILE SIDEBAR */}
      <aside
        className={`
          fixed inset-y-0 left-0 z-50
          w-72 max-w-[85vw]
          bg-[#103F78]
          shadow-2xl
          transition-transform duration-300
          md:hidden
          ${
            mobileOpen
              ? 'translate-x-0'
              : '-translate-x-full'
          }
        `}
      >
        <button
          type="button"
          onClick={closeMobile}
          aria-label="Close admin menu"
          className="absolute right-3 top-5 z-10 rounded-lg p-2 text-white hover:bg-white/10"
        >
          <FiX size={21} />
        </button>

        {/* Mobile navigation always shows labels */}
        <div className="flex h-full flex-col">
          <div className="flex h-20 items-center gap-3 border-b border-white/10 px-5">
            <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-[#FBBF24] text-[#103F78]">
              <FiBookOpen size={22} />
            </div>

            <div>
              <h2 className="text-xl font-extrabold text-white">
                RKIVE
              </h2>
              <p className="text-[10px] uppercase tracking-widest text-blue-200">
                Admin Portal
              </p>
            </div>
          </div>

          <nav
            aria-label="Mobile admin navigation"
            className="flex-1 overflow-y-auto px-3 py-6"
          >
            <p className="mb-4 px-3 text-[10px] font-bold uppercase tracking-widest text-blue-200/70">
              Workspace
            </p>

            <ul className="space-y-2">
              {menuItems.map((item) => {
                const active = isActive(item.href);
                const Icon = item.icon;

                return (
                  <li key={item.href}>
                    <Link
                      href={item.href}
                      onClick={closeMobile}
                      aria-current={active ? 'page' : undefined}
                      className={`
                        flex min-h-12 items-center gap-3
                        rounded-xl px-3 py-3 text-sm
                        transition
                        ${
                          active
                            ? 'bg-[#FBBF24] font-bold text-[#103F78]'
                            : 'text-blue-100 hover:bg-white/10'
                        }
                      `}
                    >
                      <Icon size={20} />
                      <span>{item.name}</span>
                    </Link>
                  </li>
                );
              })}
            </ul>
          </nav>

          <div className="border-t border-white/10 p-3">
            <button
              type="button"
              onClick={handleLogout}
              disabled={loggingOut}
              className="flex min-h-12 w-full items-center gap-3 rounded-xl px-3 py-3 text-sm font-semibold text-blue-100 hover:bg-red-500/15 hover:text-red-200 disabled:opacity-50"
            >
              <FiLogOut size={20} />
              {loggingOut ? 'Signing out...' : 'Sign Out'}
            </button>
          </div>
        </div>
      </aside>

      {/* DESKTOP SIDEBAR */}
      <aside
        className={`
          relative hidden h-screen shrink-0
          flex-col bg-[#103F78]
          transition-all duration-300
          md:sticky md:top-0 md:flex
          ${collapsed ? 'w-[76px]' : 'w-64'}
        `}
      >
        {navigation}

        {/* COLLAPSE BUTTON */}
        <button
          type="button"
          onClick={() => setCollapsed(!collapsed)}
          aria-label={
            collapsed ? 'Expand sidebar' : 'Collapse sidebar'
          }
          title={
            collapsed ? 'Expand sidebar' : 'Collapse sidebar'
          }
          className="absolute -right-3 top-24 z-20 flex h-7 w-7 items-center justify-center rounded-full border border-slate-200 bg-white text-[#103F78] shadow-md transition hover:bg-amber-50"
        >
          {collapsed ? (
            <FiChevronRight size={16} />
          ) : (
            <FiChevronLeft size={16} />
          )}
        </button>
      </aside>

      {/* LOGOUT LOADING OVERLAY */}
      {loggingOut && (
        <div
          role="status"
          aria-label="Signing out"
          className="fixed inset-0 z-[100] flex items-center justify-center bg-slate-950/50 backdrop-blur-sm"
        >
          <div className="flex flex-col items-center gap-4 rounded-2xl bg-white px-10 py-8 shadow-xl">
            <Spinner />

            <p className="text-sm font-bold text-[#103F78]">
              Signing out...
            </p>
          </div>
        </div>
      )}
    </>
  );
}
