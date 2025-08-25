'use client';

import Image from 'next/image';
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
    <section className='w-full flex flex-col px-4 lg:px-6 py-6'>
      <div className='max-w-7xl mx-auto w-full'>
        <h2 className='text-2xl md:text-3xl font-bold text-gray-900 mb-6'>
          {title}
        </h2>
        <div className='relative group'>
          {showLeftArrow && (
            <button
              onClick={scrollLeft}
              className='absolute left-0 top-0 z-10 w-16 h-full bg-gradient-to-r from-black/30 to-transparent flex items-center justify-center transition-all duration-300 opacity-0 group-hover:opacity-100'
              aria-label='Scroll left'
            >
              <Image
                src='/icons/leftArrowIcon.png'
                alt='Click to view more books'
                width={24}
                height={24}
                className='w-6 h-6'
              />
            </button>
          )}
          {showRightArrow && (
            <button
              onClick={scrollRight}
              className='absolute right-0 top-0 z-10 w-16 h-full bg-gradient-to-l from-black/30 to-transparent flex items-center justify-center transition-all duration-300 opacity-0 group-hover:opacity-100'
              aria-label='Scroll right'
            >
              <Image
                src='/icons/rightArrowIcon.png'
                alt='Click to view more books'
                width={24}
                height={24}
                className='w-6 h-6'
              />
            </button>
          )}
          <div
            ref={bookRailRef}
            className='flex overflow-x-auto gap-4 md:gap-6 scrollbar-hide scroll-smooth pb-2'
          >
            {BookElements}
          </div>
        </div>
      </div>
    </section>
  );
}
