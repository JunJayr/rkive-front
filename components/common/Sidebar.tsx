
'use client';

import { useEffect, useState } from 'react';
import {
  FaPaperclip,
  FaClipboard,
  FaUsers,
  FaSignOutAlt,
  FaHome,
  FaChevronDown,
  FaLock,
  FaCheckCircle,
  FaSearch,
  FaRegCircle,
  FaBookmark,
} from 'react-icons/fa';
import { HiMenu, HiX } from 'react-icons/hi';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { toast } from 'react-toastify';

import { useAppDispatch } from '@/redux/hooks';
import {
  useLogoutMutation,
} from '@/redux/features/authApiSlice';
import {
  logout as setLogout,
} from '@/redux/features/authSlice';

import Spinner from '@/components/common/Spinner';

type DefenseProgress = {
  conceptApproved: boolean;
  proposalApproved: boolean;
  finalApproved: boolean;
};

const defenseSteps = [
  {
    key: 'concept',
    label: 'Concept Defense',
    href: '/user/defense-application/concept',
  },
  {
    key: 'proposal',
    label: 'Proposal Defense',
    href: '/user/defense-application/proposal',
  },
  {
    key: 'final',
    label: 'Final Defense',
    href: '/user/defense-application/final',
  },
];

const menuItems = [
  {
    name: 'Dashboard',
    href: '/user',
    icon: FaHome,
  },
  {
    name: 'Search Repository',
    href: '/user/search',
    icon: FaSearch,
  },
  {
    name: 'Saved Manuscripts',
    href: '/user/bookmarks',
    icon: FaBookmark,
  },
  {
    name: 'Panel Nomination',
    href: '/user/panel-nomination',
    icon: FaUsers,
  },
  {
    name: 'Submit Thesis',
    href: '/user/submit-study',
    icon: FaPaperclip,
  },
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

  // Placeholder until real approval data is connected.
  // Do not treat these values as actual approval records.
  const defenseProgress: DefenseProgress = {
    conceptApproved: false,
    proposalApproved: false,
    finalApproved: false,
  };

  const isDefenseRoute = pathname.startsWith(
    '/user/defense-application'
  );

  const expanded = mobileOpen || !collapsed;

  useEffect(() => {
    setMobileOpen(false);
  }, [pathname]);

  useEffect(() => {
    if (isDefenseRoute) {
      setDefenseOpen(true);
    }
  }, [isDefenseRoute]);

  const getStepStatus = (key: string) => {
    // Workflow state is not yet fully wired to review records in the sidebar.
    // Keep steps accessible so users can apply; panels review via the panel portal.
    if (key === 'concept') return { approved: defenseProgress.conceptApproved, locked: false };
    if (key === 'proposal') return { approved: defenseProgress.proposalApproved, locked: false };
    return { approved: defenseProgress.finalApproved, locked: false };
  };

  const handleLogout = async () => {
    if (loading) return;

    setLoading(true);

    try {
      await logoutMutation(undefined).unwrap();
      dispatch(setLogout());

      toast.success('Logged out successfully');

      router.replace('/auth/login');
    } catch {
      toast.error('Logout failed. Please try again.');
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

    setDefenseOpen((prev) => !prev);
  };

  return (
    <>
      {/* MOBILE TOP BAR */}
      <div className="fixed inset-x-0 top-0 z-40 flex h-16 items-center justify-between border-b border-slate-200 bg-white px-5 md:hidden">
        <Link
          href="/user"
          className="text-xl font-extrabold tracking-tight text-[#103F78]"
        >
          R<span className="text-amber-400">k</span>ive
        </Link>

        <button
          type="button"
          onClick={() => setMobileOpen(true)}
          aria-label="Open navigation"
          className="rounded-xl p-2 text-[#103F78] hover:bg-slate-100"
        >
          <HiMenu size={24} />
        </button>
      </div>

      {/* MOBILE OVERLAY */}
      {mobileOpen && (
        <button
          type="button"
          aria-label="Close navigation"
          onClick={() => setMobileOpen(false)}
          className="fixed inset-0 z-40 bg-slate-950/60 md:hidden"
        />
      )}

      {/* SIDEBAR */}
      <aside
        onMouseEnter={() => {
          if (window.innerWidth >= 768) {
            setCollapsed(false);
          }
        }}
        onMouseLeave={() => {
          if (window.innerWidth >= 768) {
            setCollapsed(true);
          }
        }}
        className={`
          fixed left-0 top-0 z-50 flex h-screen flex-col
          overflow-hidden bg-[#103F78] text-white
          shadow-xl transition-[width,transform] duration-300
          md:sticky md:top-0 md:shrink-0
          ${
            expanded
              ? 'w-72'
              : 'w-72 md:w-[76px]'
          }
          ${
            mobileOpen
              ? 'translate-x-0'
              : '-translate-x-full md:translate-x-0'
          }
        `}
      >

        {/* LOGO */}
        <div className="flex h-20 shrink-0 items-center border-b border-white/10 px-4">
          <Link
            href="/user"
            className="flex min-w-0 flex-1 items-center gap-3"
          >
            <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-[#FBBF24] font-black text-[#103F78]">
              R
            </div>

            <div
              className={`min-w-0 overflow-hidden transition-opacity ${
                expanded ? 'opacity-100' : 'opacity-0'
              }`}
            >
              <p className="text-xl font-extrabold tracking-tight">
                R<span className="text-amber-400">k</span>ive
              </p>

              <p className="whitespace-nowrap text-[10px] uppercase tracking-widest text-blue-200">
                Academic Repository
              </p>
            </div>
          </Link>

          {mobileOpen && (
            <button
              type="button"
              onClick={() => setMobileOpen(false)}
              aria-label="Close sidebar"
              className="rounded-lg p-2 hover:bg-white/10 md:hidden"
            >
              <HiX size={22} />
            </button>
          )}
        </div>

        {/* NAVIGATION */}
        <nav
          aria-label="Main navigation"
          className="flex-1 overflow-y-auto overflow-x-hidden px-3 py-6"
        >
          <p
            className={`mb-4 whitespace-nowrap px-3 text-[10px] font-bold uppercase tracking-[0.2em] text-blue-200/70 ${
              expanded ? 'opacity-100' : 'opacity-0'
            }`}
          >
            Workspace
          </p>

          <ul className="space-y-1.5">

            {menuItems.map((item) => {
              const Icon = item.icon;

              const active =
                pathname === item.href ||
                (
                  item.href !== '/user' &&
                  pathname.startsWith(`${item.href}/`)
                );

              return (
                <li key={item.name}>
                  <Link
                    href={item.href}
                    title={!expanded ? item.name : undefined}
                    aria-current={active ? 'page' : undefined}
                    className={`
                      flex h-12 items-center rounded-xl
                      transition-colors duration-200
                      ${
                        expanded
                          ? 'gap-3 px-4'
                          : 'justify-center'
                      }
                      ${
                        active
                          ? 'bg-white text-[#103F78] shadow-sm'
                          : 'text-blue-100 hover:bg-white/10 hover:text-white'
                      }
                    `}
                  >
                    <Icon
                      size={18}
                      className="shrink-0"
                    />

                    {expanded && (
                      <span className="whitespace-nowrap text-sm font-semibold">
                        {item.name}
                      </span>
                    )}
                  </Link>
                </li>
              );
            })}

            {/* DEFENSE APPLICATION */}
            <li className="pt-5">
              <div className="mb-4 border-t border-white/10" />

              {expanded && (
                <p className="mb-3 px-3 text-[10px] font-bold uppercase tracking-[0.2em] text-blue-200/70">
                  Academic Workflow
                </p>
              )}

              <button
                type="button"
                onClick={handleDefenseToggle}
                aria-expanded={expanded && defenseOpen}
                title={!expanded ? 'Defense Application' : undefined}
                className={`
                  flex h-12 w-full items-center rounded-xl
                  transition-colors duration-200
                  ${
                    expanded
                      ? 'justify-between px-4'
                      : 'justify-center'
                  }
                  ${
                    isDefenseRoute
                      ? 'bg-white/15 text-white'
                      : 'text-blue-100 hover:bg-white/10'
                  }
                `}
              >
                <span className="flex items-center gap-3">
                  <FaClipboard size={18} />

                  {expanded && (
                    <span className="whitespace-nowrap text-sm font-semibold">
                      Defense Application
                    </span>
                  )}
                </span>

                {expanded && (
                  <FaChevronDown
                    size={12}
                    className={`transition-transform duration-200 ${
                      defenseOpen ? 'rotate-180' : ''
                    }`}
                  />
                )}
              </button>

              {/* DEFENSE STEPS */}
              {expanded && defenseOpen && (
                <ul className="ml-5 mt-3 space-y-1 border-l border-white/20 pl-4">
                  {defenseSteps.map((step) => {
                    const status = getStepStatus(step.key);
                    const active = pathname === step.href;

                    if (status.locked) {
                      return (
                        <li
                          key={step.key}
                          className="flex min-h-11 items-center justify-between gap-2 rounded-lg px-3 py-2 text-blue-200/45"
                          title="Complete the previous defense stage first"
                        >
                          <span className="text-xs font-medium">
                            {step.label}
                          </span>

                          <FaLock size={11} />
                        </li>
                      );
                    }

                    return (
                      <li key={step.key}>
                        <Link
                          href={step.href}
                          aria-current={active ? 'page' : undefined}
                          className={`
                            flex min-h-11 items-center justify-between gap-2 rounded-lg px-3 py-2
                            transition-colors
                            ${
                              active
                                ? 'bg-[#FBBF24] font-bold text-[#103F78]'
                                : 'text-blue-100 hover:bg-white/10 hover:text-white'
                            }
                          `}
                        >
                          <span className="text-xs font-medium">
                            {step.label}
                          </span>

                          {status.approved ? (
                            <FaCheckCircle
                              size={13}
                              className="text-emerald-400"
                            />
                          ) : (
                            <FaRegCircle
                              size={12}
                              className={active ? 'text-[#103F78]' : 'text-blue-300/50'}
                            />
                          )}
                        </Link>
                      </li>
                    );
                  })}
                </ul>
              )}
            </li>
          </ul>
        </nav>

        {/* LOGOUT */}
        <div className="shrink-0 border-t border-white/10 p-3">
          <button
            type="button"
            onClick={handleLogout}
            disabled={loading}
            title={!expanded ? 'Logout' : undefined}
            className={`
              flex h-12 w-full items-center rounded-xl
              text-blue-100 transition-colors
              hover:bg-red-500/20 hover:text-red-200
              disabled:opacity-50
              ${
                expanded
                  ? 'gap-3 px-4'
                  : 'justify-center'
              }
            `}
          >
            {loading ? (
              <Spinner sm />
            ) : (
              <FaSignOutAlt size={18} />
            )}

            {expanded && (
              <span className="text-sm font-semibold">
                Logout
              </span>
            )}
          </button>
        </div>
      </aside>
    </>
  );
}
