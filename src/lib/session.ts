import pool from './db';
import { NextRequest } from 'next/server';

export default async function getUserFromSession(
  req: NextRequest
): Promise<{
  id: string;
  username: string;
  csrfToken: string;
  session: string;
} | null> {
  const sessionId = req.cookies.get('session')?.value;

  if (!sessionId) return null;

  try {
    const { rows } = await pool.query(
      `
        SELECT 
          users.id AS user_id,
          users.username,
          sessions.id AS session_id,
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
      return null;
    }

    return {
      id: rows[0].user_id,
      username: rows[0].username,
      session: rows[0].session_id,
      csrfToken: rows[0].csrf_token,
    };
    
  } catch (err) {
    console.log('DB session query error:', err);
    return null;
  }
}
