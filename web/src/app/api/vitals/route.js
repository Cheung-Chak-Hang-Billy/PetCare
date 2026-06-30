import sql from "@/app/api/utils/sql";

export async function GET(request) {
  try {
    const { searchParams } = new URL(request.url);
    const petId = searchParams.get("petId");

    if (!petId) {
      return Response.json({ error: "petId is required" }, { status: 400 });
    }

    const records = await sql`
      SELECT * FROM vital_signs
      WHERE pet_id = ${petId}
      ORDER BY recorded_at DESC
      LIMIT 10
    `;
    return Response.json(records);
  } catch (error) {
    console.error(error);
    return Response.json({ error: "Failed to fetch vitals" }, { status: 500 });
  }
}

export async function POST(request) {
  try {
    const {
      pet_id,
      heart_rate,
      hours_of_sleep,
      temperature,
      respiratory_rate,
      weight,
      notes,
    } = await request.json();

    const [record] = await sql`
      INSERT INTO vital_signs (pet_id, heart_rate, hours_of_sleep, temperature, respiratory_rate, weight, notes)
      VALUES (${pet_id}, ${heart_rate || null}, ${hours_of_sleep || null}, ${temperature || null}, ${respiratory_rate || null}, ${weight || null}, ${notes || null})
      RETURNING *
    `;
    return Response.json(record);
  } catch (error) {
    console.error(error);
    return Response.json({ error: "Failed to save vitals" }, { status: 500 });
  }
}
