import sql from "@/app/api/utils/sql";

export async function GET(request, { params }) {
  try {
    const { id } = params;
    const [pet] = await sql`SELECT * FROM pets WHERE id = ${id}`;
    if (!pet) return Response.json({ error: "Pet not found" }, { status: 404 });
    return Response.json(pet);
  } catch (error) {
    console.error(error);
    return Response.json({ error: "Failed to fetch pet" }, { status: 500 });
  }
}

export async function DELETE(request, { params }) {
  try {
    const { id } = params;
    await sql`DELETE FROM pets WHERE id = ${id}`;
    return Response.json({ success: true });
  } catch (error) {
    console.error(error);
    return Response.json({ error: "Failed to delete pet" }, { status: 500 });
  }
}

export async function PATCH(request, { params }) {
  try {
    const { id } = params;
    const body = await request.json();
    const { name, species, breed, birth_date, gender, weight, photo_url } =
      body;

    const [pet] = await sql`
      UPDATE pets
      SET
        name = COALESCE(${name}, name),
        species = COALESCE(${species}, species),
        breed = COALESCE(${breed}, breed),
        birth_date = COALESCE(${birth_date}, birth_date),
        gender = COALESCE(${gender}, gender),
        weight = COALESCE(${weight}, weight),
        photo_url = COALESCE(${photo_url}, photo_url)
      WHERE id = ${id}
      RETURNING *
    `;
    return Response.json(pet);
  } catch (error) {
    console.error(error);
    return Response.json({ error: "Failed to update pet" }, { status: 500 });
  }
}
