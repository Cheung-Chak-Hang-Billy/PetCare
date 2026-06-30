import sql from "@/app/api/utils/sql";

export async function GET(request) {
  try {
    const { searchParams } = new URL(request.url);
    const userId = searchParams.get("userId") || "anonymous"; // In a real app, use session
    const pets =
      await sql`SELECT * FROM pets WHERE user_id = ${userId} ORDER BY created_at DESC`;
    return Response.json(pets);
  } catch (error) {
    console.error(error);
    return Response.json({ error: "Failed to fetch pets" }, { status: 500 });
  }
}

export async function POST(request) {
  try {
    const body = await request.json();
    const {
      name,
      species,
      breed,
      birth_date,
      gender,
      weight,
      photo_url,
      user_id,
    } = body;

    if (!name || !species) {
      return Response.json(
        { error: "Name and species are required" },
        { status: 400 },
      );
    }

    const userId = user_id || "anonymous";
    const [pet] = await sql`
      INSERT INTO pets (name, species, breed, birth_date, gender, weight, photo_url, user_id)
      VALUES (${name}, ${species}, ${breed}, ${birth_date}, ${gender}, ${weight}, ${photo_url}, ${userId})
      RETURNING *
    `;
    return Response.json(pet);
  } catch (error) {
    console.error(error);
    return Response.json({ error: "Failed to create pet" }, { status: 500 });
  }
}
