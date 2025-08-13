import pool from '@/lib/db.ts';
import { sanitizeInput } from '@/utils/sanitizeInput';

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const DEFAULT_LIMIT: number = 100;
  const lastBookId: string | null = searchParams.get('lastId');
  const bookLimit: string | null = searchParams.get('limit');
  let searchInput: string | null = searchParams.get('search');
  let bookGenre: string | null = searchParams.get('genre');

  const lastId: number =
    !lastBookId || isNaN(Number(lastBookId)) ? 0 : Number(lastBookId);

  if (!Number.isInteger(lastId) || lastId < 0 || lastId > 2_147_483_647)
    return new Response(
      JSON.stringify({ error: 'Invalid ID. Number is out of range.' }),
      {
        status: 400,
        headers: { 'Content-Type': 'application/json' },
      }
    );

  const limit: number =
    !bookLimit || isNaN(Number(bookLimit)) ? DEFAULT_LIMIT : Number(bookLimit);

  if (!Number.isInteger(limit) || limit <= 0 || limit > DEFAULT_LIMIT)
    return new Response(
      JSON.stringify({ error: 'Invalid Limit. Number is out of range.' }),
      {
        status: 400,
        headers: { 'Content-Type': 'application/json' },
      }
    );

  searchInput = sanitizeInput(searchInput ?? '');
  bookGenre = sanitizeInput(bookGenre ?? '');

  try {
    const bookQuery = await pool.query(
      `
      SELECT 
        b.*,
        json_agg(DISTINCT jsonb_build_object('name', a.name, 'birth_year', a.birth_year)) AS authors,
        json_agg(DISTINCT jsonb_build_object('name', g.name)) FILTER (WHERE g.name IS NOT NULL) AS genres
      FROM books b
      JOIN book_authors ba ON b.id = ba.book_id
      JOIN authors a       ON a.id = ba.author_id
      LEFT JOIN book_genres bg ON b.id = bg.book_id
      LEFT JOIN genres g        ON g.id = bg.genre_id
      WHERE 
        ($1 = '' OR b.title ILIKE '%' || $1 || '%' ESCAPE '\\' OR a.name ILIKE '%' || $1 || '%' ESCAPE '\\')
        AND ($2 = '' OR g.name ILIKE '%' || $2 || '%' ESCAPE '\\')
        AND ($3 = 0 OR b.id > $3)                -- seek forward from lastId
      GROUP BY b.id
      ORDER BY b.id ASC
      LIMIT $4;
      `,
      [searchInput, bookGenre, lastId, limit]
    );

    const countQuery = await pool.query(
      `
      SELECT COUNT(DISTINCT b.id) AS total
      FROM books b
      JOIN book_authors ba ON b.id = ba.book_id
      JOIN authors a       ON a.id = ba.author_id
      LEFT JOIN book_genres bg ON b.id = bg.book_id
      LEFT JOIN genres g        ON g.id = bg.genre_id
      WHERE 
        ($1 = '' OR b.title ILIKE '%' || $1 || '%' ESCAPE '\\' OR a.name ILIKE '%' || $1 || '%' ESCAPE '\\')
        AND ($2 = '' OR g.name ILIKE '%' || $2 || '%' ESCAPE '\\');
      `,
      [searchInput, bookGenre]
    );

    /* 
    Find the current page by counting rows 
    with IDs less than or equal to the lastID
    */

    const positionQuery = await pool.query(
      `
      SELECT COUNT(*)::bigint AS count_before
      FROM (
        SELECT DISTINCT b.id
        FROM books b
        JOIN book_authors ba ON b.id = ba.book_id
        JOIN authors a       ON a.id = ba.author_id
        LEFT JOIN book_genres bg ON b.id = bg.book_id
        LEFT JOIN genres g        ON g.id = bg.genre_id
        WHERE 
          ($1 = '' OR b.title ILIKE '%' || $1 || '%' ESCAPE '\\' OR a.name ILIKE '%' || $1 || '%' ESCAPE '\\')
          AND ($2 = '' OR g.name ILIKE '%' || $2 || '%' ESCAPE '\\')
          AND ($3 > 0)
          AND b.id <= $3
      ) t;
      `,
      [searchInput, bookGenre, lastId]
    );

    const books = bookQuery.rows;
    const countBefore = Number(positionQuery.rows[0]?.count_before ?? 0);

    // If client inputs invalid ID, there are no books to display
    const totalBookCount =
      books.length === 0 ? 0 : Number(countQuery.rows[0]?.total ?? 0);

    const currentPage =
      totalBookCount === 0
        ? 0
        : countBefore === 0
        ? 1
        : Math.floor(countBefore / limit) + 1;

    // If client inputs invalid page, there are no pages
    const totalPages =
      totalBookCount === 0 ? 0 : Math.ceil(totalBookCount / limit);

    let nextPage: string | null = null;

    // Only set a next link if the current page is full
    if (books.length === limit) {
      const url = new URL(request.url);
      const nextId = books[books.length - 1].id;
      url.searchParams.set('lastId', String(nextId));

      if (limit !== DEFAULT_LIMIT) url.searchParams.set('limit', String(limit));

      if (searchInput)
        url.searchParams.set('search', searchParams.get('search') as string);

      if (bookGenre)
        url.searchParams.set('genre', searchParams.get('genre') as string);

      nextPage = `http://localhost:3000${
        url.pathname
      }?${url.searchParams.toString()}`;
    }

    return new Response(
      JSON.stringify({
        page: currentPage,
        totalPages: totalPages,
        books: totalBookCount,
        next: nextPage,
        results: books,
      }),
      {
        status: 200,
        headers: { 'Content-Type': 'application/json' },
      }
    );
  } catch (err) {
    console.log(`DB query failed: ${err}`);
    return new Response(`Internal server error`, { status: 500 });
  }
}
