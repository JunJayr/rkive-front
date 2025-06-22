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
      <div className="min-h-screen bg-gradient-to-br from-gray-100 via-white to-gray-200 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900 text-gray-900 dark:text-gray-100 font-inter relative">
        {/* Sidebar */}
        <Sidebar />

        {/* Main Content */}
        <main className="pt-24 px-4">
          <div className="max-w-5xl mx-auto text-center flex flex-col items-center">
            <h1 className="text-5xl sm:text-6xl font-bold tracking-tight leading-tight bg-clip-text text-transparent bg-gradient-to-r from-indigo-500 via-purple-500 to-pink-500">
              Rkive
            </h1>
            <p className="mt-4 text-lg sm:text-xl text-gray-600 dark:text-gray-300 max-w-xl">
              Effortlessly search manuscripts, inspirations, and creative ideas.
            </p>

            {/* Search Bar */}
            <form onSubmit={handleSearch} className="w-full mt-10 max-w-2xl">
              <div className="flex items-center bg-white dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-2xl shadow-md overflow-hidden transition-all">
                <div className="px-4 text-gray-400 dark:text-gray-300">
                  <FiSearch size={20} />
                </div>
                <input
                  type="text"
                  name="q"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full py-3 px-2 bg-transparent outline-none text-base text-gray-800 dark:text-white placeholder-gray-400"
                  placeholder="Type a keyword..."
                  required
                />
                <button
                  type="submit"
                  disabled={loading}
                  className="bg-indigo-600 hover:bg-indigo-700 text-white px-6 py-3 font-semibold transition-colors duration-200 disabled:opacity-50"
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

            {/* Optional: Featured sections */}
            <div className="mt-12 grid sm:grid-cols-2 lg:grid-cols-3 gap-6 w-full px-4">
              <div className="bg-white dark:bg-gray-800 rounded-xl shadow p-6">
                <h3 className="font-semibold text-lg mb-2">Browse by Category</h3>
                <p className="text-sm text-gray-600 dark:text-gray-400">Explore specific themes or topics.</p>
              </div>
              <div className="bg-white dark:bg-gray-800 rounded-xl shadow p-6">
                <h3 className="font-semibold text-lg mb-2">Recent Searches</h3>
                <p className="text-sm text-gray-600 dark:text-gray-400">Quick access to what you’ve explored recently.</p>
              </div>
              <div className="bg-white dark:bg-gray-800 rounded-xl shadow p-6">
                <h3 className="font-semibold text-lg mb-2">Saved Inspirations</h3>
                <p className="text-sm text-gray-600 dark:text-gray-400">Revisit your curated content easily.</p>
              </div>
            </div>
          </div>
        </main>

        {/* Footer */}
        <Footer />
      </div>
    </Layout>
  );
}
