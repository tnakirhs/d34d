"use client";

import { useSession } from "next-auth/react";
import { useCallback, useEffect, useMemo, useState } from "react";

const fetchJson = async (url, options = {}) => {
  const res = await fetch(url, {
    ...options,
    headers: {
      "Content-Type": "application/json",
      ...(options.headers || {}),
    },
  });

  let payload = null;
  if (res.status !== 204) {
    try {
      payload = await res.json();
    } catch {
      payload = null;
    }
  }

  if (!res.ok) {
    const message =
      payload?.error ||
      payload?.message ||
      (typeof payload === "string" ? payload : "Request failed");
    throw new Error(message);
  }

  return payload;
};

export default function AdminPage() {
  const { data: session } = useSession();

  const isAdmin = session?.user?.role === "ADMIN";
  const currentUserId = useMemo(
    () => session?.user?.id ?? session?.user?.email ?? "",
    [session]
  );

  const [users, setUsers] = useState([]);
  const [roleDraft, setRoleDraft] = useState({});
  const [status, setStatus] = useState({ loading: false, error: "" });
  const [newUser, setNewUser] = useState({
    name: "",
    email: "",
    password: "",
    role: "EMPLOYEE",
  });

  const primeDrafts = useCallback((list) => {
    const roles = {};
    list.forEach((user) => {
      roles[user.id] = user.role;
    });
    setRoleDraft(roles);
  }, []);

  const loadUsers = useCallback(async () => {
    if (!isAdmin) return;
    try {
      setStatus({ loading: true, error: "" });
      const data = await fetchJson("/api/users");
      const list = Array.isArray(data) ? data : [];
      setUsers(list);
      primeDrafts(list);
    } catch (err) {
      setStatus({ loading: false, error: err.message || "Unable to load users" });
      return;
    }
    setStatus((prev) => ({ ...prev, loading: false }));
  }, [isAdmin, primeDrafts]);

  useEffect(() => {
    loadUsers();
  }, [loadUsers]);

  const resetForm = () =>
    setNewUser({
      name: "",
      email: "",
      password: "",
      role: "EMPLOYEE",
    });

  const handleRoleChange = async (id, role) => {
    const target = users.find((user) => user.id === id);
    if (!target) return;
    if (target.role === "ADMIN" || id === currentUserId) {
      setRoleDraft((prev) => ({ ...prev, [id]: target.role }));
      return;
    }

    setRoleDraft((prev) => ({ ...prev, [id]: role }));
    try {
      const updated = await fetchJson("/api/users", {
        method: "PUT",
        body: JSON.stringify({ id, role }),
      });
      setUsers((prev) =>
        prev.map((user) => (user.id === id ? { ...user, ...updated } : user))
      );
    } catch (err) {
      setStatus((prev) => ({ ...prev, error: err.message || "Unable to update role" }));
      setRoleDraft((prev) => ({ ...prev, [id]: target.role }));
    }
  };

  const handleDeleteUser = async (id) => {
    if (!id || id === currentUserId) return;
    const target = users.find((user) => user.id === id);
    if (!target || target.role === "ADMIN") return;

    try {
      await fetchJson(`/api/users/${id}`, { method: "DELETE" });
      setUsers((prev) => prev.filter((user) => user.id !== id));
      setRoleDraft((prev) => {
        const next = { ...prev };
        delete next[id];
        return next;
      });
    } catch (err) {
      setStatus((prev) => ({ ...prev, error: err.message || "Unable to delete user" }));
    }
  };

  const handleAddUser = async (event) => {
    event.preventDefault();
    setStatus((prev) => ({ ...prev, error: "" }));

    const name = newUser.name.trim();
    const email = newUser.email.trim().toLowerCase();
    if (!name || !email || !newUser.password) {
      setStatus((prev) => ({ ...prev, error: "Name, email, and password are required" }));
      return;
    }
    if (newUser.role === "ADMIN") {
      setStatus((prev) => ({ ...prev, error: "Cannot create another admin" }));
      return;
    }

    try {
      setStatus({ loading: true, error: "" });
      const created = await fetchJson("/api/auth/register", {
        method: "POST",
        body: JSON.stringify({
          name,
          email,
          password: newUser.password,
          confirmPassword: newUser.password,
          currency: session?.user?.currency ?? "USD",
          role: newUser.role,
          status: "ACTIVE",
        }),
      });

      const freshUser = {
        ...created,
        role: created.role ?? newUser.role,
      };

      setUsers((prev) => [...prev, freshUser]);
      primeDrafts([...users, freshUser]);
      resetForm();
    } catch (err) {
      setStatus({ loading: false, error: err.message || "Unable to add user" });
      return;
    }
    setStatus((prev) => ({ ...prev, loading: false }));
  };

  if (!isAdmin) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-b from-slate-900 to-black text-zinc-200">
        <div className="rounded-2xl border border-zinc-800 bg-black/40 backdrop-blur-xl p-6 shadow-2xl">
          <h1 className="text-2xl font-semibold mb-2 text-center">Admin Dashboard</h1>
          <p className="text-center text-zinc-400">Not authorized.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-slate-900 to-black text-zinc-200">
      <div className="mx-auto max-w-7xl p-4 md:p-6 space-y-6">
        <header className="rounded-2xl border border-zinc-800 bg-black/30 backdrop-blur-xl px-6 py-4 shadow-2xl">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-semibold">Admin Dashboard</h1>
              <p className="text-sm text-zinc-400">
                Manage roles and user lifecycle
              </p>
            </div>
            <button
              onClick={loadUsers}
              className="rounded-md border border-zinc-700 bg-zinc-800 px-3 py-1.5 text-sm hover:bg-zinc-700"
              disabled={status.loading}
            >
              {status.loading ? "Refreshing..." : "Refresh"}
            </button>
          </div>
          {status.error ? (
            <p className="mt-3 rounded-md border border-red-500/40 bg-red-500/10 px-3 py-2 text-sm text-red-300">
              {status.error}
            </p>
          ) : null}
        </header>

        <section className="rounded-2xl border border-zinc-800 bg-black/20 backdrop-blur-xl p-6 shadow-2xl">
          <h2 className="text-xl font-semibold mb-4">Add User</h2>
          <form onSubmit={handleAddUser} className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
            <div className="flex flex-col">
              <label className="text-sm text-zinc-400 mb-1">Name</label>
              <input
                type="text"
                value={newUser.name}
                onChange={(event) =>
                  setNewUser((prev) => ({ ...prev, name: event.target.value }))
                }
                className="rounded-md border border-zinc-700 bg-zinc-900/60 px-3 py-2 outline-none focus:ring-2 focus:ring-blue-500/50"
                placeholder="Jane Doe"
              />
            </div>
            <div className="flex flex-col">
              <label className="text-sm text-zinc-400 mb-1">Email</label>
              <input
                type="email"
                value={newUser.email}
                onChange={(event) =>
                  setNewUser((prev) => ({ ...prev, email: event.target.value }))
                }
                className="rounded-md border border-zinc-700 bg-zinc-900/60 px-3 py-2 outline-none focus:ring-2 focus:ring-blue-500/50"
                placeholder="jane@example.com"
              />
            </div>
            <div className="flex flex-col">
              <label className="text-sm text-zinc-400 mb-1">Temporary Password</label>
              <input
                type="password"
                value={newUser.password}
                onChange={(event) =>
                  setNewUser((prev) => ({ ...prev, password: event.target.value }))
                }
                className="rounded-md border border-zinc-700 bg-zinc-900/60 px-3 py-2 outline-none focus:ring-2 focus:ring-blue-500/50"
                placeholder="At least 8 characters"
              />
            </div>
            <div className="flex flex-col">
              <label className="text-sm text-zinc-400 mb-1">Role</label>
              <select
                value={newUser.role}
                onChange={(event) =>
                  setNewUser((prev) => ({ ...prev, role: event.target.value }))
                }
                className="rounded-md border border-zinc-700 bg-zinc-900/60 px-3 py-2 outline-none focus:ring-2 focus:ring-blue-500/50"
              >
                <option value="EMPLOYEE">Employee</option>
                <option value="MANAGER">Manager</option>
                <option value="ADMIN" disabled>
                  Admin (disabled)
                </option>
              </select>
            </div>
            <div className="lg:col-span-4">
              <button
                type="submit"
                disabled={status.loading}
                className="rounded-md bg-blue-600 px-4 py-2 font-medium text-white hover:bg-blue-700 disabled:opacity-60"
              >
                {status.loading ? "Saving..." : "Add User"}
              </button>
            </div>
          </form>
        </section>

        <section className="rounded-2xl border border-zinc-800 bg-black/20 backdrop-blur-xl p-6 shadow-2xl">
          <h2 className="text-xl font-semibold mb-4">Manage Users</h2>
          <div className="overflow-x-auto">
            <table className="w-full border-collapse">
              <thead>
                <tr className="bg-black/40 text-sm text-zinc-300">
                  <th className="p-3 text-left font-medium">Name</th>
                  <th className="p-3 text-left font-medium">Email</th>
                  <th className="p-3 text-left font-medium">Role</th>
                  <th className="p-3 text-left font-medium">Actions</th>
                </tr>
              </thead>
              <tbody>
                {users.length === 0 ? (
                  <tr>
                    <td colSpan={4} className="p-6 text-center text-zinc-500">
                      No users found.
                    </td>
                  </tr>
                ) : (
                  users.map((user) => {
                    const isSelfAdmin =
                      user.role === "ADMIN" && user.id === currentUserId;
                    return (
                      <tr key={user.id} className="border-t border-zinc-800/60 text-sm">
                        <td className="p-3 align-top">{user.name}</td>
                        <td className="p-3 align-top text-zinc-400">{user.email}</td>
                        <td className="p-3 align-top">
                          <select
                            value={roleDraft[user.id] ?? user.role}
                            onChange={(event) => handleRoleChange(user.id, event.target.value)}
                            className="rounded-md border border-zinc-700 bg-zinc-900/60 px-2 py-1 outline-none focus:ring-2 focus:ring-blue-500/40"
                            disabled={isSelfAdmin}
                          >
                            <option value="ADMIN" disabled={user.role !== "ADMIN"}>
                              Admin
                            </option>
                            <option value="MANAGER">Manager</option>
                            <option value="EMPLOYEE">Employee</option>
                          </select>
                        </td>
                        <td className="p-3 align-top">
                          <button
                            onClick={() => handleDeleteUser(user.id)}
                            disabled={isSelfAdmin || user.role === "ADMIN"}
                            className="rounded-md bg-red-600 px-3 py-1 text-white hover:bg-red-700 disabled:opacity-60"
                          >
                            Delete
                          </button>
                        </td>
                      </tr>
                    );
                  })
                )}
              </tbody>
            </table>
          </div>
        </section>
      </div>
    </div>
  );
}
