import sql from "@/app/api/utils/sql";

export async function GET(request) {
  try {
    const { searchParams } = new URL(request.url);
    const insuranceId = searchParams.get("insuranceId");

    let claims;
    if (insuranceId) {
      claims =
        await sql`SELECT * FROM claims WHERE insurance_id = ${insuranceId} ORDER BY date_filed DESC`;
    } else {
      claims = await sql`SELECT * FROM claims ORDER BY date_filed DESC`;
    }
    return Response.json(claims);
  } catch (error) {
    console.error(error);
    return Response.json({ error: "Failed to fetch claims" }, { status: 500 });
  }
}

export async function POST(request) {
  try {
    const body = await request.json();
    const { insurance_id, type, amount, description, document_url } = body;

    if (!insurance_id || !type || !amount) {
      return Response.json(
        { error: "Insurance ID, type, and amount are required" },
        { status: 400 },
      );
    }

    const [claim] = await sql`
      INSERT INTO claims (insurance_id, type, amount, description, document_url)
      VALUES (${insurance_id}, ${type}, ${amount}, ${description}, ${document_url || null})
      RETURNING *
    `;
    return Response.json(claim);
  } catch (error) {
    console.error(error);
    return Response.json({ error: "Failed to file claim" }, { status: 500 });
  }
}
