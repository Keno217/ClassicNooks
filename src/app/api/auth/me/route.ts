import { NextRequest, NextResponse } from 'next/server';
import { defRateLimit } from '@/lib/ratelimiter';
import pool from '@/lib/db';

export async function GET(req: NextRequest) {
  try {
    // Rate limiting
    const ip = req.headers.get('x-forwarded-for')?.split(',')[0] ?? '127.0.0.1';
    const { success } = await defRateLimit.limit(`me_${ip}`);

    if (!success)
      return NextResponse.json({ error: 'Too many requests' }, { status: 429 });
    
  } catch (err) {
    console.log(`Rate limiter error: ${err}`);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }

  const sessionId = req.cookies.get('session')?.value;

  if (!sessionId) return NextResponse.json({ user: null }, { status: 200 });

  try {
    const { rows } = await pool.query(
      `
        SELECT users.id,
        users.username,
        sessions.csrf_token
        FROM users
        INNER JOIN sessions
          ON sessions.user_id = users.id
        WHERE sessions.id = $1
          AND expires_at > NOW();
        `,
      [sessionId]
    );

    if (rows.length === 0) {
      return NextResponse.json({ user: null }, { status: 200 });
    }

    return NextResponse.json(
      {
        user: { id: rows[0].id, username: rows[0].username },
        csrfToken: rows[0].csrf_token,
      },
      { status: 200 }
    );

  } catch (err) {
    console.error('DB session query error:', err);
    return NextResponse.json(
      { error: 'Internal Server Error' },
      { status: 500 }
    );
  }
}
