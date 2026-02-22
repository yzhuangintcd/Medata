"use client";

import Link from "next/link";
import { useState } from "react";

/* ─── Task data ─── */
const tasks = [
    {
        id: 1,
        title: "Bug Fix: Payment Processing",
        difficulty: "Medium",
        type: "coding",
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
            "How would you communicate the urgency of this bug to your PM?",
        ],
    },
    {
        id: 2,
        title: "Architecture Decision: Microservices Migration",
        difficulty: "Hard",
        type: "scenario",
        description:
            "Your team maintains a monolithic e-commerce application. Leadership wants to migrate to microservices to 'scale better' and 'move faster'. However, your team of 5 engineers is already stretched thin maintaining the current system and building new features. You have a major holiday sale in 3 months.\n\nQuestion: How do you approach this situation? Walk through your thought process, considering technical feasibility, business priorities, team capacity, and risk.",
        starterCode: `Your structured response:

1. Initial Assessment:
   - Current system state:
   - Team capacity:
   - Business constraints:

2. Key Questions to Ask:
   - 
   - 
   - 

3. Options Analysis:
   Option A:
     Pros:
     Cons:
     Risk level:
   
   Option B:
     Pros:
     Cons:
     Risk level:

4. Recommendation:
   

5. Communication Strategy:
   - How you'd present this to leadership:
   - How you'd align the team:
`,
        hints: [
            "Consider incremental migration vs big-bang rewrite.",
            "What evidence would you gather to support your recommendation?",
            "How do you balance technical idealism with business pragmatism?",
            "What would be your compromise if leadership insists on starting now?",
        ],
    },
    {
        id: 3,
        title: "Production Incident: Database Slowdown",
        difficulty: "Hard",
        type: "scenario",
        description:
            "It's 2 PM on Friday. Your monitoring alerts that API response times have jumped from 200ms to 5 seconds. Customer support is getting complaints. Your database CPU is at 95%, and you notice one query is scanning 10M rows repeatedly. Your CTO is asking for updates every 15 minutes.\n\nQuestion: Walk through your incident response process. What's your step-by-step approach? How do you balance investigation, immediate fixes, communication, and long-term prevention?",
        starterCode: `Your incident response plan:

=== IMMEDIATE (0-15 min) ===
1. 
2. 
3. 

=== SHORT-TERM (15-60 min) ===
1. Investigation steps:
   - 
   - 

2. Potential quick fixes:
   - 
   - 

3. Communication:
   - To CTO:
   - To team:
   - To support:

=== MEDIUM-TERM (1-4 hours) ===
1. Root cause analysis:
   

2. Temporary vs permanent fix:
   

=== LONG-TERM (Post-incident) ===
1. Prevention measures:
   - 
   - 

2. Process improvements:
   - 
`,
        hints: [
            "What's more important: understanding the root cause or restoring service?",
            "How do you decide whether to roll back, add an index, or kill queries?",
            "What monitoring gaps does this incident reveal?",
            "How do you prevent this from happening again without over-engineering?",
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
        setOutput("▶ Running code...\n\n✅ No syntax errors detected.\n⏱ Execution time: 42ms\n\n[AI Agent]: I see your changes. Let me analyze your approach... Also, tell me how you'd prioritize finishing this vs responding to a production incident.");
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
                            {task.type === 'coding'
                                ? "Take your time reading the problem. I'd love to hear your thought process — talk me through your approach before you start coding. What edge cases come to mind?"
                                : "This is a real-world scenario. I'm interested in your thought process, not a perfect answer. Walk me through how you'd structure your thinking, what questions you'd ask, what trade-offs you'd consider, and how you'd communicate your reasoning to different stakeholders."}
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
                        <span className="ml-2 font-mono">{task.type === 'coding' ? 'solution.ts' : 'response.md'}</span>
                        <span className="ml-3 px-2 py-0.5 rounded text-[9px] font-semibold uppercase tracking-wider bg-zinc-800 text-zinc-400">
                            {task.type === 'coding' ? 'Code' : 'Scenario Analysis'}
                        </span>
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

                {/* Code/Response textarea */}
                <div className="flex-1 overflow-hidden">
                    <textarea
                        value={code}
                        onChange={(e) => setCode(e.target.value)}
                        spellCheck={false}
                        placeholder={task.type === 'coding' ? 'Write your code here...' : 'Structure your response here... Walk through your thought process step by step.'}
                        className={`h-full w-full resize-none bg-zinc-950 p-5 font-mono text-sm leading-relaxed outline-none selection:bg-indigo-600/40 ${task.type === 'coding' ? 'text-emerald-300' : 'text-zinc-300'}`}
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
                    href="/interview_environment/technical2"
                    className="rounded-lg bg-indigo-600 px-4 py-2 text-sm font-medium text-white hover:bg-indigo-500 transition-colors"
                >
                    Continue to Technical 2 →
                </Link>
            </div>
        </div>
    );
}
