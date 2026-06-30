import sql from "@/app/api/utils/sql";

export async function GET() {
  try {
    const pets = await sql`SELECT * FROM pets ORDER BY created_at DESC`;
    return Response.json(pets);
  } catch (error) {
    console.error(error);
    return Response.json({ error: "Failed to fetch pets" }, { status: 500 });
  }
}

export async function POST(request) {
  try {
    const { name, species, breed, age, weight, image_url } =
      await request.json();
    const [newPet] = await sql`
      INSERT INTO pets (name, species, breed, age, weight, image_url)
      VALUES (${name}, ${species}, ${breed}, ${age}, ${weight}, ${image_url})
      RETURNING *
    `;
    return Response.json(newPet);
  } catch (error) {
    console.error(error);
    return Response.json({ error: "Failed to create pet" }, { status: 500 });
  }
}
