'use client';

import Image from 'next/image';
import { useState, useEffect, useRef } from 'react';
import { useInfiniteQuery } from '@tanstack/react-query';
import BookCard from './BookCard.tsx';
import { useAuth } from '@/context/AuthContext.tsx';
import type { Book, GetBookApiResponse } from '@/types/book';

export default function BookRail({
  title,
  url,
}: {
  title: string;
  url: string;
}) {
  const [showLeftArrow, setShowLeftArrow] = useState(false);
  const [showRightArrow, setShowRightArrow] = useState(false);
  const bookRailRef = useRef<HTMLDivElement>(null);
  const { user } = useAuth();

  const fetchBooks = async ({
    pageParam = url,
  }): Promise<GetBookApiResponse> => {
    try {
      const fetchUrl = pageParam;
      const res = await fetch(fetchUrl);
      if (!res.ok) throw new Error('Failed to fetch books');
      const data: GetBookApiResponse = await res.json();
      return data;
    } catch (err) {
      throw new Error('Failed to fetch books');
    }
  };

  const {
    data,
    fetchNextPage,
    hasNextPage,
    isFetchingNextPage,
    isError,
    error,
  } = useInfiniteQuery({
    queryKey: ['books', url, user?.id],
    queryFn: fetchBooks,
    getNextPageParam: (lastPage) => lastPage.next ?? undefined,
    initialPageParam: url,
  });

  // TODO: Implement error handling, also add stats about bookrail, maybe more info
  const books: Book[] = data?.pages.flatMap((page) => page.results) ?? [];

  const updateBookRail = async (): Promise<void> => {
    const container = bookRailRef.current;

    if (container) {
      // Has the user scrolled at all?
      const hasScrolledLeft = container.scrollLeft > 0;

      /* Display right arrow if
      not at the end of container */
      const hasScrolledRight =
        container.scrollLeft < container.scrollWidth - container.clientWidth;

      // Display left/right arrow if they did
      setShowLeftArrow(hasScrolledLeft);
      setShowRightArrow(hasScrolledRight);

      // Lazy load next set of books
      const halfway = container.scrollWidth / 2;

      if (
        hasNextPage &&
        container.scrollLeft + container.clientWidth >= halfway &&
        !isFetchingNextPage
      ) {
        await fetchNextPage();
      }
    }
  };

  useEffect(() => {
    const container = bookRailRef.current;

    if (container) {
      updateBookRail();
      container.addEventListener('scroll', updateBookRail);

      return () => {
        container.removeEventListener('scroll', updateBookRail);
      };
    }
    /* Books in dependency arr so the
    arrows appear upon rendering books */
  }, [books]);

  const scrollLeft = (): void => {
    const container = bookRailRef.current;

    if (container) {
      container.scrollBy({ left: -400, behavior: 'smooth' });
    }
  };

  const scrollRight = async () => {
    const container = bookRailRef.current;

    if (container) container.scrollBy({ left: 400, behavior: 'smooth' });
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
            data-testid='book-rail-container'
            className='flex overflow-x-auto gap-4 md:gap-6 scrollbar-hide scroll-smooth pb-2'
          >
            {BookElements}
          </div>
        </div>
      </div>
    </section>
  );
}
