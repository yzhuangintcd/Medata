"use client";

import Link from "next/link";
import { useState } from "react";

/* ─── Task data with integrated simulation ─── */
const tasks = [
    {
        id: 1,
        title: "System Design: Real-time Collaboration",
        difficulty: "Hard",
        description:
            "Design a real-time collaborative document editing system (like Google Docs). Include conflict resolution, operational transforms, and how you'd handle 10,000 concurrent users. Then simulate prioritizing this feature against other team demands.",
        starterCode: `// Describe your design in comments or pseudocode

// 1. Architecture overview
// ...

// 2. Conflict resolution strategy
// ...

// 3. Operational transforms
// ...

// 4. Scalability considerations
// ...

// 5. Day-in-life simulation: How would you prioritize this against urgent bug fixes?
// ...`,
        hints: [
            "Consider CRDTs vs Operational Transforms.",
            "How do you handle network partitions?",
            "Simulate: Your PM says this feature needs to ship in 2 weeks, but there's a P1 production bug. How do you respond?",
        ],
    },
    {
        id: 2,
        title: "Debugging: Memory Leak in Production",
        difficulty: "Hard",
        description:
            "A production service is experiencing gradual memory growth leading to OOM crashes every 6 hours. You have heap dumps, metrics, and logs. Debug the issue and explain your process. Then simulate how you'd communicate this to stakeholders.",
        starterCode: `// Investigation notes:
// - Memory grows from 500MB to 2GB over 6 hours
// - Heap dump shows large arrays of user sessions
// - No obvious circular references
// - Garbage collection running but not freeing memory

// Your debugging approach:
// 1. ...
// 2. ...

// Root cause hypothesis:
// ...

// Fix:
// ...

// Simulation: Your manager asks for an ETA. What do you say?
// ...`,
        hints: [
            "Look for event listener leaks or cached data not being evicted.",
            "Check if session cleanup is actually running.",
            "Simulate: How do you balance investigation time vs applying a temporary fix?",
        ],
    },
    {
        id: 3,
        title: "Feature Build: Rate Limiter with Business Context",
        difficulty: "Medium",
        description:
            "Implement a sliding-window rate limiter for the API. Then simulate a scenario: Sales wants higher limits for premium users, but Engineering is concerned about infrastructure costs. How do you design the solution and navigate the conversation?",
        starterCode: `import { Request, Response, NextFunction } from "express";

interface RateLimiterConfig {
  windowMs: number;
  maxRequests: number;
  premiumMultiplier?: number; // Simulation: new requirement mid-development
}

export function createRateLimiter(config: RateLimiterConfig) {
  // TODO: implement sliding window logic
  // TODO: handle premium tier requirements
  return (req: Request, res: Response, next: NextFunction) => {
    next();
  };
}

// Simulation question: Sales emails you directly asking to increase limits
// for a specific enterprise customer. How do you respond?`,
        hints: [
            "Use Redis sorted sets for sliding windows.",
            "Simulate: How do you document the premium tier decision for future engineers?",
            "Simulate: What metrics would you add to prove infrastructure impact?",
        ],
    },
];

export default function Technical2Page() {
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
        setOutput("▶ Running code...\n\n✅ No syntax errors detected.\n⏱ Execution time: 42ms\n\n[AI Agent]: I see your changes. Now let's discuss the simulation aspect: how would you prioritize this work in a real team environment?");
    }

    function handleSubmit() {
        setOutput("📤 Solution submitted!\n\n[AI Agent]: Thank you. I'm reviewing both your technical solution and your responses to the day-in-life simulation prompts. Please move on to the next task.");
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
                        <span className="rounded-full px-2.5 py-0.5 text-[10px] font-semibold uppercase tracking-wider bg-purple-900/50 text-purple-400">
                            + Simulation
                        </span>
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
                            "This interview integrates technical problem-solving with realistic work scenarios. I'll be evaluating both your technical approach and how you handle day-to-day engineering challenges. Walk me through your thinking on both aspects."
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
                    href="/interview_environment/technical"
                    className="text-sm text-zinc-400 hover:text-zinc-200 transition-colors"
                >
                    ← Back to Technical 1
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
