"use client";

import { useSession } from "next-auth/react";
import { useState, useEffect } from "react";

export default function ManagerPage() {
  const { data: session } = useSession();
  const [expenses, setExpenses] = useState([]);

  useEffect(() => {
    fetch("/api/approvals")
      .then((res) => res.json())
      .then(setExpenses);
  }, []);

  if (!session) return <p>Please log in</p>;
  if (session.user.role !== "MANAGER") return <p>Access denied</p>;

  const handleAction = async (id, action) => {
    await fetch("/api/approvals", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ expenseId: id, action }),
    });

    setExpenses((prev) =>
      prev.map((e) => (e.id === id ? { ...e, status: action === "approve" ? "APPROVED" : "REJECTED" } : e))
    );
  };

  return (
    <div className="p-6">
      <h1 className="text-2xl font-bold mb-4">Manager Dashboard</h1>
      <ul>
        {expenses.map((exp) => (
          <li key={exp.id} className="mb-2 border p-2 rounded">
            {exp.user.name}: {exp.amount} {exp.currency} - {exp.description} - {exp.status}
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
    </div>
  );
}
