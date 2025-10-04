import { getServerSession } from "next-auth";
import { authOptions } from "../auth/[...nextauth]/route";
import { prisma } from "@/lib/prisma";

export async function POST(req) {
  const session = await getServerSession(authOptions);
  if (!session || session.user.role !== "EMPLOYEE") {
    return Response.json({ error: "Unauthorized" }, { status: 403 });
  }

  const body = await req.json();
  const { amount, currency, description, date } = body;

  const expense = await prisma.expense.create({
    data: {
      amount,
      currency,
      description,
      date: new Date(date),
      userId: session.user.id,
    },
  });

  return Response.json(expense, { status: 201 });
}

export async function GET() {
  const session = await getServerSession(authOptions);
  if (!session) return Response.json({ error: "Unauthorized" }, { status: 403 });

  if (session.user.role === "EMPLOYEE") {
    const expenses = await prisma.expense.findMany({
      where: { userId: session.user.id },
      include: { approvals: true },
    });
    return Response.json(expenses);
  }

  if (session.user.role === "MANAGER") {
    const expenses = await prisma.expense.findMany({
      where: { status: "PENDING" },
      include: { user: true, approvals: true },
    });
    return Response.json(expenses);
  }

  if (session.user.role === "ADMIN") {
    const expenses = await prisma.expense.findMany({
      include: { user: true, approvals: true },
    });
    return Response.json(expenses);
  }

  return Response.json({ error: "Unauthorized" }, { status: 403 });
}
