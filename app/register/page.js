"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

const currencies = [
    { code: "USD", name: "United States Dollar" },
    { code: "EUR", name: "Euro" },
    { code: "JPY", name: "Japanese Yen" },
    { code: "GBP", name: "British Pound Sterling" },
    { code: "AUD", name: "Australian Dollar" },
    { code: "CAD", name: "Canadian Dollar" },
    { code: "CHF", name: "Swiss Franc" },
    { code: "CNY", name: "Chinese Yuan" },
    { code: "INR", name: "Indian Rupee" },
    { code: "BRL", name: "Brazilian Real" },
    { code: "RUB", name: "Russian Ruble" },
    { code: "ZAR", name: "South African Rand" },
];

export default function RegisterPage() {
    const [name, setName] = useState("");
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [confirmPassword, setConfirmPassword] = useState("");
    const [currency, setCurrency] = useState(currencies[0].code);
    const [error, setError] = useState("");
    const router = useRouter();

    const handleRegister = async (e) => {
        e.preventDefault();
        setError("");

        if (!name || !email || !password || !confirmPassword || !currency) {
            setError("All fields are required");
            return;
        }

        if (password !== confirmPassword) {
            setError("Passwords do not match");
            return;
        }

        try {
            const res = await fetch("/api/auth/register", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ name, email, password, currency }),
            });

            const data = await res.json();

            if (!res.ok) {
                setError(data.error || "Registration failed");
                return;
            }

            alert("Registration successful");
            router.push("/login");
        } catch (err) {
            setError("An unexpected error occurred.");
        }
    };

    return (
        <div className="flex items-center justify-center min-h-screen bg-slate-100 font-sans p-4">
            <div className="w-full max-w-md p-8 space-y-6 bg-white rounded-2xl shadow-lg">
                <div className="text-center">
                    <h1 className="text-3xl font-bold text-slate-900">Create Account</h1>
                    <p className="mt-2 text-sm text-slate-600">
                        Get started with your new account
                    </p>
                </div>

                {error && (
                    <div
                        className="p-3 text-sm text-red-700 bg-red-50 border border-red-200 rounded-lg"
                        role="alert"
                    >
                        {error}
                    </div>
                )}

                <form onSubmit={handleRegister} className="space-y-5">
                    <div>
                        <label
                            htmlFor="name"
                            className="text-sm font-medium text-slate-700 sr-only"
                        >
                            Name
                        </label>
                        <input
                            id="name"
                            type="text"
                            placeholder="Name"
                            value={name}
                            onChange={(e) => setName(e.target.value)}
                            className="w-full px-4 py-3 text-sm text-slate-900 bg-slate-50 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 placeholder:text-slate-400"
                            required
                        />
                    </div>
                    <div>
                        <label
                            htmlFor="email"
                            className="text-sm font-medium text-slate-700 sr-only"
                        >
                            Email
                        </label>
                        <input
                            id="email"
                            type="email"
                            placeholder="Email"
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                            className="w-full px-4 py-3 text-sm text-slate-900 bg-slate-50 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 placeholder:text-slate-400"
                            required
                        />
                    </div>
                    <div>
                        <label
                            htmlFor="password"
                            className="text-sm font-medium text-slate-700 sr-only"
                        >
                            Password
                        </label>
                        <input
                            id="password"
                            type="password"
                            placeholder="Password"
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            className="w-full px-4 py-3 text-sm text-slate-900 bg-slate-50 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 placeholder:text-slate-400"
                            required
                        />
                    </div>
                    <div>
                        <label
                            htmlFor="confirmPassword"
                            className="text-sm font-medium text-slate-700 sr-only"
                        >
                            Confirm Password
                        </label>
                        <input
                            id="confirmPassword"
                            type="password"
                            placeholder="Confirm Password"
                            value={confirmPassword}
                            onChange={(e) => setConfirmPassword(e.target.value)}
                            className="w-full px-4 py-3 text-sm text-slate-900 bg-slate-50 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 placeholder:text-slate-400"
                            required
                        />
                    </div>
                    <div>
                        <label
                            htmlFor="currency"
                            className="block mb-2 text-sm font-medium text-slate-700"
                        >
                            Default Currency
                        </label>
                        <select
                            id="currency"
                            value={currency}
                            onChange={(e) => setCurrency(e.target.value)}
                            className="w-full px-4 py-3 text-sm text-slate-900 bg-slate-50 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                        >
                            {currencies.map((c) => (
                                <option key={c.code} value={c.code}>
                                    {c.name} ({c.code})
                                </option>
                            ))}
                        </select>
                    </div>
                    <button
                        type="submit"
                        className="w-full px-4 py-3 text-sm font-semibold text-white bg-blue-600 rounded-lg hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transition-colors duration-200"
                    >
                        Register
                    </button>
                </form>
            </div>
        </div>
    );
}
