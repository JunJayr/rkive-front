'use client';

import React, { useState } from 'react';
import { AiOutlineMenu } from 'react-icons/ai';
import {
  FaUser,
  FaPaperclip,
  FaClipboard,
  FaUsers,
  FaSignOutAlt,
  FaHome,
} from 'react-icons/fa';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation'; // ✅ FIX
import { toast } from 'react-toastify';
import { useAppDispatch } from '@/redux/hooks';
import { useLogoutMutation } from '@/redux/features/authApiSlice';
import { logout as setLogout } from '@/redux/features/authSlice';
import Spinner from '@/components/common/Spinner';

export default function Sidebar() {
  const [isOpen, setIsOpen] = useState(false);
  const pathname = usePathname();
  const router = useRouter(); // ✅ App Router version
  const dispatch = useAppDispatch();
  const [logoutMutation] = useLogoutMutation();

  const [showFullScreenSpinner, setShowFullScreenSpinner] = useState(false);

  const toggleSidebar = () => setIsOpen(!isOpen);
  const closeSidebar = () => setIsOpen(false);

  const handleLogout = async () => {
    setShowFullScreenSpinner(true);

    try {
      await logoutMutation(undefined).unwrap();
      dispatch(setLogout());
      toast.success('Logged out');

      router.push('/auth/login'); // ✅ works correctly now
    } catch (error) {
      console.error(error);
      toast.error('Failed to logout');
    } finally {
      setShowFullScreenSpinner(false);
      closeSidebar();
    }
  };

  const menuItems = [
    { name: 'Dashboard', href: '/admin', icon: <FaHome className="w-4 mr-3" /> },
    { name: 'Generated Documents', href: '/admin/documents', icon: <FaUser className="w-4 mr-3" /> },
    { name: 'Manuscript', href: '/admin/manuscript', icon: <FaUsers className="w-4 mr-3" /> },
    { name: 'ISO Application Form', href: '/admin/forms/application', icon: <FaClipboard className="w-4 mr-3" /> },
    { name: 'ISO Panel Nomination', href: '/admin/forms/nomination', icon: <FaPaperclip className="w-4 mr-3" /> },
  ];

  return (
    <div className="relative">
      {/* Menu Button */}
      <button
        className="p-2 text-yellow rounded-md fixed top-4 left-4 z-50"
        onClick={toggleSidebar}
      >
        <AiOutlineMenu size={24} />
      </button>

      {/* Overlay */}
      {isOpen && (
        <div
          className="fixed inset-0 bg-black/10 backdrop-blur-sm z-40"
          onClick={closeSidebar}
        />
      )}

      {/* Fullscreen Spinner */}
      {showFullScreenSpinner && (
        <div className="fixed inset-0 flex items-center justify-center bg-black/50 z-50">
          <Spinner />
        </div>
      )}

      {/* Sidebar */}
      <aside
        className={`fixed top-0 left-0 h-screen w-64 bg-gray-800 z-50 transform transition-transform duration-300 ${
          isOpen ? 'translate-x-0' : '-translate-x-full'
        }`}
      >
        <div className="py-3 text-2xl text-center border-b mb-8">
          <Link href="/admin" className="text-white" onClick={closeSidebar}>
            Rkive
          </Link>
        </div>

        <nav className="text-sm text-gray-300">
          <ul className="flex flex-col">
            {menuItems.map((item) => (
              <li
                key={item.name}
                className={`px-4 ${
                  pathname === item.href
                    ? 'bg-gray-700 text-white'
                    : 'hover:bg-gray-700'
                }`}
              >
                <Link
                  href={item.href}
                  className="py-3 flex items-center"
                  onClick={closeSidebar}
                >
                  {item.icon}
                  {item.name}
                </Link>
              </li>
            ))}

            <li className="px-4 hover:bg-gray-700">
              <button
                onClick={handleLogout}
                className="py-3 flex items-center w-full text-left"
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
