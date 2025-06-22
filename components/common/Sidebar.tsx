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

  if (!hasMounted) return null; // Prevent hydration mismatch

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
      {/* Menu Icon */}
      <button
        aria-label="Toggle sidebar"
        className="p-2 text-yellow rounded-md hover:bg-gray-200 fixed top-4 left-4 z-50"
        onClick={toggleSidebar}
        style={{ backgroundColor: 'transparent' }}
      >
        <AiOutlineMenu size={24} />
      </button>

      {/* Overlay */}
      {isOpen && (
        <div
          className="fixed inset-0 bg-black bg-opacity-10 backdrop-blur-sm z-40"
          onClick={closeSidebar}
        />
      )}

      {/* Full-screen Spinner */}
      {showFullScreenSpinner && (
        <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-50 z-50">
          <Spinner />
        </div>
      )}

      {/* Sidebar */}
      <aside
        className={`fixed top-0 left-0 h-screen bg-gray-800 transform transition-transform duration-300 z-50 w-64 ${
          isOpen ? 'translate-x-0' : '-translate-x-full'
        }`}
      >
        {/* Menu Icon */}
      <button
        aria-label="Toggle sidebar"
        className="p-2 text-yellow rounded-md hover:bg-gray-200 fixed top-4 left-4 z-50"
        onClick={toggleSidebar}
        style={{ backgroundColor: 'transparent' }}
      >
        <AiOutlineMenu size={24} />
      </button>
        <div className="py-3 text-2xl text-center tracking-widest bg-gray-800 border-b-2 border-gray-800 mb-8">
          <Link href="/user" className="text-white" onClick={closeSidebar}>
            Rkive
          </Link>
        </div>

        {/* Sidebar Menu */}
        <nav className="text-sm text-gray-300">
          <ul className="flex flex-col">
            {menuItems.map((item) => (
              <li
                key={item.name}
                className={`px-4 cursor-pointer ${
                  pathname === item.href ? 'bg-gray-700 text-white' : 'hover:bg-gray-700'
                }`}
              >
                <Link href={item.href} className="py-3 flex items-center" onClick={closeSidebar}>
                  {item.icon}
                  {item.name}
                </Link>
              </li>
            ))}

            {/* Dropdown - Defense Application */}
            <li className="text-gray-300">
              <div
                onClick={toggleDefenseDropdown}
                className={`flex items-center justify-between py-3 px-4 w-full cursor-pointer transition-colors ${
                  defenseDropdownOpen || pathname?.startsWith('/user/defense-application')
                    ? 'bg-gray-700 text-white'
                    : 'hover:bg-gray-700'
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
                <ul className="ml-10">
                  {['concept', 'proposal', 'final'].map((type) => (
                    <li
                      key={type}
                      className={`py-2 ${
                        pathname === `/user/defense-application/${type}` ? 'text-white' : ''
                      }`}
                    >
                      <Link href={`/user/defense-application/${type}`} onClick={closeSidebar}>
                        {`${type.charAt(0).toUpperCase() + type.slice(1)} Defense`}
                      </Link>
                    </li>
                  ))}
                </ul>
              )}
            </li>

            {/* Logout */}
            <li className="px-4 cursor-pointer hover:bg-gray-700">
              <button
                onClick={handleLogout}
                className="py-3 flex items-center w-full text-left text-gray-300 hover:text-white"
              >
                <FaSignOutAlt className="w-4 mr-3" />
                Logout
              </button>
            </li>
          </ul>
        </nav>
      </aside>
    </div>
  );
}
