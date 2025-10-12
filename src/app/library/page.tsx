'use client';

import Image from 'next/image';
import Navbar from '@/components/Navbar';
import BookRail from '@/components/BookRail';
import Footer from '@/components/Footer';
import { useAuth } from '@/context/AuthContext';

export default function Library() {
  const { user } = useAuth();

  return (
    <div className='flex flex-col min-h-screen bg-gradient-to-br from-slate-50 to-slate-100'>
      <Navbar />
      <main className='w-full h-full flex flex-col'>
        <div className='bg-gradient-to-r from-orange-500 to-orange-400 py-12 px-4 shadow-lg'>
          <div className='max-w-7xl mx-auto flex flex-col items-center'>
            <div className='bg-white rounded-full p-2 shadow-xl mb-6 ring-4 ring-orange-200'>
              <Image
                src='/icons/userIcon.png'
                alt='User Icon'
                width={100}
                height={100}
                className='rounded-full'
              />
            </div>
            <div className='text-center text-white'>
              <h1 className='text-4xl md:text-5xl font-bold mb-2'>
                {user ? user.username : 'Guest'}
              </h1>
              <p className='text-lg md:text-xl text-orange-100 font-medium'>
                {user
                  ? `Member since ${user.created.slice(0, 4)}`
                  : 'Sign in to save your reading history'}
              </p>
            </div>
          </div>
        </div>
        <div className='container mx-auto px-4 py-8'>
          <BookRail title='Favorites' url='/api/users/me/favorites' />
          <BookRail title='History' url='/api/users/me/history' />
        </div>
      </main>
      <Footer />
    </div>
  );
}
