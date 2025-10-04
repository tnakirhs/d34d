"use client";

import { useSession } from "next-auth/react";
import { useCallback, useEffect, useMemo, useReducer } from "react";

// Centralized state management with a reducer
const initialState = {
    users: [],
    roleDrafts: {},
    newUser: { name: "", email: "", password: "", role: "EMPLOYEE" },
    loading: false,
    error: null,
};

function adminReducer(state, action) {
    switch (action.type) {
        case "FETCH_START":
            return { ...state, loading: true, error: null };
        case "FETCH_SUCCESS":
            const roleDrafts = {};
            action.payload.forEach(user => {
                roleDrafts[user.id] = user.role;
            });
            return { ...state, loading: false, users: action.payload, roleDrafts };
        case "FETCH_ERROR":
            return { ...state, loading: false, error: action.payload };
        case "SET_NEW_USER_FIELD":
            return { ...state, newUser: { ...state.newUser, ...action.payload } };
        case "RESET_NEW_USER_FORM":
            return { ...state, newUser: initialState.newUser };
        case "ADD_USER_SUCCESS":
            const newUser = action.payload;
            return {
                ...state,
                loading: false,
                users: [...state.users, newUser],
                roleDrafts: { ...state.roleDrafts, [newUser.id]: newUser.role },
            };
        case "UPDATE_ROLE_DRAFT":
            return { ...state, roleDrafts: { ...state.roleDrafts, [action.payload.id]: action.payload.role } };
        case "UPDATE_USER_SUCCESS":
            return {
                ...state,
                users: state.users.map(user =>
                    user.id === action.payload.id ? { ...user, ...action.payload } : user
                ),
            };
        case "DELETE_USER_SUCCESS":
            const newUsers = state.users.filter(user => user.id !== action.payload.id);
            const newRoleDrafts = { ...state.roleDrafts };
            delete newRoleDrafts[action.payload.id];
            return { ...state, users: newUsers, roleDrafts: newRoleDrafts };
        case "CLEAR_ERROR":
            return { ...state, error: null };
        default:
            return state;
    }
}

// API helper
const fetchJson = async (url, options = {}) => {
    const res = await fetch(url, {
        ...options,
        headers: { "Content-Type": "application/json", ...(options.headers || {}) },
    });
    const payload = res.status === 204 ? null : await res.json().catch(() => null);
    if (!res.ok) {
        const message = payload?.error || payload?.message || "Request failed";
        throw new Error(message);
    }
    return payload;
};

export default function AdminPage() {
    const { data: session } = useSession();
    const [state, dispatch] = useReducer(adminReducer, initialState);
    const { users, roleDrafts, newUser, loading, error } = state;

    const isAdmin = session?.user?.role === "ADMIN";
    const currentUserId = useMemo(() => session?.user?.id ?? "", [session]);

    const loadUsers = useCallback(async () => {
        if (!isAdmin) return;
        dispatch({ type: "FETCH_START" });
        try {
            const data = await fetchJson("/api/users");
            dispatch({ type: "FETCH_SUCCESS", payload: Array.isArray(data) ? data : [] });
        } catch (err) {
            dispatch({ type: "FETCH_ERROR", payload: err.message });
        }
    }, [isAdmin]);

    useEffect(() => {
        loadUsers();
    }, [loadUsers]);

    const handleRoleChange = async (id, role) => {
        const originalUser = users.find(user => user.id === id);
        if (!originalUser || originalUser.role === "ADMIN" || id === currentUserId) return;

        const originalRole = originalUser.role;
        dispatch({ type: "UPDATE_ROLE_DRAFT", payload: { id, role } });

        try {
            const updated = await fetchJson("/api/users", {
                method: "PUT",
                body: JSON.stringify({ id, role }),
            });
            dispatch({ type: "UPDATE_USER_SUCCESS", payload: updated });
        } catch (err) {
            dispatch({ type: "FETCH_ERROR", payload: err.message });
            dispatch({ type: "UPDATE_ROLE_DRAFT", payload: { id, role: originalRole } });
        }
    };

    const handleDeleteUser = async (id) => {
        const target = users.find(user => user.id === id);
        if (!target || target.role === "ADMIN" || id === currentUserId) return;

        if (!window.confirm(`Are you sure you want to delete user ${target.name}?`)) return;

        try {
            await fetchJson(`/api/users/${id}`, { method: "DELETE" });
            dispatch({ type: "DELETE_USER_SUCCESS", payload: { id } });
        } catch (err) {
            dispatch({ type: "FETCH_ERROR", payload: err.message });
        }
    };

    const handleAddUser = async (event) => {
        event.preventDefault();
        dispatch({ type: "CLEAR_ERROR" });

        const { name, email, password, role } = newUser;
        if (!name.trim() || !email.trim() || !password) {
            dispatch({ type: "FETCH_ERROR", payload: "Name, email, and password are required." });
            return;
        }
        if (role === "ADMIN") {
            dispatch({ type: "FETCH_ERROR", payload: "Cannot create another admin." });
            return;
        }

        dispatch({ type: "FETCH_START" });
        try {
            const created = await fetchJson("/api/auth/register", {
                method: "POST",
                body: JSON.stringify({
                    name: name.trim(),
                    email: email.trim().toLowerCase(),
                    password,
                    confirmPassword: password,
                    currency: session?.user?.currency ?? "USD",
                    role,
                    status: "ACTIVE",
                }),
            });
            dispatch({ type: "ADD_USER_SUCCESS", payload: created });
            dispatch({ type: "RESET_NEW_USER_FORM" });
        } catch (err) {
            dispatch({ type: "FETCH_ERROR", payload: err.message });
        }
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
                            <p className="text-sm text-zinc-400">Manage roles and user lifecycle</p>
                        </div>
                        <button
                            onClick={loadUsers}
                            className="rounded-md border border-zinc-700 bg-zinc-800 px-3 py-1.5 text-sm hover:bg-zinc-700 disabled:opacity-60"
                            disabled={loading}
                        >
                            {loading ? "Refreshing..." : "Refresh"}
                        </button>
                    </div>
                    {error && (
                        <p className="mt-3 rounded-md border border-red-500/40 bg-red-500/10 px-3 py-2 text-sm text-red-300">
                            {error}
                        </p>
                    )}
                </header>

                <section className="rounded-2xl border border-zinc-800 bg-black/20 backdrop-blur-xl p-6 shadow-2xl">
                    <h2 className="text-xl font-semibold mb-4">Add User</h2>
                    <form onSubmit={handleAddUser} className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
                        <input
                            type="text"
                            value={newUser.name}
                            onChange={(e) => dispatch({ type: "SET_NEW_USER_FIELD", payload: { name: e.target.value } })}
                            className="rounded-md border border-zinc-700 bg-zinc-900/60 px-3 py-2 outline-none focus:ring-2 focus:ring-blue-500/50"
                            placeholder="Name"
                        />
                        <input
                            type="email"
                            value={newUser.email}
                            onChange={(e) => dispatch({ type: "SET_NEW_USER_FIELD", payload: { email: e.target.value } })}
                            className="rounded-md border border-zinc-700 bg-zinc-900/60 px-3 py-2 outline-none focus:ring-2 focus:ring-blue-500/50"
                            placeholder="Email"
                        />
                        <input
                            type="password"
                            value={newUser.password}
                            onChange={(e) => dispatch({ type: "SET_NEW_USER_FIELD", payload: { password: e.target.value } })}
                            className="rounded-md border border-zinc-700 bg-zinc-900/60 px-3 py-2 outline-none focus:ring-2 focus:ring-blue-500/50"
                            placeholder="Temporary Password"
                        />
                        <select
                            value={newUser.role}
                            onChange={(e) => dispatch({ type: "SET_NEW_USER_FIELD", payload: { role: e.target.value } })}
                            className="rounded-md border border-zinc-700 bg-zinc-900/60 px-3 py-2 outline-none focus:ring-2 focus:ring-blue-500/50"
                        >
                            <option value="EMPLOYEE">Employee</option>
                            <option value="MANAGER">Manager</option>
                        </select>
                        <div className="lg:col-span-4">
                            <button
                                type="submit"
                                disabled={loading}
                                className="rounded-md bg-blue-600 px-4 py-2 font-medium text-white hover:bg-blue-700 disabled:opacity-60"
                            >
                                {loading ? "Saving..." : "Add User"}
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
                                    <tr><td colSpan={4} className="p-6 text-center text-zinc-500">No users found.</td></tr>
                                ) : (
                                    users.map((user) => (
                                        <tr key={user.id} className="border-t border-zinc-800/60 text-sm">
                                            <td className="p-3 align-top">{user.name}</td>
                                            <td className="p-3 align-top text-zinc-400">{user.email}</td>
                                            <td className="p-3 align-top">
                                                <select
                                                    value={roleDrafts[user.id] ?? user.role}
                                                    onChange={(e) => handleRoleChange(user.id, e.target.value)}
                                                    className="rounded-md border border-zinc-700 bg-zinc-900/60 px-2 py-1 outline-none focus:ring-2 focus:ring-blue-500/40"
                                                    disabled={user.role === "ADMIN" || user.id === currentUserId}
                                                >
                                                    <option value="ADMIN" disabled>Admin</option>
                                                    <option value="MANAGER">Manager</option>
                                                    <option value="EMPLOYEE">Employee</option>
                                                </select>
                                            </td>
                                            <td className="p-3 align-top">
                                                <button
                                                    onClick={() => handleDeleteUser(user.id)}
                                                    disabled={user.role === "ADMIN" || user.id === currentUserId}
                                                    className="rounded-md bg-red-600 px-3 py-1 text-white hover:bg-red-700 disabled:opacity-60"
                                                >
                                                    Delete
                                                </button>
                                            </td>
                                        </tr>
                                    ))
                                )}
                            </tbody>
                        </table>
                    </div>
                </section>
            </div>
        </div>
    );
}
