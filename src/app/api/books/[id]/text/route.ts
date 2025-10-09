import { NextRequest, NextResponse } from 'next/server';
import { getCache, setCache } from '@/lib/cache';
import pool from '@/lib/db';

export async function GET(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  const { id } = await params;
  let readBookUrl: string, url: URL;
  const ALLOWED_HOSTS = new Set([
    'www.gutenberg.org',
    'gutenberg.org',
    'gutendex.com',
  ]);

  if (!id || isNaN(Number(id))) {
    return NextResponse.json(
      { error: 'Invalid book ID, it must be a number.' },
      { status: 400 }
    );
  }

  const bookId = Number(id);

  if (!Number.isSafeInteger(bookId) || bookId <= 0 || bookId > 2_147_483_647) {
    return NextResponse.json(
      { error: 'Invalid Book ID. Number is out of range.' },
      { status: 400 }
    );
  }

  const cacheRes = await getCache(`book_text_${bookId}`);
  if (cacheRes) return NextResponse.json(cacheRes, { status: 200 });

  try {
    const { rows } = await pool.query(
      `
      SELECT book
      FROM books
      WHERE id = $1;
      `,
      [bookId]
    );

    if (rows.length === 0) {
      return NextResponse.json(
        { error: `Book#${bookId} could not be found.` },
        { status: 404 }
      );
    }

    if (!rows[0].book) {
      return NextResponse.json(
        { error: `No text URL stored for book#${bookId} could be found.` },
        { status: 422 }
      );
    }

    readBookUrl = rows[0].book;
  } catch (err) {
    console.log(`DB error. ${err}`);
    return NextResponse.json(
      { error: 'Internal server error.' },
      { status: 500 }
    );
  }

  try {
    // Validate url
    url = new URL(readBookUrl);
  } catch (err) {
    return NextResponse.json({ error: 'Invalid text URL.' }, { status: 422 });
  }

  if (!ALLOWED_HOSTS.has(url.hostname))
    return NextResponse.json(
      { error: 'Upstream host not allowed.' },
      { status: 403 }
    );

  try {
    const res = await fetch(url.toString(), {
      signal: AbortSignal.timeout(15_000), // Abort after 15s
      headers: { Accept: 'text/plain' },
    });

    if (!res.ok) {
      throw new Error(
        `Failed to fetch book#${bookId} from upstream host. Status: ${res.status}`
      );
    }

    const text = await res.text();

    /* TODO: Parse text before sending */

    // Set Cache once you finish TODO

    return new NextResponse(text, {
      status: 200,
      headers: { 'Content-Type': 'text/plain; charset=utf-8' },
    });

  } catch (err) {
    console.log(err);
    return NextResponse.json(
      { error: 'Upstream fetch error.' },
      { status: 502 }
    );
  }
}
