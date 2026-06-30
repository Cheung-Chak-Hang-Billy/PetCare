import sql from "@/app/api/utils/sql";

export async function GET(request, { params }) {
  try {
    const { id } = params;
    const entries =
      await sql`SELECT * FROM diary_entries WHERE id = ${id} LIMIT 1`;
    if (!entries.length) {
      return Response.json({ error: "Entry not found" }, { status: 404 });
    }
    return Response.json(entries[0]);
  } catch (error) {
    console.error(error);
    return Response.json(
      { error: "Failed to fetch diary entry" },
      { status: 500 },
    );
  }
}

export async function PUT(request, { params }) {
  try {
    const { id } = params;
    const { title, content, mood, image_url } = await request.json();

    const setClauses = [];
    const values = [];

    if (title !== undefined) {
      setClauses.push(`title = $${values.length + 1}`);
      values.push(title);
    }
    if (content !== undefined) {
      setClauses.push(`content = $${values.length + 1}`);
      values.push(content);
    }
    if (mood !== undefined) {
      setClauses.push(`mood = $${values.length + 1}`);
      values.push(mood);
    }
    if (image_url !== undefined) {
      setClauses.push(`image_url = $${values.length + 1}`);
      values.push(image_url);
    }

    if (setClauses.length === 0) {
      return Response.json({ error: "No fields to update" }, { status: 400 });
    }

    values.push(id);
    const query = `UPDATE diary_entries SET ${setClauses.join(", ")} WHERE id = $${values.length} RETURNING *`;
    const result = await sql(query, values);
    return Response.json(result[0]);
  } catch (error) {
    console.error(error);
    return Response.json(
      { error: "Failed to update diary entry" },
      { status: 500 },
    );
  }
}

export async function DELETE(request, { params }) {
  try {
    const { id } = params;
    await sql`DELETE FROM diary_entries WHERE id = ${id}`;
    return Response.json({ success: true });
  } catch (error) {
    console.error(error);
    return Response.json(
      { error: "Failed to delete diary entry" },
      { status: 500 },
    );
  }
}
