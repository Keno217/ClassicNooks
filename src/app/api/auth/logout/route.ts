import { NextRequest, NextResponse } from 'next/server';
import getUserFromSession from '@/lib/session';
import pool from '@/lib/db';

export async function DELETE(req: NextRequest) {
  // Verify session
  const user = await getUserFromSession(req);
  const csrfHeader = req.headers.get('X-CSRF-Token');

  if (!user)
    return NextResponse.json({ error: 'User not authorized' }, { status: 401 });

  if (!csrfHeader || csrfHeader !== user?.csrfToken)
    return NextResponse.json({ error: 'User not authorized' }, { status: 403 });

  try {
    await pool.query(
      `
      DELETE FROM sessions
      WHERE id = $1;
      `,
      [user.session]
    );

    const response = NextResponse.json(
      { message: 'Logged out successfully' },
      { status: 200 }
    );

    response.cookies.set('session', '', {
      httpOnly: true,
      secure: true,
      sameSite: 'lax',
      path: '/',
      expires: new Date(0),
    });

    return NextResponse.json(
      { message: 'Logged out successfully' },
      { status: 200 }
    );

  } catch (err) {
    console.log('DB error deleting session:', err);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
