import { prisma } from "@/lib/prisma";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/lib/auth";

export async function DELETE(request, { params }) {
  const session = await getServerSession(authOptions);
  if (!session || session.user.role !== "ADMIN") {
    return new Response(JSON.stringify({ error: "Unauthorized" }), { status: 403 });
  }

  const userId = Number(params.id);
  const targetUser = await prisma.user.findUnique({ where: { id: userId } });

  if (!targetUser) {
    return new Response(JSON.stringify({ error: "User not found" }), { status: 404 });
  }

  // Prevent deleting self or other admins
  if (targetUser.id === session.user.id || targetUser.role === "ADMIN") {
    return new Response(JSON.stringify({ error: "Cannot delete this user" }), { status: 400 });
  }

  await prisma.user.delete({ where: { id: userId } });
  return new Response(null, { status: 204 });
}
