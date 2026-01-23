'use client';

import { useState, useEffect, FormEvent } from 'react';
import { useRouter } from 'next/navigation';
import Sidebar from '@/components/common/Sidebar';
import Footer from '@/components/common/Footer';
import Spinner from '@/components/common/Spinner';
import Layout from '@/components/utils/Layout';
import { FiSearch } from 'react-icons/fi';

export default function Dashboard() {
  const [searchTerm, setSearchTerm] = useState('');
  const [loading, setLoading] = useState(false);
  const [mounted, setMounted] = useState(false);
  const router = useRouter();

  useEffect(() => {
    setMounted(true);
  }, []);

  const handleSearch = (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (searchTerm.trim()) {
      setLoading(true);
      router.push(`/user/search?q=${encodeURIComponent(searchTerm)}`);
    }
  };

  return (
    <Layout>
      <div className="flex h-screen bg-white text-[#0A4D9C]">
        {/* Sidebar */}
        <Sidebar />

        {/* Main Content */}
        <main className="flex flex-col flex-grow items-center justify-center px-6 py-12 overflow-y-auto">
          <div className="w-full max-w-4xl text-center">
            {/* Title */}
            <h1 className="text-5xl font-extrabold tracking-tight select-none">
              R<span className="text-[#FBBF24]">k</span>ive
            </h1>

            <p className="mt-3 text-gray-600 text-lg leading-relaxed">
              An Academic Repository for Capstone and Thesis Projects<br />
              <span className="text-sm text-gray-500">
                College of Information Technology and Computing – USTP
              </span>
            </p>

            {/* Search */}
            <form
              onSubmit={handleSearch}
              className="mt-12 flex items-center gap-4 border border-gray-300 rounded-full px-6 py-4 shadow-sm focus-within:ring-2 focus-within:ring-[#FBBF24] transition bg-white"
            >
              <FiSearch className="text-gray-400" size={24} />

              <input
                type="text"
                name="q"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                placeholder="Search by title, keyword, author, or year"
                className="flex-grow outline-none text-gray-700 text-base placeholder-gray-400"
                required
              />

              <button
                type="submit"
                disabled={loading}
                className="bg-[#FBBF24] text-[#0A4D9C] font-semibold px-6 py-2 rounded-full hover:opacity-90 transition disabled:opacity-50"
              >
                {mounted && loading ? <Spinner sm /> : 'Search'}
              </button>
            </form>

            {/* Actions */}
            <div className="mt-10 flex justify-center gap-6 flex-wrap">
              <button
                className="px-6 py-2 border border-[#0A4D9C] text-[#0A4D9C] rounded-full font-medium hover:bg-[#0A4D9C] hover:text-white transition"
              >
                Browse All Repositories
              </button>

              <button
                className="px-6 py-2 bg-[#0A4D9C] text-white rounded-full font-medium hover:opacity-90 transition"
              >
                View Latest Submissions
              </button>
            </div>
          </div>
        </main>

        {/* Footer */}
        <Footer />
      </div>
    </Layout>
  );
}
