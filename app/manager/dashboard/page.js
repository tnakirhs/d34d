"use client";

import { useSession, signOut } from "next-auth/react";
import { ArrowRight, LogOut, CheckCircle, List } from "lucide-react";

export default function ManagerDashboard() {
  const { data: session } = useSession();

  const menuItems = [
    {
      href: "/manager/expenses/pending",
      title: "Approve Expenses",
      description: "Review and approve/reject employee expense submissions.",
      icon: <CheckCircle className="w-8 h-8 text-yellow-400" />,
    },
    {
      href: "/manager/expenses",
      title: "View All Expenses",
      description: "See history of approved and rejected expenses.",
      icon: <List className="w-8 h-8 text-blue-400" />,
    },
  ];

  return (
    <div className="bg-black min-h-screen text-gray-200 font-sans">
      <div className="max-w-4xl mx-auto p-8 relative">
        <header className="flex justify-between items-center mb-12">
          <div>
            <h1 className="text-4xl font-bold text-white tracking-tight">Manager Dashboard</h1>
            <p className="mt-2 text-gray-400">Welcome, {session?.user?.name || session?.user?.email}</p>
          </div>
          <button
            onClick={() => signOut({ callbackUrl: "/login" })}
            className="flex items-center gap-2 px-4 py-2 bg-zinc-800/50 border border-zinc-700 rounded-lg text-sm text-gray-300 hover:bg-zinc-800 hover:border-zinc-600 transition-colors duration-200"
          >
            <LogOut className="w-4 h-4" />
            <span>Logout</span>
          </button>
        </header>

        <main>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {menuItems.map((item) => (
              <a
                key={item.href}
                href={item.href}
                className="group relative block p-6 bg-zinc-900 border border-zinc-800 rounded-xl hover:border-yellow-500/50 transition-all duration-300"
              >
                <div className="absolute top-6 right-6 p-3 bg-zinc-800/50 rounded-lg border border-zinc-700">
                  {item.icon}
                </div>
                <div className="mt-16">
                  <h2 className="text-xl font-semibold text-white">{item.title}</h2>
                  <p className="mt-1 text-gray-400">{item.description}</p>
                </div>
                <div className="mt-4 flex items-center text-sm font-medium text-yellow-400">
                  <span>Go to page</span>
                  <ArrowRight className="w-4 h-4 ml-1 transform transition-transform duration-300 group-hover:translate-x-1" />
                </div>
              </a>
            ))}
          </div>
        </main>
      </div>
    </div>
  );
}
