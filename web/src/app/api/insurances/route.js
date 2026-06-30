import sql from "@/app/api/utils/sql";

export async function GET(request) {
  try {
    const { searchParams } = new URL(request.url);
    const petId = searchParams.get("petId");

    let insurances;
    if (petId) {
      insurances = await sql`SELECT * FROM insurances WHERE pet_id = ${petId}`;
    } else {
      insurances = await sql`SELECT * FROM insurances`;
    }
    return Response.json(insurances);
  } catch (error) {
    console.error(error);
    return Response.json(
      { error: "Failed to fetch insurances" },
      { status: 500 },
    );
  }
}

export async function POST(request) {
  try {
    const body = await request.json();
    const { pet_id, plan_name, premium, end_date } = body;

    if (!pet_id || !plan_name) {
      return Response.json(
        { error: "Pet ID and plan name are required" },
        { status: 400 },
      );
    }

    const policyNumber = `POL-${Math.random().toString(36).substr(2, 9).toUpperCase()}`;

    const [insurance] = await sql`
      INSERT INTO insurances (pet_id, plan_name, policy_number, premium, end_date)
      VALUES (${pet_id}, ${plan_name}, ${policyNumber}, ${premium}, ${end_date})
      RETURNING *
    `;
    return Response.json(insurance);
  } catch (error) {
    console.error(error);
    return Response.json(
      { error: "Failed to purchase insurance" },
      { status: 500 },
    );
  }
}
