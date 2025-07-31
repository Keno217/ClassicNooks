import pool from '@/lib/db.ts';

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const currentPage = searchParams.get('page');
  let bookGenre = searchParams.get('genre');
  const bookLimit = 100;

  if (bookGenre) {
    bookGenre = bookGenre.toLowerCase().trim();
  }

  const page =
    !currentPage || isNaN(Number(currentPage)) ? 1 : parseInt(currentPage);
  // Get the pages the client already received
  const offset = (page - 1) * bookLimit;

  try {
    if (bookGenre && bookGenre !== '') {
      const bookQuery = await pool.query(
        `SELECT 
        b.*, 
        json_agg(
          json_build_object('name', a.name, 'birth_year', a.birth_year)
        ) AS authors
      FROM books b
      JOIN book_authors ba ON b.id = ba.book_id
      JOIN authors a ON a.id = ba.author_id
      JOIN book_genres bg ON b.id = bg.book_id
      JOIN genres g ON g.id = bg.genre_id
      WHERE g.name ILIKE '%' || $1 || '%'
      GROUP BY b.id
      ORDER BY b.id
      LIMIT $2 OFFSET $3`,
        [bookGenre, bookLimit, offset]
      );

      // Get the total amount of books
      const countQuery = await pool.query(
        `SELECT COUNT(*) AS total
         FROM books b
         JOIN book_genres bg ON b.id = bg.book_id
         JOIN genres g ON g.id = bg.genre_id
         WHERE g.name ILIKE '%' || $1 || '%'`,
        [bookGenre]
      );

      const books = bookQuery.rows;
      const totalCount = parseInt(countQuery.rows[0].total);
      const totalPages = Math.ceil(totalCount / bookLimit);
      const nextPage =
        page < totalPages
          ? `http://localhost:3000/api/books?page=${
              page + 1
            }&genre=${bookGenre}`
          : null;

      return new Response(
        JSON.stringify({
          page: page,
          totalPages: totalPages,
          books: totalCount,
          next: nextPage,
          results: books,
        }),
        {
          status: 200,
          headers: { 'Content-Type': 'application/json' },
        }
      );
    }

    const bookQuery = await pool.query(
      `SELECT 
      b.*, 
      json_agg(
        json_build_object('name', a.name, 'birth_year', a.birth_year)
      ) AS authors
    FROM books b
    JOIN book_authors ba ON b.id = ba.book_id
    JOIN authors a ON a.id = ba.author_id
    GROUP BY b.id
    ORDER BY b.id
    LIMIT $1 OFFSET $2;`,
      [bookLimit, offset]
    );

    const countQuery = await pool.query(`SELECT COUNT(*) AS total FROM books`);

    const books = bookQuery.rows;
    const totalCount = parseInt(countQuery.rows[0].total);
    const totalPages = Math.ceil(totalCount / bookLimit);
    const nextPage =
      page < totalPages
        ? `http://localhost:3000/api/books?page=${page + 1}`
        : null;

    return new Response(
      JSON.stringify({
        page: page,
        totalPages: totalPages,
        books: totalCount,
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
