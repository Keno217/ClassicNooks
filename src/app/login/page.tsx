'use client';

import Link from 'next/link';
import Image from 'next/image';
import { useRouter } from 'next/navigation';
import { useMutation } from '@tanstack/react-query';
import { useEffect, useState, useRef } from 'react';
import { useAuth } from '@/context/AuthContext';
import ReCAPTCHA from 'react-google-recaptcha';

export default function Login() {
  const router = useRouter();
  const [captchaToken, setCaptchaToken] = useState('');
  const captchaRef = useRef<ReCAPTCHA>(null);
  const { user, loading, refresh } = useAuth();

  useEffect(() => {
    // Check if user is already logged in
    if (user && !loading) router.push('/');
  }, [loading, user, router]);

  // Handle user login
  const loginUser = async (data: {
    user: string;
    password: string;
    captchaToken: string;
  }) => {
    const res = await fetch('/api/auth/login', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data),
      credentials: 'include',
    });

    if (!res.ok) {
      setCaptchaToken('');
      captchaRef.current?.reset();
      const err = await res.json();
      throw new Error(err.error || 'Login failed');
    }

    return res.json();
  };

  const mutation = useMutation({
    mutationFn: loginUser,
    onSuccess: async () => {
      await refresh();
      router.push('/');
    },
  });

  function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();

    const formData = new FormData(e.currentTarget);
    const user = (formData.get('user') as string).toLowerCase().trim();
    const password = formData.get('password') as string;

    mutation.mutate({ user, password, captchaToken });
  }

  const handleCaptchaChange = (token: string | null) => {
    if (token) setCaptchaToken(token);
    else setCaptchaToken(''); // clears token if user fails captcha or it expires
  };

  const handleCaptchaExpired = () => {
    setCaptchaToken('');
  };

  return (
    <main
      className='min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 flex items-center justify-center px-4'
      role='main'
      aria-label='Login page'
    >
      <div
        className='w-full max-w-md mx-auto bg-white rounded-xl shadow-lg border border-gray-100 p-8'
        role='region'
        aria-label='Login form container'
      >
        <h2 className='flex text-4xl font-bold justify-center gap-x-2 bg-gradient-to-r from-amber-600 via-amber-500 to-orange-500 bg-clip-text text-transparent hover:scale-105 transition-transform duration-300 mb-8'>
          <Image src='/icons/booksIcon.png' alt='' width={40} height={40} />
          ClassicNooks
        </h2>
        <div className='space-y-6'>
          <h1 className='text-2xl font-semibold text-gray-900 text-center'>
            Sign in to your account
          </h1>
          <form
            className='space-y-6'
            onSubmit={(e) => handleSubmit(e)}
            aria-label='Login form'
          >
            <div className='space-y-2' role='group' aria-label='Username input'>
              <label
                htmlFor='user'
                className='block text-sm font-medium text-gray-700'
              >
                Username
              </label>
              <input
                id='user'
                name='user'
                type='text'
                required
                className='w-full px-4 py-3 bg-gradient-to-r from-gray-50 to-gray-100 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-amber-500/20 focus:border-amber-300 transition-all duration-300 hover:shadow-sm'
                placeholder='Enter your Username'
              />
            </div>
            <div className='space-y-2' role='group' aria-label='Password input'>
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
            <div className='flex justify-center'>
              <ReCAPTCHA
                sitekey={process.env.NEXT_PUBLIC_RECAPTCHA_SITE_KEY!}
                onChange={handleCaptchaChange}
                onExpired={handleCaptchaExpired}
                ref={captchaRef}
              />
            </div>
            {mutation.isError && (
              <p
                className='text-red-500 text-center text-sm'
                role='alert'
                aria-live='polite'
              >
                {mutation.error.message}
              </p>
            )}
            <button
              type='submit'
              disabled={mutation.isPending}
              className='w-full py-4 bg-gradient-to-r from-amber-500 to-amber-600 text-white text-lg font-semibold rounded-xl shadow-lg hover:shadow-xl transition-all duration-300 hover:scale-105 focus:outline-none focus:ring-4 focus:ring-amber-500/50'
              aria-label={
                mutation.isPending
                  ? 'Signing in, please wait'
                  : 'Sign in to your account'
              }
            >
              {mutation.isPending ? 'Signing in...' : 'Sign In'}
            </button>
            <div className='text-center'>
              <Link
                href='/register'
                className='text-sm text-gray-500 hover:text-gray-700 transition-colors duration-300'
              >
                Create an Account
              </Link>
            </div>
          </form>
        </div>
      </div>
    </main>
  );
}
