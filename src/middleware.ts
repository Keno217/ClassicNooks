import { NextRequest, NextResponse } from 'next/server';
import {
  authShortLimit,
  authDailyLimit,
  defLimit,
  dailyLimit,
  userDaily,
} from '@/lib/ratelimiter';

export async function middleware(req: NextRequest) {
  const url = req.nextUrl.pathname;
  const ip = req.headers.get('x-forwarded-for')?.split(',')[0] ?? '127.0.0.1';

  try {
    switch (true) {
      case url.startsWith('/api/books'): {
        const { success: burstSuccess } = await defLimit.limit(`books_${ip}`);
        const { success: dailySuccess } = await dailyLimit.limit(`books_${ip}`);

        if (!burstSuccess)
          return NextResponse.json(
            { error: 'Too many requests' },
            { status: 429 }
          );

        if (!dailySuccess)
          return NextResponse.json(
            { error: 'Daily requests exceeded' },
            { status: 429 }
          );

        break;
      }

      case url.startsWith('/api/auth/me'): {
        const { success: burstSuccess } = await defLimit.limit(`auth_me_${ip}`);
        const { success: dailySuccess } = await dailyLimit.limit(`auth_me_${ip}`);

        if (!burstSuccess)
          return NextResponse.json(
            { error: 'Too many requests' },
            { status: 429 }
          );

        if (!dailySuccess)
          return NextResponse.json(
            { error: 'Daily requests exceeded' },
            { status: 429 }
          );

        break;
      }

      case url.startsWith('/api/auth/register'): {
        const { success: burstSuccess } = await authShortLimit.limit(`auth_register_${ip}`);
        const { success: dailySuccess } = await authDailyLimit.limit(`auth_register_${ip}`);

        if (!burstSuccess)
          return NextResponse.json(
            { error: 'Too many requests' },
            { status: 429 }
          );

        if (!dailySuccess)
          return NextResponse.json(
            { error: 'Daily requests exceeded' },
            { status: 429 }
          );

        break;
      }

      case url.startsWith('/api/auth/logout'): {
        const { success: burstSuccess } = await authShortLimit.limit(`auth_logout_${ip}`);
        const { success: dailySuccess } = await authDailyLimit.limit(`auth_logout_${ip}`);

        if (!burstSuccess)
          return NextResponse.json(
            { error: 'Too many requests' },
            { status: 429 }
          );

        if (!dailySuccess)
          return NextResponse.json(
            { error: 'Daily requests exceeded' },
            { status: 429 }
          );

        break;
      }

      case url.startsWith('/api/users/me'): {
        const { success: burstSuccess } = await defLimit.limit(`user_me_${ip}`);
        const { success: dailySuccess } = await userDaily.limit(`user_me_${ip}`);

        if (!burstSuccess)
          return NextResponse.json(
            { error: 'Too many requests' },
            { status: 429 }
          );

        if (!dailySuccess)
          return NextResponse.json(
            { error: 'Daily requests exceeded' },
            { status: 429 }
          );

        break;
      }

      default:
        break;
    }

    return;
  } catch (err) {
    console.log('Rate limiter error:', err);
  }
}

export const config = {
  matcher: ['/api/auth/:path*', '/api/books/:path*', '/api/users/:path*'],
};
