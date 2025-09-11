'use client';

import Image from 'next/image';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useQuery } from '@tanstack/react-query';
import { use } from 'react';
import Navbar from '@/components/Navbar.tsx';
import BookRail from '@/components/BookRail.tsx';
import allGenres from '@/data/genres.ts';

export default function BookInfo({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const pathName = usePathname();
  const { id } = use(params);
  let bookId = Number(id);

  if (!bookId || isNaN(Number(bookId))) {
    bookId = 1;
  }

  const fetchBook = async () => {
    try {
      const res = await fetch(`http://localhost:3000/api/books/${bookId}`);

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
  const readBook = book?.book ? book.book : pathName;

  /* 
    TODO: Convert all img to Image component for optimization later
    const bookCover =
      book.cover && book.cover !== '' ? book.cover : '/book-cover.jpg';
  */

  return (
    <div className='min-h-screen bg-gradient-to-br from-slate-50 to-slate-100'>
      <Navbar />
      <main className='container mx-auto px-4 py-8 lg:py-12'>
        <div className='max-w-7xl mx-auto'>
          <div className='grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-12'>
            <div className='xl:col-span-3 lg:col-span-4'>
              <figure className='flex justify-center items-center h-full w-full'>
                <div className='w-[160px] h-[250px] lg:h-[500px] lg:w-80 flex justify-center items-center'>
                  <img
                    src={book?.cover}
                    alt={`Cover of ${book?.title} by ${authorsName}`}
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
                <ul className='flex flex-wrap justify-center gap-2 md:gap-3'>
                  {genreElements}
                </ul>
              </div>
              <div className='bg-white rounded-xl p-6 md:p-8 shadow-lg border border-gray-100'>
                <p className='text-gray-700 text-base md:text-lg leading-relaxed max-w-none'>
                  {book?.description}
                </p>
              </div>
              <div className='flex flex-col sm:flex-row items-center justify-center lg:justify-start gap-4 pt-4'>
                <Link
                  className='w-full sm:w-auto inline-flex items-center justify-center px-8 py-4 bg-gradient-to-r from-amber-500 to-amber-600 text-white text-lg font-semibold rounded-xl shadow-lg hover:shadow-xl transition-all duration-300 hover:scale-105 focus:outline-none focus:ring-4 focus:ring-amber-500/50'
                  href={readBook}
                >
                  📖 Read Now
                </Link>
                <div className='flex items-center gap-3'>
                  <button className='cursor-pointer group p-4 bg-white hover:bg-red-50 border-2 border-gray-200 hover:border-red-300 rounded-xl transition-all duration-200 hover:shadow-md focus:outline-none focus:ring-4 focus:ring-red-500/20'>
                    <Image
                      src='/icons/heartIcon.png'
                      alt='Add to Favorites'
                      width='28'
                      height='28'
                      className='group-hover:scale-110 transition-transform duration-200'
                    />
                  </button>
                  <button className='cursor-pointer group p-4 bg-white hover:bg-blue-50 border-2 border-gray-200 hover:border-blue-300 rounded-xl transition-all duration-200 hover:shadow-md focus:outline-none focus:ring-4 focus:ring-blue-500/20'>
                    <img
                      src='https://cdn-icons-png.flaticon.com/512/0/532.png'
                      alt='Download eBook'
                      className='w-7 h-7 group-hover:scale-110 transition-transform duration-200'
                    />
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </main>
      <footer className='bg-white border-t border-gray-200 mt-16'>
        <div className='py-12'>
          {isGenre ? (
            <BookRail
              title='Similar books you may like...'
              url={`http://localhost:3000/api/books?genre=${genres[0]}`}
            />
          ) : (
            <BookRail
              title='Other Trending Books'
              url='http://localhost:3000/api/books'
            />
          )}
        </div>
      </footer>
    </div>
  );
}
