"use client";

import { useState } from "react";

export default function InterviewLayout({
    children,
}: {
    children: React.ReactNode;
}) {
    const [timer] = useState("45:00");

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

                {/* Timer & candidate info */}
                <div className="flex items-center gap-4">
                    <div className="flex items-center gap-2 rounded-lg bg-zinc-800 px-3 py-1.5 text-sm font-mono">
                        <span className="h-2 w-2 rounded-full bg-emerald-500 animate-pulse" />
                        {timer}
                    </div>
                    <div className="h-8 w-8 rounded-full bg-zinc-700 flex items-center justify-center text-xs font-bold">
                        C
                    </div>
                </div>
            </header>

            {/* ─── Main content ─── */}
            <main className="flex-1 overflow-y-auto">{children}</main>

            {/* ─── Footer ─── */}
            <footer className="border-t border-zinc-800 bg-zinc-900 px-6 py-3 flex items-center justify-between text-xs text-zinc-500">
                <span>IntelliView AI Interview Platform</span>
                <span>Session Active • Responses are being recorded</span>
            </footer>
        </div>
    );
}
