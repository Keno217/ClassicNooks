import pool from '@/lib/db';

export async function GET(
  request: Request,
  { params }: { params: { id: string } }
) {
  const { id } = await params;
  const ALLOWED_HOSTS = new Set([
    'www.gutenberg.org',
    'gutenberg.org',
    'gutendex.com',
  ]);

  if (!id || isNaN(Number(id))) {
    return new Response(
      JSON.stringify({ error: 'Invalid book ID, it must be a number.' }),
      {
        status: 400,
        headers: { 'Content-Type': 'application/json' },
      }
    );
  }

  const bookId = Number(id);

  if (!Number.isSafeInteger(bookId) || bookId <= 0 || bookId > 2_147_483_647) {
    return new Response(
      JSON.stringify({ error: 'Invalid Book ID. Number is out of range.' }),
      {
        status: 400,
        headers: { 'Content-Type': 'application/json' },
      }
    );
  }

  let readBookUrl: string;

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
      return new Response(
        JSON.stringify({ error: `Book#${bookId} could not be found.` }),
        {
          status: 404,
          headers: { 'Content-Type': 'application/json' },
        }
      );
    }

    if (!rows[0].book) {
      return new Response(
        JSON.stringify({
          error: `No text URL stored for book#${bookId} could be found.`,
        }),
        {
          status: 422,
          headers: { 'Content-Type': 'application/json' },
        }
      );
    }
    readBookUrl = rows[0].book;
  } catch (err) {
    console.log(`DB error. ${err}`);
    return new Response(JSON.stringify({ error: 'Internal Server Error.' }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' },
    });
  }

  /* Validate url */
  let url: URL;

  try {
    url = new URL(readBookUrl);
  } catch (err) {
    return new Response(JSON.stringify({ error: `Invalid text URL.` }), {
      status: 422,
      headers: { 'Content-Type': 'application/json' },
    });
  }

  if (!ALLOWED_HOSTS.has(url.hostname))
    return new Response(
      JSON.stringify({ error: 'Upstream host not allowed.' }),
      {
        status: 403,
        headers: { 'Content-Type': 'application/json' },
      }
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

    return new Response(JSON.stringify(text), {
      status: 200,
      headers: { 'Content-Type': 'text/plain; charset=utf-8' },
    });
  } catch (err) {
    console.log(err);
    return new Response(JSON.stringify({ error: `Upstream fetch error.` }), {
      status: 502,
      headers: { 'Content-Type': 'application/json' },
    });
  }
}
