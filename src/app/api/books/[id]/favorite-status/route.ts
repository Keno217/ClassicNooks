import { NextRequest, NextResponse } from 'next/server';
import { defRateLimit } from '@/lib/ratelimiter';
import getUserFromSession from '@/lib/session';
import pool from '@/lib/db.ts';

export async function GET(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  const { id } = await params;

  try {
    // Rate limiting
    const ip = req.headers.get('x-forwarded-for')?.split(',')[0] ?? '127.0.0.1';
    const { success } = await defRateLimit.limit(`favorites_${ip}`);

    if (!success)
      return NextResponse.json({ error: 'Too many requests' }, { status: 429 });
    
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

  const user = await getUserFromSession(req);

  if (!user)
    return NextResponse.json({ error: 'User not authorized' }, { status: 401 });

  try {
    const { rows } = await pool.query(
      `
      SELECT b.id
      FROM user_favorites uf
      INNER JOIN books b
        ON uf.book_id = b.id
      WHERE uf.user_id = $1
        AND b.id = $2
      ORDER BY uf.created_at DESC
      `,
      [user.id, bookId]
    );

    return NextResponse.json({ isFavorited: rows.length > 0 }, { status: 200 });
  } catch (err) {
    console.log('DB error:', err);
    return NextResponse.json(
      { error: `Internal server error` },
      { status: 500 }
    );
  }
}

export async function POST(req: NextRequest) {}
