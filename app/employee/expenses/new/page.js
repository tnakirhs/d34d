import { redirect } from 'next/navigation';
import { revalidatePath } from 'next/cache';
import { PrismaClient } from '@prisma/client';
import Link from 'next/link';
import { ArrowLeft, FilePlus2, Send } from 'lucide-react';

// /home/n3v3r/odoo/expense-manager/app/employee/expenses/new/page.js

const prisma = globalThis._prisma || new PrismaClient();
if (process.env.NODE_ENV !== 'production') globalThis._prisma = prisma;

async function createExpense(formData) {
    'use server';

    const email = String(formData.get('email') || '').trim();
    const description = String(formData.get('description') || '').trim();
    const currencyInput = String(formData.get('currency') || '').trim().toUpperCase();
    const amountRaw = String(formData.get('amount') || '').trim();

    if (!email) throw new Error('Email is required');
    if (!amountRaw) throw new Error('Amount is required');
    const amount = Number(amountRaw);
    if (!Number.isFinite(amount) || amount <= 0) throw new Error('Amount must be a positive number');
    if (!description) throw new Error('Description is required');

    const user = await prisma.user.findUnique({ where: { email } });
    if (!user) throw new Error('User not found');

    const currency = currencyInput || user.currency || 'USD';

    await prisma.expense.create({
        data: {
            amount,
            currency,
            description,
            userId: user.id,
        },
    });

    revalidatePath('/employee/expenses');
    redirect('/employee/expenses');
}

export default function NewExpensePage() {
    return (
        <div className="bg-black min-h-screen text-gray-200 antialiased">
            <div className="relative max-w-2xl mx-auto p-6 md:p-10">
                {/* ambient glow */}
                <div className="pointer-events-none absolute inset-0 -z-10">
                    <div className="absolute -top-24 -left-24 h-72 w-72 rounded-full bg-blue-600/20 blur-3xl" />
                    <div className="absolute -bottom-24 -right-24 h-72 w-72 rounded-full bg-purple-600/20 blur-3xl" />
                </div>

                <header className="flex items-center justify-between mb-8">
                    <Link
                        href="/employee/expenses"
                        className="inline-flex items-center gap-2 text-sm text-gray-400 hover:text-gray-200 transition-colors"
                    >
                        <ArrowLeft className="h-4 w-4" />
                        Back to My Expenses
                    </Link>
                </header>

                <div className="relative overflow-hidden rounded-2xl border border-zinc-800 bg-zinc-900/70 shadow-2xl">
                    <div className="absolute inset-px rounded-[1rem] bg-gradient-to-b from-white/5 to-transparent pointer-events-none" />
                    <div className="p-6 md:p-8">
                        <div className="flex items-center gap-3 mb-6">
                            <div className="p-2 rounded-lg bg-zinc-800/70 border border-zinc-700">
                                <FilePlus2 className="h-5 w-5 text-blue-400" />
                            </div>
                            <div>
                                <h1 className="text-2xl md:text-3xl font-semibold text-white tracking-tight">
                                    Submit New Expense
                                </h1>
                                <p className="text-sm text-gray-400">
                                    Create and submit a new expense report.
                                </p>
                            </div>
                        </div>

                        <form action={createExpense} className="grid gap-5">
                            <div>
                                <label className="block text-sm font-medium text-gray-300">
                                    Employee Email
                                </label>
                                <input
                                    name="email"
                                    type="email"
                                    placeholder="employee@example.com"
                                    required
                                    autoComplete="email"
                                    className="mt-2 w-full rounded-lg bg-zinc-950/60 border border-zinc-800 focus:border-blue-500/50 focus:outline-none focus:ring-0 text-gray-100 placeholder:text-zinc-500 px-4 py-3"
                                />
                            </div>

                            <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                                <div>
                                    <label className="block text-sm font-medium text-gray-300">
                                        Amount
                                    </label>
                                    <input
                                        name="amount"
                                        type="number"
                                        step="0.01"
                                        min="0"
                                        placeholder="0.00"
                                        required
                                        className="mt-2 w-full rounded-lg bg-zinc-950/60 border border-zinc-800 focus:border-blue-500/50 focus:outline-none focus:ring-0 text-gray-100 placeholder:text-zinc-500 px-4 py-3"
                                    />
                                </div>

                                <div>
                                    <label className="block text-sm font-medium text-gray-300">
                                        Currency (optional)
                                    </label>
                                    <input
                                        name="currency"
                                        type="text"
                                        placeholder="USD"
                                        maxLength={10}
                                        className="mt-2 w-full uppercase tracking-wide rounded-lg bg-zinc-950/60 border border-zinc-800 focus:border-blue-500/50 focus:outline-none focus:ring-0 text-gray-100 placeholder:text-zinc-500 px-4 py-3"
                                    />
                                </div>
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-gray-300">
                                    Description
                                </label>
                                <textarea
                                    name="description"
                                    placeholder="Describe the expense"
                                    rows={4}
                                    required
                                    className="mt-2 w-full rounded-lg bg-zinc-950/60 border border-zinc-800 focus:border-blue-500/50 focus:outline-none focus:ring-0 text-gray-100 placeholder:text-zinc-500 px-4 py-3"
                                />
                            </div>

                            <div className="flex items-center justify-between">
                                <p className="text-xs text-gray-400">
                                    If currency is not provided, the user&apos;s default currency will be used.
                                </p>
                                <button
                                    type="submit"
                                    className="inline-flex items-center gap-2 px-5 py-2.5 rounded-lg bg-blue-600 hover:bg-blue-500 text-white font-medium transition-colors border border-blue-500/30"
                                >
                                    <Send className="h-4 w-4" />
                                    Submit Expense
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            </div>
        </div>
    );
}