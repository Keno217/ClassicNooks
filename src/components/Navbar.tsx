'use client';

import Link from 'next/link';
import { useState, useEffect } from 'react';
import { usePathname } from 'next/navigation';

export default function Navbar() {
  const [isMobileNavOpen, setIsMobileNavOpen] = useState(false);
  const pathName = usePathname();

  // Close Navbar & Set scrolling back on after traversing page
  useEffect(() => {
    setIsMobileNavOpen(false);
    document.body.style.overflow = 'auto';
  }, [pathName]);

  function toggleNavbar() {
    const isNavOpen = !isMobileNavOpen;
    document.body.style.overflow = isNavOpen ? 'hidden' : 'auto';
    setIsMobileNavOpen(isNavOpen);
  }

  return (
    <>
      <header className='w-full h-[10vh] flex items-center p-4 border-b border-gray-300 relative'>
        <div className='h-full w-full flex items-center gap-8'>
          <h1 className='text-4xl'>BookWorm</h1>
          <button
            className='flex ml-auto flex-col gap-2 items-end hover:cursor-pointer sm:hidden z-30'
            onClick={toggleNavbar}
          >
            <span className='w-10 h-1 bg-gray-500'></span>
            <span className='w-10 h-1 bg-gray-500'></span>
            <span className='w-10 h-1 bg-gray-500'></span>
          </button>
          <nav className='hidden sm:flex items-center'>
            <ul className='flex items-center gap-8'>
              <li>
                <Link href='/'>Home</Link>
              </li>
              <li>
                <Link href=''>Library</Link>
              </li>
            </ul>
          </nav>
        </div>
        <div className='hidden sm:flex justify-end gap-2'>
          <form className='flex gap-2 bg-gray-200 py-2 px-4 rounded'>
            <button className='w-[24px] h-[24px] hover:cursor-pointer'>
              <img
                src='https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcQO_c_aX1M5K8nKlEYvZvOdWstIgLagKrRtWT_7wlGV9lciKYuUzAj6uYnD_1OVqXxY6_4&usqp=CAU'
                width='24px'
                height='24px'
              />
            </button>
            <input type='text' />
          </form>
          <img
            src='https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcTzSa0_z47xMCQstx5AUS2BGiWd0f4Rxnvs1Q&s'
            width='40px'
            height='40px'
            className=''
          />
        </div>
      </header>
      {isMobileNavOpen && (
        <div className='fixed top-0 left-1/2 w-full h-full bg-gray-300 z-10 p-6 sm:hidden'>
          <nav className='mt-12 flex flex-col gap-4'>
            <Link href='/'>Home</Link>
            <Link href=''>Library</Link>
          </nav>
        </div>
      )}
    </>
  );
}
