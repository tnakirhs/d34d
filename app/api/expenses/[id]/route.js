import { getServerSession } from "next-auth";
import { authOptions } from "../../auth/[...nextauth]/route";
import { prisma } from "@/lib/prisma";

export async function PATCH(req, { params }) {
  const session = await getServerSession(authOptions);
  if (!session || (session.user.role !== "MANAGER" && session.user.role !== "ADMIN")) {
    return Response.json({ error: "Unauthorized" }, { status: 403 });
  }

  const { id } = params;
  const { action } = await req.json(); // "APPROVE" or "REJECT"

  // Create or update Approval record
  let approval = await prisma.approval.upsert({
    where: {
      approverId_expenseId: {
        approverId: session.user.id,
        expenseId: parseInt(id),
      },
    },
    update: { status: action },
    create: {
      approverId: session.user.id,
      expenseId: parseInt(id),
      status: action,
    },
  });

  // ⚡ Simple Rule: If ANY rejection → mark Expense REJECTED
  if (action === "REJECT") {
    await prisma.expense.update({
      where: { id: parseInt(id) },
      data: { status: "REJECTED" },
    });
  }

  // ⚡ Simple Rule: If all assigned approvers approved → mark APPROVED
  // (For now: if at least one approves, we approve. Later: use ApprovalRules)
  if (action === "APPROVE") {
    await prisma.expense.update({
      where: { id: parseInt(id) },
      data: { status: "APPROVED" },
    });
  }

  return Response.json(approval);
}

