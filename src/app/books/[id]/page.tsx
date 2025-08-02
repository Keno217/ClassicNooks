'use client';

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

  const genreElements = genres?.map((genre) => <li key={genre}>{genre}</li>);
  const isGenre = genres.length > 0;

  return (
    <div className='flex flex-col lg:min-h-screen'>
      <Navbar />
      <main className='lg:flex'>
        <div className='flex flex-col-reverse'>
          <div className='flex flex-col lg:w-9/12'>
            <h1>{book.title}</h1>
            <h2>By {authorsName}</h2>
            <p>{book.description}</p>
            <ul className='flex gap-4'>{genreElements}</ul>
            <Link href={`/books/${bookId}/read-now`}>Read Now</Link>
          </div>
          <figure className='flex flex-grow justify-center items-center'>
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
