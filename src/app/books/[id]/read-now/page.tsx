'use client';

import { useParams } from 'next/navigation';
import { useQuery } from '@tanstack/react-query';
import Navbar from '@/components/Navbar';
import type { Book } from '@/types/book';

export default function Read() {
  const params = useParams<{ id: string }>();
  const { id } = params;

  const fetchBook = async () => {
    if (id) {
      try {
        const res = await fetch(`/api/books/${id}`);

        if (!res.ok)
          throw new Error(`Failed to fetch book#${id}. Status: ${res.status}`);

        const data: Book = await res.json();
        return data ?? null;
      } catch (err) {
        console.log(`Error: ${err}`);
      }
    } else {
      return null;
    }
  };

  const { data } = useQuery({
    queryKey: ['book', id],
    queryFn: fetchBook,
  });

  /* TODO: Add a second useQuery for api/books/text
  and implement responsive layout logic */

  return (
    <div className='flex flex-col'>
      <Navbar />
      <h1>{data && data.title}</h1>
    </div>
  );
}
