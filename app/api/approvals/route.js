import { PrismaClient } from "@prisma/client";
import { getServerSession } from "next-auth";
import { authOptions } from "../auth/[...nextauth]/route";

const prisma = new PrismaClient();

export async function POST(req) {
  const session = await getServerSession(authOptions);

  if (!session || (session.user.role !== "MANAGER" && session.user.role !== "ADMIN")) {
    return new Response(JSON.stringify({ error: "Not authorized" }), { status: 401 });
  }

  const { expenseId, action } = await req.json();

  try {
    const expense = await prisma.expense.update({
      where: { id: parseInt(expenseId) },
      data: {
        status: action === "approve" ? "APPROVED" : "REJECTED",
      },
    });

    return new Response(JSON.stringify(expense), { status: 200 });
  } catch (err) {
    return new Response(JSON.stringify({ error: err.message }), { status: 500 });
  }
}

export async function GET(req) {
  const session = await getServerSession(authOptions);

  if (!session || (session.user.role !== "MANAGER" && session.user.role !== "ADMIN")) {
    return new Response(JSON.stringify([]), { status: 200 });
  }

  const expenses = await prisma.expense.findMany({ include: { user: true } });
  return new Response(JSON.stringify(expenses), { status: 200 });
}
