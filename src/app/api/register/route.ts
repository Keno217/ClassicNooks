import pool from '@/lib/db.ts';
import argon2 from 'argon2';
import { ratelimit } from '@/lib/ratelimiter';

export async function POST(req: Request) {
  try {
    // Rate the amount of times a user can POST to this API
    const ip = req.headers.get('x-forwarded-for')?.split(',')[0] ?? '127.0.0.1';
    const { success } = await ratelimit.limit(ip);

    if (!success)
      return new Response(JSON.stringify({ error: 'Rate limit exceeded.' }), {
        status: 429,
      });

    const { user, password } = await req.json();

    if (!user || !password)
      return new Response(JSON.stringify({ error: 'Missing Fields.' }), {
        status: 400,
      });

    if (user.length < 3 || user.length > 30)
      return new Response(
        JSON.stringify({
          error: 'Username must be between 3 and 30 characters.',
        }),
        {
          status: 400,
        }
      );

    if (password.length < 8 || password.length > 64)
      return new Response(
        JSON.stringify({
          error: 'Password must be between 8 and 64 characters.',
        }),
        { status: 400 }
      );

    const usernameRegex = /^[A-Za-z0-9]+$/;
    const username = user.toLowerCase().trim();

    if (!usernameRegex.test(username))
      return new Response(
        JSON.stringify({ error: 'Username contains invalid characters.' }),
        { status: 400 }
      );

    // Check if there is already a prexisting user with this username
    const { rows } = await pool.query(
      `
      SELECT username
      FROM users
      WHERE username = $1
      `,
      [username]
    );

    if (rows.length > 0)
      return new Response(
        JSON.stringify({ error: 'Username already exists.' }),
        { status: 409 }
      );

    const hashedPassword = await argon2.hash(password);

    await pool.query(
      `
      INSERT INTO users (username, password)
      VALUES ($1, $2)
      `,
      [username, hashedPassword]
    );

    return new Response(
      JSON.stringify({ message: 'User registration successful.', username }),
      { status: 201 }
    );
  } catch (err) {
    console.log(`Error handling user registration: ${err}`);
    return new Response(`Internal server error`, { status: 500 });
  }
}
