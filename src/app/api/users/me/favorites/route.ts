import getUserFromSession from '@/lib/session';
import { NextRequest, NextResponse } from 'next/server';
import pool from '@/lib/db';

export async function GET(req: NextRequest) {
  const user = await getUserFromSession(req);

  if (!user)
    return NextResponse.json(
      { error: 'User not authenticated' },
      { status: 401 }
    );

  try {
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
        uf.created_at AS favorited_at
      FROM user_favorites uf
      INNER JOIN books b 
        ON uf.book_id = b.id
      LEFT JOIN book_authors ba 
        ON b.id = ba.book_id
      LEFT JOIN authors a 
        ON a.id = ba.author_id
      LEFT JOIN book_genres bg 
        ON b.id = bg.book_id
      LEFT JOIN genres g 
        ON g.id = bg.genre_id
      WHERE uf.user_id = $1
      GROUP BY b.id, uf.created_at
      ORDER BY uf.created_at DESC;
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
