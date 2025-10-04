"use client";

import { useSession } from "next-auth/react";

export default function EmployeePage() {
  const { data: session } = useSession();

  if (!session) return <p>Please log in</p>;
  if (session.user.role !== "EMPLOYEE") return <p>Access denied</p>;

  return (
    <div className="p-6">
      <h1 className="text-2xl font-bold">Employee Dashboard</h1>
      <p>Welcome {session.user.name}. You can submit expenses here.</p>
    </div>
  );
}
