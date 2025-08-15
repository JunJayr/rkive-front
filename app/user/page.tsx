'use client';

import { useState, FormEvent } from 'react';
import { useRouter } from 'next/navigation';
import Sidebar from '@/components/common/Sidebar';
import Footer from '@/components/common/Footer';
import Spinner from '@/components/common/Spinner';
import Layout from '@/components/utils/Layout';
import { FiSearch } from 'react-icons/fi';

export default function Dashboard() {
  const [searchTerm, setSearchTerm] = useState('');
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  const handleSearch = (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (searchTerm.trim()) {
      setLoading(true);
      router.push(`/user/search?q=${encodeURIComponent(searchTerm)}`);
    }
  };

  return (
    <Layout>
      <div className="flex h-screen relative bg-gradient-to-br from-indigo-100 via-white to-purple-100 dark:from-gray-900 dark:via-gray-800 dark:to-black">
        {/* Sidebar */}
        <Sidebar />

        {/* Main Content */}
        <div className="flex flex-grow items-center justify-center p-6">
          {/* Center Card */}
          <div className="w-full max-w-4xl bg-white/70 dark:bg-gray-800/70 backdrop-blur-md rounded-2xl shadow-xl p-10">
            <h1 className="text-5xl sm:text-6xl font-extrabold text-center tracking-tight text-indigo-900 dark:text-indigo-300">
              Rkive
            </h1>
            <p className="mt-4 text-center text-lg sm:text-xl text-gray-700 dark:text-gray-300 max-w-2xl mx-auto">
              Effortlessly search manuscripts, inspirations, and creative ideas.
            </p>

            {/* Search Bar */}
            <form onSubmit={handleSearch} className="w-full mt-10 max-w-2xl mx-auto">
              <div className="flex items-center bg-white dark:bg-gray-700/80 border border-gray-300 dark:border-gray-600 rounded-xl shadow-md overflow-hidden">
                <div className="px-4 text-gray-400">
                  <FiSearch size={20} />
                </div>
                <input
                  type="text"
                  name="q"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full py-3 px-2 bg-transparent outline-none text-base text-gray-800 dark:text-white placeholder-gray-500"
                  placeholder="Type a keyword..."
                  required
                />
                <button
                  type="submit"
                  disabled={loading}
                  className="bg-indigo-700 hover:bg-indigo-600 text-white px-6 py-3 font-semibold transition-all duration-200 disabled:opacity-50"
                >
                  {loading ? (
                    <div className="flex items-center justify-center">
                      <Spinner sm />
                    </div>
                  ) : (
                    'Search'
                  )}
                </button>
              </div>
            </form>

            {/* Featured Sections */}
            <div className="mt-12 grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
              <div className="bg-white/80 dark:bg-gray-800/80 rounded-xl shadow-md p-6 hover:scale-[1.02] hover:shadow-lg transition">
                <h3 className="font-semibold text-lg mb-2 text-indigo-900 dark:text-indigo-300">Browse by Category</h3>
                <p className="text-sm text-gray-700 dark:text-gray-400">Explore specific themes or topics.</p>
              </div>
              <div className="bg-white/80 dark:bg-gray-800/80 rounded-xl shadow-md p-6 hover:scale-[1.02] hover:shadow-lg transition">
                <h3 className="font-semibold text-lg mb-2 text-indigo-900 dark:text-indigo-300">Recent Searches</h3>
                <p className="text-sm text-gray-700 dark:text-gray-400">Quick access to what you’ve explored recently.</p>
              </div>
              <div className="bg-white/80 dark:bg-gray-800/80 rounded-xl shadow-md p-6 hover:scale-[1.02] hover:shadow-lg transition">
                <h3 className="font-semibold text-lg mb-2 text-indigo-900 dark:text-indigo-300">Saved Inspirations</h3>
                <p className="text-sm text-gray-700 dark:text-gray-400">Revisit your curated content easily.</p>
              </div>
            </div>
          </div>
        </div>

        {/* Footer */}
        <Footer />
      </div>
    </Layout>
  );
}