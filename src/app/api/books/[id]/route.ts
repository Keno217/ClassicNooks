import { NextRequest, NextResponse } from 'next/server';
import { defRateLimit, dailyRateLimit } from '@/lib/ratelimiter';
import pool from '@/lib/db.ts';

export async function GET(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  const { id } = await params;

  try {
      // Rate limiting
      const ip = req.headers.get('x-forwarded-for')?.split(',')[0] ?? '127.0.0.1';
      const { success: burstSuccess } = await defRateLimit.limit(`book_id_${ip}`);
      const { success: dailySuccess } = await dailyRateLimit.limit(`book_id_${ip}`);
  
      if (!burstSuccess)
        return NextResponse.json({ error: 'Too many requests' }, { status: 429 });

      if (!dailySuccess)
        return NextResponse.json({ error: 'Daily request limit exceeded' }, { status: 429 });
  
    } catch (err) {
      console.log(`Rate limiter error: ${err}`);
      return NextResponse.json(
        { error: 'Internal server error' },
        { status: 500 }
      );
    }

  if (!id || isNaN(Number(id))) {
    return NextResponse.json(
      { error: 'Invalid book ID, it must be a number.' },
      { status: 400 }
    );
  }

  const bookId = Number(id);

  if (!Number.isSafeInteger(bookId) || bookId <= 0 || bookId > 2_147_483_647) {
    return NextResponse.json(
      { error: 'Invalid Book ID. Number is out of range.' },
      { status: 400 }
    );
  }

  try {
    const bookQuery = await pool.query(
      `
    SELECT 
      b.id,
      b.title,
      b.cover,
      b.description,
      b.book,
      json_agg(DISTINCT jsonb_build_object(
        'name', a.name,
        'birth_year', a.birth_year
      )) AS authors,
      json_agg(DISTINCT g.name) AS genres
    FROM books b
    LEFT JOIN book_authors ba 
      ON b.id = ba.book_id
    LEFT JOIN authors a 
      ON ba.author_id = a.id
    LEFT JOIN book_genres bg 
      ON b.id = bg.book_id
    LEFT JOIN genres g 
      ON bg.genre_id = g.id
    WHERE b.id = $1
    GROUP BY b.id
    `,
      [bookId]
    );

    if (bookQuery.rows.length === 0) {
      return NextResponse.json(
        { error: `Book#${bookId} could not be found.` },
        { status: 404 }
      );
    }

    return NextResponse.json(bookQuery.rows[0], { status: 200 });
    
  } catch (err) {
    console.log(`Internal server error. ${err}`);
    return NextResponse.json(
      { error: 'Internal server error.' },
      { status: 500 }
    );
  }
}
