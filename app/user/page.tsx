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

  // Ensure consistent SSR vs CSR render
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
      <div className="flex h-screen relative bg-gradient-to-br from-[#1E2A38] via-[#1C2434] to-black">
        {/* Sidebar */}
        <Sidebar />

        {/* Main Content */}
        <div className="flex flex-col flex-grow items-center justify-start p-8 overflow-y-auto mt-16">
          
          {/* Header Box (Title + Search) */}
          <h1 className="text-5xl sm:text-6xl font-extrabold tracking-tight text-[#FBBF24]">
            Rkive
          </h1>
          <p className="mt-4 text-lg sm:text-xl text-gray-200 max-w-2xl mx-auto text-center">
            A Repository for Capstone & Thesis Projects at CITC – USTP
          </p>

          {/* Search Bar */}
          <form onSubmit={handleSearch} className="w-full mt-8 max-w-2xl mx-auto">
            <div className="flex items-center bg-[#1E2A38]/80 border border-[#FBBF24]/50 rounded-xl shadow-md overflow-hidden">
              <div className="px-4 text-[#FBBF24]">
                <FiSearch size={20} />
              </div>
              <input
                type="text"
                name="q"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full py-3 px-2 bg-transparent outline-none text-base text-gray-100 placeholder-gray-400"
                placeholder="Search projects, keywords, or authors..."
                required
              />
              <button
                type="submit"
                disabled={loading}
                className="flex items-center gap-2 bg-[#FBBF24] text-[#1E2A38] px-6 py-3 font-semibold rounded-r-xl
                          hover:bg-[#FACC15] hover:shadow-lg active:bg-[#EAB308] 
                          transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {mounted && loading ? (
                  <div className="flex items-center justify-center">
                    <Spinner sm />
                  </div>
                ) : (
                  <>
                    <FiSearch size={18} />
                    <span>Search</span>
                  </>
                )}
              </button>
            </div>
          </form>

          {/* Featured Sections Grid */}
          <div className="mt-10 grid sm:grid-cols-2 lg:grid-cols-3 gap-6 w-full max-w-6xl">
            
            {/* Browse */}
            <div className="bg-[#1E2A38]/80 border border-[#FBBF24]/40 rounded-xl shadow-md p-6 
                            hover:scale-[1.03] hover:shadow-lg transition flex flex-col items-start">
              <div className="text-[#FBBF24] mb-3 text-2xl">📂</div>
              <h3 className="font-semibold text-lg mb-2 text-white">
                Browse Repositories
              </h3>
              <p className="text-sm text-gray-300">
                Explore capstone & thesis works organized by categories.
              </p>
            </div>

            {/* Latest */}
            <div className="bg-[#1E2A38]/80 border border-[#FBBF24]/40 rounded-xl shadow-md p-6 
                            hover:scale-[1.03] hover:shadow-lg transition flex flex-col items-start">
              <div className="text-[#FBBF24] mb-3 text-2xl">🆕</div>
              <h3 className="font-semibold text-lg mb-2 text-white">
                Latest Submissions
              </h3>
              <p className="text-sm text-gray-300">
                Stay updated with the newest uploaded projects.
              </p>
            </div>

            {/* Top Rated */}
            <div className="bg-[#1E2A38]/80 border border-[#FBBF24]/40 rounded-xl shadow-md p-6 
                            hover:scale-[1.03] hover:shadow-lg transition flex flex-col items-start">
              <div className="text-[#FBBF24] mb-3 text-2xl">⭐</div>
              <h3 className="font-semibold text-lg mb-2 text-white">
                Top Rated Projects
              </h3>
              <p className="text-sm text-gray-300">
                Discover the most recognized and recommended works.
              </p>
            </div>

            {/* By Adviser */}
            <div className="bg-[#1E2A38]/80 border border-[#FBBF24]/40 rounded-xl shadow-md p-6 
                            hover:scale-[1.03] hover:shadow-lg transition flex flex-col items-start">
              <div className="text-[#FBBF24] mb-3 text-2xl">🎓</div>
              <h3 className="font-semibold text-lg mb-2 text-white">
                By Adviser / Panel
              </h3>
              <p className="text-sm text-gray-300">
                Browse research works organized by faculty mentors.
              </p>
            </div>

            {/* Saved */}
            <div className="bg-[#1E2A38]/80 border border-[#FBBF24]/40 rounded-xl shadow-md p-6 
                            hover:scale-[1.03] hover:shadow-lg transition flex flex-col items-start">
              <div className="text-[#FBBF24] mb-3 text-2xl">💾</div>
              <h3 className="font-semibold text-lg mb-2 text-white">
                Saved Projects
              </h3>
              <p className="text-sm text-gray-300">
                Revisit your curated list of favorite projects.
              </p>
            </div>

            {/* Statistics */}
            <div className="bg-[#1E2A38]/80 border border-[#FBBF24]/40 rounded-xl shadow-md p-6 
                            hover:scale-[1.03] hover:shadow-lg transition flex flex-col items-start">
              <div className="text-[#FBBF24] mb-3 text-2xl">📊</div>
              <h3 className="font-semibold text-lg mb-2 text-white">
                Research Trends
              </h3>
              <p className="text-sm text-gray-300">
                See insights into popular topics and project statistics.
              </p>
            </div>

          </div>
        </div>

        {/* Footer */}
        <Footer />
      </div>
    </Layout>
  );
}
