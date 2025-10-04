"use client";

import { useSession, signOut } from "next-auth/react";

export default function Dashboard() {
  const { data: session } = useSession();

  if (!session) {
    return <p className="p-6">Not logged in.</p>;
  }

  return (
    <div className="p-6">
      <h1 className="text-xl font-bold">Welcome {session.user.name}</h1>
      <p>Role: {session.user.role}</p>
      <button
        onClick={() => signOut({ callbackUrl: "/login" })}
        className="mt-4 bg-red-500 text-white px-4 py-2 rounded"
      >
        Logout
      </button>
    </div>
  );
}
