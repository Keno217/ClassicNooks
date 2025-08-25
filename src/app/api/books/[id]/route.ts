import pool from '@/lib/db.ts';

export async function GET(
  request: Request,
  { params }: { params: { id: string } }
) {
  const { id } = await params;

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

  try {
    const bookQuery = await pool.query(
      `
    SELECT 
      b.id,
      b.title,
      b.cover,
      b.description,
      b.book,
      json_agg(DISTINCT jsonb_build_object(
        'name', a.name,
        'birth_year', a.birth_year
      )) AS authors,
      json_agg(DISTINCT g.name) AS genres
    FROM books b
    LEFT JOIN book_authors ba ON b.id = ba.book_id
    LEFT JOIN authors a ON ba.author_id = a.id
    LEFT JOIN book_genres bg ON b.id = bg.book_id
    LEFT JOIN genres g ON bg.genre_id = g.id
    WHERE b.id = $1
    GROUP BY b.id
    `,
      [bookId]
    );

    if (bookQuery.rows.length === 0) {
      return new Response(
        JSON.stringify({ error: `Book#${bookId} could not be found.` }),
        {
          status: 404,
          headers: { 'Content-Type': 'application/json' },
        }
      );
    }

    return new Response(JSON.stringify(bookQuery.rows[0]), {
      status: 200,
      headers: { 'Content-Type': 'application/json' },
    });
  } catch (err) {
    console.log(`Internal server error. ${err}`);
    return new Response(JSON.stringify({ error: 'Internal Server Error.' }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' },
    });
  }
}
