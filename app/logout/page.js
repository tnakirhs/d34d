"use client";

import { useEffect } from "react";
import { signOut } from "next-auth/react";

export default function LogoutPage() {
  useEffect(() => {
    // Trigger logout on load
    signOut({ callbackUrl: "/login" });
  }, []);

  return (
    <div className="flex items-center justify-center h-screen">
      <p className="text-lg font-medium">Logging out...</p>
    </div>
  );
}
