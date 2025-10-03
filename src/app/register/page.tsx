'use client';

import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useState, useEffect, useRef } from 'react';
import ReCAPTCHA from 'react-google-recaptcha';

export default function Register() {
  const router = useRouter();
  const [step, setStep] = useState(1);
  const [error, setError] = useState('');
  const [captchaToken, setCaptchaToken] = useState('');
  const captchaRef = useRef<ReCAPTCHA>(null);

  useEffect(() => {
    // Check if user is already logged in
    const checkLoggedIn = async () => {
      try {
        const res = await fetch('/api/me', { credentials: 'include' });
        const data = await res.json();

        if (res.ok && data.user?.username) {
          router.push('/');
        }

      } catch (err) {
        console.log('Error fetching user data:', err);
      }
    };

    checkLoggedIn();
  }, []);

  // Step 1: Validate username
  function handleUsernameValidation(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();

    const formData = new FormData(e.currentTarget);
    const username = (formData.get('user') as string).toLowerCase().trim();
    const usernameRegex = /^[A-Za-z0-9]+$/;

    if (username.length < 3 || username.length > 30) {
      setError('Username must be between 3 and 30 characters');
      return;
    }

    if (!usernameRegex.test(username)) {
      setError('Username contains invalid characters');
      return;
    }

    setError('');
    setStep((prevStep) => prevStep + 1);
  }

  // Step 2: Handle full registration
  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();

    const formData = new FormData(e.currentTarget);
    const user = (formData.get('user') as string).toLowerCase().trim();
    const password = formData.get('password') as string;
    const confirmPassword = formData.get('confirmPassword') as string;

    if (password.length < 8 || password.length > 64) {
      setError('Password must be between 8 and 64 characters');
      return;
    }

    if (password !== confirmPassword) {
      setError('Passwords do not match');
      return;
    }

    try {
      const res = await fetch('/api/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ user, password, captchaToken }),
      });

      if (!res.ok) {
        setCaptchaToken('');
        captchaRef.current?.reset();
        const err = await res.json();
        throw new Error(err.error || 'Registration failed. Please try again');
      }

    } catch (err: any) {
      // err is always an obj that contains a message/error property
      console.log(`Error registering user: ${err}`);
      setError(err.message);
      return;
    }

    setStep(1);
    setError('');
    router.push('/login');
  };

  const handleCaptchaChange = (token: string | null) => {
    if (token) setCaptchaToken(token);
    else setCaptchaToken(''); // clears token if user fails captcha or it expires
  };

  const handleCaptchaExpired = () => {
    setCaptchaToken('');
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
              step === 1 ? handleUsernameValidation(e) : handleSubmit(e)
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
            {step === 1 ? (
              <>
                {error && (
                  <p className='text-sm text-red-500 text-center'>{error}</p>
                )}
                <button
                  type='submit'
                  className='w-full py-4 bg-gradient-to-r from-amber-500 to-amber-600 text-white text-lg font-semibold rounded-xl shadow-lg hover:shadow-xl transition-all duration-300 hover:scale-105 focus:outline-none focus:ring-4 focus:ring-amber-500/50'
                >
                  Continue
                </button>
              </>
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
                <div className='space-y-2'>
                  <label
                    htmlFor='confirmPassword'
                    className='block text-sm font-medium text-gray-700'
                  >
                    Confirm Password
                  </label>
                  <input
                    id='confirmPassword'
                    type='password'
                    name='confirmPassword'
                    required
                    className='w-full px-4 py-3 bg-gradient-to-r from-gray-50 to-gray-100 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-amber-500/20 focus:border-amber-300 transition-all duration-300 hover:shadow-sm'
                    placeholder='Confirm your password'
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
                {error && (
                  <p className='text-sm text-red-500 text-center'>{error}</p>
                )}
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
