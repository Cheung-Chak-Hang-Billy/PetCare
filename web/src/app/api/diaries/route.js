import sql from "@/app/api/utils/sql";

export async function GET(request) {
  try {
    const { searchParams } = new URL(request.url);
    const petId = searchParams.get("petId");

    if (!petId) {
      return Response.json({ error: "Pet ID is required" }, { status: 400 });
    }

    const diaries =
      await sql`SELECT * FROM diaries WHERE pet_id = ${petId} ORDER BY entry_date DESC, created_at DESC`;
    return Response.json(diaries);
  } catch (error) {
    console.error(error);
    return Response.json({ error: "Failed to fetch diaries" }, { status: 500 });
  }
}

export async function POST(request) {
  try {
    const body = await request.json();
    const { pet_id, title, content, mood, entry_date } = body;

    if (!pet_id || !title || !content) {
      return Response.json(
        { error: "Pet ID, title, and content are required" },
        { status: 400 },
      );
    }

    const [diary] = await sql`
      INSERT INTO diaries (pet_id, title, content, mood, entry_date)
      VALUES (${pet_id}, ${title}, ${content}, ${mood}, ${entry_date || new Date().toISOString().split("T")[0]})
      RETURNING *
    `;
    return Response.json(diary);
  } catch (error) {
    console.error(error);
    return Response.json(
      { error: "Failed to create diary entry" },
      { status: 500 },
    );
  }
}
