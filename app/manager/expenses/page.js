"use client";

import { useSession } from "next-auth/react";
import { useState, useEffect } from "react";

export default function ManagerPage() {
    const { data: session, status } = useSession();
    const [expenses, setExpenses] = useState([]);
    const [error, setError] = useState(null);

    useEffect(() => {
        if (status !== "authenticated") return;
        if (session?.user?.role !== "MANAGER") return;

        const load = async () => {
            try {
                const res = await fetch("/api/approvals", { cache: "no-store" });
                if (!res.ok) throw new Error(`Failed to load approvals (${res.status})`);
                const data = await res.json();
                setExpenses(data || []);
            } catch (e) {
                setError(e.message);
            }
        };
        load();
    }, [status, session]);

    if (status === "loading") return <p>Loading...</p>;
    if (!session) return <p>Please log in</p>;
    if (session.user.role !== "MANAGER") return <p>Access denied</p>;

    const handleAction = async (id, action) => {
        try {
            const res = await fetch("/api/approvals", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ expenseId: id, action }),
            });
            if (!res.ok) throw new Error("Action failed");

            setExpenses((prev) =>
                prev.map((e) =>
                    e.id === id ? { ...e, status: action === "approve" ? "APPROVED" : "REJECTED" } : e
                )
            );
        } catch (e) {
            alert(e.message);
        }
    };

    return (
        <div className="p-6">
            <h1 className="text-2xl font-bold mb-4">Manager Dashboard</h1>
            {error && <p className="text-red-600 mb-2">{error}</p>}
            {expenses.length === 0 ? (
                <p>No pending expenses.</p>
            ) : (
                <ul>
                    {expenses.map((exp) => (
                        <li key={exp.id} className="mb-2 border p-2 rounded">
                            {exp.user?.name || "Unknown"}: {exp.amount} {exp.currency} - {exp.description} - {exp.status}
                            {exp.status === "PENDING" && (
                                <span className="ml-4">
                                    <button
                                        className="bg-green-500 text-white px-2 py-1 rounded mr-2"
                                        onClick={() => handleAction(exp.id, "approve")}
                                    >
                                        Approve
                                    </button>
                                    <button
                                        className="bg-red-500 text-white px-2 py-1 rounded"
                                        onClick={() => handleAction(exp.id, "reject")}
                                    >
                                        Reject
                                    </button>
                                </span>
                            )}
                        </li>
                    ))}
                </ul>
            )}
        </div>
    );
}
