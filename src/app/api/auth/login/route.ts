import { NextRequest, NextResponse } from 'next/server';
import pool from '@/lib/db.ts';
import argon2 from 'argon2';
import { authRateLimit } from '@/lib/ratelimiter';

export async function POST(req: NextRequest) {
  let userId: string, user: string, password: string, captchaToken: string;
  const secret = process.env.RECAPTCHA_SECRET_KEY;

  try {
    // Rate limiting
    const ip = req.headers.get('x-forwarded-for')?.split(',')[0] ?? '127.0.0.1';
    const { success } = await authRateLimit.limit(`login_${ip}`);

    if (!success)
      return NextResponse.json({ error: 'Too many requests' }, { status: 429 });

  } catch (err) {
    console.log(`Rate limiter error: ${err}`);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }

  try {
    // Parse request body
    const body = await req.json();
    user = body.user;
    password = body.password;
    captchaToken = body.captchaToken;

    if (!user || !password)
      return NextResponse.json({ error: 'Missing fields' }, { status: 400 });

    if (!captchaToken)
      return NextResponse.json(
        { error: 'Missing captcha token' },
        { status: 400 }
      );

  } catch (err) {
    console.log(`Error parsing username/password/captcha-token: ${err}`);
    return NextResponse.json({ error: 'Invalid JSON' }, { status: 400 });
  }

  try {
    // Verify reCAPTCHA token
    const captchaRes = await fetch(
      `https://www.google.com/recaptcha/api/siteverify?secret=${secret}&response=${captchaToken}`,
      { method: 'POST' }
    );

    const data = await captchaRes.json();

    if (!data.success)
      return NextResponse.json({ error: 'reCAPTCHA failed' }, { status: 400 });

  } catch (err) {
    console.log(`Error verifying reCAPTCHA: ${err}`);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
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
        { error: 'Invalid username or password' },
        { status: 401 }
      );

    const isValidPassword = await argon2.verify(rows[0].password, password);

    if (!isValidPassword)
      return NextResponse.json(
        { error: 'Invalid username or password' },
        { status: 401 }
      );

    userId = rows[0].id;
  } catch (err) {
    console.log(`DB or password verification error: ${err}`);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }

  try {
    // Delete previous sessions
    await pool.query(
      `
      DELETE FROM sessions
      WHERE user_id = $1
        AND expires_at < NOW();
      `,
      [userId]
    );

    // Create session & send cookie
    const now = new Date();
    const expiresAt = new Date(now.getTime() + 6 * 60 * 60 * 1000);

    const { rows } = await pool.query(
      `
      INSERT INTO sessions (user_id, expires_at)
      VALUES ($1, $2)
      RETURNING id;
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
      sameSite: 'lax' /* none TODO: Add CRSF protections later before deployment */,
      path: '/',
      maxAge: 6 * 60 * 60,
    });

    // Take out all of the fetch requests to api/me on frontend pages, only one is needed with usecontext
    // Set up CORS/CSP headers

    return response;
  } catch (err) {
    console.log(`DB/Session error: ${err}`);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
