"use client";

import Link from "next/link";
import { useState, useEffect } from "react";

/* ─── Task data with real-life scenarios ─── */
const tasks = [
    {
        id: 1,
        title: "Technical Debt vs Feature Velocity",
        difficulty: "Hard",
        type: "scenario",
        description:
            "Your codebase has accumulated significant technical debt over 2 years of rapid growth. Test coverage is 30%, the deployment process takes 2 hours and fails 40% of the time, and the authentication system uses deprecated libraries with known security vulnerabilities.\n\nMeanwhile, your product team has a roadmap of high-value features that could increase revenue by 30% if shipped this quarter. Your engineering team is spending 60% of their time fighting fires instead of building new features.\n\nYour VP asks: 'Why is engineering so slow? Can't we just hire more people?'\n\nQuestion: How do you analyze this situation and make a recommendation?",
        starterCode: `Your structured analysis:

1. Problem Framing:
   - Root causes:
   - Impact on business:
   - Impact on team:

2. Data You'd Gather:
   - Metrics needed:
   - Stakeholder interviews:
   - Technical assessment:

3. Options & Trade-offs:
   
   Option A: Stop all feature work for 1 quarter, focus on debt
     Business impact:
     Technical impact:
     Team morale:
     Risk:
   
   Option B: Dedicate 20% of sprint capacity to debt incrementally
     Business impact:
     Technical impact:
     Team morale:
     Risk:
   
   Option C: (Your alternative)
     

4. Your Recommendation:
   

5. How You'd Present This:
   - To VP of Engineering:
   - To Product team:
   - To your engineers:

6. Success Metrics:
   - How you'd measure progress:
   - Timeline:
`,
        hints: [
            "The VP's question about hiring reveals a misunderstanding. How do you address it?",
            "What's the cost of NOT addressing technical debt?",
            "How do you make technical debt tangible to non-technical stakeholders?",
            "What would be a realistic, incremental approach?",
        ],
    },
    {
        id: 2,
        title: "System Scalability Crisis",
        difficulty: "Hard",
        type: "scenario",
        description:
            "Your application currently handles 10,000 concurrent users. Sales just closed a major enterprise deal that will bring 100,000 new users going live in 6 weeks. Your current architecture will definitely not handle that load — your database is already at 70% capacity and your API servers start throttling at 50,000 requests/minute.\n\nYou've identified 3 major bottlenecks: database queries, image processing pipeline, and session management. Each would take 3-4 weeks to properly fix. You have 3 engineers available.\n\nSales is celebrating. Leadership expects this to 'just work'. The contract has penalties if you can't handle the load.\n\nQuestion: How do you approach this? What's your risk mitigation strategy?",
        starterCode: `Your strategic response:

1. Immediate Risk Assessment (Week 1):
   - Critical path analysis:
   - What breaks first at 100k users:
   - Minimum viable scale solution:

2. Quick Wins vs Proper Solutions:
   
   Bottleneck 1: Database
     Quick hack (1 week):
     Proper fix (4 weeks):
     Your choice:
   
   Bottleneck 2: Image processing
     Quick hack (1 week):
     Proper fix (4 weeks):
     Your choice:
   
   Bottleneck 3: Session management
     Quick hack (1 week):
     Proper fix (4 weeks):
     Your choice:

3. Resource Allocation:
   - Engineer 1:
   - Engineer 2:
   - Engineer 3:

4. Risk Mitigation:
   - Load testing plan:
   - Rollout strategy:
   - Rollback plan:
   - Communication plan:

5. Stakeholder Management:
   - What you tell Sales:
   - What you tell Leadership:
   - What you tell your team:

6. Post-Launch Technical Debt:
   - What gets sacrificed:
   - Payback plan:
`,
        hints: [
            "Perfect is the enemy of good. What's the 80/20 solution?",
            "How do you balance technical integrity with business reality?",
            "What's your 'circuit breaker' if things go wrong during launch?",
            "How do you avoid this situation in the future?",
        ],
    },
    {
        id: 3,
        title: "Cross-Team Architecture Conflict",
        difficulty: "Hard",
        type: "scenario",
        description:
            "Your team maintains the Payments service. The Orders team wants to call your service synchronously in their checkout flow, but you know from experience that payment gateways have high latency (1-3 seconds) and occasional timeouts.\n\nYou propose an async event-driven approach: Orders publishes an event, Payments processes it asynchronously, updates happen via webhooks. This is more resilient but adds complexity.\n\nThe Orders team pushes back: 'That's overengineered. We need a simple REST call. Our deadline is in 3 weeks and we don't have time to build event infrastructure.' Their engineering manager escalates to your director, saying your team is 'blocking' them.\n\nYour director asks: 'Why can't we just give them what they want?'\n\nQuestion: How do you navigate this technical and political situation?",
        starterCode: `Your response strategy:

1. Technical Analysis:
   - Orders team's approach:
     Pros:
     Cons:
     Risks:
   
   - Your approach:
     Pros:
     Cons:
     Risks:

2. Understanding Their Constraints:
   - Questions you'd ask Orders team:
   - Legitimate concerns to validate:
   - Assumptions to challenge:

3. Middle Ground Options:
   
   Option 1: Compromise solution
     Description:
     Addresses their needs:
     Manages your concerns:
   
   Option 2: Phased approach
     Phase 1 (3 weeks):
     Phase 2 (later):
   
   Option 3: (Your creative alternative)
     

4. Building Consensus:
   - How you'd present to Orders team:
   - How you'd present to your director:
   - Evidence you'd provide:

5. If You Lose This Debate:
   - Risk documentation:
   - Monitoring you'd add:
   - Future refactor path:

6. Relationship Management:
   - How you keep this from being adversarial:
   - How you'd collaborate moving forward:
`,
        hints: [
            "They have a valid point about timeline. How do you acknowledge that?",
            "What data or past incidents would strengthen your argument?",
            "Is there a way to let them ship fast AND address your concerns?",
            "How do you disagree without being 'the team that says no'?",
        ],
    },
];

export default function Technical2Page() {
    const [activeTask, setActiveTask] = useState(0);
    const [code, setCode] = useState(tasks[0].starterCode);
    const [showHints, setShowHints] = useState(false);
    const [output, setOutput] = useState("");
    const [taskStartTimes, setTaskStartTimes] = useState<Record<number, number>>({});
    const [submittedTasks, setSubmittedTasks] = useState<Set<number>>(new Set());

    const task = tasks[activeTask];

    // Track start time when a task is opened
    useEffect(() => {
        if (!taskStartTimes[task.id]) {
            setTaskStartTimes(prev => ({ ...prev, [task.id]: Date.now() }));
        }
    }, [task.id, taskStartTimes]);

    function handleTaskSwitch(idx: number) {
        setActiveTask(idx);
        setCode(tasks[idx].starterCode);
        setShowHints(false);
        setOutput("");
    }

    function handleRun() {
        setOutput("▶ Analyzing your response...\n\n✅ Structure detected.\n\n[AI Agent]: I can see your thought process. Let me ask some follow-up questions about your reasoning...");
    }

    async function handleSubmit() {
        setOutput("📤 Submitting response...\n\n[AI Agent]: Processing your submission...");
        
        // Calculate time spent
        const startTime = taskStartTimes[task.id] || Date.now();
        const timeSpentSeconds = Math.floor((Date.now() - startTime) / 1000);

        // Save to database
        try {
            await fetch('/api/save-response', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    candidateId: `candidate-${Date.now()}`,
                    candidateEmail: 'candidate@example.com',
                    interviewType: 'technical2',
                    taskId: task.id,
                    taskTitle: task.title,
                    response: code,
                    timeSpentSeconds,
                    metadata: {
                        difficulty: task.difficulty,
                        type: task.type,
                        hintsViewed: showHints,
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
            setOutput("📤 Response submitted!\n\n[AI Agent]: Thank you for walking me through your thinking. I'm evaluating your structure, trade-off analysis, and communication strategy. Let's move to the next scenario.");
        } catch (error) {
            console.error('❌ Failed to save to database:', error);
            setOutput("📤 Response submitted! (Note: Failed to save to database, but you can continue)\n\n[AI Agent]: Thank you for walking me through your thinking. Let's move to the next scenario.");
        }
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
                        <span className="rounded-full px-2.5 py-0.5 text-[10px] font-semibold uppercase tracking-wider bg-blue-900/50 text-blue-400">
                            Scenario
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
                            "This interview focuses on real-world problem-solving. I'm evaluating how you structure your thinking, weigh trade-offs, handle ambiguity, and communicate with different stakeholders. There's no single right answer — show me your reasoning process."
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
                        <span className="ml-2 font-mono">response.md</span>
                        <span className="ml-3 px-2 py-0.5 rounded text-[9px] font-semibold uppercase tracking-wider bg-zinc-800 text-zinc-400">
                            Scenario Analysis
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

                {/* Response textarea */}
                <div className="flex-1 overflow-hidden">
                    <textarea
                        value={code}
                        onChange={(e) => setCode(e.target.value)}
                        spellCheck={false}
                        placeholder="Structure your response here... Walk through your thought process step by step."
                        className="h-full w-full resize-none bg-zinc-950 p-5 font-mono text-sm text-zinc-300 leading-relaxed outline-none selection:bg-indigo-600/40"
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
