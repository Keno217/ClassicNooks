'use client';

import Link from 'next/link';
import Image from 'next/image';
import { useState, useEffect } from 'react';
import { useQuery } from '@tanstack/react-query';
import { useDebounce } from 'use-debounce';
import { usePathname, useRouter } from 'next/navigation';
import { useAuth } from '@/context/AuthContext';
import type { Book } from '@/types/book';

export default function Navbar() {
  const [isMobileNavOpen, setIsMobileNavOpen] = useState(false);
  const [searchBook, setSearchBook] = useState('');
  const [debouncedSearchBook] = useDebounce(searchBook, 350);
  const pathName = usePathname();
  const router = useRouter();
  const { user } = useAuth();

  // Close Navbar & Set scrolling back on after traversing page
  useEffect(() => {
    setIsMobileNavOpen(false);
    document.body.style.overflow = 'auto';
  }, [pathName]);

  const fetchBooks = async () => {
    const MAX_LIMIT: number = 5;
    const queryParam = encodeURIComponent(
      debouncedSearchBook.toLowerCase().trim()
    );

    try {
      const res = await fetch(
        `/api/books?search=${queryParam}&limit=${MAX_LIMIT}`
      );

      if (!res.ok)
        throw new Error(
          `Failed to fetch book#${queryParam}. Status: ${res.status}`
        );

      const data = await res.json();
      return Array.isArray(data.results) ? (data.results as Book[]) : [];
    } catch (err) {
      console.log(`Error: ${err}`);
      return [];
    }
  };

  const { data: books = [] } = useQuery({
    queryKey: ['book', debouncedSearchBook],
    queryFn: fetchBooks,
    enabled: debouncedSearchBook !== '',
  });

  function toggleNavbar() {
    const isNavOpen = !isMobileNavOpen;
    document.body.style.overflow = isNavOpen ? 'hidden' : 'auto';
    setIsMobileNavOpen(isNavOpen);
  }

  function handleChange(e: React.ChangeEvent<HTMLInputElement>) {
    const { value } = e.target;
    setSearchBook(value);
  }

  function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();

    const queryParam = searchBook
      ? encodeURIComponent(searchBook.toLowerCase().trim())
      : '';

    if (queryParam) router.push(`/search?query=${queryParam}`);
  }

  const usernameElement =
    user?.username && user.username.length > 10
      ? <span>{`${user.username.slice(0, 10)}.`}</span>
      : <span>{user?.username}</span>;

  const bookElements = books.map((book: Book) => (
    <Link
      key={book.id}
      href={`/books/${book.id}`}
      className='flex gap-3 p-4 hover:bg-gradient-to-r hover:from-amber-50 hover:to-orange-50 transition-all duration-300 border-b border-gray-100 last:border-none group'
    >
      <div className='relative w-[60px] h-[90px] shrink-0'>
        <Image
          fill
          sizes='w-full'
          src={book.cover}
          alt={`${book.title} by ${book.authors
            .map((author) => author.name)
            .join(', ')}`}
          className='rounded-lg shadow-sm group-hover:shadow-md transition-shadow duration-200 object-cover'
        />
      </div>
      <div className='flex flex-col justify-center flex-1 min-w-0'>
        <h3 className='text-sm font-semibold line-clamp-2 text-gray-900 group-hover:text-amber-700 transition-colors duration-200'>
          {book.title}
        </h3>
        <h3 className='text-xs text-gray-600 line-clamp-1 mt-1'>
          {book.authors.map((author) => author.name).join(', ')}
        </h3>
      </div>
    </Link>
  ));

  return (
    <>
      <header className='w-full h-[10vh] flex items-center p-4 border-b bg-gradient-to-r from-white via-slate-50 to-white border-gray-200 z-20 sticky inset-0 shadow-lg backdrop-blur-sm'>
        <div className='h-full w-full flex items-center gap-8'>
          <h2 className='text-4xl font-bold bg-gradient-to-r from-amber-600 via-amber-500 to-orange-500 bg-clip-text text-transparent hover:scale-105 transition-transform duration-300'>
            📚 BookWorm
          </h2>
          <button
            className='flex ml-auto flex-col gap-1.5 items-end hover:cursor-pointer sm:hidden p-2 rounded-lg hover:bg-amber-50 transition-all duration-200 group'
            onClick={toggleNavbar}
          >
            <span className='w-8 h-0.5 bg-gradient-to-r from-amber-500 to-orange-500 rounded-full group-hover:w-10 transition-all duration-200'></span>
            <span className='w-10 h-0.5 bg-gradient-to-r from-amber-500 to-orange-500 rounded-full'></span>
            <span className='w-6 h-0.5 bg-gradient-to-r from-amber-500 to-orange-500 rounded-full group-hover:w-10 transition-all duration-200'></span>
          </button>
          <nav className='hidden sm:flex items-center'>
            <ul className='flex items-center gap-8'>
              <li>
                <Link
                  href='/'
                  className='relative text-gray-700 hover:text-amber-600 font-medium transition-all duration-300 group'
                >
                  Home
                  <span className='absolute bottom-0 left-0 w-0 h-0.5 bg-gradient-to-r from-amber-500 to-orange-500 group-hover:w-full transition-all duration-300'></span>
                </Link>
              </li>
              <li>
                <Link
                  href=''
                  className='relative text-gray-700 hover:text-amber-600 font-medium transition-all duration-300 group'
                >
                  Library
                  <span className='absolute bottom-0 left-0 w-0 h-0.5 bg-gradient-to-r from-amber-500 to-orange-500 group-hover:w-full transition-all duration-300'></span>
                </Link>
              </li>
            </ul>
          </nav>
        </div>
        <div className='hidden sm:flex justify-end items-center gap-4'>
          <form onSubmit={handleSubmit} className='flex flex-col relative'>
            <div className='flex gap-2 bg-gradient-to-r from-gray-50 to-gray-100 py-3 px-4 rounded-xl border border-gray-200 shadow-sm hover:shadow-md transition-all duration-300 focus-within:ring-2 focus-within:ring-amber-500/20 focus-within:border-amber-300'>
              <button
                type='submit'
                className='w-[24px] h-[24px] hover:cursor-pointer hover:scale-110 transition-transform duration-200'
              >
                <Image
                  src='/icons/searchIcon.png'
                  alt='Search for books'
                  width='24'
                  height='24'
                />
              </button>
              <input
                type='text'
                name='search'
                value={searchBook}
                required
                onChange={(e) => handleChange(e)}
                placeholder='Search books...'
                className='bg-transparent focus:outline-none focus:ring-0 placeholder-gray-400 text-gray-700 min-w-[200px]'
              />
            </div>
            {books.length > 0 && (
              <div className='absolute top-full left-0 w-full flex flex-col z-30 bg-white rounded-xl shadow-xl border border-gray-200 mt-2 overflow-hidden'>
                {bookElements}
              </div>
            )}
          </form>
          <div className='flex-shrink-0 relative group flex flex-col justify-center items-center'>
            <Image
              src='/icons/userIcon.png'
              alt='Profile'
              width='40'
              height='40'
              className=''
            />
            {usernameElement}
          </div>
        </div>
      </header>
      {isMobileNavOpen && (
        <div
          className='fixed inset-0 bg-gradient-to-br from-black/70 via-slate-900/60 to-black/70 z-40 opacity-100 sm:hidden transition-all duration-300 backdrop-blur-sm'
          onClick={toggleNavbar}
        />
      )}
      <aside
        className={`fixed top-0 right-0 w-3/4 max-w-sm h-full bg-gradient-to-br from-white via-slate-50 to-amber-50/30 z-50 px-6 py-8 flex flex-col transform transition-all duration-500 ease-out sm:hidden shadow-2xl border-l border-amber-200/50 ${
          isMobileNavOpen ? 'translate-x-0' : 'translate-x-full'
        }`}
      >
        <div className='flex items-center justify-between mb-8'>
          <h3 className='text-2xl font-bold bg-gradient-to-r from-amber-600 to-orange-500 bg-clip-text text-transparent'>
            📚 Menu
          </h3>
          <button
            className='flex flex-col gap-1 items-center justify-center w-10 h-10 p-2 hover:cursor-pointer hover:bg-amber-100 rounded-xl transition-all duration-200 group'
            onClick={toggleNavbar}
          >
            <span className='w-6 h-0.5 bg-gradient-to-r from-amber-500 to-orange-500 rounded-full rotate-45 translate-y-1 group-hover:from-red-500 group-hover:to-red-600 transition-all duration-200'></span>
            <span className='w-6 h-0.5 bg-gradient-to-r from-amber-500 to-orange-500 rounded-full -rotate-45 -translate-y-1 group-hover:from-red-500 group-hover:to-red-600 transition-all duration-200'></span>
          </button>
        </div>
        <nav className='flex flex-col gap-6 flex-1'>
          <ul className='space-y-4'>
            <li>
              <Link
                href='/'
                className='flex items-center gap-4 p-4 rounded-xl bg-white/70 hover:bg-gradient-to-r hover:from-amber-50 hover:to-orange-50 transition-all duration-300 shadow-sm hover:shadow-md group border border-amber-100/50'
              >
                <div className='w-8 h-8 bg-gradient-to-r from-amber-500 to-orange-500 rounded-lg flex items-center justify-center text-white font-bold text-sm group-hover:scale-110 transition-transform duration-200'>
                  🏠
                </div>
                <span className='text-gray-700 font-medium group-hover:text-amber-700 transition-colors duration-200'>
                  Home
                </span>
              </Link>
            </li>
            <li>
              <Link
                href=''
                className='flex items-center gap-4 p-4 rounded-xl bg-white/70 hover:bg-gradient-to-r hover:from-amber-50 hover:to-orange-50 transition-all duration-300 shadow-sm hover:shadow-md group border border-amber-100/50'
              >
                <div className='w-8 h-8 bg-gradient-to-r from-blue-500 to-blue-600 rounded-lg flex items-center justify-center text-white font-bold text-sm group-hover:scale-110 transition-transform duration-200'>
                  📚
                </div>
                <span className='text-gray-700 font-medium group-hover:text-blue-700 transition-colors duration-200'>
                  Library
                </span>
              </Link>
            </li>
          </ul>
          <div className='mt-8 p-4 bg-gradient-to-r from-amber-50 to-orange-50 rounded-xl border border-amber-200/50'>
            <form onSubmit={handleSubmit} className='space-y-3'>
              <label className='text-sm font-medium text-gray-700'>
                Search Books
              </label>
              <div className='relative'>
                <input
                  type='text'
                  name='search'
                  value={searchBook}
                  onChange={(e) => handleChange(e)}
                  placeholder='Title or author...'
                  className='w-full pl-10 pr-4 py-3 bg-white border border-amber-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-amber-500/20 focus:border-amber-400 transition-all duration-200 text-sm'
                />
                <div className='absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none'>
                  <Image
                    src='/icons/searchIcon.png'
                    alt='Search'
                    width='16'
                    height='16'
                    className='text-gray-400'
                  />
                </div>
              </div>
              <button
                type='submit'
                className='w-full py-3 bg-gradient-to-r from-amber-500 to-orange-500 text-white font-medium rounded-lg hover:shadow-lg transition-all duration-200 hover:scale-105 text-sm'
              >
                Search Library
              </button>
            </form>
          </div>
        </nav>
        <div className='mt-auto pt-6 border-t border-amber-200/50'>
          <div className='flex items-center gap-3 p-3 bg-white/50 rounded-xl'>
            <img
              src='https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcTzSa0_z47xMCQstx5AUS2BGiWd0f4Rxnvs1Q&s'
              width='32'
              height='32'
              className='rounded-full border-2 border-amber-200'
              alt='Profile'
            />
            <div className='flex-1'>
              <p className='text-sm font-medium text-gray-700'>Reader</p>
              <p className='text-xs text-gray-500'>Book enthusiast</p>
            </div>
          </div>
        </div>
      </aside>
    </>
  );
}
