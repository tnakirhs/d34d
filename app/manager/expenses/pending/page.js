import { getServerSession } from "next-auth";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";
import { prisma } from "@/lib/prisma";
import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";

export default async function PendingExpensesPage() {
    const session = await getServerSession(authOptions);
    if (!session || (session.user.role !== "MANAGER" && session.user.role !== "ADMIN")) {
        redirect("/"); // or redirect to a dedicated unauthorized page
    }

    const expenses = await prisma.expense.findMany({
        where: { status: "PENDING" },
        include: { user: true, approvals: true },
        orderBy: { date: "desc" },
    });

    async function handleApproval(formData) {
        "use server";

        const s = await getServerSession(authOptions);
        if (!s || (s.user.role !== "MANAGER" && s.user.role !== "ADMIN")) return;

        const expenseId = Number(formData.get("expenseId"));
        const action = String(formData.get("action")); // "APPROVE" | "REJECT"

        // Record (or update) the manager's approval decision
        const approverId = Number(s.user.id);
        const approvalStatus = action === "APPROVE" ? "APPROVED" : "REJECTED";

        const existingApproval = await prisma.approval.findFirst({
            where: { approverId, expenseId },
            select: { id: true },
        });

        if (existingApproval) {
            await prisma.approval.update({
                where: { id: existingApproval.id },
                data: { status: approvalStatus },
            });
        } else {
            await prisma.approval.create({
                data: {
                    approverId,
                    expenseId,
                    status: approvalStatus,
                },
            });
        }

        if (action === "REJECT") {
            await prisma.expense.update({
                where: { id: expenseId },
                data: { status: "REJECTED" },
            });
        } else if (action === "APPROVE") {
            await prisma.expense.update({
                where: { id: expenseId },
                data: { status: "APPROVED" },
            });
        }

        revalidatePath("/manager/expenses/pending");
    }

    return (
        <div style={{ padding: 24 }}>
            <h1>Pending Expenses</h1>
            {expenses.length === 0 ? (
                <p>No pending expenses.</p>
            ) : (
                <ul style={{ listStyle: "none", padding: 0, margin: 0, display: "grid", gap: 12 }}>
                    {expenses.map((e) => (
                        <li
                            key={e.id}
                            style={{
                                border: "1px solid #e5e7eb",
                                borderRadius: 8,
                                padding: 16,
                                display: "grid",
                                gap: 8,
                            }}
                        >
                            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                                <strong>#{e.id}</strong>
                                <span>{new Date(e.date).toLocaleString()}</span>
                            </div>
                            <div>
                                <div>
                                    Employee: {e.user?.name} ({e.user?.email})
                                </div>
                                <div>
                                    Amount: {e.amount} {e.currency}
                                </div>
                                <div>Description: {e.description}</div>
                                <div>Status: {e.status}</div>
                            </div>

                            <form action={handleApproval} style={{ display: "flex", gap: 8 }}>
                                <input type="hidden" name="expenseId" value={e.id} />
                                <button
                                    type="submit"
                                    name="action"
                                    value="APPROVE"
                                    style={{
                                        background: "#16a34a",
                                        color: "white",
                                        border: 0,
                                        padding: "8px 12px",
                                        borderRadius: 6,
                                        cursor: "pointer",
                                    }}
                                >
                                    Approve
                                </button>
                                <button
                                    type="submit"
                                    name="action"
                                    value="REJECT"
                                    style={{
                                        background: "#dc2626",
                                        color: "white",
                                        border: 0,
                                        padding: "8px 12px",
                                        borderRadius: 6,
                                        cursor: "pointer",
                                    }}
                                >
                                    Reject
                                </button>
                            </form>
                        </li>
                    ))}
                </ul>
            )}
        </div>
    );
}