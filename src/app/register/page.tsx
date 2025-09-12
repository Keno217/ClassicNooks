'use client';

import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useState } from 'react';

export default function Register() {
  const [steps, setSteps] = useState(1);
  const router = useRouter();

  function handleUserValidation(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();

    setSteps((prevStep) => prevStep + 1);
  }

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();

    // Password validation

    setSteps(1);
    router.push('/login');
  };

  return (
    <div className='min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 flex items-center justify-center px-4'>
      <div className='w-full max-w-md mx-auto bg-white rounded-xl shadow-lg border border-gray-100 p-8'>
        <h2 className='text-4xl font-bold text-center bg-gradient-to-r from-amber-600 via-amber-500 to-orange-500 bg-clip-text text-transparent hover:scale-105 transition-transform duration-300 mb-8'>
          📚 BookWorm
        </h2>
        <div className='space-y-6'>
          <h1 className='text-2xl font-semibold text-gray-900 text-center'>
            Create your Account
          </h1>
          <form
            className='space-y-6'
            onSubmit={(e) =>
              steps === 1 ? handleUserValidation(e) : handleSubmit(e)
            }
          >
            <div className='space-y-2'>
              <label
                htmlFor='user'
                className='block text-sm font-medium text-gray-700'
              >
                Username
              </label>
              <input
                id='user'
                name='user'
                type='user'
                required
                className='w-full px-4 py-3 bg-gradient-to-r from-gray-50 to-gray-100 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-amber-500/20 focus:border-amber-300 transition-all duration-300 hover:shadow-sm'
                placeholder='Enter your username'
              />
            </div>
            {steps === 1 ? (
              <button
                type='submit'
                className='w-full py-4 bg-gradient-to-r from-amber-500 to-amber-600 text-white text-lg font-semibold rounded-xl shadow-lg hover:shadow-xl transition-all duration-300 hover:scale-105 focus:outline-none focus:ring-4 focus:ring-amber-500/50'
              >
                Continue
              </button>
            ) : (
              <>
                <div className='space-y-2'>
                  <label
                    htmlFor='password'
                    className='block text-sm font-medium text-gray-700'
                  >
                    Password
                  </label>
                  <input
                    id='password'
                    type='password'
                    name='password'
                    required
                    className='w-full px-4 py-3 bg-gradient-to-r from-gray-50 to-gray-100 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-amber-500/20 focus:border-amber-300 transition-all duration-300 hover:shadow-sm'
                    placeholder='Enter your password'
                  />
                </div>
                <button
                  type='submit'
                  className='w-full py-4 bg-gradient-to-r from-amber-500 to-amber-600 text-white text-lg font-semibold rounded-xl shadow-lg hover:shadow-xl transition-all duration-300 hover:scale-105 focus:outline-none focus:ring-4 focus:ring-amber-500/50'
                >
                  Create
                </button>
              </>
            )}
            <div className='text-center'>
              <Link
                href='/login'
                className='text-sm text-gray-500 hover:text-gray-700 transition-colors duration-300'
              >
                Already have an Account?
              </Link>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}
