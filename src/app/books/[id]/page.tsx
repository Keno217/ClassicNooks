'use client';

import Image from 'next/image';
import Link from 'next/link';
import { useQuery } from '@tanstack/react-query';
import { use } from 'react';
import Navbar from '@/components/Navbar.tsx';
import BookRail from '@/components/BookRail.tsx';
import allGenres from '@/data/genres.ts';

export default function BookSummary({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = use(params);
  let bookId = Number(id);

  if (!bookId || isNaN(Number(bookId))) {
    bookId = 1;
  }

  const fetchBook = async (bookId: number) => {
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
    queryFn: () => fetchBook(bookId),
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
    <li className='px-4 py-2 bg-gray-300 rounded-lg text-sm' key={genre}>
      {genre}
    </li>
  ));
  const isGenre = genres.length > 0;

  return (
    <div className='flex flex-col lg:min-h-screen'>
      <Navbar />
      <main className='lg:flex'>
        <div className='flex flex-col-reverse px-2'>
          <div className='flex flex-col lg:w-9/12 gap-4 mt-4'>
            <div>
              <h1 className='text-center text-2xl'>{book.title}</h1>
              <h2 className='text-center text-gray-500'>By {authorsName}</h2>
            </div>
            <div className='flex flex-col-reverse'>
              <p className='text-base mt-4 px-4 max-w-[100ch]'>
                {book.description}
              </p>
              <ul className='flex flex-wrap justify-center gap-4 text-xl'>
                {genreElements}
              </ul>
            </div>
            <Link
              className='w-fit h-fit m-auto mt-4 rounded px-5 py-3 bg-amber-500 text-lg'
              href={`/books/${bookId}/read-now`}
            >
              Read Now
            </Link>
            <div className='flex justify-center items-center gap-4 mt-4'>
              <button className='p-3 border rounded-full hover:cursor-pointer'>
                <Image
                  src='/icons/heartIcon.png'
                  alt='Add to Favorites'
                  width='32'
                  height='32'
                />
              </button>
              <button
                className='p-3 border rounded-full hover:cursor-pointer'
                onClick={() => {
                  console.log('test');
                }}
              >
                <img
                  src='https://cdn-icons-png.flaticon.com/512/0/532.png'
                  alt='Download eBook'
                  className='w-[32px] h-[32px]'
                />
              </button>
            </div>
          </div>
          <figure className='mt-8 flex flex-grow justify-center items-center'>
            <img
              src={book.cover}
              alt={`Cover of ${book.title} by ${authorsName}`}
            ></img>
          </figure>
        </div>
      </main>
      {isGenre ? (
        <footer className='mt-auto mb-8'>
          <BookRail
            title='Similar books you may like...'
            url={`http://localhost:3000/api/books?genre=${genres[0]}`}
          />
        </footer>
      ) : (
        <footer className='mt-auto'>
          <BookRail
            title='Other Trending Books'
            url='http://localhost:3000/api/books'
          />
        </footer>
      )}
    </div>
  );
}
