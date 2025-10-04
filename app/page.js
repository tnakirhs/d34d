import Link from "next/link";

export default function Home() {
  return (
    <div className="relative min-h-screen overflow-hidden bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 text-white">
      {/* Ambient blobs (subtle) */}
      <div className="pointer-events-none absolute -top-32 -left-24 h-80 w-80 rounded-full bg-gradient-to-br from-pink-500/25 via-fuchsia-500/25 to-purple-500/25 blur-3xl" />
      <div className="pointer-events-none absolute -bottom-32 -right-24 h-80 w-80 rounded-full bg-gradient-to-br from-sky-500/25 via-cyan-500/25 to-teal-500/25 blur-3xl" />

      <div className="relative mx-auto flex max-w-4xl flex-col items-center px-4 py-10 md:py-16">
        {/* Subtle macOS-style window */}
        <div className="w-full overflow-hidden rounded-3xl border border-white/15 bg-white/10 shadow-[0_20px_120px_rgba(0,0,0,0.35)] backdrop-blur-2xl">
          {/* Title bar */}
          <div className="flex items-center gap-2 border-b border-white/10 px-5 py-3">
            <span className="h-3.5 w-3.5 rounded-full bg-[#ff5f57]" />
            <span className="h-3.5 w-3.5 rounded-full bg-[#febc2e]" />
            <span className="h-3.5 w-3.5 rounded-full bg-[#28c840]" />
            <div className="mx-auto select-none text-sm text-white/70">Expense Manager</div>
          </div>

          {/* Content */}
          <div className="px-6 py-10 text-center md:px-10">
            <h1 className="bg-gradient-to-br from-white to-white/70 bg-clip-text text-3xl font-semibold text-transparent md:text-4xl">
              Manage expenses beautifully
            </h1>
            <p className="mt-2 text-sm text-white/70 md:text-base">
              Track and visualize your spending with a clean, familiar feel.
            </p>

            {/* Actions */}
            <div className="mx-auto mt-8 flex w-full max-w-md flex-col gap-3 sm:flex-row">
              <Link
                href="/login"
                className="flex-1 rounded-xl bg-gradient-to-tr from-[#F58529] via-[#DD2A7B] via-50% to-[#515BD4] px-5 py-3 text-center text-sm font-semibold text-white shadow-lg shadow-pink-500/30 transition hover:brightness-110"
              >
                Login
              </Link>
              <Link
                href="/register"
                className="flex-1 rounded-xl border border-white/15 bg-white/5 px-5 py-3 text-center text-sm font-medium text-white/90 transition hover:bg-white/10"
              >
                Register
              </Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
