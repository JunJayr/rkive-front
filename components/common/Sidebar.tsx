'use client';

import React, { useState, useEffect } from 'react';
import { AiOutlineMenu, AiOutlineInfoCircle } from 'react-icons/ai';
import {
  FaUser,
  FaPaperclip,
  FaClipboard,
  FaUsers,
  FaSignOutAlt,
  FaHome,
  FaChevronDown,
} from 'react-icons/fa';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { toast } from 'react-toastify';
import { useAppDispatch } from '@/redux/hooks';
import { useLogoutMutation } from '@/redux/features/authApiSlice';
import { logout as setLogout } from '@/redux/features/authSlice';
import Spinner from '@/components/common/Spinner';

export default function Sidebar() {
  const [isOpen, setIsOpen] = useState(false);
  const [defenseDropdownOpen, setDefenseDropdownOpen] = useState(false);
  const [showFullScreenSpinner, setShowFullScreenSpinner] = useState(false);
  const [hasMounted, setHasMounted] = useState(false);

  const pathname = usePathname();
  const dispatch = useAppDispatch();
  const [logoutMutation] = useLogoutMutation();

  useEffect(() => {
    setHasMounted(true);
  }, []);

  if (!hasMounted) return null;

  const toggleSidebar = () => setIsOpen(!isOpen);
  const closeSidebar = () => setIsOpen(false);
  const toggleDefenseDropdown = () => setDefenseDropdownOpen(!defenseDropdownOpen);

  const handleLogout = async () => {
    setShowFullScreenSpinner(true);
    try {
      await logoutMutation(undefined).unwrap();
      dispatch(setLogout());
      toast.success('Logged out');
    } catch (error) {
      toast.error('Failed to logout');
    } finally {
      setShowFullScreenSpinner(false);
      closeSidebar();
    }
  };

  const menuItems = [
    { name: 'Dashboard', href: '/user', icon: <FaHome className="w-4 mr-3" /> },
    { name: 'Panel Nomination', href: '/user/panel-nomination', icon: <FaUsers className="w-4 mr-3" /> },
    { name: 'Submit Thesis', href: '/user/submit-study', icon: <FaPaperclip className="w-4 mr-3" /> },
  ];

  return (
    <div className="relative">
      <button
        aria-label="Toggle sidebar"
        className="p-2 text-white bg-indigo-600 hover:bg-indigo-700 rounded-full fixed top-4 left-4 z-50 shadow-md"
        onClick={toggleSidebar}
      >
        <AiOutlineMenu size={24} />
      </button>

      {isOpen && (
        <div
          className="fixed inset-0 bg-black bg-opacity-10 backdrop-blur-sm z-40"
          onClick={closeSidebar}
        />
      )}

      {showFullScreenSpinner && (
        <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-50 z-50">
          <Spinner />
        </div>
      )}

      <aside
        className={`fixed top-0 left-0 h-screen bg-white dark:bg-gray-900 transform transition-transform duration-300 z-50 w-72 shadow-xl border-r border-gray-200 dark:border-gray-700 ${
          isOpen ? 'translate-x-0' : '-translate-x-full'
        }`}
      >
        <button
        aria-label="Toggle sidebar"
        className="p-2 text-white bg-indigo-600 hover:bg-indigo-700 rounded-full fixed top-4 left-4 z-50 shadow-md"
        onClick={toggleSidebar}
      >
        <AiOutlineMenu size={24} />
      </button>
      
        <div className="py-4 px-6 text-3xl font-bold tracking-wider text-indigo-600 dark:text-white border-b border-gray-200 dark:border-gray-700 text-center">
          <Link href="/user" onClick={closeSidebar}>
            Rkive
          </Link>
        </div>

        <nav className="text-sm font-medium text-gray-700 dark:text-gray-300 mt-6">
          <ul className="flex flex-col space-y-1">
            {menuItems.map((item) => (
              <li key={item.name}>
                <Link
                  href={item.href}
                  onClick={closeSidebar}
                  className={`flex items-center px-6 py-3 rounded-xl mx-3 transition-colors ${
                    pathname === item.href
                      ? 'bg-indigo-100 text-indigo-700 dark:bg-indigo-700 dark:text-white'
                      : 'hover:bg-indigo-50 dark:hover:bg-gray-800'
                  }`}
                >
                  {item.icon}
                  {item.name}
                </Link>
              </li>
            ))}

            <li>
              <div
                onClick={toggleDefenseDropdown}
                className={`flex items-center justify-between px-6 py-3 rounded-xl mx-3 cursor-pointer transition-colors ${
                  pathname?.startsWith('/user/defense-application') || defenseDropdownOpen
                    ? 'bg-indigo-100 text-indigo-700 dark:bg-indigo-700 dark:text-white'
                    : 'hover:bg-indigo-50 dark:hover:bg-gray-800'
                }`}
              >
                <span className="flex items-center">
                  <FaClipboard className="w-4 mr-3" />
                  Defense Application
                </span>
                <FaChevronDown
                  className={`transition-transform duration-300 ${
                    defenseDropdownOpen ? 'rotate-180' : ''
                  }`}
                />
              </div>
              {defenseDropdownOpen && (
                <ul className="ml-10 mt-1 space-y-1">
                  {['concept', 'proposal', 'final'].map((type) => (
                    <li key={type}>
                      <Link
                        href={`/user/defense-application/${type}`}
                        onClick={closeSidebar}
                        className={`block px-4 py-2 rounded-md transition ${
                          pathname === `/user/defense-application/${type}`
                            ? 'text-indigo-700 dark:text-white font-semibold'
                            : 'hover:text-indigo-700 dark:hover:text-white'
                        }`}
                      >
                        {`${type.charAt(0).toUpperCase() + type.slice(1)} Defense`}
                      </Link>
                    </li>
                  ))}
                </ul>
              )}
            </li>

            <li className="px-6">
              <button
                onClick={handleLogout}
                className="w-full flex items-center gap-3 px-4 py-3 mt-4 bg-red-500 hover:bg-red-600 text-white rounded-xl transition-colors"
              >
                <FaSignOutAlt className="w-4" />
                Logout
              </button>
            </li>

          </ul>
        </nav>
      </aside>
    </div>
  );
}
