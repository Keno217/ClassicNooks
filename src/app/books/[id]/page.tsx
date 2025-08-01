'use client';

import { useQuery } from '@tanstack/react-query';
import { use } from 'react';

export default function BookSummary({ params }: { params: Promise<{ id: string }>; }) {
  const { id } = use(params);
  let bookId = Number(id);

  if (!bookId || isNaN(Number(bookId))) {
    bookId = 1;
  }

  const { data: book = [] } = useQuery({
    queryKey: ['book', bookId],
    queryFn: () => fetchBook(bookId),
  });

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

  return <h1>{book.title}</h1>;
}
