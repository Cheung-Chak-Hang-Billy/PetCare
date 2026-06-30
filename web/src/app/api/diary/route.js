import sql from "@/app/api/utils/sql";

export async function GET(request) {
  try {
    const { searchParams } = new URL(request.url);
    const petId = searchParams.get("petId");

    let entries;
    if (petId) {
      entries =
        await sql`SELECT * FROM diary_entries WHERE pet_id = ${petId} ORDER BY date DESC, created_at DESC`;
    } else {
      entries =
        await sql`SELECT * FROM diary_entries ORDER BY date DESC, created_at DESC`;
    }
    return Response.json(entries);
  } catch (error) {
    console.error(error);
    return Response.json(
      { error: "Failed to fetch diary entries" },
      { status: 500 },
    );
  }
}

export async function POST(request) {
  try {
    const { pet_id, title, content, date, mood, image_url } =
      await request.json();
    const [newEntry] = await sql`
      INSERT INTO diary_entries (pet_id, title, content, date, mood, image_url)
      VALUES (${pet_id}, ${title}, ${content}, ${date || new Date()}, ${mood}, ${image_url})
      RETURNING *
    `;
    return Response.json(newEntry);
  } catch (error) {
    console.error(error);
    return Response.json(
      { error: "Failed to create diary entry" },
      { status: 500 },
    );
  }
}
