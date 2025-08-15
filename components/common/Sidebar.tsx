'use client';

import React, { useState, useEffect } from 'react';
import { AiOutlineMenu } from 'react-icons/ai';
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
      {/* Toggle Button */}
      <button
        aria-label="Toggle sidebar"
        className="p-2 text-[#FBBF24] bg-[#1E2A38] hover:bg-[#2A3646] rounded-full fixed top-4 left-4 z-50 shadow-lg border border-[#FBBF24]/50"
        onClick={toggleSidebar}
      >
        <AiOutlineMenu size={24} />
      </button>

      {isOpen && (
        <div
          className="fixed inset-0 bg-black bg-opacity-40 backdrop-blur-sm z-40"
          onClick={closeSidebar}
        />
      )}

      {showFullScreenSpinner && (
        <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-50 z-50">
          <Spinner />
        </div>
      )}

      {/* Sidebar */}
      <aside
        className={`fixed top-0 left-0 h-screen w-72 transform transition-transform duration-300 z-50 
        bg-[#1E2A38]/95 backdrop-blur-lg border-r border-[#FBBF24]/30 shadow-xl
        ${isOpen ? 'translate-x-0' : '-translate-x-full'}`}
      >
        <button
        aria-label="Toggle sidebar"
        className="p-2 text-[#FBBF24] bg-[#1E2A38] hover:bg-[#2A3646] rounded-full fixed top-4 left-4 z-50 shadow-lg border border-[#FBBF24]/50"
        onClick={toggleSidebar}
      >
        <AiOutlineMenu size={24} />
      </button>
        {/* Brand */}
        <div className="py-5 px-6 text-3xl font-extrabold tracking-wide text-[#FBBF24] border-b border-[#FBBF24]/20 text-center">
          <Link href="/user" onClick={closeSidebar}>
            Rkive
          </Link>
        </div>

        {/* Navigation */}
        <nav className="mt-6 text-sm font-medium text-gray-200">
          <ul className="flex flex-col space-y-1">
            {menuItems.map((item) => (
              <li key={item.name}>
                <Link
                  href={item.href}
                  onClick={closeSidebar}
                  className={`flex items-center px-6 py-3 rounded-lg mx-3 transition-all
                    ${pathname === item.href
                      ? 'bg-[#FBBF24] text-[#1E2A38] font-semibold shadow-md'
                      : 'hover:bg-[#FBBF24]/10 hover:text-[#FBBF24]'
                    }`}
                >
                  {item.icon}
                  {item.name}
                </Link>
              </li>
            ))}

            {/* Defense Dropdown */}
            <li>
              <div
                onClick={toggleDefenseDropdown}
                className={`flex items-center justify-between px-6 py-3 rounded-lg mx-3 cursor-pointer transition-all
                  ${(pathname?.startsWith('/user/defense-application') || defenseDropdownOpen)
                    ? 'bg-[#FBBF24] text-[#1E2A38] font-semibold shadow-md'
                    : 'hover:bg-[#FBBF24]/10 hover:text-[#FBBF24]'
                  }`}
              >
                <span className="flex items-center">
                  <FaClipboard className="w-4 mr-3" />
                  Defense Application
                </span>
                <FaChevronDown
                  className={`transition-transform duration-300 ${defenseDropdownOpen ? 'rotate-180' : ''}`}
                />
              </div>
              {defenseDropdownOpen && (
                <ul className="ml-10 mt-1 space-y-1">
                  {['concept', 'proposal', 'final'].map((type) => (
                    <li key={type}>
                      <Link
                        href={`/user/defense-application/${type}`}
                        onClick={closeSidebar}
                        className={`block px-4 py-2 rounded-md transition-all
                          ${pathname === `/user/defense-application/${type}`
                            ? 'text-[#FBBF24] font-semibold'
                            : 'hover:text-[#FBBF24]'
                          }`}
                      >
                        {`${type.charAt(0).toUpperCase() + type.slice(1)} Defense`}
                      </Link>
                    </li>
                  ))}
                </ul>
              )}
            </li>

            {/* Logout */}
            <li className="px-6 mt-4">
              <button
                onClick={handleLogout}
                className="w-full flex items-center gap-3 px-4 py-3 rounded-lg transition-all
                  bg-red-600 hover:bg-red-700 text-white shadow-md"
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
