'use client';

import { useState, useEffect, useRef } from 'react';
import Book from './Book.tsx';

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
  const [books, setBooks] = useState<Book[]>([]);
  const scrollContainerRef = useRef<HTMLDivElement>(null);
  const [showLeftArrow, setShowLeftArrow] = useState(false);
  const [showRightArrow, setShowRightArrow] = useState(false);

  useEffect(() => {
    let nextPage: string | null = url;

    const fetchBooks = async () => {
      let totalBooks = 0;

      while (nextPage) {
        if (totalBooks >= 1000) break;

        try {
          const res = await fetch(nextPage);
          const data = await res.json();
          nextPage = data.next;
          totalBooks += data.results.length;
          setBooks((prevBooks) => [...prevBooks, ...data.results]);
        } catch (err) {
          console.log(err);
        }
      }
    };

    fetchBooks();
  }, []);

  console.log(books);

  const updateArrowVisibility = () => {
    const container = scrollContainerRef.current;
    if (container) {
      setShowLeftArrow(container.scrollLeft > 0);
      setShowRightArrow(
        container.scrollLeft < container.scrollWidth - container.clientWidth
      );
    }
  };

  const scrollLeft = () => {
    const container = scrollContainerRef.current;
    if (container) {
      container.scrollBy({ left: -400, behavior: 'smooth' });
    }
  };

  const scrollRight = () => {
    const container = scrollContainerRef.current;
    if (container) {
      container.scrollBy({ left: 400, behavior: 'smooth' });
    }
  };

  useEffect(() => {
    const container = scrollContainerRef.current;
    if (container) {
      updateArrowVisibility();
      container.addEventListener('scroll', updateArrowVisibility);
      window.addEventListener('resize', updateArrowVisibility);

      return () => {
        container.removeEventListener('scroll', updateArrowVisibility);
        window.removeEventListener('resize', updateArrowVisibility);
      };
    }
  }, [books]);

  const BookElements = books.map((bookObj) => (
    <Book
      key={bookObj.id}
      title={bookObj.title ?? 'Untitled'}
      author={bookObj.authors.map((a) => a.name).join(', ') ?? 'Unknown'}
      cover={bookObj.cover}
    />
  ));

  return (
    <section className='w-full flex flex-col px-4 mt-8'>
      <h2 className='text-xl font-bold mb-2'>{title}</h2>
      <div className='relative group'>
        {/* Left Arrow */}
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

        {/* Right Arrow */}
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

        {/* Scrollable Container */}
        <div
          ref={scrollContainerRef}
          className='flex overflow-x-auto gap-4 scrollbar-hide scroll-smooth'
        >
          {BookElements}
        </div>
      </div>
    </section>
  );
}
