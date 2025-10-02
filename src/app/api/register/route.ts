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
      { error: 'Internal server error' },
      { status: 500 }
    );
  }

  let user: string, password: string;

  try {
    // Parse request body
    const body = await req.json();
    user = body.user;
    password = body.password;

    if (!user || !password)
      return NextResponse.json({ error: 'Missing fields' }, { status: 400 });

  } catch (err) {
    console.log(`Error parsing username/password: ${err}`);
    return NextResponse.json({ error: 'Invalid JSON' }, { status: 400 });
  }

  // Validate username and password
  if (user.length < 3 || user.length > 30)
    return NextResponse.json(
      { error: 'Username must be between 3 and 30 characters' },
      { status: 400 }
    );

  if (password.length < 8 || password.length > 64)
    return NextResponse.json(
      { error: 'Password must be between 8 and 64 characters' },
      { status: 400 }
    );

  const usernameRegex = /^[A-Za-z0-9]+$/;
  user = user.toLowerCase().trim();

  if (!usernameRegex.test(user))
    return NextResponse.json(
      { error: 'Username contains invalid characters' },
      { status: 400 }
    );

  try {
    // DB query
    const { rows } = await pool.query(
      `
      SELECT username
      FROM users
      WHERE username = $1
      `,
      [user]
    );

    // Check if there is already a prexisting user with this username
    if (rows.length > 0)
      return NextResponse.json(
        { error: 'Username already exists' },
        { status: 409 }
      );

    const hashedPassword = await argon2.hash(password);

    await pool.query(
      `
      INSERT INTO users (username, password)
      VALUES ($1, $2)
      `,
      [user, hashedPassword]
    );

    return NextResponse.json(
      { message: 'User registration successful' },
      { status: 201 }
    );

  } catch (err) {
    console.log(`Error inserting user into DB: ${err}`);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
