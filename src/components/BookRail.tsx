'use client';

import { useState, useEffect, useRef } from 'react';
import { useQuery } from '@tanstack/react-query';
import BookCard from './BookCard.tsx';

interface Author {
  name: string;
}

interface Book {
  id: number;
  title: string;
  authors: Author[];
  cover: string;
}

export default function BookRail({
  title,
  url,
}: {
  title: string;
  url: string;
}) {
  const bookRailRef = useRef<HTMLDivElement>(null);
  /* 
  TODO: Implement hash map instead of arr

  const [arrows, setArrows] = useState({
    left: false,
    right: false,
  }); */
  const [showLeftArrow, setShowLeftArrow] = useState(false);
  const [showRightArrow, setShowRightArrow] = useState(false);

  const fetchAllBooks = async (url: string): Promise<Book[]> => {
    let nextPage: string | null = url;
    let allBooks: Book[] = [];
    let totalBooks = 0;

    while (nextPage) {
      if (totalBooks >= 1000) break;
      const res = await fetch(nextPage);
      const data: {
        page: string;
        totalPages: string;
        books: string; // This is book count
        next: string | null;
        results: Book[];
      } = await res.json();
      allBooks.push(...data.results);
      totalBooks += data.results.length;
      nextPage = data.next;
    }

    return allBooks;
  };

  const { data: books = [] } = useQuery({
    queryKey: ['books', url],
    queryFn: () => fetchAllBooks(url),
  });

  console.log(books);

  const updateArrowVisibility = () => {
    const container = bookRailRef.current;

    if (container) {
      // Has the user scrolled at all?
      const hasScrolledLeft = container.scrollLeft > 0; // Display left arrow if they did

      /* Display right arrow if
      not at the end of container */
      const hasScrolledRight =
        container.scrollLeft < container.scrollWidth - container.clientWidth;

      setShowLeftArrow(hasScrolledLeft);
      setShowRightArrow(hasScrolledRight);
    }
  };

  useEffect(() => {
    const container = bookRailRef.current;

    if (container) {
      updateArrowVisibility();
      container.addEventListener('scroll', updateArrowVisibility);

      return () => {
        container.removeEventListener('scroll', updateArrowVisibility);
      };
    }
    /* Books in dependency arr so the
    arrows appear upon rendering books */
  }, [books]);

  const scrollLeft = () => {
    const container = bookRailRef.current;

    if (container) {
      container.scrollBy({ left: -400, behavior: 'smooth' });
    }
  };

  const scrollRight = () => {
    const container = bookRailRef.current;

    if (container) {
      container.scrollBy({ left: 400, behavior: 'smooth' });
    }
  };

  const BookElements = books.map((bookObj) => (
    <BookCard
      key={bookObj.id}
      id={bookObj.id}
      title={bookObj.title ?? 'Untitled'}
      author={bookObj.authors.map((a) => a.name).join(', ') ?? 'Unknown'}
      cover={bookObj.cover}
    />
  ));

  return (
    <section className='w-full flex flex-col px-4 mt-8'>
      <h2 className='text-xl font-bold mb-2'>{title}</h2>
      <div className='relative group'>
        {showLeftArrow && (
          <button
            onClick={scrollLeft}
            className='absolute left-0 top-1/2 -translate-y-1/2 z-10 w-12 h-12 mx-4 bg-gray-800/20 hover:bg-gray-800/40 rounded-full flex items-center justify-center transition-all duration-200 opacity-0 group-hover:opacity-100'
            aria-label='Scroll left'
          >
            <svg
              className='w-6 h-6 text-white'
              fill='none'
              stroke='currentColor'
              viewBox='0 0 24 24'
            >
              <path
                strokeLinecap='round'
                strokeLinejoin='round'
                strokeWidth={2}
                d='M15 19l-7-7 7-7'
              />
            </svg>
          </button>
        )}
        {showRightArrow && (
          <button
            onClick={scrollRight}
            className='absolute right-0 top-1/2 -translate-y-1/2 z-10 w-12 h-12 mx-4 bg-gray-800/20 hover:bg-gray-800/40 rounded-full flex items-center justify-center transition-all duration-200 opacity-0 group-hover:opacity-100'
            aria-label='Scroll right'
          >
            <svg
              className='w-6 h-6 text-white'
              fill='none'
              stroke='currentColor'
              viewBox='0 0 24 24'
            >
              <path
                strokeLinecap='round'
                strokeLinejoin='round'
                strokeWidth={2}
                d='M9 5l7 7-7 7'
              />
            </svg>
          </button>
        )}
        <div
          ref={bookRailRef}
          className='flex overflow-x-auto gap-4 scrollbar-hide scroll-smooth'
        >
          {BookElements}
        </div>
      </div>
    </section>
  );
}
