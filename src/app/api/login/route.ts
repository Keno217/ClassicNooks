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

    const username = user.toLowerCase().trim();

    // Validate username & password
    const { rows } = await pool.query(
      `
      SELECT username,
      password
      FROM users
      WHERE username = $1
      `,
      [username]
    );

    if (rows.length === 0)
      return new Response(
        JSON.stringify({ error: 'Invalid username or password.' }),
        { status: 401 }
      );

    const isValidPassword = await argon2.verify(rows[0].password, password);

    if (!isValidPassword)
      return new Response(
        JSON.stringify({ error: 'Invalid username or password.' }),
        { status: 401 }
      );
      
    //Implement cookies, research time...  
    return new Response(JSON.stringify({ message: 'Login successful.' }), {
      status: 200,
    });
    
  } catch (err) {
    console.log(`Error handling user registration: ${err}`);
    return new Response(`Internal server error`, { status: 500 });
  }
}
