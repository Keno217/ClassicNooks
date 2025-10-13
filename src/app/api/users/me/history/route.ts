import getUserFromSession from '@/lib/session';
import { NextRequest, NextResponse } from 'next/server';
import pool from '@/lib/db';

export async function GET(req: NextRequest) {
  // Verify session
  const user = await getUserFromSession(req);

  if (!user)
    return NextResponse.json(
      { error: 'User not authenticated' },
      { status: 401 }
    );

  try {
    // DB query for user's history of books
    const { rows } = await pool.query(
      `
      SELECT 
        b.id,
        b.title,
        b.cover,
        b.book,
        b.description,
        json_agg(DISTINCT jsonb_build_object(
          'name', a.name,
          'birth_year', a.birth_year
        )) AS authors,
        json_agg(DISTINCT jsonb_build_object(
          'name', g.name
        )) FILTER (WHERE g.name IS NOT NULL) AS genres,
        uh.created_at AS read_at
      FROM user_history uh
      INNER JOIN books b 
        ON uh.book_id = b.id
      LEFT JOIN book_authors ba 
        ON b.id = ba.book_id
      LEFT JOIN authors a 
        ON a.id = ba.author_id
      LEFT JOIN book_genres bg 
        ON b.id = bg.book_id
      LEFT JOIN genres g 
        ON g.id = bg.genre_id
      WHERE uh.user_id = $1
      GROUP BY b.id, uh.created_at
      ORDER BY uh.created_at DESC;
      `,
      [user.id]
    );

    return NextResponse.json(
      {
        results: rows,
        next: null,
      },
      { status: 200 }
    );
    
  } catch (err) {
    console.log('DB error', err);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

export async function POST(req: NextRequest) {
  const { id } = await req.json();

  // Validate/sanitize input
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

  // Verify session
  const user = await getUserFromSession(req);
  const csrfHeader = req.headers.get('X-CSRF-Token');

  if (!user)
    return NextResponse.json({ error: 'User not authorized' }, { status: 401 });

  if (!csrfHeader || csrfHeader !== user.csrfToken) {
    return NextResponse.json({ error: 'User not authorized' }, { status: 403 });
  }

  try {
    // DB query to insert book into user's history
    await pool.query(
      `
      INSERT INTO user_history (user_id, book_id)
      VALUES ($1, $2)
      ON CONFLICT (user_id, book_id)
      DO UPDATE SET created_at = NOW();
      `,
      [user.id, bookId]
    );

    return NextResponse.json({ success: true }, { status: 200 });
  } catch (err) {
    console.log('DB error', err);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
