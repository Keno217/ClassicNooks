'use client';

import Image from 'next/image';
import { useQuery } from '@tanstack/react-query';
import { use, useEffect, useState } from 'react';
import { useAuth } from '@/context/AuthContext';
import Navbar from '@/components/Navbar.tsx';
import BookRail from '@/components/BookRail.tsx';
import Footer from '@/components/Footer';
import allGenres from '@/data/genres.ts';

export default function BookInfo({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const [isFavorited, setIsFavorited] = useState(false);
  const { user, csrfToken } = useAuth();
  const { id } = use(params);
  let bookId = Number(id);

  if (!bookId || isNaN(Number(bookId))) {
    bookId = 1;
  }

  useEffect(() => {
    const getFavoriteStatus = async () => {
      try {
        const resFav = await fetch(`/api/books/${bookId}/favorite-status`, {
          method: 'GET',
          credentials: 'include',
        });

        if (!resFav.ok) {
          setIsFavorited(false);
          return;
        }

        const favData = await resFav.json();
        setIsFavorited(favData.isFavorited);
      } catch (err) {
        setIsFavorited(false);
        console.log('Error fetching user/favorites:', err);
      }
    };

    getFavoriteStatus();
  }, [bookId, user?.id]);

  const fetchBook = async () => {
    try {
      const res = await fetch(`/api/books/${bookId}`);

      if (!res.ok) {
        throw new Error(
          `Failed to fetch book#${bookId}. Status: ${res.status}`
        );
      }

      const data = await res.json();
      return data;
    } catch (err) {
      console.log(`Internal server error. ${err}`);
      return null;
    }
  };

  const { data: book = [] } = useQuery({
    queryKey: ['book', bookId],
    queryFn: fetchBook,
  });

  const handleFavorite = async () => {
    if (!user) return;

    try {
      const method = isFavorited ? 'DELETE' : 'POST';

      const res = await fetch(`/api/books/${bookId}/favorite-status`, {
        method: method,
        credentials: 'include',
        headers: {
          'Content-Type': 'application/json',
          'X-CSRF-Token': csrfToken ?? '',
        },
      });

      if (!res.ok) {
        console.log('Failed to favorite/unfavorite book');
        return;
      }

      setIsFavorited((prevIsFavorite) => !prevIsFavorite);
    } catch (err) {
      console.log(`Error adding book#${bookId} to favorites:`, err);
    }
  };

  const handleBookHistory = async () => {
    if (!user) return;

    try {
      const res = await fetch('/api/users/me/history', {
        method: 'POST',
        credentials: 'include',
        body: JSON.stringify({ id: bookId }),
        headers: {
          'Content-Type': 'application/json',
          'X-CSRF-Token': csrfToken ?? '',
        },
      });

      if (!res.ok) {
        console.log('Failed to add book to user history');
        return;
      }
    } catch (err) {
      console.log(`Error adding book${bookId} to history`, err);
    }
  };

  const authorsName =
    book && book.authors
      ? book.authors
          .map(
            (author: { name: string; birth_year: number | null }) => author.name
          )
          .join(', ')
      : 'Unknown';

  const genres =
    book && book.genres
      ? allGenres.filter((genre: string) =>
          book.genres.find((g: string) => g.includes(genre))
        )
      : [];

  const genreElements = genres?.map((genre) => (
    <li
      className='px-3 py-1.5 bg-gradient-to-r from-blue-100 to-blue-200 text-blue-800 rounded-full text-sm font-medium border border-blue-300 transition-all duration-300 hover:shadow-md hover:scale-110 cursor-default'
      key={genre}
    >
      {genre}
    </li>
  ));

  const isGenre = genres.length > 0;

  return (
    <div className='min-h-screen bg-gradient-to-br from-slate-50 to-slate-100'>
      <Navbar />
      <main
        className='container mx-auto px-4 py-8 lg:py-12'
        role='main'
        aria-label='Book details page'
      >
        <div className='max-w-7xl mx-auto'>
          <div className='grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-12'>
            <div className='xl:col-span-3 lg:col-span-4'>
              <figure className='flex justify-center items-center h-full w-full'>
                <div className='w-[160px] h-[250px] lg:h-[500px] lg:w-80 flex justify-center items-center'>
                  <Image
                    src={book.cover || '/icons/bookCoverIcon.png'}
                    alt={`Cover of ${book?.title} by ${authorsName}`}
                    width={500}
                    height={800}
                    className='rounded-lg shadow-2xl w-full h-full object-fill'
                  />
                </div>
              </figure>
            </div>
            <div className='lg:col-span-8 xl:col-span-9 space-y-6'>
              <div className='text-center lg:text-left space-y-2'>
                <h1 className='text-3xl md:text-4xl lg:text-5xl font-bold text-gray-900 leading-tight'>
                  {book?.title}
                </h1>
                <h2 className='text-lg md:text-xl text-gray-600 font-medium'>
                  By {authorsName}
                </h2>
              </div>
              <div className='flex justify-center lg:justify-start'>
                <ul
                  className='flex flex-wrap justify-center gap-2 md:gap-3'
                  role='list'
                  aria-label='Book genres'
                >
                  {genreElements}
                </ul>
              </div>
              <div
                className='bg-white rounded-xl p-6 md:p-8 shadow-lg border border-gray-100'
                role='region'
                aria-label='Book description'
              >
                <p className='text-gray-700 text-base md:text-lg leading-relaxed max-w-none'>
                  {book?.description}
                </p>
              </div>
              <div
                className='flex flex-col sm:flex-row items-center justify-center lg:justify-start gap-4 pt-4'
                role='group'
                aria-label='Book actions'
              >
                <a
                  className='w-full sm:w-auto inline-flex items-center justify-center px-8 py-4 bg-gradient-to-r from-amber-500 to-amber-600 text-white text-lg font-semibold rounded-xl shadow-lg hover:shadow-xl transition-all duration-300 hover:scale-105 focus:outline-none focus:ring-4 focus:ring-amber-500/50 gap-x-4'
                  href={book?.book}
                  target='_blank'
                  rel='noopener noreferrer'
                  onClick={handleBookHistory}
                  aria-label={`Read ${book?.title} now`}
                >
                  <Image
                    src='/icons/bookIcon.png'
                    width={25}
                    height={25}
                    alt=''
                    aria-hidden='true'
                  />
                  Read Now
                </a>
                <div className='flex items-center gap-3'>
                  <button
                    className='cursor-pointer group p-4 bg-white hover:bg-red-50 border-2 border-gray-200 hover:border-red-300 rounded-xl transition-all duration-200 hover:shadow-md focus:outline-none focus:ring-4 focus:ring-red-500/20'
                    onClick={handleFavorite}
                    aria-label={
                      isFavorited
                        ? `Remove ${book?.title} from favorites`
                        : `Add ${book?.title} to favorites`
                    }
                    aria-pressed={isFavorited}
                  >
                    <Image
                      src={
                        isFavorited
                          ? '/icons/redHeartIcon.png'
                          : '/icons/blackHeartIcon.png'
                      }
                      alt=''
                      width='28'
                      height='28'
                      className='group-hover:scale-110 transition-transform duration-200'
                      aria-hidden='true'
                    />
                  </button>
                  <a
                    href={book?.book}
                    download
                    className='cursor-pointer group p-4 bg-white hover:bg-blue-50 border-2 border-gray-200 hover:border-blue-300 rounded-xl transition-all duration-200 hover:shadow-md focus:outline-none focus:ring-4 focus:ring-blue-500/20'
                    aria-label={`Download ${book?.title} eBook`}
                  >
                    <Image
                      src='/icons/downloadIcon.png'
                      alt=''
                      width={28}
                      height={28}
                      className='w-7 h-7 group-hover:scale-110 transition-transform duration-200'
                      aria-hidden='true'
                    />
                  </a>
                </div>
              </div>
            </div>
          </div>
        </div>
        <section
          className='mt-16'
          role='region'
          aria-label='Similar books recommendations'
        >
          <div className='py-12'>
            {isGenre ? (
              <BookRail
                title='Similar books you may like...'
                url={`/api/books?genre=${genres[0]}`}
              />
            ) : (
              <BookRail title='Other Trending Books' url='/api/books' />
            )}
          </div>
        </section>
      </main>
      <Footer />
    </div>
  );
}
