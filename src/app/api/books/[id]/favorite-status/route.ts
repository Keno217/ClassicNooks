import { NextRequest, NextResponse } from 'next/server';
import getUserFromSession from '@/lib/session';
import pool from '@/lib/db.ts';

export async function GET(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  const { id } = await params;

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

  // Check session
  const user = await getUserFromSession(req);

  if (!user)
    return NextResponse.json({ error: 'User not authorized' }, { status: 401 });

  try {
    const { rows } = await pool.query(
      `
      SELECT 1
      FROM user_favorites
      WHERE user_id = $1
        AND book_id = $2
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

export async function POST(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  const { id } = await params;

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

  // Check session & CSRF token
  const user = await getUserFromSession(req);
  const csrfHeader = req.headers.get('X-CSRF-Token');

  if (!user)
    return NextResponse.json({ error: 'User not authorized' }, { status: 401 });

  if (!csrfHeader || csrfHeader !== user.csrfToken) {
    return NextResponse.json({ error: 'User not authorized' }, { status: 403 });
  }

  try {
    await pool.query(
      `
      INSERT INTO user_favorites (user_id, book_id)
      VALUES ($1, $2)
      ON CONFLICT (user_id, book_id) DO NOTHING
      `,
      [user.id, bookId]
    );

    return NextResponse.json({ success: true }, { status: 200 });
  } catch (err) {
    console.log('DB error adding book into favorites:', err);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

export async function DELETE(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  const { id } = await params;

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

  // Check session & CSRF token
  const user = await getUserFromSession(req);
  const csrfHeader = req.headers.get('X-CSRF-Token');

  if (!user)
    return NextResponse.json({ error: 'User not authorized' }, { status: 401 });

  if (!csrfHeader || csrfHeader !== user.csrfToken) {
    return NextResponse.json({ error: 'User not authorized' }, { status: 403 });
  }

  try {
    await pool.query(
      `
      DELETE FROM user_favorites
      WHERE user_id = $1
        AND book_id = $2;
      `,
      [user.id, bookId]
    );

    return NextResponse.json({ success: true }, { status: 200 });
  } catch (err) {
    console.log('DB error removing book from favorites:', err);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
