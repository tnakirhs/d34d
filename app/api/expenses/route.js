import { PrismaClient } from "@prisma/client";
import { getServerSession } from "next-auth";
import { authOptions } from "../auth/[...nextauth]/route";

const prisma = new PrismaClient();

export async function POST(req) {
  try {
    const session = await getServerSession(authOptions);

    if (!session || session.user.role !== "EMPLOYEE") {
      return new Response(JSON.stringify({ error: "Not authorized" }), { status: 401 });
    }

    const body = await req.json();
    const { amount, currency, description, date } = body;

    if (!amount || !currency || !description || !date) {
      return new Response(JSON.stringify({ error: "Missing fields" }), { status: 400 });
    }

    const expense = await prisma.expense.create({
      data: {
        amount: parseFloat(amount),
        currency,
        description,
        date: new Date(date),
        user: { connect: { email: session.user.email } },
      },
    });

    return new Response(JSON.stringify(expense), { status: 201 });
  } catch (err) {
    return new Response(JSON.stringify({ error: err.message }), { status: 500 });
  }
}

export async function GET() {
  try {
    const session = await getServerSession(authOptions);
    if (!session) return new Response(JSON.stringify([]), { status: 200 });

    let expenses;
    if (session.user.role === "EMPLOYEE") {
      expenses = await prisma.expense.findMany({
        where: { user: { email: session.user.email } },
        include: { approvals: true },
      });
    } else if (session.user.role === "MANAGER" || session.user.role === "ADMIN") {
      expenses = await prisma.expense.findMany({ include: { approvals: true, user: true } });
    }

    return new Response(JSON.stringify(expenses), { status: 200 });
  } catch (err) {
    return new Response(JSON.stringify({ error: err.message }), { status: 500 });
  }
}
