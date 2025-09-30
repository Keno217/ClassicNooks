import { NextRequest, NextResponse } from 'next/server';
import pool from '@/lib/db.ts';
import argon2 from 'argon2';
import { ratelimit } from '@/lib/ratelimiter';

export async function POST(req: NextRequest) {
  try {
    // Rate limiting
    const ip = req.headers.get('x-forwarded-for')?.split(',')[0] ?? '127.0.0.1';
    const { success } = await ratelimit.limit(ip);

    if (!success)
      return NextResponse.json(
        { error: 'Rate limit exceeded.' },
        { status: 429 }
      );

  } catch (err) {
    console.log(`Rate limiter error: ${err}`);
    return NextResponse.json(
      { error: 'Internal server error.' },
      { status: 500 }
    );
  }

  let userId: string, user: string, password: string;

  try {
    // Parse request body
    const body = await req.json();
    user = body.user;
    password = body.password;

    if (!user || !password)
      return NextResponse.json({ error: 'Missing fields.' }, { status: 400 });

  } catch (err) {
    console.log(`Error parsing username/password: ${err}`);
    return NextResponse.json({ error: 'Invalid JSON.' }, { status: 400 });
  }

  try {
    // Validate username & password
    user = user.toLowerCase().trim();
    const { rows } = await pool.query(
      `
      SELECT id,
      username,
      password
      FROM users
      WHERE username = $1
      `,
      [user]
    );

    if (rows.length === 0)
      return NextResponse.json(
        { error: 'Invalid username or password.' },
        { status: 401 }
      );

    const isValidPassword = await argon2.verify(rows[0].password, password);

    if (!isValidPassword)
      return NextResponse.json(
        { error: 'Invalid username or password.' },
        { status: 401 }
      );

    userId = rows[0].id;
  } catch (err) {
    console.log(`DB or password verification error: ${err}`);
    return NextResponse.json(
      { error: 'Internal server error.' },
      { status: 500 }
    );
  }

  try {
    // Create session & send cookie
    const now = new Date();
    const expiresAt = new Date(now.getTime() + 6 * 60 * 60 * 1000);

    const { rows } = await pool.query(
      `
      INSERT INTO sessions (user_id, expires_at)
      VALUES ($1, $2)
      RETURNING id
      `,
      [userId, expiresAt]
    );

    const sessionId = rows[0].id;

    const response = NextResponse.json(
      { message: 'Login successful' },
      { status: 200 }
    );

    response.cookies.set('session', sessionId, {
      httpOnly: true,
      secure: false /* true */,
      sameSite: 'lax',
      /* domain: '.BookWorm.com', */
      maxAge: 6 * 60 * 60,
    });

    return response;
  } catch (err) {
    console.log(`DB/Session error: ${err}`);
    return NextResponse.json(
      { error: 'Internal server error.' },
      { status: 500 }
    );
  }
}
