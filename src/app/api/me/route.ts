import { NextRequest, NextResponse } from 'next/server';
import pool from '@/lib/db';

export async function GET(req: NextRequest) {
  const sessionId = req.cookies.get('session')?.value;

  if (!sessionId) return NextResponse.json({ user: null }, { status: 200 });

  try {
    const { rows } = await pool.query(
      `
        SELECT users.id,
        users.username
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
      { user: { id: rows[0].id, username: rows[0].username } },
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
