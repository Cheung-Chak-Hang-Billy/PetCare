import sql from "@/app/api/utils/sql";

export async function GET(request) {
  try {
    const { searchParams } = new URL(request.url);
    const petId = searchParams.get("petId");
    const planName = searchParams.get("planName");

    let policies;
    if (petId && planName) {
      policies = await sql(
        `SELECT * FROM insurance_policies WHERE pet_id = $1 AND plan_name = $2 AND status = 'active' AND end_date > CURRENT_DATE ORDER BY created_at DESC`,
        [petId, planName],
      );
    } else if (petId) {
      policies =
        await sql`SELECT * FROM insurance_policies WHERE pet_id = ${petId} ORDER BY created_at DESC`;
    } else {
      policies =
        await sql`SELECT * FROM insurance_policies ORDER BY created_at DESC`;
    }
    return Response.json(policies);
  } catch (error) {
    console.error(error);
    return Response.json(
      { error: "Failed to fetch policies" },
      { status: 500 },
    );
  }
}

export async function POST(request) {
  try {
    const { pet_id, plan_name, premium, start_date } = await request.json();
    const startDateValue = start_date || new Date().toISOString().split("T")[0];
    const [newPolicy] = await sql`
      INSERT INTO insurance_policies (pet_id, plan_name, premium, start_date, end_date)
      VALUES (${pet_id}, ${plan_name}, ${premium}, ${startDateValue}, ${startDateValue}::date + INTERVAL '1 year')
      RETURNING *
    `;
    return Response.json(newPolicy);
  } catch (error) {
    console.error(error);
    return Response.json(
      { error: "Failed to purchase policy" },
      { status: 500 },
    );
  }
}
