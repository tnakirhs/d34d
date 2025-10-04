import React from "react";
import Link from "next/link";
import { PrismaClient } from "@prisma/client";
import { FilePlus2 } from "lucide-react";

export const revalidate = 0;

// Single Prisma client across hot-reloads
const prisma = globalThis._prisma || new PrismaClient();
if (process.env.NODE_ENV !== "production") globalThis._prisma = prisma;

function formatCurrency(amount, currency) {
    try {
        return new Intl.NumberFormat("en-US", {
            style: "currency",
            currency: currency || "USD",
            maximumFractionDigits: 2,
        }).format(amount ?? 0);
    } catch {
        return `${(amount ?? 0).toFixed(2)} ${currency || ""}`.trim();
    }
}

function formatDate(d) {
    try {
        return new Intl.DateTimeFormat("en-US", {
            year: "numeric",
            month: "short",
            day: "numeric",
        }).format(d instanceof Date ? d : new Date(d));
    } catch {
        return String(d);
    }
}

function StatusBadge({ status }) {
    const s = String(status || "").toUpperCase();
    let cls =
        "inline-flex items-center rounded-full border px-2.5 py-1 text-xs font-semibold text-zinc-300 border-zinc-700 bg-zinc-900/40";
    if (s === "APPROVED")
        cls =
            "inline-flex items-center rounded-full border px-2.5 py-1 text-xs font-semibold text-green-300 border-green-700/50 bg-green-500/10";
    else if (s === "REJECTED")
        cls =
            "inline-flex items-center rounded-full border px-2.5 py-1 text-xs font-semibold text-red-300 border-red-700/50 bg-red-500/10";
    return <span className={cls}>{s || "PENDING"}</span>;
}

export default async function Page() {
    let expenses = [];
    let error = null;

    try {
        expenses = await prisma.expense.findMany({
            orderBy: { date: "desc" },
            include: {
                user: { select: { id: true, name: true, email: true, currency: true } },
                approvals: { select: { id: true, status: true } },
            },
        });
    } catch (e) {
        error = "Failed to load expenses.";
        console.error(e);
    }

    return (
        <div className="bg-black min-h-screen text-gray-200 antialiased">
            <div className="relative max-w-3xl mx-auto p-6 md:p-10">
                {/* ambient glow */}
                <div className="pointer-events-none absolute inset-0 -z-10">
                    <div className="absolute -top-24 -left-24 h-72 w-72 rounded-full bg-blue-600/20 blur-3xl" />
                    <div className="absolute -bottom-24 -right-24 h-72 w-72 rounded-full bg-purple-600/20 blur-3xl" />
                </div>

                <header className="flex items-center justify-between mb-8">
                    <div>
                        <h1 className="text-2xl md:text-3xl font-semibold text-white tracking-tight">My Expenses</h1>
                        <p className="text-sm text-gray-400">Recent submissions and status</p>
                    </div>
                    <Link
                        href="/employee/expenses/new"
                        className="inline-flex items-center gap-2 px-4 py-2 rounded-lg bg-blue-600 hover:bg-blue-500 text-white font-medium transition-colors border border-blue-500/30"
                    >
                        <FilePlus2 className="h-4 w-4" />
                        New Expense
                    </Link>
                </header>

                <div className="relative overflow-hidden rounded-2xl border border-zinc-800 bg-zinc-900/70 shadow-2xl">
                    <div className="absolute inset-px rounded-[1rem] bg-gradient-to-b from-white/5 to-transparent pointer-events-none" />
                    <div className="p-4 md:p-6">
                        {error && (
                            <div className="mb-4 rounded-lg border border-red-900/30 bg-red-900/20 text-red-300 px-4 py-3">
                                {error}
                            </div>
                        )}

                        {!error && expenses.length === 0 && (
                            <div className="py-16 text-center text-gray-400">
                                <div className="text-4xl mb-2">💼</div>
                                <div className="text-white font-semibold">No expenses yet</div>
                                <div className="text-sm mt-1">Create your first expense to see it here.</div>
                            </div>
                        )}

                        {!error && expenses.length > 0 && (
                            <ul className="grid gap-3">
                                {expenses.map((exp) => (
                                    <li
                                        key={exp.id}
                                        className="rounded-xl border border-zinc-800 bg-zinc-950/50 hover:bg-zinc-900/60 transition-colors p-4 md:p-5 grid grid-cols-[1fr_auto] gap-4"
                                    >
                                        <div className="min-w-0">
                                            <div className="font-semibold text-white truncate">{exp.description}</div>
                                            <div className="mt-1 text-xs text-gray-400 flex items-center gap-2 flex-wrap">
                                                <span>{formatDate(exp.date)}</span>
                                                <span className="opacity-50">•</span>
                                                <span>{exp.user?.name || "Unknown"}</span>
                                                {exp.approvals?.length ? (
                                                    <>
                                                        <span className="opacity-50">•</span>
                                                        <span>
                                                            {exp.approvals.length} approval
                                                            {exp.approvals.length > 1 ? "s" : ""}
                                                        </span>
                                                    </>
                                                ) : null}
                                            </div>
                                        </div>
                                        <div className="text-right grid gap-2 content-center">
                                            <div className="font-semibold text-white">
                                                {formatCurrency(exp.amount, exp.currency || exp.user?.currency)}
                                            </div>
                                            <StatusBadge status={exp.status} />
                                        </div>
                                    </li>
                                ))}
                            </ul>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
}
