'use client';

import Image from 'next/image';
import Link from 'next/link';
import { useSearchParams } from 'next/navigation';
import { useQuery, keepPreviousData } from '@tanstack/react-query';
import { useRouter } from 'next/navigation';
import { useState, useEffect } from 'react';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import type { Book, GetBookApiResponse } from '@/types/book';

export default function searchPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const searchQuery = searchParams.get('query') ?? '';
  const [pageHistory, setPageHistory] = useState<string[]>([]);
  const [currentPage, setCurrentPage] = useState<string | null>(null);

  // Reset stack on new search
  useEffect(() => {
    if (!searchQuery) {
      setPageHistory([]);
      setCurrentPage(null);
      return;
    }

    const initialUrl = `/api/books?search=${encodeURIComponent(
      searchQuery.toLowerCase().trim()
    )}&limit=9`;

    setPageHistory([initialUrl]);
    setCurrentPage(initialUrl);
  }, [searchQuery]);

  const fetchBooks = async () => {
    if (!currentPage) return null;

    try {
      const res = await fetch(currentPage);

      if (!res.ok)
        throw new Error(
          `Failed to fetch book relating to ${searchQuery}. Status: ${res.status}`
        );

      const data: GetBookApiResponse = await res.json();
      return data;
    } catch (err) {
      throw new Error(
        `Failed to fetch book relating to ${searchQuery}: ${err}`
      );
    }
  };

  const { data } = useQuery({
    queryKey: ['book', searchQuery, currentPage],
    queryFn: fetchBooks,
    enabled: searchQuery !== '' && currentPage !== null,
    placeholderData: keepPreviousData,
  });

  // Derived values
  const books: Book[] = Array.isArray(data?.results) ? data.results : [];
  const canPrev = pageHistory.length > 1;
  const canNext = Boolean(data?.next);

  function goPrevPage() {
    if (pageHistory.length <= 1) return;

    setPageHistory((prevHistory) => {
      const nextHist = prevHistory.slice(0, -1);
      setCurrentPage(nextHist[nextHist.length - 1] ?? null);
      return nextHist;
    });
  }

  function goNextPage() {
    if (!data?.next) return;

    setPageHistory((prevHistory) => {
      const nextHist = [...prevHistory, data.next as string];
      setCurrentPage(data.next as string);
      return nextHist;
    });
  }

  function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();

    const searchBook = new FormData(e.currentTarget).get('search') as string;

    const queryParam = searchBook ? encodeURIComponent(searchBook) : '';

    if (queryParam) {
      router.push(`/search?query=${queryParam}`);
      e.currentTarget.reset();
    }
  }

  const bookElements = books.map((book) => {
    const authorsName = book.authors
      ? book.authors.map((author) => author.name).join(', ')
      : 'Unknown Author';

    return (
      <Link
        href={`/books/${book.id}`}
        key={book.id}
        className='group bg-white rounded p-4 shadow-sm border border-gray-100 hover:shadow-md hover:bg-gray-50/50 transition-all duration-300 cursor-pointer sm:bg-inherit sm:shadow-none sm:hover:shadow-none sm:border-none sm:hover:bg-gray-200'
      >
        <div className='flex flex-col h-full'>
          <div className='flex-1 flex flex-col gap-3 items-center text-center sm:flex-row sm:items-start sm:text-left'>
            <div className='w-24 h-36 flex-shrink-0'>
              <img
                src={book.cover}
                alt={`Cover of ${book.title}`}
                className='w-full h-full object-cover rounded-lg shadow-md group-hover:shadow-lg transition-shadow duration-300'
              />
            </div>
            <div>
              <h3 className='font-semibold text-gray-900 text-sm leading-tight line-clamp-2 sm:line-clamp-4'>
                {book.title}
              </h3>
              <p className='text-xs text-gray-600 line-clamp-1 sm:line-clamp-3'>
                {authorsName}
              </p>
            </div>
          </div>
        </div>
      </Link>
    );
  });

  return (
    <div className='flex flex-col min-h-screen bg-gradient-to-br from-slate-50 to-slate-100'>
      <Navbar />
      <main className='container mx-auto px-4 py-8 lg:py-12'>
        <div className='max-w-7xl mx-auto'>
          <div className='text-center space-y-6 mb-8'>
            <h1 className='text-3xl md:text-4xl lg:text-5xl font-bold text-gray-900 leading-tight'>
              Find your next great read among 70,000+ books
            </h1>
            <form onSubmit={handleSubmit} className='w-full max-w-2xl mx-auto'>
              <div className='relative'>
                <div className='absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none'>
                  <Image
                    src='/icons/searchIcon.png'
                    alt='Search for books'
                    width='20'
                    height='20'
                    className='text-gray-400'
                  />
                </div>
                <input
                  type='text'
                  name='search'
                  required
                  className='w-full pl-12 pr-4 py-4 bg-white border-2 border-gray-200 rounded-xl text-lg placeholder-gray-400 focus:outline-none focus:ring-4 focus:ring-amber-500/20 focus:border-amber-500 transition-all duration-200 shadow-sm'
                  placeholder='Search Library by Title or Author...'
                />
                <button
                  type='submit'
                  className='absolute inset-y-0 right-0 pr-4 flex items-center'
                >
                  <div className='px-6 py-2 bg-gradient-to-r from-amber-500 to-amber-600 text-white font-semibold rounded-lg hover:shadow-lg transition-all duration-200 hover:scale-105 hover:cursor-pointer'>
                    Search
                  </div>
                </button>
              </div>
            </form>
          </div>
          {searchQuery && (
            <div className='flex flex-col lg:flex-row gap-8'>
              <div className='flex-1'>
                <h2 className='text-2xl font-bold text-gray-900 mb-6 text-center lg:text-left'>
                  Books matching: "{searchQuery}"
                </h2>
                <div className='grid grid-cols-1 sm:grid-cols-3 gap-6 h-fit'>
                  {bookElements}
                </div>
              </div>
              <div className='lg:w-80 flex flex-col'>
                <div className='bg-white rounded-xl p-6 shadow-lg border border-gray-100 space-y-4'>
                  <h3 className='text-lg font-semibold text-gray-900'>
                    Navigation
                  </h3>
                  <div className='flex flex-col gap-3'>
                    {canPrev && (
                      <button
                        onClick={goPrevPage}
                        className='w-full px-4 py-3 bg-gradient-to-r from-blue-500 to-blue-600 text-white font-medium rounded-lg hover:shadow-lg transition-all duration-200 hover:scale-105 hover:cursor-pointer focus:outline-none focus:ring-4 focus:ring-blue-500/20'
                      >
                        ← Previous
                      </button>
                    )}
                    {canNext && (
                      <button
                        onClick={goNextPage}
                        className='w-full px-4 py-3 bg-gradient-to-r from-blue-500 to-blue-600 text-white font-medium rounded-lg hover:shadow-lg transition-all duration-200 hover:scale-105 hover:cursor-pointer focus:outline-none focus:ring-4 focus:ring-blue-500/20'
                      >
                        Next →
                      </button>
                    )}
                  </div>
                  <div className='pt-4 border-t border-gray-200 space-y-2'>
                    <div className='text-sm text-gray-600'>
                      <span className='font-medium'>
                        Page: {pageHistory.length} /
                        {data?.totalPages ? ` ${data?.totalPages}`: ' 0'}
                      </span>
                    </div>
                    <div className='text-sm text-gray-600'>
                      <span className='font-medium'>
                        Total Books: {data?.books || 0}
                      </span>
                    </div>
                    <div className='text-sm text-gray-600'>
                      <span className='font-medium'>
                        Search Query: "{searchQuery}"
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      </main>
      <Footer />
    </div>
  );
}
