export async function POST(req: Request) {
  try {
    const { user, password } = await req.json();

    if (!user || !password) {
      return new Response(JSON.stringify({ error: 'Missing Fields' }), {
        status: 400,
      });
    }

    if (user.length < 3 || user.length > 30) {
      return new Response(
        JSON.stringify({
          error: 'Username must be between 3 and 30 characters',
        }),
        {
          status: 400,
        }
      );
    }

    if (password.length < 8 || password.length > 64) {
      return new Response(
        JSON.stringify({
          error: 'Password must be between 8 and 64 characters.',
        }),
        {
          status: 400,
        }
      );
    }
  } catch (err) {}
}
