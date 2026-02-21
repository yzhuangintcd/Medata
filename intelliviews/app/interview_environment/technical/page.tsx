"use client";

import Link from "next/link";
import { useState } from "react";

/* ─── Task data ─── */
const tasks = [
    {
        id: 1,
        title: "Bug Fix: Payment Processing",
        difficulty: "Medium",
        description:
            "The checkout service is silently dropping orders when the payment gateway returns a timeout. Customers are charged but never receive a confirmation email. Investigate the code below and fix the bug.",
        starterCode: `async function processPayment(order: Order) {
  const gateway = new PaymentGateway();

  // BUG: timeout errors are swallowed here
  try {
    const result = await gateway.charge(order.total, order.paymentMethod);
    await db.orders.update(order.id, { status: "paid", txnId: result.id });
    await emailService.sendConfirmation(order.customerEmail, order);
  } catch (err) {
    console.log("Payment failed");
  }
}`,
        hints: [
            "What happens to the order status when a TimeoutError is caught?",
            "Should you differentiate between a timeout and a declined card?",
            "Think about idempotency — can the customer safely retry?",
        ],
    },
    {
        id: 2,
        title: "System Design: URL Shortener",
        difficulty: "Hard",
        description:
            "Design a URL shortening service (like bit.ly) that can handle 100 million new URLs per day. Describe the API, database schema, encoding strategy, and how you'd handle collisions and analytics.",
        starterCode: `// Describe your design in comments or pseudocode

// 1. API endpoints
// POST /shorten  { longUrl: string } -> { shortUrl: string }
// GET  /:code    -> 302 redirect to longUrl

// 2. Database schema
// ...

// 3. Encoding strategy
// ...

// 4. Collision handling
// ...

// 5. Analytics
// ...`,
        hints: [
            "Consider Base62 encoding of an auto-increment ID vs hashing.",
            "How would you partition data across multiple database shards?",
            "What caching layer would reduce read latency?",
        ],
    },
    {
        id: 3,
        title: "Feature Build: Rate Limiter",
        difficulty: "Medium",
        description:
            "Implement a sliding-window rate limiter middleware for an Express.js API. It should allow a configurable number of requests per window (e.g., 100 requests per minute) per API key, and return 429 when the limit is exceeded.",
        starterCode: `import { Request, Response, NextFunction } from "express";

interface RateLimiterConfig {
  windowMs: number;   // e.g. 60_000 for 1 minute
  maxRequests: number; // e.g. 100
}

export function createRateLimiter(config: RateLimiterConfig) {
  // TODO: implement sliding window logic
  return (req: Request, res: Response, next: NextFunction) => {
    // 1. Extract API key from request
    // 2. Check request count in current window
    // 3. Allow or reject
    next();
  };
}`,
        hints: [
            "A sorted set (e.g. Redis ZRANGEBYSCORE) works well for sliding windows.",
            "Remove expired entries before counting.",
            "Include Retry-After and X-RateLimit-Remaining headers in the response.",
        ],
    },
];

export default function TechnicalPage() {
    const [activeTask, setActiveTask] = useState(0);
    const [code, setCode] = useState(tasks[0].starterCode);
    const [showHints, setShowHints] = useState(false);
    const [output, setOutput] = useState("");

    const task = tasks[activeTask];

    function handleTaskSwitch(idx: number) {
        setActiveTask(idx);
        setCode(tasks[idx].starterCode);
        setShowHints(false);
        setOutput("");
    }

    function handleRun() {
        setOutput("▶ Running code...\n\n✅ No syntax errors detected.\n⏱ Execution time: 42ms\n\n[AI Agent]: I see your changes. Let me analyze your approach...");
    }

    function handleSubmit() {
        setOutput("📤 Solution submitted!\n\n[AI Agent]: Thank you. I'm reviewing your solution now. I'll assess correctness, code quality, edge-case handling, and your reasoning. Please move on to the next task.");
    }

    return (
        <div className="flex h-[calc(100vh-7rem)] overflow-hidden">
            {/* ─── Left Panel: Task description ─── */}
            <div className="w-[420px] shrink-0 border-r border-zinc-800 bg-zinc-900 flex flex-col overflow-y-auto">
                {/* Task selector tabs */}
                <div className="flex border-b border-zinc-800">
                    {tasks.map((t, idx) => (
                        <button
                            key={t.id}
                            onClick={() => handleTaskSwitch(idx)}
                            className={`flex-1 px-3 py-3 text-xs font-medium transition-colors ${idx === activeTask
                                    ? "bg-zinc-800 text-indigo-400 border-b-2 border-indigo-500"
                                    : "text-zinc-500 hover:text-zinc-300 hover:bg-zinc-800/50"
                                }`}
                        >
                            Task {t.id}
                        </button>
                    ))}
                </div>

                {/* Task body */}
                <div className="p-5 flex-1">
                    <div className="flex items-center gap-3 mb-4">
                        <span
                            className={`rounded-full px-2.5 py-0.5 text-[10px] font-semibold uppercase tracking-wider ${task.difficulty === "Hard"
                                    ? "bg-red-900/50 text-red-400"
                                    : "bg-amber-900/50 text-amber-400"
                                }`}
                        >
                            {task.difficulty}
                        </span>
                        <span className="text-xs text-zinc-500">Task {task.id} of {tasks.length}</span>
                    </div>

                    <h2 className="text-xl font-bold mb-3">{task.title}</h2>
                    <p className="text-sm text-zinc-400 leading-relaxed mb-6">
                        {task.description}
                    </p>

                    {/* AI interviewer prompt */}
                    <div className="rounded-lg border border-indigo-600/30 bg-indigo-950/30 p-4 mb-6">
                        <div className="flex items-center gap-2 mb-2">
                            <span className="h-6 w-6 rounded-full bg-indigo-600 flex items-center justify-center text-[10px] font-bold">
                                AI
                            </span>
                            <span className="text-xs font-semibold text-indigo-400">
                                AI Interviewer
                            </span>
                        </div>
                        <p className="text-sm text-zinc-300 leading-relaxed">
                            "Take your time reading the problem. I'd love to hear your thought
                            process — talk me through your approach before you start coding.
                            What edge cases come to mind?"
                        </p>
                    </div>

                    {/* Hints */}
                    <button
                        onClick={() => setShowHints(!showHints)}
                        className="text-xs text-indigo-400 hover:text-indigo-300 transition-colors mb-3"
                    >
                        {showHints ? "▾ Hide hints" : "▸ Show hints"}
                    </button>
                    {showHints && (
                        <ul className="space-y-2 text-sm text-zinc-400 list-disc list-inside mb-4">
                            {task.hints.map((h, i) => (
                                <li key={i}>{h}</li>
                            ))}
                        </ul>
                    )}
                </div>
            </div>

            {/* ─── Right Panel: Code editor + output ─── */}
            <div className="flex-1 flex flex-col">
                {/* Editor toolbar */}
                <div className="flex items-center justify-between border-b border-zinc-800 bg-zinc-900 px-4 py-2">
                    <div className="flex items-center gap-2 text-xs text-zinc-500">
                        <span className="h-3 w-3 rounded-full bg-red-500" />
                        <span className="h-3 w-3 rounded-full bg-amber-500" />
                        <span className="h-3 w-3 rounded-full bg-emerald-500" />
                        <span className="ml-2 font-mono">solution.ts</span>
                    </div>
                    <div className="flex gap-2">
                        <button
                            onClick={handleRun}
                            className="rounded-lg bg-zinc-800 px-3 py-1.5 text-xs font-medium text-emerald-400 hover:bg-zinc-700 transition-colors"
                        >
                            ▶ Run
                        </button>
                        <button
                            onClick={handleSubmit}
                            className="rounded-lg bg-indigo-600 px-3 py-1.5 text-xs font-medium text-white hover:bg-indigo-500 transition-colors"
                        >
                            Submit Solution
                        </button>
                    </div>
                </div>

                {/* Code textarea */}
                <div className="flex-1 overflow-hidden">
                    <textarea
                        value={code}
                        onChange={(e) => setCode(e.target.value)}
                        spellCheck={false}
                        className="h-full w-full resize-none bg-zinc-950 p-5 font-mono text-sm text-emerald-300 leading-relaxed outline-none selection:bg-indigo-600/40"
                    />
                </div>

                {/* Output panel */}
                <div className="border-t border-zinc-800 bg-zinc-900">
                    <div className="flex items-center px-4 py-2 text-xs text-zinc-500 border-b border-zinc-800">
                        <span>Output</span>
                    </div>
                    <pre className="p-4 text-xs text-zinc-400 font-mono h-36 overflow-y-auto whitespace-pre-wrap">
                        {output || "Run your code to see output here..."}
                    </pre>
                </div>
            </div>

            {/* ─── Navigation footer inside panel ─── */}
            <div className="absolute bottom-12 left-0 right-0 flex items-center justify-between border-t border-zinc-800 bg-zinc-900 px-6 py-3">
                <Link
                    href="/interview_environment"
                    className="text-sm text-zinc-400 hover:text-zinc-200 transition-colors"
                >
                    ← Back to Dashboard
                </Link>
                <Link
                    href="/interview_environment/behavioural"
                    className="rounded-lg bg-indigo-600 px-4 py-2 text-sm font-medium text-white hover:bg-indigo-500 transition-colors"
                >
                    Continue to Behavioural →
                </Link>
            </div>
        </div>
    );
}
