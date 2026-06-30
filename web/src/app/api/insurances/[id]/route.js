import sql from "@/app/api/utils/sql";

export async function DELETE(request, { params }) {
  try {
    const { id } = params;
    await sql`UPDATE insurances SET status = 'cancelled' WHERE id = ${id}`;
    return Response.json({ success: true });
  } catch (error) {
    console.error(error);
    return Response.json(
      { error: "Failed to cancel insurance" },
      { status: 500 },
    );
  }
}
