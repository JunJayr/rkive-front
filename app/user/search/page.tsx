'use client';

import { useSearchParams } from 'next/navigation';
import { useState, useEffect } from 'react';
import Sidebar from '@/components/common/Sidebar';
import Footer from '@/components/common/Footer';
import Spinner from '@/components/common/Spinner';
import { useSearchManuscriptsQuery } from '@/redux/features/authApiSlice';
import Layout from '@/components/utils/Layout';
import { FiSearch } from 'react-icons/fi';

export default function SearchPage() {
  const searchParams = useSearchParams();
  const [searchTerm, setSearchTerm] = useState('');
  const [hydrated, setHydrated] = useState(false);

  useEffect(() => {
    setHydrated(true);
    const query = searchParams.get('q') || '';
    setSearchTerm(query);
  }, [searchParams]);

  const {
    data: manuscripts = [],
    isLoading: isSearching,
    isError: searchError,
  } = useSearchManuscriptsQuery(searchTerm, {
    skip: !searchTerm,
  });

  const handleSearch = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (searchTerm.trim()) {
      window.location.href = `/user/search?q=${encodeURIComponent(searchTerm)}`;
    }
  };

  const handleResultClick = (pdfUrl: string) => {
    if (pdfUrl) {
      window.open(pdfUrl, '_blank', 'noopener,noreferrer');
    }
  };

  if (!hydrated) return null;

  return (
    <Layout>
      <div className="min-h-screen bg-gradient-to-br from-gray-100 via-white to-gray-200 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900 text-gray-900 dark:text-gray-100 font-inter relative">
        <Sidebar />

        <div className="pt-24 px-4 max-w-5xl mx-auto text-center">
          <h1 className="text-5xl sm:text-6xl font-bold tracking-tight leading-tight bg-clip-text text-transparent bg-gradient-to-r from-indigo-500 via-purple-500 to-pink-500">
            Search Results
          </h1>
          <p className="mt-4 text-lg sm:text-xl text-gray-600 dark:text-gray-300 max-w-xl mx-auto">
            Discover manuscripts that match your inspiration.
          </p>

          <form onSubmit={handleSearch} className="w-full mt-10 max-w-2xl mx-auto">
            <div className="flex items-center bg-white dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-2xl shadow-md overflow-hidden transition-all">
              <div className="px-4 text-gray-400 dark:text-gray-300">
                <FiSearch size={20} />
              </div>
              <input
                type="search"
                id="search"
                placeholder="Search for manuscripts..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full py-3 px-2 bg-transparent outline-none text-base text-gray-800 dark:text-white placeholder-gray-400"
                required
              />
              <button
                type="submit"
                className="bg-indigo-600 hover:bg-indigo-700 text-white px-6 py-3 font-semibold transition-colors duration-200 disabled:opacity-50"
                disabled={isSearching}
              >
                {isSearching ? (
                  <div className="flex items-center justify-center">
                    <Spinner sm />
                  </div>
                ) : (
                  'Search'
                )}
              </button>
            </div>
          </form>

          <div className="mt-12 text-left">
            {isSearching && <Spinner />}
            {searchError && (
              <p className="text-red-500 text-center text-base">
                Failed to fetch manuscripts. Please try again later.
              </p>
            )}

            {manuscripts.length > 0 ? (
              <ul className="space-y-6 mt-6">
                {manuscripts.map((manuscript: any) => (
                  <li
                    key={manuscript.id}
                    onClick={() => handleResultClick(manuscript.pdf_url)}
                    className="p-6 bg-white dark:bg-gray-800 rounded-2xl shadow-md hover:shadow-lg hover:bg-gray-50 dark:hover:bg-gray-700 transition cursor-pointer"
                  >
                    <h3 className="text-xl font-semibold text-gray-900 dark:text-white">
                      {manuscript.title}
                    </h3>
                    {manuscript.description && (
                      <p className="mt-2 text-sm text-gray-700 dark:text-gray-400">
                        {manuscript.description}
                      </p>
                    )}
                  </li>
                ))}
              </ul>
            ) : (
              !isSearching && (
                <p className="text-gray-700 dark:text-gray-400 text-center text-base mt-6">
                  No results found.
                </p>
              )
            )}
          </div>
        </div>

        <Footer />
      </div>
    </Layout>
  );
}
