import { PrismaClient } from "@prisma/client";
import { getServerSession } from "next-auth";
import { authOptions } from "../auth/[...nextauth]/route";
import { NextResponse } from "next/server";

const prisma = new PrismaClient();

export async function GET() {
  const session = await getServerSession(authOptions);
  if (!session || session.user.role !== "ADMIN") {
    return NextResponse.json({ error: "Not authorized" }, { status: 401 });
  }

  const users = await prisma.user.findMany();
  return NextResponse.json(users, { status: 200 });
}

export async function PUT(req) {
  const session = await getServerSession(authOptions);
  if (!session || session.user.role !== "ADMIN") {
    return NextResponse.json({ error: "Not authorized" }, { status: 401 });
  }

  const { id, role } = await req.json();
  const updated = await prisma.user.update({
    where: { id: id },
    data: { role },
  });

  return NextResponse.json(updated, { status: 200 });
}

export async function DELETE(req) {
  const session = await getServerSession(authOptions);
  if (!session || session.user.role !== "ADMIN") {
    return NextResponse.json({ error: "Not authorized" }, { status: 401 });
  }

  const { searchParams } = new URL(req.url);
  const id = searchParams.get("id");

  if (session.user.id === id) {
    return NextResponse.json(
      { error: "You cannot delete your own account." },
      { status: 400 }
    );
  }

  const deleted = await prisma.user.delete({
    where: { id: id },
  });

  return NextResponse.json(deleted, { status: 200 });
}
