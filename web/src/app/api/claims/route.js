import sql from "@/app/api/utils/sql";

export async function GET(request) {
  try {
    const { searchParams } = new URL(request.url);
    const policyId = searchParams.get("policyId");

    let claims;
    if (policyId) {
      claims =
        await sql`SELECT * FROM claims WHERE policy_id = ${policyId} ORDER BY created_at DESC`;
    } else {
      claims = await sql`SELECT * FROM claims ORDER BY created_at DESC`;
    }
    return Response.json(claims);
  } catch (error) {
    console.error(error);
    return Response.json({ error: "Failed to fetch claims" }, { status: 500 });
  }
}

export async function POST(request) {
  try {
    const { policy_id, pet_id, description, amount, document_url, date } =
      await request.json();
    const [newClaim] = await sql`
      INSERT INTO claims (policy_id, pet_id, description, amount, document_url, date)
      VALUES (${policy_id}, ${pet_id}, ${description}, ${amount}, ${document_url}, ${date || new Date()})
      RETURNING *
    `;
    return Response.json(newClaim);
  } catch (error) {
    console.error(error);
    return Response.json({ error: "Failed to submit claim" }, { status: 500 });
  }
}
