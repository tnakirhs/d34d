"use client";

import { useSession } from "next-auth/react";
import { useState, useEffect } from "react";

export default function EmployeePage() {
  const { data: session } = useSession();
  const [amount, setAmount] = useState("");
  const [currency, setCurrency] = useState("USD");
  const [description, setDescription] = useState("");
  const [date, setDate] = useState("");
  const [expenses, setExpenses] = useState([]);
  const [error, setError] = useState("");

  useEffect(() => {
    fetchExpenses();
  }, []);

  const fetchExpenses = async () => {
    const res = await fetch("/api/expenses");
    const data = await res.json();
    setExpenses(data);
  };

  if (!session) return <p>Please log in</p>;
  if (session.user.role !== "EMPLOYEE") return <p>Access denied</p>;

  const submitExpense = async (e) => {
    e.preventDefault();
    setError("");

    if (!amount || !currency || !description || !date) {
      setError("All fields are required.");
      return;
    }

    const res = await fetch("/api/expenses", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ amount, currency, description, date }),
    });

    const data = await res.json();

    if (!res.ok) {
      setError(data.error || "Failed to submit expense");
      return;
    }

    setAmount("");
    setCurrency("USD");
    setDescription("");
    setDate("");
    setExpenses([...expenses, data]);
  };

  return (
    <div className="p-6">
      <h1 className="text-2xl font-bold mb-4">Employee Dashboard</h1>

      {error && <p className="text-red-500 mb-2">{error}</p>}

      <form onSubmit={submitExpense} className="mb-6 space-y-2">
        <input
          type="number"
          placeholder="Amount"
          value={amount}
          onChange={(e) => setAmount(e.target.value)}
          className="border p-2 w-full"
        />
        <input
          type="text"
          placeholder="Currency (USD)"
          value={currency}
          onChange={(e) => setCurrency(e.target.value)}
          className="border p-2 w-full"
        />
        <input
          type="text"
          placeholder="Description"
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          className="border p-2 w-full"
        />
        <input
          type="date"
          value={date}
          onChange={(e) => setDate(e.target.value)}
          className="border p-2 w-full"
        />
        <button type="submit" className="bg-blue-500 text-white px-4 py-2 rounded">
          Submit Expense
        </button>
      </form>

      <h2 className="text-xl font-bold mb-2">Your Expenses</h2>
      <ul>
        {expenses.map((exp) => (
          <li key={exp.id}>
            {exp.amount} {exp.currency} - {exp.description} - {exp.status}
          </li>
        ))}
      </ul>
    </div>
  );
}
