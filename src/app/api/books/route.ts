import pool from '@/lib/db.ts';

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const currentPage = searchParams.get('page');
  let searchInput = searchParams.get('search');
  let bookGenre = searchParams.get('genre');
  const bookLimit = 100;

  const page =
    !currentPage || isNaN(Number(currentPage)) ? 1 : Number(currentPage);

  if (!Number.isSafeInteger(page) || page <= 0 || page > 2_147_483_647)
    return new Response(
      JSON.stringify({ error: 'Invalid Page. Number is out of range.' }),
      {
        status: 400,
        headers: { 'Content-Type': 'application/json' },
      }
    );

  searchInput =
    !searchInput || typeof searchInput !== 'string'
      ? ''
      : searchInput.toLowerCase().trim();

  bookGenre =
    !bookGenre || typeof bookGenre !== 'string'
      ? ''
      : bookGenre.toLowerCase().trim();

  // Get the pages the client already received
  const offset = (page - 1) * bookLimit;

  try {
    //TODO: Implement Keyset Pagination (Seek Method)
    const bookQuery = await pool.query(
      `
      SELECT 
        b.*, 
        json_agg(DISTINCT jsonb_build_object('name', a.name, 'birth_year', a.birth_year)) AS authors,
        json_agg(DISTINCT jsonb_build_object('name', g.name)) FILTER (WHERE g.name IS NOT NULL) AS genres
      FROM books b
      JOIN book_authors ba ON b.id = ba.book_id
      JOIN authors a ON a.id = ba.author_id
      LEFT JOIN book_genres bg ON b.id = bg.book_id
      LEFT JOIN genres g ON g.id = bg.genre_id
      WHERE 
        ($1 = '' OR b.title ILIKE '%' || $1 || '%' OR a.name ILIKE '%' || $1 || '%')
        AND ($2 = '' OR g.name ILIKE '%' || $2 || '%')
      GROUP BY b.id
      ORDER BY b.id
      LIMIT $3 OFFSET $4;
      `,
      [searchInput, bookGenre, bookLimit, offset]
    );

    const countQuery = await pool.query(
      `
      SELECT COUNT(DISTINCT b.id) AS total
      FROM books b
      JOIN book_authors ba ON b.id = ba.book_id
      JOIN authors a ON a.id = ba.author_id
      LEFT JOIN book_genres bg ON b.id = bg.book_id
      LEFT JOIN genres g ON g.id = bg.genre_id
      WHERE 
        ($1 = '' OR b.title ILIKE '%' || $1 || '%' OR a.name ILIKE '%' || $1 || '%')
        AND ($2 = '' OR g.name ILIKE '%' || $2 || '%');
      `,
      [searchInput, bookGenre]
    );

    const books = bookQuery.rows;
    let totalBookCount = parseInt(countQuery.rows[0].total);

    // If client inputs invalid page, there are no books
    totalBookCount = page < 1 || offset >= totalBookCount ? 0 : totalBookCount;

    // If client inputs invalid page, there are no pages
    const totalPages =
      page < 1 || offset >= totalBookCount
        ? 0
        : Math.ceil(totalBookCount / bookLimit);

    // Get the next URL to fetch for the client
    const nextPage =
      page < totalPages
        ? `http://localhost:3000/api/books?page=${page + 1}${
            searchInput ? `&search=${encodeURIComponent(searchInput)}` : ''
          }${bookGenre ? `&genre=${encodeURIComponent(bookGenre)}` : ''}`
        : null;

    return new Response(
      JSON.stringify({
        page: page,
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
