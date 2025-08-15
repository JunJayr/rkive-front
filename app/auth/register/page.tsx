'use client';

import Link from "next/link";
import Spinner from "@/components/common/Spinner";
import Footer from '@/components/common/Footer'; 
import { useRegister } from "@/hooks";

export default function RegisterForm() {
  const {
      first_name, 
      last_name, 
      email, password, 
      re_password,
      isLoading,
      onChange,
      onSubmit,
  } = useRegister();

  return (
    <div
      className="flex h-screen w-screen items-center justify-center bg-cover bg-center"
      style={{
        backgroundImage: "url('https://pbs.twimg.com/media/Egbd8bVWAAEtEzP?format=jpg&name=4096x4096')",
      }}
    >
      <div className="mt-10 sm:mx-auto sm:w-full sm:max-w-sm bg-white bg-opacity-60 p-6 rounded-md shadow-md">
      <img
          alt="New Logo"
          src="/logo.png"
          className="mx-auto h-20 w-auto"
        />
        <h2 className="mt-5 text-center text-2xl/9 font-bold tracking-tight text-indigo-950">
          Sign up for your account
        </h2>

        <form onSubmit={onSubmit}>
          <div>
            <div className="mt-5">
              <input
                id="first_name"
                className="block w-full rounded-md bg-white px-3 py-1.5 text-base text-gray-900 outline outline-1 placeholder:text-gray-400 focus:outline focus:outline-2 focus:outline-indigo-600 sm:text-sm/6"
                name="first_name"
                type="text"
                placeholder="First Name"
                onChange={onChange}
                value={first_name}
                required
              />
            </div>
          </div>

          <div>
            <div className="mt-2">
              <input
                id="last_name"
                className="block w-full rounded-md bg-white px-3 py-1.5 text-base text-gray-900 outline outline-1 placeholder:text-gray-400 focus:outline focus:outline-2 focus:outline-indigo-600 sm:text-sm/6"
                name="last_name"
                type="text"
                placeholder="Last Name"
                onChange={onChange}
                value={last_name}
                required
              />
            </div>
          </div>

          <div>
            <div className="mt-2">
              <input
                id="email"
                className="block w-full rounded-md bg-white px-3 py-1.5 text-base text-gray-900 outline outline-1 placeholder:text-gray-400 focus:outline focus:outline-2 focus:outline-indigo-600 sm:text-sm/6"
                name="email"
                type="email"
                placeholder="Email Address"
                onChange={onChange}
                value={email}
                required
              />
            </div>
          </div>

          <div>
            <div className="mt-2">
              <input
                id="password"
                className="block w-full rounded-md bg-white px-3 py-1.5 text-base text-gray-900 outline outline-1 placeholder:text-gray-400 focus:outline focus:outline-2 focus:outline-indigo-600 sm:text-sm/6"
                name="password"
                type="password"
                placeholder="Password"
                onChange={onChange}
                value={password}
                required
              />
            </div>
          </div>

          <div>
            <div className="mt-2">
              <input
                id="re_password"
                className="block w-full rounded-md bg-white px-3 py-1.5 text-base text-gray-900 outline outline-1 placeholder:text-gray-400 focus:outline focus:outline-2 focus:outline-indigo-600 sm:text-sm/6"
                name="re_password"
                type="password"
                placeholder="Confirm Password"
                onChange={onChange}
                value={re_password}
                required
              />
            </div>
          </div>

          <div>
            <button
              type="submit"
              className="mt-5 flex w-full justify-center rounded-md bg-indigo-800 px-3 py-1.5 text-sm/6 font-semibold text-white shadow-sm hover:bg-indigo-600 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-indigo-600"
            >
              {isLoading ? <Spinner sm/>: 'Sign Up'}
            </button>
          </div>
        </form>

        <p className="mt-5 text-center text-sm/6 text-gray-900">
          Already have an account?{' '}
          <Link href="/auth/login" className="font-semibold text-indigo-950 hover:text-indigo-600">
            Login
          </Link>
        </p>
      </div>
      {/* Footer */}
      <Footer />
    </div>
  );
}
