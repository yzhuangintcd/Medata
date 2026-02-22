"use client";

export default function InterviewLayout({
    children,
}: {
    children: React.ReactNode;
}) {
    return (
        <div className="min-h-screen bg-zinc-950 text-zinc-100 flex flex-col">
            {/* ─── Top bar ─── */}
            <header className="flex items-center justify-between border-b border-zinc-800 bg-zinc-900 px-6 py-3">
                <div className="flex items-center gap-3">
                    <div className="h-8 w-8 rounded-lg bg-indigo-600 flex items-center justify-center text-sm font-bold">
                        IV
                    </div>
                    <span className="text-lg font-semibold tracking-tight">
                        Intelli<span className="text-indigo-400">View</span>
                    </span>
                </div>
            </header>

            {/* ─── Main content ─── */}
            <main className="flex-1 overflow-hidden">{children}</main>

            {/* ─── Footer ─── */}
            <footer className="border-t border-zinc-800 bg-zinc-900 px-6 py-3 flex items-center justify-between text-xs text-zinc-500">
                <span>IntelliView AI Interview Platform</span>
                <span>Session Active • Responses are being recorded</span>
            </footer>
        </div>
    );
}
