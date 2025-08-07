'use client';

import Link from 'next/link';
import Image from 'next/image';
import { useState, useEffect } from 'react';
import { useQuery } from '@tanstack/react-query';
import { useDebounce } from 'use-debounce';
import { usePathname } from 'next/navigation';
import type { Book } from '@/types/book';

export default function Navbar() {
  const [isMobileNavOpen, setIsMobileNavOpen] = useState(false);
  const [searchBook, setSearchBook] = useState('');
  const [debouncedSearchBook] = useDebounce(searchBook, 1250);
  const pathName = usePathname();

  // Close Navbar & Set scrolling back on after traversing page
  useEffect(() => {
    setIsMobileNavOpen(false);
    document.body.style.overflow = 'auto';
  }, [pathName]);

  const fetchBooks = async () => {
    const queryParam = encodeURIComponent(
      debouncedSearchBook.toLowerCase().trim()
    );

    try {
      const res = await fetch(
        `http://localhost:3000/api/books?search=${queryParam}`
      );

      const data = await res.json();
      return data.results;
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

  console.log(books);

  function toggleNavbar() {
    const isNavOpen = !isMobileNavOpen;
    document.body.style.overflow = isNavOpen ? 'hidden' : 'auto';
    setIsMobileNavOpen(isNavOpen);
  }

  function handleChange(e: React.ChangeEvent<HTMLInputElement>) {
    const { value } = e.target;
    setSearchBook(value);
  }

  return (
    <>
      <header className='w-full h-[10vh] flex items-center p-4 border-b bg-white border-gray-300 sticky inset-0 z-10 shadow-sm'>
        <div className='h-full w-full flex items-center gap-8'>
          <h1 className='text-4xl'>BookWorm</h1>
          <button
            className={`flex ml-auto flex-col gap-2 items-end hover:cursor-pointer sm:hidden`}
            onClick={toggleNavbar}
          >
            <span
              className={`w-10 h-1 bg-gray-500 transition-all duration-300 ease-in-out origin-center ${
                isMobileNavOpen ? 'rotate-45 translate-y-3 translate-x-0' : ''
              }`}
            ></span>
            <span
              className={`w-10 h-1 bg-gray-500 transition-all duration-300 ease-in-out ${
                isMobileNavOpen ? 'opacity-0 scale-0' : 'opacity-100 scale-100'
              }`}
            ></span>
            <span
              className={`w-10 h-1 bg-gray-500 transition-all duration-300 ease-in-out origin-center ${
                isMobileNavOpen ? '-rotate-45 -translate-y-3 translate-x-0' : ''
              }`}
            ></span>
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
          <form className='flex flex-col relative'>
            <div className='flex gap-2 bg-gray-200 py-2 px-4 rounded'>
              <button className='w-[24px] h-[24px] hover:cursor-pointer'>
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
                onChange={(e) => handleChange(e)}
              />
            </div>
            {/* Put into own element variable later when finished styling */}
            {books.length > 0 && (
              <div className='absolute top-full left-0 flex flex-col z-20 bg-white'>
                {books.slice(0, 5).map((book: Book) => (
                  <section
                    key={book.id}
                    className='flex gap-2 border-t-2 py-4 px-2 first:border-none'
                  >
                    <div className='relative w-[80px] h-[125px] shrink-0'>
                      <Image
                        fill
                        src={book.cover}
                        alt={`${book.title} by ${book.authors
                          .map((author) => author.name)
                          .join(', ')}`}
                      />
                    </div>
                    <div className='flex flex-col'>
                      <Link href={`http://localhost:3000/books/${book.id}`}>
                        <h2 className='text-base font-semibold line-clamp-3'>
                          {book.title}
                        </h2>
                        <h3 className='text-sm line-clamp-2'>
                          {book.authors.map((author) => author.name).join(', ')}
                        </h3>
                      </Link>
                    </div>
                  </section>
                ))}
              </div>
            )}
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
        // Add a sliding aside bar with its own button to click with animation, giving enough time for the other to show.
        <>
          <div className='fixed inset-0 bg-black/65 z-10 sm:hidden'></div>
          <div className='fixed top-0 right-0 w-2/3 h-full bg-white z-20 p-6 sm:hidden flex flex-col shadow-lg'>
            <nav className='mt-12 flex flex-col gap-4'>
              <Link href='/'>Home</Link>
              <Link href=''>Library</Link>
            </nav>
          </div>
        </>
      )}
    </>
  );
}
