'use client';

import Link from 'next/link';
import { useState, useEffect, FormEvent } from 'react'; // Updated import for FormEvent
import Spinner from '@/components/common/Spinner';
import Footer from '@/components/common/Footer';
import { useLogin } from '@/hooks';

export default function LoginForm() {
  const { email, password, isLoading, errors, onChange, onSubmit } = useLogin();

  // Add local loading state to control the full-screen spinner
  const [showFullScreenSpinner, setShowFullScreenSpinner] = useState(false);

  // Handle form submission with full-screen loading, typed correctly
  const handleSubmit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setShowFullScreenSpinner(true); // Show full-screen spinner
    try {
      await onSubmit(e);
    } catch (error) {
      console.error('Error during login:', error);
    } finally {
      setShowFullScreenSpinner(false); // Hide full-screen spinner
    }
  };

  return (
    <div className="flex h-screen">
      <div
        className="flex flex-grow items-center justify-center bg-cover bg-center"
        style={{
          backgroundImage:
            "url('https://pbs.twimg.com/media/Egbd8bVWAAEtEzP?format=jpg&name=4096x4096')",
        }}
      >
        <div className="sm:w-full sm:max-w-sm bg-white bg-opacity-60 p-6 rounded-md shadow-md">
          <img alt="New Logo" src="/logo.png" className="mx-auto h-20 w-auto" />
          <h2 className="mt-5 text-center text-2xl/9 font-bold tracking-tight text-indigo-900">
            Login to your account
          </h2>
          <form onSubmit={handleSubmit}>
            <div className="mt-3">
              <input
                id="email"
                name="email"
                type="email"
                placeholder="Email Address"
                value={email}
                onChange={onChange}
                className="block w-full rounded-md bg-white px-3 py-1.5 text-base text-gray-900 outline outline-1 placeholder:text-gray-400 focus:outline focus:outline-2 focus:outline-indigo-600 sm:text-sm/6"
                required
              />
              {errors.email && <p className="mt-1 text-sm text-red-600">{errors.email}</p>}
            </div>
            
            <div className="mt-3">
              <input
                id="password"
                name="password"
                type="password"
                placeholder="Password"
                value={password}
                onChange={onChange}
                className="block w-full rounded-md bg-white px-3 py-1.5 text-base text-gray-900 outline outline-1 placeholder:text-gray-400 focus:outline focus:outline-2 focus:outline-indigo-600 sm:text-sm/6"
                required
              />
              {errors.password && <p className="mt-1 text-sm text-red-600">{errors.password}</p>}
            </div>
            
            <button
              type="submit"
              className="mt-5 w-full rounded-md bg-indigo-800 px-3 py-1.5 text-sm font-semibold text-white hover:bg-indigo-600"
              disabled={showFullScreenSpinner} // Disable button while loading
            >
              Login
            </button>
          </form>

          <div className="mt-5 text-right text-sm">
            <a
              href="/password-reset"
              className="font-semibold text-indigo-800 hover:text-indigo-600"
            >
              Forgot password?
            </a>
          </div>
          <p className="mt-5 text-center text-sm text-gray-900">
            Don't have an account?{' '}
            <Link
              href="/auth/register"
              className="font-semibold text-indigo-800 hover:text-indigo-600"
            >
              Sign Up
            </Link>
          </p>
        </div>

        {showFullScreenSpinner && (
          <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-50 z-50">
            <Spinner/>
          </div>
        )}
      </div>

      {/* Footer */}
      <Footer />
    </div>
  );
}