'use client';

import Image from 'next/image';
import { useSearchParams } from 'next/navigation';
import { useQuery } from '@tanstack/react-query';
import { useRouter } from 'next/navigation';
import { useState, useEffect } from 'react';
import type { Book } from '@/types/book';
import Navbar from '@/components/Navbar';

export default function searchPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const searchQuery = searchParams.get('query') ?? '';

  // Reset stack on new search
  useEffect(() => {
    /*     setPageHistory([
      `http://localhost:3000/api/books?search=${searchQuery}&limit=32`,
    ]); */
  }, [searchQuery]);

  // Query key should be source of truth
  const fetchBooks = async () => {
    try {
      const res = await fetch(currentUrl);

      if (!res.ok)
        throw new Error(
          `Failed to fetch book relating to ${searchQuery}. Status: ${res.status}`
        );

      const data = await res.json();
      return Array.isArray(data.results) ? (data.results as Book[]) : [];
    } catch (err) {
      console.log(`Error: ${err}`);
      return [];
    }
  };

  const { data: books = [] } = useQuery({
    queryKey: ['book', searchQuery, currentUrl],
    queryFn: fetchBooks,
    enabled: searchQuery !== '',
  });

  console.log(books);

  // Derived values
  /*   const bookCount = books.length;
  const totalPages = Math.max(1, Math.ceil(bookCount / BOOKLIMIT));
  const pagesTraversed = (currentPage - 1) * BOOKLIMIT;
  const hasPrev = currentPage > 1;
  const hasNext = currentPage < totalPages; */

  function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();

    const searchBook = new FormData(e.currentTarget).get('search') as string;

    const queryParam = searchBook ? encodeURIComponent(searchBook) : '';

    if (queryParam) {
      router.push(`/search?query=${queryParam}`);
      e.currentTarget.reset();
    }
  }

  return (
    <div className='w-full flex flex-col'>
      <Navbar />
      <main className='w-full flex flex-col gap-4'>
        <div>
          <h1 className='text-center text-2xl'>
            Find your next great read among 70,000+ books
          </h1>
          <form
            onSubmit={handleSubmit}
            className='w-full px-2 sm:w-1/2 mx-auto'
          >
            <div className='flex gap-2 bg-gray-200 py-2 px-4 rounded'>
              <button
                type='submit'
                className='w-[24px] h-[24px] hover:cursor-pointer'
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
                required
                className='w-full bg-white p-1 rounded focus:outline-none focus:ring-0'
                placeholder='Search Library by Title or Author'
              />
            </div>
          </form>
        </div>
        <div className='w-full flex flex-col'>
          <h2 className='text-center'>{`Books matching: ${searchQuery}`}</h2>
          <div className='w-full grid grid-cols-3'>
            <section className='w-full px-2 border-r-4'>
              <p>test</p>
            </section>
            <section className='w-full px-2 border-r-4'>
              <p>test</p>
            </section>
            <section className='w-full px-2'>
              <p>test</p>
            </section>
          </div>
        </div>
      </main>
    </div>
  );
}
