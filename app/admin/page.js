"use client";

import { useSession } from "next-auth/react";
import { useEffect, useState } from "react";

export default function AdminPage() {
  const { data: session } = useSession();
  const [users, setUsers] = useState([]);
  const [roleMap, setRoleMap] = useState({});

  useEffect(() => {
    if (session?.user?.role === "ADMIN") {
      fetch("/api/users")
        .then((res) => res.json())
        .then((data) => {
          setUsers(data);
          const map = {};
          data.forEach((u) => (map[u.id] = u.role));
          setRoleMap(map);
        });
    }
  }, [session]);

  const handleRoleChange = async (id, newRole) => {
    await fetch("/api/users", {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ id, role: newRole }),
    });
    setRoleMap((prev) => ({ ...prev, [id]: newRole }));
  };

  return (
    <div className="p-6">
      <h1 className="text-2xl font-bold mb-4">Admin Dashboard</h1>
      <h2 className="text-xl font-bold mb-2">Manage Users</h2>
      <table className="border-collapse border w-full">
        <thead>
          <tr className="border">
            <th className="border p-2">Name</th>
            <th className="border p-2">Email</th>
            <th className="border p-2">Role</th>
          </tr>
        </thead>
        <tbody>
          {users.map((u) => (
            <tr key={u.id} className="border">
              <td className="border p-2">{u.name}</td>
              <td className="border p-2">{u.email}</td>
              <td className="border p-2">
                <select
                  value={roleMap[u.id]}
                  onChange={(e) => handleRoleChange(u.id, e.target.value)}
                  className="border p-1"
                >
                  <option value="ADMIN">Admin</option>
                  <option value="MANAGER">Manager</option>
                  <option value="EMPLOYEE">Employee</option>
                </select>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
