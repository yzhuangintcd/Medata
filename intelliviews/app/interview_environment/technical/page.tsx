"use client";

import Link from "next/link";
import { useState, useEffect } from "react";

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
];

export default function TechnicalPage() {
    const [activeTask, setActiveTask] = useState(0);
    const [code, setCode] = useState(tasks[0].starterCode);
    const [showHints, setShowHints] = useState(false);
    const [output, setOutput] = useState("");
    const [taskStartTimes, setTaskStartTimes] = useState<Record<number, number>>({});
    const [submittedTasks, setSubmittedTasks] = useState<Set<number>>(new Set());
    const [taskResponses, setTaskResponses] = useState<Record<number, string>>({});
    const [candidateEmail, setCandidateEmail] = useState('candidate@example.com');

    const task = tasks[activeTask];

    // Load progress from localStorage on mount
    useEffect(() => {
        const savedResponses = localStorage.getItem('technical1_responses');
        if (savedResponses) {
            try {
                setTaskResponses(JSON.parse(savedResponses));
            } catch (e) {
                console.error('Failed to parse saved responses', e);
            }
        }
        
        const savedCompleted = localStorage.getItem('technical1_completed');
        if (savedCompleted) {
            try {
                setSubmittedTasks(new Set(JSON.parse(savedCompleted)));
            } catch (e) {
                console.error('Failed to parse completed tasks', e);
            }
        }

        const email = localStorage.getItem('candidateEmail');
        if (email) {
            setCandidateEmail(email);
        }
    }, []);

    // Load code for current task
    useEffect(() => {
        const savedCode = taskResponses[task.id];
        if (savedCode) {
            setCode(savedCode);
        } else {
            setCode(task.starterCode);
        }
    }, [activeTask]);

    // Save responses to localStorage whenever they change
    useEffect(() => {
        if (Object.keys(taskResponses).length > 0) {
            localStorage.setItem('technical1_responses', JSON.stringify(taskResponses));
        }
    }, [taskResponses]);

    // Save completed tasks to localStorage
    useEffect(() => {
        if (submittedTasks.size > 0) {
            localStorage.setItem('technical1_completed', JSON.stringify(Array.from(submittedTasks)));
        }
    }, [submittedTasks]);

    // Track start time when a task is opened
    useEffect(() => {
        if (!taskStartTimes[task.id]) {
            setTaskStartTimes(prev => ({ ...prev, [task.id]: Date.now() }));
        }
    }, [task.id, taskStartTimes]);

    function handleTaskSwitch(idx: number) {
        // Save current code before switching
        setTaskResponses(prev => ({
            ...prev,
            [task.id]: code
        }));
        
        setActiveTask(idx);
        setShowHints(false);
        setOutput("");
    }

    function handleCodeChange(newCode: string) {
        setCode(newCode);
        // Auto-save as they type
        setTaskResponses(prev => ({
            ...prev,
            [task.id]: newCode
        }));
    }

    function handleRun() {
        if (submittedTasks.has(task.id)) return;
        setOutput("▶ Running code...\n\n✅ No syntax errors detected.\n⏱ Execution time: 42ms\n\n[AI Agent]: I see your changes. Let me analyze your approach... Also, tell me how you'd prioritize finishing this vs responding to a production incident.");
    }

    const isTaskCompleted = submittedTasks.has(task.id);

    async function handleSubmit() {
        if (isTaskCompleted) return;
        
        setOutput("📤 Submitting solution...\n\n[AI Agent]: Processing your submission...");
        
        // Skip database save for coding questions
        if (task.type === 'coding') {
            setOutput("📤 Solution submitted!\n\n[AI Agent]: Thank you. I'm reviewing your solution now. I'll assess correctness, code quality, edge-case handling, and your reasoning. Please move on to the next task.");
            return;
        }
        
        // Calculate time spent
        const startTime = taskStartTimes[task.id] || Date.now();
        const timeSpentSeconds = Math.floor((Date.now() - startTime) / 1000);

        // Save to database (scenarios only)
        try {
            await fetch('/api/save-response', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    candidateId: `candidate-${Date.now()}`,
                    candidateEmail: 'candidate@example.com',
                    interviewType: 'technical1',
                    taskId: task.id,
                    taskTitle: task.title,
                    response: code,
                    timeSpentSeconds,
                    metadata: {
                        difficulty: task.difficulty,
                        type: task.type,
                        hintsViewed: showHints,
                        completed: true,
                        question: {
                            description: task.description,
                            starterCode: task.starterCode,
                            hints: task.hints,
                        },
                    },
                }),
            });
            console.log('✅ Technical solution saved to database');
            setSubmittedTasks(prev => new Set(prev).add(task.id));
            setOutput("📤 Solution submitted!\n\n[AI Agent]: Thank you. I'm reviewing your solution now. I'll assess correctness, code quality, edge-case handling, and your reasoning. Please move on to the next task.");
        } catch (error) {
            console.error('❌ Failed to save to database:', error);
            setOutput("📤 Solution submitted! (Note: Failed to save to database, but you can continue)\n\n[AI Agent]: Thank you. I'm reviewing your solution now. Please move on to the next task.");
        }
    }

    return (
        <div className="flex h-[calc(100vh-7rem)] overflow-hidden">
            {/* ─── Left Panel: Task description ─── */}
            <div className="w-[420px] shrink-0 border-r border-zinc-800 bg-zinc-900 flex flex-col overflow-y-auto">
                {/* Task selector tabs */}
                <div className="flex border-b border-zinc-800">
                    {tasks.map((t, idx) => {
                        const isCompleted = submittedTasks.has(t.id);
                        return (
                            <button
                                key={t.id}
                                onClick={() => handleTaskSwitch(idx)}
                                className={`flex-1 px-3 py-3 text-xs font-medium transition-colors relative ${idx === activeTask
                                    ? "bg-zinc-800 text-indigo-400 border-b-2 border-indigo-500"
                                    : "text-zinc-500 hover:text-zinc-300 hover:bg-zinc-800/50"
                                    }`}
                            >
                                {isCompleted && <span className="absolute top-1 right-1 text-emerald-400">✓</span>}
                                Task {t.id}
                            </button>
                        );
                    })}
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
                        {isTaskCompleted && (
                            <span className="ml-auto text-emerald-400 text-xs font-medium">✓ Completed</span>
                        )}
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
                            disabled={isTaskCompleted}
                            className="rounded-lg bg-zinc-800 px-3 py-1.5 text-xs font-medium text-emerald-400 hover:bg-zinc-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                            ▶ Run
                        </button>
                        <button
                            onClick={handleSubmit}
                            disabled={isTaskCompleted}
                            className="rounded-lg bg-indigo-600 px-3 py-1.5 text-xs font-medium text-white hover:bg-indigo-500 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                            {isTaskCompleted ? '✓ Submitted' : 'Submit Solution'}
                        </button>
                    </div>
                </div>

                {/* Code/Response textarea */}
                <div className="flex-1 overflow-hidden relative">
                    <textarea
                        value={code}
                        onChange={(e) => handleCodeChange(e.target.value)}
                        spellCheck={false}
                        placeholder={task.type === 'coding' ? 'Write your code here...' : 'Structure your response here... Walk through your thought process step by step.'}
                        disabled={isTaskCompleted}
                        className={`h-full w-full resize-none bg-zinc-950 p-5 font-mono text-sm leading-relaxed outline-none selection:bg-indigo-600/40 disabled:opacity-70 disabled:cursor-not-allowed ${task.type === 'coding' ? 'text-emerald-300' : 'text-zinc-300'}`}
                    />
                    {isTaskCompleted && (
                        <div className="absolute inset-0 flex items-center justify-center bg-zinc-950/80 pointer-events-none">
                            <span className="text-emerald-400 text-lg font-bold">✓ Task completed</span>
                        </div>
                    )}
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
